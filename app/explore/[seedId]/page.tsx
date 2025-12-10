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
  const [discoveryPrompt, setDiscoveryPrompt] = useState("");
  const [discoveryResponse, setDiscoveryResponse] = useState("");
  const [surprise, setSurprise] = useState("");
  const [tag, setTag] = useState("");
  const [metaphor, setMetaphor] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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
    setSelectedConnection(connection);
    setStep("discovery");
    // The discovery prompt will be generated when the user submits their response
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
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            Micro-Discovery
          </h2>
          <Card className="mb-6">
            <div className="mb-4">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Exploring connection:
              </span>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                {selectedConnection.concept}
              </h3>
            </div>
          </Card>

          <form onSubmit={handleSubmitDiscovery} className="space-y-4">
            <TextArea
              label="Take 1-5 minutes to respond to this exploration prompt:"
              placeholder="Write your thoughts, observations, or examples..."
              value={discoveryResponse}
              onChange={(e) => setDiscoveryResponse(e.target.value)}
              rows={6}
              error={error}
              disabled={isLoading}
            />
            <Button type="submit" isLoading={isLoading}>
              Continue to Reflection
            </Button>
          </form>
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
