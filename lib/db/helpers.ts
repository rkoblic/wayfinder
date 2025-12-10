/**
 * Database Helper Functions
 * Common database operations for Wayfinder
 */

import prisma from "./prisma";

/**
 * Get or create the default user for MVP
 * Since auth is skipped, we use a single default user
 */
export async function getDefaultUser() {
  const email = "default@wayfinder.app";

  let user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    user = await prisma.user.create({
      data: { email },
    });
  }

  return user;
}

/**
 * Build summary text for self-narrative generation
 * Aggregates user's tags, reflections, and patterns
 */
export async function buildUserSummary(userId: string): Promise<string> {
  // Get most frequent tags
  const reflections = await prisma.reflection.findMany({
    where: { userId },
    select: { tag: true, surprise: true },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const tagCounts = reflections.reduce((acc, r) => {
    acc[r.tag] = (acc[r.tag] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topTags = Object.entries(tagCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([tag]) => tag);

  // Get example reflections with surprise text
  const exampleReflections = reflections
    .filter((r) => r.surprise)
    .slice(0, 3)
    .map((r) => `- "${r.surprise}"`);

  // Get frequently explored concepts
  const nodes = await prisma.node.findMany({
    where: { userId },
    select: { concept: true },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  const concepts = nodes.map((n) => n.concept).slice(0, 5);

  // Build summary text
  let summary = "";

  if (topTags.length > 0) {
    summary += `User tags used most frequently: ${topTags.join(", ")}\n\n`;
  }

  if (exampleReflections.length > 0) {
    summary += `Example reflections:\n${exampleReflections.join("\n")}\n\n`;
  }

  if (concepts.length > 0) {
    summary += `User often explores: ${concepts.join(", ")}\n`;
  }

  return summary.trim() || "User has just started exploring.";
}
