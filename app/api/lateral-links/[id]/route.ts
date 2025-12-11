import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { getDefaultUser } from "@/lib/db/helpers";

/**
 * PATCH /api/lateral-links/:id
 * Update a lateral link's relation type
 * Expects: relation
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { relation } = body;

    if (!relation || typeof relation !== "string") {
      return NextResponse.json(
        { error: "relation is required" },
        { status: 400 }
      );
    }

    // Validate relation type
    const validRelations = ["analogy", "pattern", "contrast", "association"];
    if (!validRelations.includes(relation)) {
      return NextResponse.json(
        { error: `relation must be one of: ${validRelations.join(", ")}` },
        { status: 400 }
      );
    }

    // Get default user (since auth is skipped for MVP)
    const user = await getDefaultUser();

    // Find the lateral link with its nodes
    const lateralLink = await prisma.lateralLink.findUnique({
      where: { id },
      include: {
        from: true,
        to: true,
      },
    });

    if (!lateralLink) {
      return NextResponse.json(
        { error: "Lateral link not found" },
        { status: 404 }
      );
    }

    // Verify the user owns the from node (connections belong to the from node's owner)
    if (lateralLink.from.userId !== user.id) {
      return NextResponse.json(
        { error: "Unauthorized to update this connection" },
        { status: 401 }
      );
    }

    // Update the lateral link
    const updatedLink = await prisma.lateralLink.update({
      where: { id },
      data: { relation },
    });

    return NextResponse.json({
      id: updatedLink.id,
      from_node: updatedLink.fromNode,
      to_node: updatedLink.toNode,
      relation: updatedLink.relation,
      created_at: updatedLink.createdAt.toISOString(),
    });
  } catch (error) {
    console.error("Error updating lateral link:", error);
    return NextResponse.json(
      { error: "Failed to update lateral link" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/lateral-links/:id
 * Delete a lateral link
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Get default user (since auth is skipped for MVP)
    const user = await getDefaultUser();

    // Find the lateral link with its nodes
    const lateralLink = await prisma.lateralLink.findUnique({
      where: { id },
      include: {
        from: true,
      },
    });

    if (!lateralLink) {
      return NextResponse.json(
        { error: "Lateral link not found" },
        { status: 404 }
      );
    }

    // Verify the user owns the from node
    if (lateralLink.from.userId !== user.id) {
      return NextResponse.json(
        { error: "Unauthorized to delete this connection" },
        { status: 401 }
      );
    }

    // Delete the lateral link
    await prisma.lateralLink.delete({
      where: { id },
    });

    return NextResponse.json({
      message: "Lateral link deleted successfully",
      id,
    });
  } catch (error) {
    console.error("Error deleting lateral link:", error);
    return NextResponse.json(
      { error: "Failed to delete lateral link" },
      { status: 500 }
    );
  }
}
