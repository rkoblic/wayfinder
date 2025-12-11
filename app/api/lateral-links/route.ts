import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { getDefaultUser } from "@/lib/db/helpers";

/**
 * POST /api/lateral-links
 * Create a manual lateral link between two nodes
 * Expects: from_node_id, to_node_id, relation
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { from_node_id, to_node_id, relation } = body;

    if (!from_node_id || typeof from_node_id !== "string") {
      return NextResponse.json(
        { error: "from_node_id is required" },
        { status: 400 }
      );
    }

    if (!to_node_id || typeof to_node_id !== "string") {
      return NextResponse.json(
        { error: "to_node_id is required" },
        { status: 400 }
      );
    }

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

    // Prevent self-loops
    if (from_node_id === to_node_id) {
      return NextResponse.json(
        { error: "Cannot create a connection from a node to itself" },
        { status: 400 }
      );
    }

    // Get default user (since auth is skipped for MVP)
    const user = await getDefaultUser();

    // Verify both nodes exist and belong to the user
    const fromNode = await prisma.node.findUnique({
      where: { id: from_node_id },
    });

    const toNode = await prisma.node.findUnique({
      where: { id: to_node_id },
    });

    if (!fromNode || !toNode) {
      return NextResponse.json(
        { error: "One or both nodes not found" },
        { status: 404 }
      );
    }

    if (fromNode.userId !== user.id || toNode.userId !== user.id) {
      return NextResponse.json(
        { error: "Unauthorized to create connection between these nodes" },
        { status: 401 }
      );
    }

    // Check if connection already exists
    const existingLink = await prisma.lateralLink.findFirst({
      where: {
        fromNode: from_node_id,
        toNode: to_node_id,
      },
    });

    if (existingLink) {
      return NextResponse.json(
        { error: "Connection already exists between these nodes" },
        { status: 409 }
      );
    }

    // Create the lateral link
    const lateralLink = await prisma.lateralLink.create({
      data: {
        fromNode: from_node_id,
        toNode: to_node_id,
        relation: relation,
      },
    });

    return NextResponse.json(
      {
        id: lateralLink.id,
        from_node: lateralLink.fromNode,
        to_node: lateralLink.toNode,
        relation: lateralLink.relation,
        created_at: lateralLink.createdAt.toISOString(),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating lateral link:", error);
    return NextResponse.json(
      { error: "Failed to create lateral link" },
      { status: 500 }
    );
  }
}
