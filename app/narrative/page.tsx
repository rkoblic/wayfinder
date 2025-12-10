"use client";

import { useState, useEffect } from "react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Loading from "@/components/ui/Loading";

interface Narrative {
  id: string;
  narrative: string;
  created_at: string;
}

export default function NarrativePage() {
  const [narrative, setNarrative] = useState<Narrative | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchNarrative();
  }, []);

  async function fetchNarrative() {
    try {
      setIsLoading(true);
      setError("");
      const response = await fetch("/api/self-narrative");

      if (response.status === 404) {
        // No narrative exists yet
        setNarrative(null);
      } else if (!response.ok) {
        throw new Error("Failed to fetch narrative");
      } else {
        const data = await response.json();
        setNarrative(data);
      }
    } catch (err) {
      console.error("Error fetching narrative:", err);
      setError("Failed to load narrative");
    } finally {
      setIsLoading(false);
    }
  }

  async function generateNarrative() {
    try {
      setIsGenerating(true);
      setError("");
      const response = await fetch("/api/self-narrative", {
        method: "POST",
      });

      if (!response.ok) throw new Error("Failed to generate narrative");

      const data = await response.json();
      setNarrative(data);
    } catch (err) {
      console.error("Error generating narrative:", err);
      setError("Failed to generate narrative. Make sure you have completed some explorations first.");
    } finally {
      setIsGenerating(false);
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Loading text="Loading your self-narrative..." />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Your Self-Narrative
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          An AI-generated reflection on how you explore ideas and what patterns
          you tend to notice
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <Card className="mb-6 border-red-300 bg-red-50 dark:bg-red-900/20">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </Card>
      )}

      {/* No Narrative State */}
      {!narrative && !isLoading && (
        <Card className="text-center">
          <div className="py-8">
            <div className="text-6xl mb-4">📖</div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              No Narrative Yet
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
              Your self-narrative is a personalized summary of your curiosity
              patterns. Complete some explorations first, then generate your
              narrative.
            </p>
            <Button
              onClick={generateNarrative}
              isLoading={isGenerating}
              size="lg"
            >
              Generate My Narrative
            </Button>
          </div>
        </Card>
      )}

      {/* Narrative Display */}
      {narrative && (
        <div className="space-y-6">
          <Card>
            <div className="prose prose-lg dark:prose-invert max-w-none">
              <p className="text-xl leading-relaxed text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                {narrative.narrative}
              </p>
            </div>
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Generated on{" "}
                {new Date(narrative.created_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </Card>

          {/* Generate New Narrative */}
          <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Generate a New Narrative
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  As you complete more explorations, your narrative will evolve
                  to reflect your changing patterns and interests.
                </p>
              </div>
              <Button
                onClick={generateNarrative}
                isLoading={isGenerating}
                variant="primary"
              >
                Regenerate
              </Button>
            </div>
          </Card>

          {/* Insights Card */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              About Your Narrative
            </h3>
            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <p>
                ✨ Your self-narrative is generated by AI based on your
                exploration history, including your tags, reflections, and the
                concepts you've explored.
              </p>
              <p>
                🔄 You can regenerate it anytime to get an updated perspective
                on your thinking patterns.
              </p>
              <p>
                🎯 It's designed to help you understand your own curiosity
                style—how you explore, what themes you return to, and how you
                connect ideas.
              </p>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
