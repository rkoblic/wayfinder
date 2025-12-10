import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { generateLateralConnections } from "@/lib/llm/claude";
import { getDefaultUser } from "@/lib/db/helpers";

/**
 * GET /api/nodes/:id/sideways
 * Get lateral connections for a node
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Get default user (since auth is skipped for MVP)
    const user = await getDefaultUser();

    // Find the node
    const node = await prisma.node.findUnique({
      where: { id },
    });

    if (!node) {
      return NextResponse.json({ error: "Node not found" }, { status: 404 });
    }

    // Verify node belongs to user
    if (node.userId !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Generate lateral connections using LLM
    const connections = await generateLateralConnections(node.concept);

    return NextResponse.json({
      node: {
        id: node.id,
        concept: node.concept,
      },
      connections: connections.map((conn) => ({
        concept: conn.concept,
        reason: conn.reason,
        type: conn.type,
      })),
    });
  } catch (error) {
    console.error("Error generating lateral connections:", error);
    return NextResponse.json(
      { error: "Failed to generate lateral connections" },
      { status: 500 }
    );
  }
}
