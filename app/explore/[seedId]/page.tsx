"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import TextArea from "@/components/ui/TextArea";
import Input from "@/components/ui/Input";
import Loading from "@/components/ui/Loading";

interface LateralConnection {
  concept: string;
  reason: string;
  type: "analogy" | "pattern" | "contrast" | "association";
}

type Step =
  | "loading"
  | "connections"
  | "discovery"
  | "reflection"
  | "complete";

export default function ExplorePage() {
  const params = useParams();
  const router = useRouter();
  const seedId = params.seedId as string;

  const [step, setStep] = useState<Step>("loading");
  const [seedText, setSeedText] = useState("");
  const [nodeId, setNodeId] = useState("");
  const [connections, setConnections] = useState<LateralConnection[]>([]);
  const [selectedConnection, setSelectedConnection] =
    useState<LateralConnection | null>(null);
  const [bridgingText, setBridgingText] = useState("");
  const [questions, setQuestions] = useState<string[]>([]);
  const [discoveryPrompt, setDiscoveryPrompt] = useState("");
  const [discoveryResponse, setDiscoveryResponse] = useState("");
  const [surprise, setSurprise] = useState("");
  const [tag, setTag] = useState("");
  const [metaphor, setMetaphor] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingPrompts, setIsLoadingPrompts] = useState(false);

  useEffect(() => {
    initializeExploration();
  }, [seedId]);

  async function initializeExploration() {
    try {
      // Fetch the seed
      const seedResponse = await fetch("/api/seeds");
      if (!seedResponse.ok) throw new Error("Failed to fetch seed");
      const seeds = await seedResponse.json();
      const seed = seeds.find((s: any) => s.id === seedId);

      if (!seed) {
        setError("Seed not found");
        return;
      }

      setSeedText(seed.text);

      // Get the curiosity map to find the node for this seed
      const mapResponse = await fetch("/api/curiosity-map");
      if (!mapResponse.ok) throw new Error("Failed to fetch curiosity map");
      const map = await mapResponse.json();

      // Find the node that matches this seed's concept
      const node = map.nodes.find((n: any) => n.concept === seed.text);

      if (!node) {
        setError("Node not found for this seed");
        return;
      }

      setNodeId(node.id);

      // Fetch lateral connections
      await fetchConnections(node.id);
    } catch (err) {
      console.error("Error initializing exploration:", err);
      setError("Failed to initialize exploration");
    }
  }

  async function fetchConnections(nId: string) {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/nodes/${nId}/sideways`);
      if (!response.ok) throw new Error("Failed to fetch connections");
      const data = await response.json();
      setConnections(data.connections);
      setStep("connections");
    } catch (err) {
      console.error("Error fetching connections:", err);
      setError("Failed to generate lateral connections");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSelectConnection(connection: LateralConnection) {
    try {
      setSelectedConnection(connection);
      setIsLoadingPrompts(true);
      setError("");
      setStep("discovery");

      // Fetch discovery prompts
      const params = new URLSearchParams({
        connectionConcept: connection.concept,
        connectionReason: connection.reason,
        connectionType: connection.type,
      });

      const response = await fetch(
        `/api/nodes/${nodeId}/discovery-prompts?${params}`
      );

      if (!response.ok) throw new Error("Failed to fetch discovery prompts");

      const data = await response.json();
      setBridgingText(data.bridgingText);
      setQuestions(data.questions);
    } catch (err) {
      console.error("Error fetching discovery prompts:", err);
      setError("Failed to generate exploration prompts. Please try again.");
      setStep("connections");
    } finally {
      setIsLoadingPrompts(false);
    }
  }

  async function handleSubmitDiscovery(e: React.FormEvent) {
    e.preventDefault();
    if (!discoveryResponse.trim()) {
      setError("Please enter your response");
      return;
    }

    try {
      setIsLoading(true);
      setError("");

      // Create micro-discovery
      const response = await fetch("/api/micro-discoveries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          node_id: nodeId,
          response: discoveryResponse,
          questions: questions,
        }),
      });

      if (!response.ok) throw new Error("Failed to save discovery");
      const data = await response.json();
      setDiscoveryPrompt(data.prompt);

      setStep("reflection");
    } catch (err) {
      console.error("Error submitting discovery:", err);
      setError("Failed to save your response");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSubmitReflection(e: React.FormEvent) {
    e.preventDefault();
    if (!tag.trim()) {
      setError("Please enter a tag");
      return;
    }

    try {
      setIsLoading(true);
      setError("");

      // Create reflection
      const response = await fetch("/api/reflections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          node_id: nodeId,
          surprise: surprise.trim() || null,
          tag: tag.trim(),
          metaphor: metaphor.trim() || null,
        }),
      });

      if (!response.ok) throw new Error("Failed to save reflection");

      setStep("complete");
    } catch (err) {
      console.error("Error submitting reflection:", err);
      setError("Failed to save your reflection");
    } finally {
      setIsLoading(false);
    }
  }

  if (error && step === "loading") {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Card>
          <p className="text-red-600">{error}</p>
          <Button onClick={() => router.push("/")} className="mt-4">
            Return Home
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Exploring: {seedText}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Follow your curiosity through lateral connections
        </p>
      </div>

      {/* Loading State */}
      {step === "loading" && <Loading text="Preparing your exploration..." />}

      {/* Step 1: Lateral Connections */}
      {step === "connections" && (
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            Lateral Connections
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            These are sideways connections generated by AI. Select one that
            intrigues you:
          </p>

          {isLoading ? (
            <Loading text="Generating connections..." />
          ) : (
            <div className="grid gap-4">
              {connections.map((conn, index) => (
                <Card
                  key={index}
                  hover
                  onClick={() => handleSelectConnection(conn)}
                >
                  <div className="flex items-start gap-4">
                    <span className="text-3xl mt-1">
                      {conn.type === "analogy" && "🔄"}
                      {conn.type === "pattern" && "🔗"}
                      {conn.type === "contrast" && "⚡"}
                      {conn.type === "association" && "💡"}
                    </span>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        {conn.concept}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        {conn.reason}
                      </p>
                      <span className="inline-block mt-2 text-xs font-medium text-blue-600 dark:text-blue-400 uppercase">
                        {conn.type}
                      </span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Step 2: Micro-Discovery */}
      {step === "discovery" && selectedConnection && (
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
            Micro-Discovery
          </h2>

          {isLoadingPrompts ? (
            <Loading text="Generating exploration prompts..." />
          ) : (
            <>
              {/* Context Section */}
              <Card className="mb-6 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-blue-200 dark:border-blue-800">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      You started exploring:
                    </p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {seedText}
                    </p>
                  </div>

                  <div className="flex items-center justify-center">
                    <span className="text-2xl text-gray-400 dark:text-gray-500">
                      ↓
                    </span>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Now exploring:
                      </p>
                      <span className="text-xs font-medium px-2 py-1 rounded bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 uppercase">
                        {selectedConnection.type}
                      </span>
                    </div>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {selectedConnection.concept}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 italic">
                      {selectedConnection.reason}
                    </p>
                  </div>
                </div>
              </Card>

              {/* Bridging Text */}
              {bridgingText && (
                <Card className="mb-6">
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    {bridgingText}
                  </p>
                </Card>
              )}

              {/* Exploration Questions */}
              {questions.length > 0 && (
                <Card className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Reflection Questions
                  </h3>
                  <div className="space-y-4">
                    {questions.map((question, index) => (
                      <div
                        key={index}
                        className="flex gap-3 p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50"
                      >
                        <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 font-semibold text-sm">
                          {index + 1}
                        </span>
                        <p className="flex-1 text-gray-700 dark:text-gray-300">
                          {question}
                        </p>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Response Area */}
              <form onSubmit={handleSubmitDiscovery} className="space-y-4">
                <TextArea
                  label="Your Thoughts"
                  placeholder="Take 5-10 minutes to explore these questions. Write your thoughts, observations, examples, or any connections you notice..."
                  value={discoveryResponse}
                  onChange={(e) => setDiscoveryResponse(e.target.value)}
                  rows={8}
                  error={error}
                  disabled={isLoading}
                />
                <Button type="submit" isLoading={isLoading}>
                  Continue to Reflection
                </Button>
              </form>
            </>
          )}
        </div>
      )}

      {/* Step 3: Reflection */}
      {step === "reflection" && (
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            Reflection
          </h2>

          <Card className="mb-6">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
              Your response:
            </p>
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
              {discoveryResponse}
            </p>
          </Card>

          <form onSubmit={handleSubmitReflection} className="space-y-4">
            <TextArea
              label="What surprised you? (optional)"
              placeholder="Any insights or unexpected observations?"
              value={surprise}
              onChange={(e) => setSurprise(e.target.value)}
              rows={3}
            />

            <Input
              label="Tag this exploration (required)"
              placeholder="e.g., systems, aesthetics, paradox"
              value={tag}
              onChange={(e) => setTag(e.target.value)}
              error={error}
              disabled={isLoading}
              required
            />

            <TextArea
              label="Metaphor or phrase (optional)"
              placeholder="Any metaphor that comes to mind?"
              value={metaphor}
              onChange={(e) => setMetaphor(e.target.value)}
              rows={2}
            />

            <Button type="submit" isLoading={isLoading}>
              Complete Exploration
            </Button>
          </form>
        </div>
      )}

      {/* Step 4: Complete */}
      {step === "complete" && (
        <div className="text-center">
          <Card>
            <div className="text-6xl mb-4">✨</div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              Exploration Complete!
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Your reflection has been added to your curiosity map.
            </p>
            <div className="flex gap-4 justify-center">
              <Button onClick={() => router.push("/")}>
                Return Home
              </Button>
              <Button variant="secondary" onClick={() => router.push("/map")}>
                View Curiosity Map
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
