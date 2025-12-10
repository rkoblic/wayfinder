import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { generateSelfNarrative } from "@/lib/llm/claude";
import { getDefaultUser, buildUserSummary } from "@/lib/db/helpers";

/**
 * POST /api/self-narrative
 * Generate a new self-narrative based on user's exploration patterns
 */
export async function POST(request: NextRequest) {
  try {
    // Get default user (since auth is skipped for MVP)
    const user = await getDefaultUser();

    // Build summary of user's activity
    const summaryText = await buildUserSummary(user.id);

    // Generate narrative using LLM
    const narrativeText = await generateSelfNarrative(summaryText);

    // Store the narrative
    const narrative = await prisma.selfNarrative.create({
      data: {
        userId: user.id,
        narrative: narrativeText,
      },
    });

    return NextResponse.json({
      id: narrative.id,
      narrative: narrative.narrative,
      created_at: narrative.createdAt.toISOString(),
    });
  } catch (error) {
    console.error("Error generating self-narrative:", error);
    return NextResponse.json(
      { error: "Failed to generate self-narrative" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/self-narrative
 * Get the latest self-narrative for the current user
 */
export async function GET(request: NextRequest) {
  try {
    // Get default user (since auth is skipped for MVP)
    const user = await getDefaultUser();

    // Get the most recent narrative
    const narrative = await prisma.selfNarrative.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });

    if (!narrative) {
      return NextResponse.json(
        { error: "No narrative found. Generate one first." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: narrative.id,
      narrative: narrative.narrative,
      created_at: narrative.createdAt.toISOString(),
    });
  } catch (error) {
    console.error("Error fetching self-narrative:", error);
    return NextResponse.json(
      { error: "Failed to fetch self-narrative" },
      { status: 500 }
    );
  }
}
