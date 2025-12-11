import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { getDefaultUser } from "@/lib/db/helpers";

/**
 * GET /api/reflections
 * Fetch reflections for the current user
 * Query params:
 * - tag: optional filter by tag
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tagFilter = searchParams.get("tag");

    // Get default user (since auth is skipped for MVP)
    const user = await getDefaultUser();

    // Build query filter
    const where: any = {
      userId: user.id,
    };

    if (tagFilter) {
      where.tag = tagFilter;
    }

    // Fetch reflections with related node and micro-discovery data
    const reflections = await prisma.reflection.findMany({
      where,
      include: {
        node: {
          include: {
            seed: true,
            microDiscoveries: {
              orderBy: { createdAt: "desc" },
              take: 1, // Get the most recent micro-discovery for this node
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Get tag counts for autocomplete
    const tagCounts = await prisma.reflection.groupBy({
      by: ["tag"],
      where: { userId: user.id },
      _count: { tag: true },
      orderBy: { _count: { tag: "desc" } },
    });

    return NextResponse.json({
      reflections: reflections.map((r) => ({
        id: r.id,
        node_id: r.nodeId,
        surprise: r.surprise,
        tag: r.tag,
        metaphor: r.metaphor,
        created_at: r.createdAt.toISOString(),
        node: {
          id: r.node.id,
          concept: r.node.concept,
          generated_via: r.node.generatedVia,
          seed: r.node.seed
            ? {
                id: r.node.seed.id,
                content: r.node.seed.content,
              }
            : null,
          micro_discovery: r.node.microDiscoveries[0]
            ? {
                id: r.node.microDiscoveries[0].id,
                prompt: r.node.microDiscoveries[0].prompt,
                response: r.node.microDiscoveries[0].response,
              }
            : null,
        },
      })),
      tag_counts: tagCounts.map((tc) => ({
        tag: tc.tag,
        count: tc._count.tag,
      })),
    });
  } catch (error) {
    console.error("Error fetching reflections:", error);
    return NextResponse.json(
      { error: "Failed to fetch reflections" },
      { status: 500 }
    );
  }
}

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
