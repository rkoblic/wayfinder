"use client";

import { useCallback, useEffect, useMemo } from "react";
import ReactFlow, {
  Node as FlowNode,
  Edge as FlowEdge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  ConnectionMode,
  MarkerType,
} from "reactflow";
import "reactflow/dist/style.css";

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

interface CuriosityGraphProps {
  nodes: Node[];
  edges: Edge[];
  onNodeClick?: (node: Node) => void;
  selectedNodeId?: string | null;
}

// Relation type to color mapping
const RELATION_COLORS = {
  analogy: "#3b82f6", // blue
  pattern: "#10b981", // green
  contrast: "#f59e0b", // amber
  association: "#8b5cf6", // purple
};

// Relation type to emoji mapping
const RELATION_EMOJI = {
  analogy: "🔄",
  pattern: "🔗",
  contrast: "⚡",
  association: "💡",
};

// Simple force-directed layout algorithm
function calculateLayout(nodes: Node[], edges: Edge[]): Map<string, { x: number; y: number }> {
  const positions = new Map<string, { x: number; y: number }>();
  const nodeCount = nodes.length;

  if (nodeCount === 0) return positions;

  // Initialize positions in a circle with better spacing
  const radius = Math.max(300, nodeCount * 50);
  nodes.forEach((node, index) => {
    const angle = (index / nodeCount) * 2 * Math.PI;
    positions.set(node.id, {
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius,
    });
  });

  // Simple force-directed iterations with stronger forces
  const iterations = 100;
  const k = Math.sqrt((1200 * 800) / nodeCount); // Ideal distance - increased spacing

  for (let iter = 0; iter < iterations; iter++) {
    // Repulsive forces between all nodes
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const node1 = nodes[i];
        const node2 = nodes[j];
        const pos1 = positions.get(node1.id)!;
        const pos2 = positions.get(node2.id)!;

        const dx = pos1.x - pos2.x;
        const dy = pos1.y - pos2.y;
        const distance = Math.sqrt(dx * dx + dy * dy) || 1;

        const force = (k * k) / distance;
        const fx = (dx / distance) * force * 1.5; // Stronger repulsion
        const fy = (dy / distance) * force * 1.5;

        pos1.x += fx;
        pos1.y += fy;
        pos2.x -= fx;
        pos2.y -= fy;
      }
    }

    // Attractive forces for connected nodes
    edges.forEach((edge) => {
      const pos1 = positions.get(edge.from_node);
      const pos2 = positions.get(edge.to_node);

      if (!pos1 || !pos2) return;

      const dx = pos1.x - pos2.x;
      const dy = pos1.y - pos2.y;
      const distance = Math.sqrt(dx * dx + dy * dy) || 1;

      const force = (distance * distance) / k;
      const fx = (dx / distance) * force * 0.3; // Weaker attraction
      const fy = (dy / distance) * force * 0.3;

      pos1.x -= fx;
      pos1.y -= fy;
      pos2.x += fx;
      pos2.y += fy;
    });
  }

  return positions;
}

export default function CuriosityGraph({
  nodes: dataNodes,
  edges: dataEdges,
  onNodeClick,
  selectedNodeId,
}: CuriosityGraphProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Convert data to React Flow format and apply layout
  useEffect(() => {
    const positions = calculateLayout(dataNodes, dataEdges);

    const flowNodes: FlowNode[] = dataNodes.map((node) => {
      const pos = positions.get(node.id) || { x: 0, y: 0 };
      const isSelected = node.id === selectedNodeId;

      return {
        id: node.id,
        data: { label: node.concept },
        position: pos,
        draggable: true,
        selectable: true,
        style: {
          background: isSelected ? "#3b82f6" : "#ffffff",
          color: isSelected ? "#ffffff" : "#000000",
          border: `2px solid ${isSelected ? "#2563eb" : "#d1d5db"}`,
          borderRadius: "8px",
          padding: "10px 15px",
          fontSize: "14px",
          fontWeight: isSelected ? "600" : "500",
          cursor: "grab",
          boxShadow: isSelected
            ? "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)"
            : "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
        },
      };
    });

    const flowEdges: FlowEdge[] = dataEdges.map((edge) => ({
      id: edge.id,
      source: edge.from_node,
      target: edge.to_node,
      label: `${RELATION_EMOJI[edge.relation as keyof typeof RELATION_EMOJI] || ""} ${edge.relation}`,
      labelStyle: {
        fontSize: "11px",
        fontWeight: "500",
      },
      labelBgStyle: {
        fill: "#ffffff",
        fillOpacity: 0.9,
      },
      style: {
        stroke: RELATION_COLORS[edge.relation as keyof typeof RELATION_COLORS] || "#6b7280",
        strokeWidth: 2,
      },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: RELATION_COLORS[edge.relation as keyof typeof RELATION_COLORS] || "#6b7280",
      },
      animated: false,
    }));

    setNodes(flowNodes);
    setEdges(flowEdges);
  }, [dataNodes, dataEdges, selectedNodeId, setNodes, setEdges]);

  const onNodeClickHandler = useCallback(
    (event: React.MouseEvent, node: FlowNode) => {
      const originalNode = dataNodes.find((n) => n.id === node.id);
      if (originalNode && onNodeClick) {
        onNodeClick(originalNode);
      }
    },
    [dataNodes, onNodeClick]
  );

  if (dataNodes.length === 0) {
    return (
      <div className="flex items-center justify-center h-[600px] bg-gray-50 dark:bg-gray-900 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400 text-lg mb-2">
            Your curiosity map is empty
          </p>
          <p className="text-gray-500 dark:text-gray-500 text-sm">
            Start exploring to build your graph!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[600px] bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClickHandler}
        nodesDraggable={true}
        nodesConnectable={false}
        elementsSelectable={true}
        panOnDrag={[1, 2]} // Allow pan with middle/right mouse or shift+drag
        selectionOnDrag={false}
        zoomOnScroll={true}
        connectionMode={ConnectionMode.Loose}
        fitView
        fitViewOptions={{
          padding: 0.2,
          minZoom: 0.5,
          maxZoom: 1.5,
        }}
        minZoom={0.1}
        maxZoom={2}
        defaultEdgeOptions={{
          type: "smoothstep",
        }}
      >
        <Background color="#9ca3af" gap={16} />
        <Controls />
        <MiniMap
          nodeColor={(node) => {
            if (node.id === selectedNodeId) return "#3b82f6";
            return "#d1d5db";
          }}
          maskColor="rgba(0, 0, 0, 0.1)"
        />
      </ReactFlow>
    </div>
  );
}
