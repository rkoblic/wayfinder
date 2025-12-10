"use client";

import { useState, useEffect } from "react";
import Card from "@/components/ui/Card";
import Loading from "@/components/ui/Loading";

interface Node {
  id: string;
  concept: string;
}

interface Edge {
  from_node: string;
  to_node: string;
  relation: string;
}

interface MapData {
  nodes: Node[];
  edges: Edge[];
}

export default function MapPage() {
  const [mapData, setMapData] = useState<MapData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);

  useEffect(() => {
    fetchMap();
  }, []);

  async function fetchMap() {
    try {
      setIsLoading(true);
      const response = await fetch("/api/curiosity-map");
      if (!response.ok) throw new Error("Failed to fetch map");
      const data = await response.json();
      setMapData(data);
    } catch (err) {
      console.error("Error fetching map:", err);
      setError("Failed to load curiosity map");
    } finally {
      setIsLoading(false);
    }
  }

  function getConnectedNodes(nodeId: string): { node: Node; relation: string }[] {
    if (!mapData) return [];

    const connections: { node: Node; relation: string }[] = [];

    // Find outgoing connections
    mapData.edges.forEach((edge) => {
      if (edge.from_node === nodeId) {
        const toNode = mapData.nodes.find((n) => n.id === edge.to_node);
        if (toNode) {
          connections.push({ node: toNode, relation: edge.relation });
        }
      }
    });

    return connections;
  }

  function getNodeStats() {
    if (!mapData) return { nodes: 0, connections: 0 };
    return {
      nodes: mapData.nodes.length,
      connections: mapData.edges.length,
    };
  }

  const stats = getNodeStats();

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <Loading text="Loading your curiosity map..." />
      </div>
    );
  }

  if (error || !mapData) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <Card>
          <p className="text-red-600">{error || "Failed to load map"}</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Your Curiosity Map
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Visualize your exploration patterns and connections
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <p className="text-sm text-gray-500 dark:text-gray-400">Concepts</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {stats.nodes}
          </p>
        </Card>
        <Card>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Connections
          </p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {stats.connections}
          </p>
        </Card>
        <Card>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Branching
          </p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {stats.nodes > 0
              ? (stats.connections / stats.nodes).toFixed(1)
              : "0"}
          </p>
        </Card>
        <Card>
          <p className="text-sm text-gray-500 dark:text-gray-400">Density</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {stats.nodes > 1
              ? (
                  (stats.connections / (stats.nodes * (stats.nodes - 1))) *
                  100
                ).toFixed(0)
              : "0"}
            %
          </p>
        </Card>
      </div>

      {/* Empty State */}
      {mapData.nodes.length === 0 ? (
        <Card className="text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Your curiosity map is empty. Start by creating an idea seed on the
            home page!
          </p>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-8">
          {/* Nodes List */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              All Concepts
            </h2>
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {mapData.nodes.map((node) => (
                <Card
                  key={node.id}
                  hover
                  onClick={() => setSelectedNode(node)}
                  className={`${
                    selectedNode?.id === node.id
                      ? "ring-2 ring-blue-500"
                      : ""
                  }`}
                >
                  <p className="font-medium text-gray-900 dark:text-white">
                    {node.concept}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {getConnectedNodes(node.id).length} connection
                    {getConnectedNodes(node.id).length !== 1 ? "s" : ""}
                  </p>
                </Card>
              ))}
            </div>
          </div>

          {/* Node Details */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              {selectedNode ? "Connections" : "Select a Concept"}
            </h2>
            {selectedNode ? (
              <div className="space-y-4">
                <Card>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {selectedNode.concept}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Selected concept
                  </p>
                </Card>

                {getConnectedNodes(selectedNode.id).length > 0 ? (
                  <div className="space-y-2">
                    {getConnectedNodes(selectedNode.id).map((conn, idx) => (
                      <Card key={idx} hover onClick={() => setSelectedNode(conn.node)}>
                        <div className="flex items-start gap-3">
                          <span className="text-2xl mt-1">
                            {conn.relation === "analogy" && "🔄"}
                            {conn.relation === "pattern" && "🔗"}
                            {conn.relation === "contrast" && "⚡"}
                            {conn.relation === "association" && "💡"}
                          </span>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {conn.node.concept}
                            </p>
                            <p className="text-xs text-blue-600 dark:text-blue-400 uppercase mt-1">
                              {conn.relation}
                            </p>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card>
                    <p className="text-gray-600 dark:text-gray-400">
                      No outgoing connections from this concept yet.
                    </p>
                  </Card>
                )}
              </div>
            ) : (
              <Card>
                <p className="text-gray-600 dark:text-gray-400">
                  Click on a concept to see its connections and explore how your
                  ideas relate to each other.
                </p>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
