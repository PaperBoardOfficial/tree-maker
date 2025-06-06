"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { HumanMessage } from "@langchain/core/messages";
import { AssemblyAI } from "assemblyai";
import AudioRecordingPanel from "../components/AudioRecordingPanel";
import TopicTreeVisualization from "../components/TopicTreeVisualization";
import { useTopicTree, TopicNode } from "../hooks/useTopicTree";

export default function Home() {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [textInput, setTextInput] = useState("");
  const [llm, setLlm] = useState<ChatGoogleGenerativeAI | null>(null);
  const [validationLlm, setValidationLlm] =
    useState<ChatGoogleGenerativeAI | null>(null);
  const [assemblyClient, setAssemblyClient] = useState<AssemblyAI | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const { nodes, edges, initializeTree } = useTopicTree();

  useEffect(() => {
    const googleApiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;
    const assemblyApiKey = process.env.NEXT_PUBLIC_ASSEMBLYAI_API_KEY;

    if (googleApiKey) {
      const llmInstance = new ChatGoogleGenerativeAI({
        model: "gemini-2.0-flash",
        apiKey: googleApiKey,
      });
      setLlm(llmInstance);

      const validationLlmInstance = new ChatGoogleGenerativeAI({
        model: "gemini-2.5-flash-preview",
        apiKey: googleApiKey,
      });
      setValidationLlm(validationLlmInstance);
    } else {
      console.error(
        "No Google API key found. Make sure NEXT_PUBLIC_GOOGLE_API_KEY is set in environment variables."
      );
    }

    if (assemblyApiKey) {
      const client = new AssemblyAI({
        apiKey: assemblyApiKey,
      });
      setAssemblyClient(client);
    } else {
      console.error(
        "No AssemblyAI API key found. Make sure NEXT_PUBLIC_ASSEMBLYAI_API_KEY is set in environment variables."
      );
    }
  }, []);

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
        await processAudioToText(audioBlob, "audio/wav");
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

  const processAudioToText = async (audioBlob: Blob, mimeType?: string) => {
    try {
      if (!assemblyClient) {
        console.error("AssemblyAI client not initialized - API key missing");
        return;
      }

      // Determine the correct file extension based on MIME type
      const audioMimeType = mimeType || audioBlob.type || "audio/wav";
      let fileExtension = ".wav"; // default

      if (audioMimeType.includes("mp3") || audioMimeType.includes("mpeg")) {
        fileExtension = ".mp3";
      } else if (
        audioMimeType.includes("mp4") ||
        audioMimeType.includes("m4a")
      ) {
        fileExtension = ".m4a";
      } else if (audioMimeType.includes("ogg")) {
        fileExtension = ".ogg";
      } else if (audioMimeType.includes("flac")) {
        fileExtension = ".flac";
      } else if (audioMimeType.includes("aac")) {
        fileExtension = ".aac";
      } else if (audioMimeType.includes("webm")) {
        fileExtension = ".webm";
      }

      // Convert blob to file with correct extension
      const audioFile = new File([audioBlob], `audio${fileExtension}`, {
        type: audioMimeType,
      });

      // Direct transcription with AssemblyAI
      const transcript = await assemblyClient.transcripts.transcribe({
        audio: audioFile,
      });

      const transcribedText = transcript.text || "";
      setTextInput(transcribedText);
    } catch (error) {
      console.error("Error transcribing audio:", error);
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    setIsTranscribing(true);
    try {
      await processAudioToText(file, file.type);
    } catch (error) {
      console.error("Error processing uploaded file:", error);
      setIsTranscribing(false);
    }
  };

  const validateTopicTree = async (
    topicTree: TopicNode,
    originalText: string
  ): Promise<TopicNode> => {
    if (!validationLlm) {
      console.error("Validation LLM not initialized - API key missing");
      return topicTree;
    }

    try {
      const validationPrompt = `
You are a precision topic extraction validator. Your task is to review and correct the extracted topic tree against the original text.

VALIDATION CHECKLIST:
✓ ACCURACY: Every topic must be explicitly mentioned in the original text
✓ COMPLETENESS: No significant topics should be missing  
✓ HIERARCHY: Parent-child relationships must be logical and appropriate
✓ PRECISION: Accuracy scores should reflect actual topic prominence (0.3-1.0 scale)
✓ CONSISTENCY: IDs should follow pattern: main_topic → main_topic_subtopic → main_topic_subtopic_detail

CORRECTION PRIORITIES:
1. REMOVE any topics not actually present in the text (hallucinations)
2. ADD any major topics that were missed
3. REORGANIZE hierarchy if parent-child relationships are illogical  
4. ADJUST accuracy scores based on how much detail/emphasis each topic receives
5. FIX malformed IDs to follow consistent naming pattern

ACCURACY SCORE GUIDE:
• 0.9-1.0: Topic discussed extensively with multiple details
• 0.7-0.9: Topic clearly mentioned with context and explanation  
• 0.5-0.7: Topic mentioned with some detail
• 0.3-0.5: Topic briefly mentioned or implied

ORIGINAL TEXT:
"${originalText}"

EXTRACTED TOPIC TREE:
${JSON.stringify(topicTree, null, 2)}

INSTRUCTIONS:
- Make surgical corrections - don't change what's already accurate
- Preserve good hierarchical structure where it exists
- Ensure every topic can be traced back to specific text mentions
- Return only the corrected JSON, no explanations or formatting

Return the validated topic tree:
      `;

      const validationMessage = new HumanMessage({
        content: [{ type: "text", text: validationPrompt }],
      });

      const validationResponse = await validationLlm.invoke([
        validationMessage,
      ]);
      const validatedJsonString = validationResponse.content as string;

      const cleanValidatedJsonString = validatedJsonString
        .replace(/```json\n?/, "")
        .replace(/```\n?$/, "")
        .trim();

      const validatedTopicTree: TopicNode = JSON.parse(
        cleanValidatedJsonString
      );
      return validatedTopicTree;
    } catch (error) {
      console.error("Error validating topic tree:", error);
      return topicTree;
    }
  };

  const processText = async (inputText: string) => {
    if (!inputText.trim()) return;

    if (!llm) {
      console.error("LLM not initialized - API key missing");
      return;
    }

    setIsProcessing(true);
    try {
      const topicExtractionPrompt = `
Extract a hierarchical topic tree from this text. Include ONLY explicitly mentioned topics and concepts.

EXTRACTION RULES:
- Include ONLY topics actually mentioned in the text
- Maintain logical hierarchy and grouping
- Capture specific values, measurements, and names within appropriate categories
- Do NOT add unmentioned topics or infer content

HIERARCHY GUIDELINES:
- Group related information under logical main topics
- Place specific values and names as subtopics under relevant categories
- Create natural hierarchy depth based on content complexity

WHAT TO CAPTURE:
- Main concepts and themes as top-level topics
- Specific details, values, and names as subtopics under relevant main topics
- Individual measurements, names, or values as deeper subtopics when they belong together

HIERARCHY STRUCTURE:
- Main topics: Core themes/areas explicitly discussed (e.g., "Physical Characteristics", "Orbital Properties") 
- Subtopics: Specific aspects within themes (e.g., "Size", "Moons", "Orbital Period")
- Sub-subtopics: Individual values, names, or detailed breakdowns (e.g., "2,106 miles", "Phobos")
- Create as many levels as needed to properly organize the information

ID FORMAT:
- Use descriptive, lowercase IDs with underscores (e.g., "app_performance", "payment_systems")
- Make IDs hierarchical: main_topic -> main_topic_subtopic -> main_topic_subtopic_detail

ACCURACY SCORING:
- 0.9-1.0: Topic discussed with significant detail or emphasis
- 0.7-0.9: Topic clearly mentioned with context
- 0.5-0.7: Topic briefly mentioned but clearly stated
- 0.3-0.5: Topic implied or indirectly referenced

JSON STRUCTURE:
{
  "id": "main_topic_name",
  "topic": "Main Topic Title",
  "accuracy": 0.95,
  "subtopics": [
    {
      "id": "main_topic_specific_item",
      "topic": "Specific Item Name",
      "accuracy": 0.85,
      "subtopics": []
    }
  ]
}

REQUIREMENTS:
- Organize information hierarchically with logical grouping
- Include ALL specifically named items, values, and measurements within appropriate categories
- Create natural hierarchy depth based on content complexity
- Do NOT hallucinate or add unmentioned topics
- Use consistent "subtopics" field name at all levels

Return ONLY the JSON object. No explanations, no additional text, no formatting markers.

Text: "${inputText}"
      `;

      const topicMessage = new HumanMessage({
        content: [{ type: "text", text: topicExtractionPrompt }],
      });

      const topicResponse = await llm.invoke([topicMessage]);
      const topicJsonString = topicResponse.content as string;

      const cleanJsonString = topicJsonString
        .replace(/```json\n?/, "")
        .replace(/```\n?$/, "")
        .trim();
      const topicTree: TopicNode = JSON.parse(cleanJsonString);

      setIsValidating(true);
      setIsProcessing(false);

      const validatedTopicTree = await validateTopicTree(topicTree, inputText);

      initializeTree(validatedTopicTree);
    } catch (error) {
      console.error("Error processing text:", error);
    } finally {
      setIsProcessing(false);
      setIsValidating(false);
    }
  };

  const handleTextSubmit = () => {
    if (textInput.trim()) {
      processText(textInput.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleTextSubmit();
    }
  };

  return (
    <div className="h-screen bg-gray-900 text-gray-100">
      <div className="h-full flex">
        <AudioRecordingPanel
          textInput={textInput}
          setTextInput={setTextInput}
          isRecording={isRecording}
          isProcessing={isProcessing}
          isTranscribing={isTranscribing}
          isValidating={isValidating}
          onMicClick={handleMicClick}
          onTextSubmit={handleTextSubmit}
          onKeyDown={handleKeyDown}
          onFileUpload={handleFileUpload}
        />
        <TopicTreeVisualization nodes={nodes} edges={edges} />
      </div>
    </div>
  );
}
