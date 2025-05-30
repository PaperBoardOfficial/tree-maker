"use client";

import React, { useState, useRef } from "react";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { HumanMessage } from "@langchain/core/messages";
import { Document } from "@langchain/core/documents";
import AudioRecordingPanel from "../../components/AudioRecordingPanel";
import { LLMGraphTransformer } from "@langchain/community/experimental/graph_transformers/llm";
import dynamic from "next/dynamic";
import { Node, Relationship } from "@neo4j-nvl/base";

const InteractiveNvlWrapper = dynamic(
  () =>
    import("@neo4j-nvl/react").then((mod) => ({
      default: mod.InteractiveNvlWrapper,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-gray-400">Loading graph visualization...</div>
      </div>
    ),
  }
);

export default function KnowledgeGraph() {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [textInput, setTextInput] = useState("");
  const [nodes, setNodes] = useState<Node[]>([]);
  const [relationships, setRelationships] = useState<Relationship[]>([]);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const llm = new ChatGoogleGenerativeAI({
    model: "gemini-2.0-flash",
    apiKey:
      process.env.GOOGLE_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_API_KEY,
  });

  const llmTransformer = new LLMGraphTransformer({
    llm: llm,
  });

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/wav",
        });
        stream.getTracks().forEach((track) => track.stop());
        await processAudioToText(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error starting recording:", error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsTranscribing(true);
    }
  };

  const handleMicClick = () => {
    if (isRecording) {
      stopRecording();
    } else if (!isTranscribing) {
      startRecording();
    }
  };

  const processAudioToText = async (audioBlob: Blob) => {
    try {
      const audioBuffer = await audioBlob.arrayBuffer();
      const base64Audio = btoa(
        String.fromCharCode(...new Uint8Array(audioBuffer))
      );

      const transcriptionMessage = new HumanMessage({
        content: [
          {
            type: "text",
            text: "Transcribe this audio. Return only the transcribed text without any additional formatting or explanations.",
          },
          { type: "media", data: base64Audio, mimeType: "audio/wav" },
        ],
      });

      const transcriptionResponse = await llm.invoke([transcriptionMessage]);
      const transcribedText = transcriptionResponse.content as string;

      setTextInput(transcribedText);
    } catch (error) {
      console.error("Error transcribing audio:", error);
    } finally {
      setIsTranscribing(false);
    }
  };

  const generateKnowledgeGraph = async (inputText: string) => {
    try {
      setIsProcessing(true);

      const documents = [new Document({ pageContent: inputText })];

      const graphDocuments = await llmTransformer.convertToGraphDocuments(
        documents
      );

      if (graphDocuments.length > 0) {
        const graphDoc = graphDocuments[0];

        const nvlNodes: Node[] = graphDoc.nodes.map((node) => ({
          id: String(node.id),
          caption: String(node.id),
          labels: [node.type || "Entity"],
          properties: node.properties || {},
        }));

        const validNodeIds = new Set(nvlNodes.map((node) => node.id));

        const nvlRelationships: Relationship[] = graphDoc.relationships
          .filter((rel) => {
            const sourceId = String(rel.source.id);
            const targetId = String(rel.target.id);
            const isValid =
              validNodeIds.has(sourceId) && validNodeIds.has(targetId);
            if (!isValid) {
              console.warn(
                `Skipping invalid relationship: ${sourceId} -> ${targetId} (${rel.type})`
              );
            }
            return isValid;
          })
          .map((rel, index) => ({
            id: `rel_${index}`,
            from: String(rel.source.id),
            to: String(rel.target.id),
            caption: rel.type,
            type: rel.type,
            properties: rel.properties || {},
          }));

        setNodes(nvlNodes);
        setRelationships(nvlRelationships);
      }
    } catch (error) {
      console.error("Error generating knowledge graph:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTextSubmit = () => {
    if (textInput.trim()) {
      generateKnowledgeGraph(textInput.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleTextSubmit();
    }
  };

  return (
    <div className="h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <div className="h-full flex">
        <AudioRecordingPanel
          textInput={textInput}
          setTextInput={setTextInput}
          isRecording={isRecording}
          isProcessing={isProcessing}
          isTranscribing={isTranscribing}
          onMicClick={handleMicClick}
          onTextSubmit={handleTextSubmit}
          onKeyDown={handleKeyDown}
        />
        <div className="flex-1 h-full flex flex-col">
          {/* Graph Container */}
          <div className="flex-1 relative">
            {nodes.length === 0 && !isProcessing ? (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="text-gray-400 text-lg mb-2">
                    No graph data yet
                  </div>
                  <div className="text-gray-500 text-sm">
                    Enter some text and click send to generate a knowledge graph
                  </div>
                </div>
              </div>
            ) : isProcessing ? (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                  <div className="text-blue-500">
                    Generating knowledge graph...
                  </div>
                </div>
              </div>
            ) : (
              <div className="w-full h-full">
                <InteractiveNvlWrapper
                  nvlOptions={{
                    initialZoom: 1.5,
                    maxZoom: 3,
                    minZoom: 0.1,
                  }}
                  nodes={nodes}
                  rels={relationships}
                  mouseEventCallbacks={{
                    onZoom: true,
                    onPan: true,
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
