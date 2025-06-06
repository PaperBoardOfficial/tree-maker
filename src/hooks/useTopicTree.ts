import { useState } from "react";

export interface TopicNode {
  id: string;
  topic: string;
  accuracy: number;
  subtopics?: TopicNode[];
}

export const useTopicTree = () => {
  const [topicTree, setTopicTree] = useState<TopicNode | null>(null);

  const initializeTree = (newTopicTree: TopicNode) => {
    setTopicTree(newTopicTree);
  };

  return {
    topicTree,
    initializeTree,
  };
};
