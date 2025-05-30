import { useState, useEffect, useCallback } from "react";
import { Node, Edge } from "@xyflow/react";

export interface TopicNode {
  id: string;
  topic: string;
  accuracy: number;
  subtopics?: TopicNode[];
}

export const useTopicTree = () => {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [fullTopicTree, setFullTopicTree] = useState<TopicNode | null>(null);

  const handleNodeClick = (nodeId: string) => {
    if (expandedNodes.has(nodeId)) {
      setExpandedNodes((prev) => {
        const newSet = new Set(prev);
        newSet.delete(nodeId);
        return newSet;
      });
    } else {
      setExpandedNodes((prev) => new Set(prev).add(nodeId));
    }
  };

  const calculateSubtreeWidth = (node: TopicNode): number => {
    const minNodeWidth = 180;

    if (!node.subtopics || node.subtopics.length === 0) {
      return minNodeWidth;
    }

    const childrenWidth = node.subtopics.reduce((sum, child) => {
      return sum + calculateSubtreeWidth(child);
    }, 0);

    return Math.max(minNodeWidth, childrenWidth);
  };

  const convertTreeToFlow = useCallback(
    (
      topicNode: TopicNode,
      parentId: string | null = null,
      x = 0,
      y = 0
    ): { nodes: Node[]; edges: Edge[] } => {
      const nodes: Node[] = [];
      const edges: Edge[] = [];

      const currentNode: Node = {
        id: topicNode.id,
        type: "topicNode",
        data: {
          label: topicNode.topic,
          accuracy: topicNode.accuracy,
          hasChildren: topicNode.subtopics && topicNode.subtopics.length > 0,
          isExpanded: expandedNodes.has(topicNode.id),
          onNodeClick: handleNodeClick,
        },
        position: { x, y },
      };
      nodes.push(currentNode);

      if (parentId) {
        edges.push({
          id: `e_${parentId}_${topicNode.id}`,
          source: parentId,
          target: topicNode.id,
          type: "smoothstep",
          style: { stroke: "#6b7280", strokeWidth: 2 },
        });
      }

      if (
        expandedNodes.has(topicNode.id) &&
        topicNode.subtopics &&
        topicNode.subtopics.length > 0
      ) {
        const childY = y + 150;

        const subtreeWidths = topicNode.subtopics.map((subtopic) =>
          calculateSubtreeWidth(subtopic)
        );
        const totalWidth = subtreeWidths.reduce((sum, width) => sum + width, 0);

        let currentX = x - totalWidth / 2;

        topicNode.subtopics.forEach((subtopic, index) => {
          const subtreeX = currentX + subtreeWidths[index] / 2;

          const { nodes: childNodes, edges: childEdges } = convertTreeToFlow(
            subtopic,
            topicNode.id,
            subtreeX,
            childY
          );

          nodes.push(...childNodes);
          edges.push(...childEdges);

          currentX += subtreeWidths[index];
        });
      }

      return { nodes, edges };
    },
    [expandedNodes]
  );

  useEffect(() => {
    if (fullTopicTree) {
      const { nodes: flowNodes, edges: flowEdges } = convertTreeToFlow(
        fullTopicTree,
        null,
        0,
        0
      );
      setNodes(flowNodes);
      setEdges(flowEdges);
    }
  }, [expandedNodes, fullTopicTree, convertTreeToFlow]);

  const initializeTree = (topicTree: TopicNode) => {
    setFullTopicTree(topicTree);
    setExpandedNodes(new Set());
  };

  return {
    nodes,
    edges,
    initializeTree,
  };
};
