"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Loading from "@/components/ui/Loading";

interface Seed {
  id: string;
  text: string;
  created_at: string;
}

export default function Home() {
  const router = useRouter();
  const [seedText, setSeedText] = useState("");
  const [seeds, setSeeds] = useState<Seed[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState("");

  // Fetch seeds on mount
  useEffect(() => {
    fetchSeeds();
  }, []);

  async function fetchSeeds() {
    try {
      setIsLoading(true);
      const response = await fetch("/api/seeds");
      if (!response.ok) throw new Error("Failed to fetch seeds");
      const data = await response.json();
      setSeeds(data);
    } catch (err) {
      console.error("Error fetching seeds:", err);
      setError("Failed to load seeds");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCreateSeed(e: React.FormEvent) {
    e.preventDefault();
    if (!seedText.trim()) {
      setError("Please enter an idea seed");
      return;
    }

    try {
      setIsCreating(true);
      setError("");
      const response = await fetch("/api/seeds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: seedText }),
      });

      if (!response.ok) throw new Error("Failed to create seed");

      const newSeed = await response.json();
      setSeeds([newSeed, ...seeds]);
      setSeedText("");

      // Navigate to explore this seed
      router.push(`/explore/${newSeed.id}`);
    } catch (err) {
      console.error("Error creating seed:", err);
      setError("Failed to create seed. Please try again.");
    } finally {
      setIsCreating(false);
    }
  }

  function handleSeedClick(seedId: string) {
    router.push(`/explore/${seedId}`);
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Welcome to Wayfinder
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          A curiosity-first learning platform. Start by entering an idea seed,
          then explore lateral connections and discover your thinking patterns.
        </p>
      </div>

      {/* Create Seed Form */}
      <Card className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
          Start Exploring
        </h2>
        <form onSubmit={handleCreateSeed} className="space-y-4">
          <Input
            type="text"
            placeholder="Enter an idea seed (e.g., 'ikebana and negative space')"
            value={seedText}
            onChange={(e) => setSeedText(e.target.value)}
            error={error}
            disabled={isCreating}
          />
          <Button
            type="submit"
            isLoading={isCreating}
            disabled={!seedText.trim()}
            className="w-full sm:w-auto"
          >
            Begin Exploration
          </Button>
        </form>
      </Card>

      {/* Seeds List */}
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
          Your Previous Seeds
        </h2>

        {isLoading ? (
          <Loading text="Loading your seeds..." />
        ) : seeds.length === 0 ? (
          <Card className="text-center">
            <p className="text-gray-600 dark:text-gray-400">
              No seeds yet. Create your first idea seed above to begin your
              curiosity journey!
            </p>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {seeds.map((seed) => (
              <Card
                key={seed.id}
                hover
                onClick={() => handleSeedClick(seed.id)}
              >
                <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  {seed.text}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {new Date(seed.created_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
