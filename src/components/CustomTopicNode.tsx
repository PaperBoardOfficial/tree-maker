"use client";

import { useState } from "react";
import { Handle, Position } from "@xyflow/react";

interface CustomTopicNodeProps {
  data: {
    label: string;
    accuracy: number;
    hasChildren: boolean;
    isExpanded: boolean;
    onNodeClick: (nodeId: string) => void;
  };
  id: string;
}

const CustomTopicNode = ({ data, id }: CustomTopicNodeProps) => {
  const [showTooltip, setShowTooltip] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (data.hasChildren) {
      data.onNodeClick(id);
    }
  };

  return (
    <div
      className="relative"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <div
        className={`bg-gray-100 dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-500 rounded-lg p-3 text-center w-[140px] min-h-[60px] shadow-sm hover:shadow-md transition-shadow flex items-center justify-center ${
          data.hasChildren
            ? "cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600"
            : ""
        }`}
        onClick={handleClick}
      >
        <div className="flex items-center justify-center space-x-2">
          <span className="text-sm font-medium text-gray-800 dark:text-gray-200 leading-tight">
            {data.label}
          </span>
          {data.hasChildren && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {data.isExpanded ? "−" : "+"}
            </span>
          )}
        </div>
      </div>

      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-800 text-xs rounded shadow-lg whitespace-nowrap z-10">
          Accuracy: {(data.accuracy * 100).toFixed(1)}%
          {data.hasChildren && (
            <div className="text-center mt-1 opacity-75">
              Click to {data.isExpanded ? "collapse" : "expand"}
            </div>
          )}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800 dark:border-t-gray-200"></div>
        </div>
      )}

      <Handle type="target" position={Position.Top} className="w-3 h-3" />
      <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
    </div>
  );
};

export default CustomTopicNode;
