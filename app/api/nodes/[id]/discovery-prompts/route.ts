import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { generateDiscoveryPrompts } from "@/lib/llm/claude";
import { getDefaultUser } from "@/lib/db/helpers";

/**
 * GET /api/nodes/:id/discovery-prompts
 * Generate discovery prompts for exploring a lateral connection
 * Query params:
 * - connectionConcept: the lateral connection concept
 * - connectionReason: why these concepts are related
 * - connectionType: type of relationship (analogy, pattern, contrast, association)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const searchParams = request.nextUrl.searchParams;

    // Get query parameters
    const connectionConcept = searchParams.get("connectionConcept");
    const connectionReason = searchParams.get("connectionReason");
    const connectionType = searchParams.get("connectionType");

    if (!connectionConcept || !connectionReason || !connectionType) {
      return NextResponse.json(
        { error: "Missing required query parameters" },
        { status: 400 }
      );
    }

    // Get default user (since auth is skipped for MVP)
    const user = await getDefaultUser();

    // Find the node (original seed)
    const node = await prisma.node.findUnique({
      where: { id },
      include: {
        seed: true,
      },
    });

    if (!node) {
      return NextResponse.json({ error: "Node not found" }, { status: 404 });
    }

    // Verify node belongs to user
    if (node.userId !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Generate discovery prompts using LLM
    const prompts = await generateDiscoveryPrompts(node.concept, {
      concept: connectionConcept,
      reason: connectionReason,
      type: connectionType,
    });

    return NextResponse.json({
      seedConcept: node.concept,
      lateralConnection: {
        concept: connectionConcept,
        reason: connectionReason,
        type: connectionType,
      },
      bridgingText: prompts.bridgingText,
      questions: prompts.questions,
    });
  } catch (error) {
    console.error("Error generating discovery prompts:", error);
    return NextResponse.json(
      { error: "Failed to generate discovery prompts" },
      { status: 500 }
    );
  }
}
