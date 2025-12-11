import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { generateMicroDiscovery } from "@/lib/llm/claude";
import { getDefaultUser } from "@/lib/db/helpers";

/**
 * POST /api/micro-discoveries
 * Create a micro-discovery with user's response
 * Expects: node_id, response, questions (array of reflection questions), connection (optional lateral connection data)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { node_id, response, questions, connection } = body;

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

    if (!questions || !Array.isArray(questions)) {
      return NextResponse.json(
        { error: "questions must be an array" },
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

    // Store questions as JSON string in the prompt field
    const promptData = JSON.stringify(questions);

    // Create the micro-discovery
    const microDiscovery = await prisma.microDiscovery.create({
      data: {
        userId: user.id,
        nodeId: node_id,
        prompt: promptData,
        response: response.trim(),
      },
    });

    // If connection data is provided, create new Node and LateralLink
    let newNode = null;
    let lateralLink = null;

    if (connection && connection.concept && connection.type) {
      // Create new Node for the lateral connection
      newNode = await prisma.node.create({
        data: {
          userId: user.id,
          seedId: node.seedId, // Link to same seed as parent node
          concept: connection.concept,
          generatedVia: "sideways",
          metadata: {
            reason: connection.reason || null,
            parentNodeId: node_id,
          },
        },
      });

      // Create LateralLink between the nodes
      lateralLink = await prisma.lateralLink.create({
        data: {
          fromNode: node_id,
          toNode: newNode.id,
          relation: connection.type, // analogy, pattern, contrast, association
        },
      });
    }

    return NextResponse.json(
      {
        id: microDiscovery.id,
        node_id: microDiscovery.nodeId,
        prompt: microDiscovery.prompt,
        response: microDiscovery.response,
        created_at: microDiscovery.createdAt.toISOString(),
        new_node: newNode
          ? {
              id: newNode.id,
              concept: newNode.concept,
              generated_via: newNode.generatedVia,
            }
          : null,
        lateral_link: lateralLink
          ? {
              id: lateralLink.id,
              from_node: lateralLink.fromNode,
              to_node: lateralLink.toNode,
              relation: lateralLink.relation,
            }
          : null,
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
