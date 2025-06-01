"use client";

import { ReactFlow, Background, Node, Edge } from "@xyflow/react";
import CustomTopicNode from "./CustomTopicNode";
import "@xyflow/react/dist/style.css";

const nodeTypes = {
  topicNode: CustomTopicNode,
};

interface TopicTreeVisualizationProps {
  nodes: Node[];
  edges: Edge[];
}

const TopicTreeVisualization = ({
  nodes,
  edges,
}: TopicTreeVisualizationProps) => {
  return (
    <div className="flex-1 h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        fitView
        fitViewOptions={{
          maxZoom: 0.8,
        }}
        className="bg-gray-50 dark:bg-gray-900"
        proOptions={{ hideAttribution: true }}
        nodeTypes={nodeTypes}
      >
        <Background />
      </ReactFlow>
    </div>
  );
};

export default TopicTreeVisualization;
