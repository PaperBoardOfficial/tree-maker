"use client";

import React, { useState } from "react";
import { ChevronRight } from "lucide-react";

interface TopicNode {
  id: string;
  topic: string;
  accuracy: number;
  subtopics?: TopicNode[];
}

interface TopicTreeVisualizationProps {
  topicTree?: TopicNode | null;
}

const TopicTreeVisualization = ({ topicTree }: TopicTreeVisualizationProps) => {
  const [currentPath, setCurrentPath] = useState<TopicNode[]>([]);
  const [selectedNode, setSelectedNode] = useState<TopicNode | null>(null);
  const [rightPanelChildren, setRightPanelChildren] = useState<TopicNode[]>([]);

  // Initialize path when topic tree is available
  React.useEffect(() => {
    if (topicTree) {
      setCurrentPath([topicTree]);
      setSelectedNode(null);
      setRightPanelChildren([]);
    }
  }, [topicTree]);

  // Array of all our beautiful soft colors
  const softColors = [
    "bg-emerald-200", // Soft mint green
    "bg-lime-200", // Soft lime green
    "bg-green-200", // Light green
    "bg-cyan-200", // Soft cyan
    "bg-teal-200", // Soft teal
    "bg-sky-200", // Light sky blue
    "bg-blue-200", // Soft blue
    "bg-indigo-200", // Light indigo
    "bg-violet-200", // Soft violet
    "bg-purple-200", // Soft lavender
    "bg-fuchsia-200", // Light fuchsia
    "bg-pink-200", // Light pink
    "bg-rose-200", // Soft rose
    "bg-red-200", // Light red
    "bg-orange-200", // Soft peach
    "bg-amber-200", // Light amber
    "bg-yellow-200", // Soft yellow
    "bg-lime-100", // Very light lime
    "bg-emerald-100", // Very light emerald
    "bg-teal-100", // Very light teal
    "bg-cyan-100", // Very light cyan
    "bg-pink-100", // Very light pink
    "bg-rose-100", // Very light rose
  ];

  const softBorderColors = [
    "border-emerald-300",
    "border-lime-300",
    "border-green-300",
    "border-cyan-300",
    "border-teal-300",
    "border-sky-300",
    "border-blue-300",
    "border-indigo-300",
    "border-violet-300",
    "border-purple-300",
    "border-fuchsia-300",
    "border-pink-300",
    "border-rose-300",
    "border-red-300",
    "border-orange-300",
    "border-amber-300",
    "border-yellow-300",
    "border-lime-200",
    "border-emerald-200",
    "border-teal-200",
    "border-cyan-200",
    "border-pink-200",
    "border-rose-200",
  ];

  // Simple hash function to get consistent random color for each node
  const hashString = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
  };

  const getRandomColor = (nodeId: string) => {
    const index = hashString(nodeId) % softColors.length;
    return softColors[index];
  };

  const getRandomBorderColor = (nodeId: string) => {
    const index = hashString(nodeId) % softBorderColors.length;
    return softBorderColors[index];
  };

  // Keep the old functions for backward compatibility, but now they use random colors
  const getAccuracyColor = (accuracy: number, nodeId: string) => {
    return getRandomColor(nodeId);
  };

  const getAccuracyBorderColor = (accuracy: number, nodeId: string) => {
    return getRandomBorderColor(nodeId);
  };

  const handleNodeClick = (node: TopicNode) => {
    setSelectedNode(node);

    if (node.subtopics && node.subtopics.length > 0) {
      setRightPanelChildren(node.subtopics);
    } else {
      setRightPanelChildren([]);
    }
  };

  const handleChildSelect = (child: TopicNode) => {
    // Find the index of the currently selected node in the path
    const selectedNodeIndex = currentPath.findIndex(
      (node) => node.id === selectedNode?.id
    );

    // Build new path: keep everything up to and including the selected node, then add the child
    const newPath =
      selectedNodeIndex >= 0
        ? [...currentPath.slice(0, selectedNodeIndex + 1), child]
        : [...currentPath, child];

    setCurrentPath(newPath);

    // Update selected node and show its children
    setSelectedNode(child);
    if (child.subtopics && child.subtopics.length > 0) {
      setRightPanelChildren(child.subtopics);
    } else {
      setRightPanelChildren([]);
    }
  };

  if (!topicTree) {
    return (
      <div className="flex-1 h-full bg-gray-900 flex items-center justify-center">
        <div className="text-gray-400 text-lg">
          No topic data available. Process some text to see the topic tree.
        </div>
      </div>
    );
  }

  return (
    <>
      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none; /* Internet Explorer 10+ */
          scrollbar-width: none; /* Firefox */
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none; /* Safari and Chrome */
        }
      `}</style>

      <div className="flex-1 h-full bg-gray-900 flex">
        {/* Left Side - Linear Path */}
        <div className="w-1/2 p-6 overflow-y-scroll scrollbar-hide">
          <div className="flex flex-col items-center space-y-8">
            {currentPath.map((node, index) => (
              <div
                key={`${node.id}-${index}`}
                className="flex flex-col items-center"
              >
                {/* Circular Node */}
                <div
                  className={`relative w-32 h-32 rounded-full border-4 ${getAccuracyBorderColor(
                    node.accuracy,
                    node.id
                  )} ${getAccuracyColor(
                    node.accuracy,
                    node.id
                  )} cursor-pointer transition-all duration-200 hover:scale-105 shadow-lg ${
                    selectedNode?.id === node.id
                      ? "ring-4 ring-white ring-opacity-50"
                      : ""
                  }`}
                  onClick={() => handleNodeClick(node)}
                >
                  {/* Node Content */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-3 text-center">
                    <div className="text-gray-800 font-semibold text-sm leading-tight mb-1 overflow-hidden">
                      <div className="line-clamp-3">{node.topic}</div>
                    </div>
                    <div className="text-gray-700 text-xs bg-white bg-opacity-60 px-2 py-1 rounded-full">
                      {(node.accuracy * 100).toFixed(0)}%
                    </div>
                  </div>

                  {/* Children Indicator */}
                  {node.subtopics && node.subtopics.length > 0 && (
                    <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-gray-700 rounded-full border-2 border-gray-800 flex items-center justify-center">
                      <span className="text-xs text-white font-bold">
                        {node.subtopics.length}
                      </span>
                    </div>
                  )}
                </div>

                {/* Connection Line */}
                {index < currentPath.length - 1 && (
                  <div className="w-0.5 h-12 bg-gray-600 my-4"></div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right Side - Children Panel */}
        <div className="w-1/2 p-6">
          {selectedNode && rightPanelChildren.length > 0 ? (
            <div className="bg-gray-800 rounded-lg p-6 h-full overflow-y-scroll scrollbar-hide">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-100 mb-2">
                  Subtopics of &quot;{selectedNode.topic}&quot;
                </h3>
                <p className="text-sm text-gray-400">
                  {rightPanelChildren.length} subtopic
                  {rightPanelChildren.length !== 1 ? "s" : ""}
                </p>
              </div>

              <div className="space-y-3">
                {rightPanelChildren.map((child) => (
                  <div
                    key={child.id}
                    className="bg-gray-700 hover:bg-gray-600 rounded-lg p-4 cursor-pointer transition-colors border border-gray-600"
                    onClick={() => handleChildSelect(child)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-3 h-3 rounded-full ${getAccuracyColor(
                            child.accuracy,
                            child.id
                          )}`}
                        />
                        <h4 className="text-white font-medium">
                          {child.topic}
                        </h4>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium text-gray-700 ${getAccuracyColor(
                            child.accuracy,
                            child.id
                          )}`}
                        >
                          {(child.accuracy * 100).toFixed(0)}%
                        </span>
                        {child.subtopics && child.subtopics.length > 0 && (
                          <ChevronRight className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                    </div>

                    {child.subtopics && child.subtopics.length > 0 && (
                      <div className="text-xs text-gray-400">
                        {child.subtopics.length} subtopic
                        {child.subtopics.length !== 1 ? "s" : ""}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : selectedNode && rightPanelChildren.length === 0 ? (
            <div className="bg-gray-800 rounded-lg p-6 h-full flex items-center justify-center">
              <div className="text-center text-gray-400">
                <div className="text-lg mb-2">
                  &quot;{selectedNode.topic}&quot; has no subtopics
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gray-800 rounded-lg p-6 h-full flex items-center justify-center">
              <div className="text-center text-gray-400">
                <div className="text-lg mb-2">Select a Node</div>
                <div className="text-sm">
                  Click a node on the left to see its children
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default TopicTreeVisualization;
