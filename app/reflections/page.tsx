"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Loading from "@/components/ui/Loading";

interface Reflection {
  id: string;
  node_id: string;
  surprise: string | null;
  tag: string;
  metaphor: string | null;
  created_at: string;
  node: {
    id: string;
    concept: string;
    generated_via: string;
    seed: {
      id: string;
      content: string;
    } | null;
    micro_discovery: {
      id: string;
      prompt: string;
      response: string;
    } | null;
  };
}

interface TagCount {
  tag: string;
  count: number;
}

export default function ReflectionsPage() {
  const router = useRouter();
  const [reflections, setReflections] = useState<Reflection[]>([]);
  const [tagCounts, setTagCounts] = useState<TagCount[]>([]);
  const [selectedTag, setSelectedTag] = useState<string>("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchReflections();
  }, [selectedTag]);

  async function fetchReflections() {
    try {
      setIsLoading(true);
      setError("");
      const url = selectedTag
        ? `/api/reflections?tag=${encodeURIComponent(selectedTag)}`
        : "/api/reflections";
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch reflections");
      const data = await response.json();
      setReflections(data.reflections);
      setTagCounts(data.tag_counts);
    } catch (err) {
      console.error("Error fetching reflections:", err);
      setError("Failed to load reflections");
    } finally {
      setIsLoading(false);
    }
  }

  function toggleExpand(id: string) {
    setExpandedId(expandedId === id ? null : id);
  }

  function handleTagFilter(tag: string) {
    setSelectedTag(selectedTag === tag ? "" : tag);
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            Your Reflections
          </h1>
          <Button onClick={() => router.push("/")} variant="secondary">
            Home
          </Button>
        </div>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Review your past explorations and the patterns in your thinking
        </p>
      </div>

      {/* Tag Filter */}
      {tagCounts.length > 0 && (
        <Card className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            Filter by Tag
          </h2>
          <div className="flex flex-wrap gap-2">
            {tagCounts.map((tc) => (
              <button
                key={tc.tag}
                onClick={() => handleTagFilter(tc.tag)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  selectedTag === tc.tag
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
                }`}
              >
                {tc.tag} ({tc.count})
              </button>
            ))}
          </div>
        </Card>
      )}

      {/* Reflections List */}
      {isLoading ? (
        <Loading text="Loading reflections..." />
      ) : error ? (
        <Card className="text-center border-red-300 bg-red-50 dark:bg-red-900/20">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </Card>
      ) : reflections.length === 0 ? (
        <Card className="text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {selectedTag
              ? `No reflections found with tag "${selectedTag}"`
              : "No reflections yet. Complete an exploration to create your first reflection!"}
          </p>
          {selectedTag && (
            <Button onClick={() => setSelectedTag("")} variant="secondary">
              Clear Filter
            </Button>
          )}
        </Card>
      ) : (
        <div className="space-y-4">
          {reflections.map((reflection) => (
            <Card key={reflection.id}>
              {/* Reflection Summary */}
              <div className="mb-3">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200">
                        {reflection.tag}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(reflection.created_at).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          }
                        )}
                      </span>
                    </div>
                    <p className="text-lg font-medium text-gray-900 dark:text-white">
                      {reflection.node.concept}
                    </p>
                  </div>
                </div>

                {reflection.surprise && (
                  <div className="mb-2">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Surprise:
                    </p>
                    <p className="text-gray-600 dark:text-gray-400">
                      {reflection.surprise}
                    </p>
                  </div>
                )}

                {reflection.metaphor && (
                  <div className="mb-2">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Metaphor:
                    </p>
                    <p className="text-gray-600 dark:text-gray-400 italic">
                      {reflection.metaphor}
                    </p>
                  </div>
                )}
              </div>

              {/* Toggle Expand Button */}
              <button
                onClick={() => toggleExpand(reflection.id)}
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium"
              >
                {expandedId === reflection.id
                  ? "Hide full context"
                  : "Show full context"}
              </button>

              {/* Expanded Context */}
              {expandedId === reflection.id && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-4">
                  {/* Original Seed */}
                  {reflection.node.seed && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Original Seed:
                      </p>
                      <p className="text-gray-600 dark:text-gray-400">
                        {reflection.node.seed.content}
                      </p>
                    </div>
                  )}

                  {/* Lateral Connection (concept) */}
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Explored Concept:
                    </p>
                    <p className="text-gray-600 dark:text-gray-400">
                      {reflection.node.concept}
                    </p>
                  </div>

                  {/* Micro-Discovery */}
                  {reflection.node.micro_discovery && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Discovery Prompt:
                      </p>
                      <p className="text-gray-600 dark:text-gray-400 mb-3 whitespace-pre-wrap">
                        {reflection.node.micro_discovery.prompt}
                      </p>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Your Response:
                      </p>
                      <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                        {reflection.node.micro_discovery.response}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
