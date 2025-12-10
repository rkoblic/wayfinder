import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { getDefaultUser } from "@/lib/db/helpers";

/**
 * POST /api/reflections
 * Create a reflection for a node
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { node_id, surprise, tag, metaphor } = body;

    if (!node_id || typeof node_id !== "string") {
      return NextResponse.json(
        { error: "node_id is required" },
        { status: 400 }
      );
    }

    if (!tag || typeof tag !== "string" || tag.trim().length === 0) {
      return NextResponse.json(
        { error: "tag is required and must be a non-empty string" },
        { status: 400 }
      );
    }

    // Get default user (since auth is skipped for MVP)
    const user = await getDefaultUser();

    // Find the node
    const node = await prisma.node.findUnique({
      where: { id: node_id },
    });

    if (!node) {
      return NextResponse.json({ error: "Node not found" }, { status: 404 });
    }

    // Verify node belongs to user
    if (node.userId !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Create the reflection
    const reflection = await prisma.reflection.create({
      data: {
        userId: user.id,
        nodeId: node_id,
        surprise: surprise?.trim() || null,
        tag: tag.trim(),
        metaphor: metaphor?.trim() || null,
      },
    });

    return NextResponse.json(
      {
        id: reflection.id,
        node_id: reflection.nodeId,
        surprise: reflection.surprise,
        tag: reflection.tag,
        metaphor: reflection.metaphor,
        created_at: reflection.createdAt.toISOString(),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating reflection:", error);
    return NextResponse.json(
      { error: "Failed to create reflection" },
      { status: 500 }
    );
  }
}
