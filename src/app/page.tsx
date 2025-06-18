"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { HumanMessage } from "@langchain/core/messages";
import { AssemblyAI } from "assemblyai";
import AudioRecordingPanel from "../components/AudioRecordingPanel";
import TopicTreeVisualization from "../components/TopicTreeVisualization";
import { useTopicTree, TopicNode } from "../hooks/useTopicTree";
import {
  DEFAULT_EXTRACTION_PROMPT,
  DEFAULT_VALIDATION_PROMPT,
  DEFAULT_EXTRACTION_MODEL,
  DEFAULT_VALIDATION_MODEL,
  OPENROUTER_MODELS,
} from "../lib/constants";

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

  const { topicTree, initializeTree } = useTopicTree();

  useEffect(() => {
    const googleApiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;
    const assemblyApiKey = process.env.NEXT_PUBLIC_ASSEMBLYAI_API_KEY;
    const openrouterApiKey = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY;

    const extractionModel =
      localStorage.getItem("extractionModel") || DEFAULT_EXTRACTION_MODEL;
    const validationModel =
      localStorage.getItem("validationModel") || DEFAULT_VALIDATION_MODEL;

    if (extractionModel.startsWith("gemini")) {
      if (!googleApiKey) {
        console.error(
          "No Google API key found. Make sure NEXT_PUBLIC_GOOGLE_API_KEY is set in environment variables for Google models."
        );
      } else {
        setLlm(new ChatGoogleGenerativeAI({ model: extractionModel, apiKey: googleApiKey }));
      }
    } else if (OPENROUTER_MODELS.includes(extractionModel)) {
      if (!openrouterApiKey) {
        console.error(
          "No OpenRouter API key found. Make sure NEXT_PUBLIC_OPENROUTER_API_KEY is set in environment variables for OpenRouter models."
        );
      }
      // LLM instance is not set for OpenRouter models as they are called directly via fetch
    } else {
      console.error("Unsupported extraction model:", extractionModel);
    }

    if (validationModel.startsWith("gemini")) {
      if (!googleApiKey) {
        console.error(
          "No Google API key found. Make sure NEXT_PUBLIC_GOOGLE_API_KEY is set in environment variables for Google models."
        );
      } else {
        setValidationLlm(new ChatGoogleGenerativeAI({ model: validationModel, apiKey: googleApiKey }));
      }
    } else if (OPENROUTER_MODELS.includes(validationModel)) {
      if (!openrouterApiKey) {
        console.error(
          "No OpenRouter API key found. Make sure NEXT_PUBLIC_OPENROUTER_API_KEY is set in environment variables for OpenRouter models."
        );
      }
      // Validation LLM instance is not set for OpenRouter models as they are called directly via fetch
    } else {
      console.error("Unsupported validation model:", validationModel);
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
    const validationModel =
      localStorage.getItem("validationModel") || DEFAULT_VALIDATION_MODEL;
    const openrouterApiKey = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY;

    try {
      const validationPrompt = getValidationPrompt(topicTree, originalText);
      let validatedJsonString: string;

      if (validationModel.startsWith("gemini")) {
        if (!validationLlm) {
          console.error("Validation LLM not initialized - API key missing");
          return topicTree;
        }
        const validationMessage = new HumanMessage({
          content: [{ type: "text", text: validationPrompt }],
        });
        const validationResponse = await validationLlm.invoke([
          validationMessage,
        ]);
        validatedJsonString = validationResponse.content as string;
      } else if (OPENROUTER_MODELS.includes(validationModel)) {
        if (!openrouterApiKey) {
          console.error("OpenRouter API key not found.");
          return topicTree;
        }
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${openrouterApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: validationModel,
            messages: [{ role: "user", content: validationPrompt }],
          }),
        });
        const data = await response.json();
        validatedJsonString = data.choices[0].message.content;
      } else {
        console.error("Unsupported validation model:", validationModel);
        return topicTree;
      }

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

    const extractionModel =
      localStorage.getItem("extractionModel") || DEFAULT_EXTRACTION_MODEL;
    const openrouterApiKey = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY;

    setIsProcessing(true);
    try {
      const topicExtractionPrompt = getExtractionPrompt(inputText);
      let topicJsonString: string;

      if (extractionModel.startsWith("gemini")) {
        if (!llm) {
          console.error("LLM not initialized - API key missing");
          return;
        }
        const topicMessage = new HumanMessage({
          content: [{ type: "text", text: topicExtractionPrompt }],
        });
        const topicResponse = await llm.invoke([topicMessage]);
        topicJsonString = topicResponse.content as string;
      } else if (OPENROUTER_MODELS.includes(extractionModel)) {
        if (!openrouterApiKey) {
          console.error("OpenRouter API key not found.");
          return;
        }
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${openrouterApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: extractionModel,
            messages: [{ role: "user", content: topicExtractionPrompt }],
          }),
        });
        const data = await response.json();
        topicJsonString = data.choices[0].message.content;
      } else {
        console.error("Unsupported extraction model:", extractionModel);
        return;
      }

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
        <TopicTreeVisualization topicTree={topicTree} />
      </div>
    </div>
  );
}

function getExtractionPrompt(inputText: string) {
  if (typeof window !== "undefined") {
    const userPrompt = localStorage.getItem("extractionPrompt");
    if (userPrompt) return userPrompt.replace("${inputText}", inputText);
  }
  return DEFAULT_EXTRACTION_PROMPT.replace("${inputText}", inputText);
}

function getValidationPrompt(topicTree: TopicNode, originalText: string) {
  if (typeof window !== "undefined") {
    const userPrompt = localStorage.getItem("validationPrompt");
    if (userPrompt)
      return userPrompt
        .replace("${originalText}", originalText)
        .replace("${topicTree}", JSON.stringify(topicTree, null, 2));
  }
  return DEFAULT_VALIDATION_PROMPT.replace(
    "${originalText}",
    originalText
  ).replace("${topicTree}", JSON.stringify(topicTree, null, 2));
}
