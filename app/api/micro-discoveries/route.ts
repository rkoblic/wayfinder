import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { generateMicroDiscovery } from "@/lib/llm/claude";
import { getDefaultUser } from "@/lib/db/helpers";

/**
 * POST /api/micro-discoveries
 * Create a micro-discovery with user's response
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { node_id, response } = body;

    if (!node_id || typeof node_id !== "string") {
      return NextResponse.json(
        { error: "node_id is required" },
        { status: 400 }
      );
    }

    if (!response || typeof response !== "string" || response.trim().length === 0) {
      return NextResponse.json(
        { error: "response is required and must be a non-empty string" },
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

    // Generate micro-discovery prompt using LLM
    const prompt = await generateMicroDiscovery(node.concept);

    // Create the micro-discovery
    const microDiscovery = await prisma.microDiscovery.create({
      data: {
        userId: user.id,
        nodeId: node_id,
        prompt,
        response: response.trim(),
      },
    });

    return NextResponse.json(
      {
        id: microDiscovery.id,
        node_id: microDiscovery.nodeId,
        prompt: microDiscovery.prompt,
        response: microDiscovery.response,
        created_at: microDiscovery.createdAt.toISOString(),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating micro-discovery:", error);
    return NextResponse.json(
      { error: "Failed to create micro-discovery" },
      { status: 500 }
    );
  }
}
