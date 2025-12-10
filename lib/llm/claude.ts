/**
 * Anthropic Claude LLM Integration
 * Handles all LLM-related functionality for Wayfinder
 */

import Anthropic from "@anthropic-ai/sdk";

// Initialize the Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const MODEL = "claude-3-5-sonnet-20241022";

// Type definitions for lateral connections
export interface LateralConnection {
  concept: string;
  reason: string;
  type: "analogy" | "pattern" | "contrast" | "association";
}

/**
 * Generate lateral connections for a given concept
 * Returns 3-6 sideways connections (analogies, patterns, contrasts)
 */
export async function generateLateralConnections(
  concept: string
): Promise<LateralConnection[]> {
  try {
    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 1024,
      system:
        "You are an assistant that generates interesting lateral connections between ideas. You avoid simple hierarchies (broader/narrower) and trivial associations. You focus on analogies, structural parallels, and surprising neighbors across domains.",
      messages: [
        {
          role: "user",
          content: `Given the concept: "${concept}"

Generate 4 interesting lateral connections.

For each connection, return a JSON object with:
- "concept": the related concept (short phrase)
- "reason": 1–2 sentence explanation of the connection
- "type": one of ["analogy", "pattern", "contrast", "association"].

Return a JSON array only.`,
        },
      ],
    });

    // Extract the text content from the response
    const content = response.content[0];
    if (content.type !== "text") {
      throw new Error("Unexpected response type from Claude");
    }

    // Parse the JSON response
    const connections = JSON.parse(content.text) as LateralConnection[];

    // Validate the response
    if (!Array.isArray(connections) || connections.length === 0) {
      throw new Error("Invalid response format from Claude");
    }

    return connections;
  } catch (error) {
    console.error("Error generating lateral connections:", error);
    throw new Error("Failed to generate lateral connections");
  }
}

/**
 * Generate a micro-discovery prompt for a concept
 * Returns a short reflective activity that can be completed in 1-5 minutes
 */
export async function generateMicroDiscovery(
  concept: string
): Promise<string> {
  try {
    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 300,
      system:
        "You are an assistant that creates short reflective prompts. Each prompt should invite the user to think, imagine, compare, or design something related to a concept. Responses should be possible in 1–5 minutes.",
      messages: [
        {
          role: "user",
          content: `The user is exploring the concept: "${concept}".

Create one short reflective activity prompt related to this concept. It should:
- Be answerable in 1–2 short paragraphs or bullet points.
- Encourage the user to notice patterns, compare ideas, or imagine a concrete example.

Return the prompt as plain text only.`,
        },
      ],
    });

    // Extract the text content from the response
    const content = response.content[0];
    if (content.type !== "text") {
      throw new Error("Unexpected response type from Claude");
    }

    return content.text.trim();
  } catch (error) {
    console.error("Error generating micro-discovery:", error);
    throw new Error("Failed to generate micro-discovery prompt");
  }
}

/**
 * Generate a self-narrative based on user's exploration patterns
 * Returns a 3-5 sentence paragraph describing how the user explores ideas
 */
export async function generateSelfNarrative(
  summaryText: string
): Promise<string> {
  try {
    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 500,
      system:
        "You are an assistant that summarizes a person's curiosity patterns. Write in the second person, in simple and concise language. Avoid flattery. Focus on describing how they tend to explore, what themes they return to, and how they connect ideas.",
      messages: [
        {
          role: "user",
          content: `Here is a summary of the user's activity:

${summaryText}

Based on this, write a short paragraph (3–5 sentences) describing how this person tends to explore ideas, what they often notice, and the kinds of patterns they seem drawn to. Do not give advice. Simply describe.`,
        },
      ],
    });

    // Extract the text content from the response
    const content = response.content[0];
    if (content.type !== "text") {
      throw new Error("Unexpected response type from Claude");
    }

    return content.text.trim();
  } catch (error) {
    console.error("Error generating self-narrative:", error);
    throw new Error("Failed to generate self-narrative");
  }
}
