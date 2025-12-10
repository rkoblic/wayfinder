import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { getDefaultUser } from "@/lib/db/helpers";

/**
 * GET /api/curiosity-map
 * Get all nodes and edges for the current user's curiosity map
 */
export async function GET(request: NextRequest) {
  try {
    // Get default user (since auth is skipped for MVP)
    const user = await getDefaultUser();

    // Get all nodes for the user
    const nodes = await prisma.node.findMany({
      where: { userId: user.id },
      select: {
        id: true,
        concept: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    // Get all lateral links between nodes
    const links = await prisma.lateralLink.findMany({
      where: {
        from: { userId: user.id },
      },
      select: {
        fromNode: true,
        toNode: true,
        relation: true,
      },
    });

    return NextResponse.json({
      nodes: nodes.map((node) => ({
        id: node.id,
        concept: node.concept,
      })),
      edges: links.map((link) => ({
        from_node: link.fromNode,
        to_node: link.toNode,
        relation: link.relation,
      })),
    });
  } catch (error) {
    console.error("Error fetching curiosity map:", error);
    return NextResponse.json(
      { error: "Failed to fetch curiosity map" },
      { status: 500 }
    );
  }
}
