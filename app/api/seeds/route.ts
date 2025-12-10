import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { getDefaultUser } from "@/lib/db/helpers";

/**
 * POST /api/seeds
 * Create a new idea seed
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text } = body;

    if (!text || typeof text !== "string" || text.trim().length === 0) {
      return NextResponse.json(
        { error: "Text is required and must be a non-empty string" },
        { status: 400 }
      );
    }

    // Get default user (since auth is skipped for MVP)
    const user = await getDefaultUser();

    // Create the idea seed
    const seed = await prisma.ideaSeed.create({
      data: {
        text: text.trim(),
        userId: user.id,
      },
    });

    // Create initial node from this seed
    await prisma.node.create({
      data: {
        userId: user.id,
        seedId: seed.id,
        concept: text.trim(),
        generatedVia: "seed",
      },
    });

    return NextResponse.json(
      {
        id: seed.id,
        text: seed.text,
        created_at: seed.createdAt.toISOString(),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating seed:", error);
    return NextResponse.json(
      { error: "Failed to create idea seed" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/seeds
 * List all idea seeds for the current user
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    // Get default user (since auth is skipped for MVP)
    const user = await getDefaultUser();

    const seeds = await prisma.ideaSeed.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
    });

    return NextResponse.json(
      seeds.map((seed) => ({
        id: seed.id,
        text: seed.text,
        created_at: seed.createdAt.toISOString(),
      }))
    );
  } catch (error) {
    console.error("Error fetching seeds:", error);
    return NextResponse.json(
      { error: "Failed to fetch idea seeds" },
      { status: 500 }
    );
  }
}
