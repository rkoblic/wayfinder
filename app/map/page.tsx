"use client";

import { useState, useEffect } from "react";
import Card from "@/components/ui/Card";
import Loading from "@/components/ui/Loading";
import Button from "@/components/ui/Button";
import CuriosityGraph from "@/components/CuriosityGraph";

interface Node {
  id: string;
  concept: string;
}

interface Edge {
  id: string;
  from_node: string;
  to_node: string;
  relation: string;
}

interface MapData {
  nodes: Node[];
  edges: Edge[];
}

type ViewMode = "list" | "graph";

export default function MapPage() {
  const [mapData, setMapData] = useState<MapData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creatingConnection, setCreatingConnection] = useState(false);
  const [deletingLinkId, setDeletingLinkId] = useState<string | null>(null);
  const [editingLink, setEditingLink] = useState<{
    id: string;
    relation: string;
  } | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("list");

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

  async function handleDeleteConnection(edgeId: string) {
    if (!confirm("Are you sure you want to delete this connection?")) return;

    try {
      setDeletingLinkId(edgeId);
      const response = await fetch(`/api/lateral-links/${edgeId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete connection");

      // Refresh map data
      await fetchMap();
    } catch (err) {
      console.error("Error deleting connection:", err);
      alert("Failed to delete connection");
    } finally {
      setDeletingLinkId(null);
    }
  }

  async function handleUpdateRelation(edgeId: string, newRelation: string) {
    try {
      const response = await fetch(`/api/lateral-links/${edgeId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ relation: newRelation }),
      });

      if (!response.ok) throw new Error("Failed to update connection");

      // Refresh map data
      await fetchMap();
      setEditingLink(null);
    } catch (err) {
      console.error("Error updating connection:", err);
      alert("Failed to update connection");
    }
  }

  function getConnectedNodes(
    nodeId: string
  ): { edge: Edge; node: Node; relation: string }[] {
    if (!mapData) return [];

    const connections: { edge: Edge; node: Node; relation: string }[] = [];

    // Find outgoing connections
    mapData.edges.forEach((edge) => {
      if (edge.from_node === nodeId) {
        const toNode = mapData.nodes.find((n) => n.id === edge.to_node);
        if (toNode) {
          connections.push({ edge, node: toNode, relation: edge.relation });
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
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Your Curiosity Map
          </h1>
          {mapData && mapData.nodes.length > 0 && (
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={viewMode === "list" ? "primary" : "secondary"}
                onClick={() => setViewMode("list")}
              >
                List View
              </Button>
              <Button
                size="sm"
                variant={viewMode === "graph" ? "primary" : "secondary"}
                onClick={() => setViewMode("graph")}
              >
                Graph View
              </Button>
            </div>
          )}
        </div>
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
      ) : viewMode === "graph" ? (
        /* Graph View */
        <CuriosityGraph
          nodes={mapData.nodes}
          edges={mapData.edges}
          onNodeClick={setSelectedNode}
          selectedNodeId={selectedNode?.id || null}
        />
      ) : (
        /* List View */
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
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {selectedNode ? "Connections" : "Select a Concept"}
              </h2>
              {selectedNode && (
                <Button
                  size="sm"
                  onClick={() => setShowCreateModal(true)}
                  variant="secondary"
                >
                  + Create Connection
                </Button>
              )}
            </div>
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
                      <Card key={idx}>
                        <div className="flex items-start justify-between gap-3">
                          <div
                            className="flex-1 flex items-start gap-3 cursor-pointer hover:opacity-70"
                            onClick={() => setSelectedNode(conn.node)}
                          >
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
                              {editingLink?.id === conn.edge.id ? (
                                <select
                                  value={editingLink.relation}
                                  onChange={(e) =>
                                    setEditingLink({
                                      ...editingLink,
                                      relation: e.target.value,
                                    })
                                  }
                                  onClick={(e) => e.stopPropagation()}
                                  className="text-xs uppercase mt-1 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-1 py-0.5"
                                >
                                  <option value="analogy">Analogy</option>
                                  <option value="pattern">Pattern</option>
                                  <option value="contrast">Contrast</option>
                                  <option value="association">Association</option>
                                </select>
                              ) : (
                                <p className="text-xs text-blue-600 dark:text-blue-400 uppercase mt-1">
                                  {conn.relation}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                            {editingLink?.id === conn.edge.id ? (
                              <>
                                <button
                                  onClick={() =>
                                    handleUpdateRelation(
                                      conn.edge.id,
                                      editingLink.relation
                                    )
                                  }
                                  className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                                >
                                  Save
                                </button>
                                <button
                                  onClick={() => setEditingLink(null)}
                                  className="text-xs px-2 py-1 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded hover:bg-gray-400 dark:hover:bg-gray-500"
                                >
                                  Cancel
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() =>
                                    setEditingLink({
                                      id: conn.edge.id,
                                      relation: conn.relation,
                                    })
                                  }
                                  className="text-xs px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDeleteConnection(conn.edge.id)}
                                  disabled={deletingLinkId === conn.edge.id}
                                  className="text-xs px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded hover:bg-red-200 dark:hover:bg-red-900/50 disabled:opacity-50"
                                >
                                  {deletingLinkId === conn.edge.id
                                    ? "Deleting..."
                                    : "Delete"}
                                </button>
                              </>
                            )}
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

      {/* Create Connection Modal */}
      {showCreateModal && selectedNode && mapData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Create Connection
            </h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const toNodeId = formData.get("to_node") as string;
                const relation = formData.get("relation") as string;

                if (toNodeId && relation) {
                  setCreatingConnection(true);
                  fetch("/api/lateral-links", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      from_node_id: selectedNode.id,
                      to_node_id: toNodeId,
                      relation,
                    }),
                  })
                    .then((res) => {
                      if (!res.ok) throw new Error("Failed to create connection");
                      return fetchMap();
                    })
                    .then(() => {
                      setShowCreateModal(false);
                    })
                    .catch((err) => {
                      console.error(err);
                      alert("Failed to create connection");
                    })
                    .finally(() => {
                      setCreatingConnection(false);
                    });
                }
              }}
            >
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    From:
                  </label>
                  <p className="text-gray-900 dark:text-white font-medium">
                    {selectedNode.concept}
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="to_node"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    To: *
                  </label>
                  <select
                    id="to_node"
                    name="to_node"
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    <option value="">Select a concept...</option>
                    {mapData.nodes
                      .filter((n) => n.id !== selectedNode.id)
                      .map((node) => (
                        <option key={node.id} value={node.id}>
                          {node.concept}
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="relation"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Relationship Type: *
                  </label>
                  <select
                    id="relation"
                    name="relation"
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    <option value="analogy">🔄 Analogy</option>
                    <option value="pattern">🔗 Pattern</option>
                    <option value="contrast">⚡ Contrast</option>
                    <option value="association">💡 Association</option>
                  </select>
                </div>

                <div className="flex gap-3 justify-end pt-2">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setShowCreateModal(false)}
                    disabled={creatingConnection}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" isLoading={creatingConnection}>
                    Create Connection
                  </Button>
                </div>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
