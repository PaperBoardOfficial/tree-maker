"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { HumanMessage } from "@langchain/core/messages";
import {
  DEFAULT_EXTRACTION_PROMPT,
  DEFAULT_VALIDATION_PROMPT,
  DEFAULT_EXTRACTION_MODEL,
  DEFAULT_VALIDATION_MODEL,
  OPENROUTER_MODELS,
} from "../../lib/constants";

export default function SettingsPage() {
  const [extractionPrompt, setExtractionPrompt] = useState(
    DEFAULT_EXTRACTION_PROMPT
  );
  const [llm, setLlm] = useState<ChatGoogleGenerativeAI | null>(null);
  const [validationPrompt, setValidationPrompt] = useState(
    DEFAULT_VALIDATION_PROMPT
  );
  const [extractionModel, setExtractionModel] = useState(
    DEFAULT_EXTRACTION_MODEL
  );
  const [validationModel, setValidationModel] = useState(
    DEFAULT_VALIDATION_MODEL
  );
  const [promptEnhancementInput, setPromptEnhancementInput] = useState('');

  // Load from localStorage on mount
  useEffect(() => {
    const savedExtraction = localStorage.getItem("extractionPrompt");
    const savedValidation = localStorage.getItem("validationPrompt");
    const savedExtractionModel = localStorage.getItem("extractionModel");
    const savedValidationModel = localStorage.getItem("validationModel");

    if (savedExtraction) setExtractionPrompt(savedExtraction);
    if (savedValidation) setValidationPrompt(savedValidation);
    if (savedExtractionModel) setExtractionModel(savedExtractionModel);
    if (savedValidationModel) setValidationModel(savedValidationModel);
    const savedPromptEnhancementInput = localStorage.getItem('promptEnhancementInput');
    if (savedPromptEnhancementInput) setPromptEnhancementInput(savedPromptEnhancementInput);

    const googleApiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;
    const openrouterApiKey = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY;

    const extractionModelFromStorage = localStorage.getItem("extractionModel") || DEFAULT_EXTRACTION_MODEL;

    if (extractionModelFromStorage.startsWith("gemini")) {
      if (!googleApiKey) {
        console.error(
          "No Google API key found. Make sure NEXT_PUBLIC_GOOGLE_API_KEY is set in environment variables for Google models."
        );
      } else {
        setLlm(new ChatGoogleGenerativeAI({ model: extractionModelFromStorage, apiKey: googleApiKey }));
      }
    } else if (OPENROUTER_MODELS.includes(extractionModelFromStorage)) {
      if (!openrouterApiKey) {
        console.error(
          "No OpenRouter API key found. Make sure NEXT_PUBLIC_OPENROUTER_API_KEY is set in environment variables for OpenRouter models."
        );
      }
      // LLM instance is not set for OpenRouter models as they are called directly via fetch
    } else {
      console.error("Unsupported extraction model:", extractionModelFromStorage);
    }
  }, []);

  // Save to localStorage on change
  const handleSave = () => {
    localStorage.setItem("extractionPrompt", extractionPrompt);
    localStorage.setItem("validationPrompt", validationPrompt);
    localStorage.setItem("extractionModel", extractionModel);
    localStorage.setItem("validationModel", validationModel);
    localStorage.setItem('promptEnhancementInput', promptEnhancementInput);
    alert("Settings saved!");
  };

  const handleEnhancePrompt = async () => {
    try {
      const openrouterApiKey = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY;
      const enhancementPromptContent = `Given the following current prompt:
\`\`\`
${extractionPrompt}
\`\`\`

And the following feedback/enhancement request:
\`\`\`
${promptEnhancementInput}
\`\`\`

Please provide an improved version of the current prompt based on the feedback. Return only the improved prompt text, without any additional explanations or formatting.`;

      let enhancedPromptText: string;

      if (extractionModel.startsWith("gemini")) {
        if (!llm) {
          console.error("LLM not initialized for prompt enhancement.");
          alert("LLM not initialized. Check console for details.");
          return;
        }
        const message = new HumanMessage({
          content: [{ type: "text", text: enhancementPromptContent }],
        });
        const response = await llm.invoke([message]);
        enhancedPromptText = response.content as string;
      } else if (OPENROUTER_MODELS.includes(extractionModel)) {
        if (!openrouterApiKey) {
          console.error("OpenRouter API key not found for prompt enhancement.");
          alert("OpenRouter API key not found. Check console for details.");
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
            messages: [{ role: "user", content: enhancementPromptContent }],
          }),
        });
        const data = await response.json();
        enhancedPromptText = data.choices[0].message.content;
      } else {
        console.error("Unsupported model for prompt enhancement:", extractionModel);
        alert("Unsupported model for prompt enhancement. Check console for details.");
        return;
      }

      setExtractionPrompt(enhancedPromptText.trim());
      alert("Prompt enhanced successfully!");
    } catch (error) {
      console.error("Error enhancing prompt:", error);
      alert("Failed to enhance prompt. Check console for details.");
    }
  };

  const handleReset = () => {
    setExtractionPrompt(DEFAULT_EXTRACTION_PROMPT);
    setValidationPrompt(DEFAULT_VALIDATION_PROMPT);
    setExtractionModel(DEFAULT_EXTRACTION_MODEL);
    setValidationModel(DEFAULT_VALIDATION_MODEL);
    localStorage.removeItem("extractionPrompt");
    localStorage.removeItem("validationPrompt");
    localStorage.removeItem("extractionModel");
    localStorage.removeItem("validationModel");
    alert("Settings reset to default!");
  };

  return (
    <div className="bg-gray-900 text-gray-100 min-h-screen w-full flex items-center justify-center">
      <div className="p-6 max-w-3xl w-full rounded shadow-lg bg-gray-800">
        <h1 className="text-2xl font-bold mb-6">Settings</h1>
        <div className="mb-6">
          <label className="block font-semibold mb-2">Extraction Prompt</label>
          <textarea
            className="w-full h-40 p-2 bg-gray-700 border border-gray-600 rounded text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
            value={extractionPrompt}
            onChange={(e) => setExtractionPrompt(e.target.value)}
            placeholder="Enter extraction prompt..."
          />
        </div>
        <div className="mb-6">
          <label className="block font-semibold mb-2">Extraction Model</label>
          <select
            className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={extractionModel}
            onChange={(e) => setExtractionModel(e.target.value)}
          >
            <option value="gemini-2.0-flash">gemini-2.0-flash (Google)</option>
            <option value="gemini-2.5-flash">gemini-2.5-flash (Google)</option>
            {OPENROUTER_MODELS.map((model) => (
              <option key={model} value={model}>
                {model} (OpenRouter)
              </option>
            ))}
          </select>
        </div>
        <div className="mb-6">
          <label className="block font-semibold mb-2">Validation Prompt</label>
          <textarea
            className="w-full h-40 p-2 bg-gray-700 border border-gray-600 rounded text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
            value={validationPrompt}
            onChange={(e) => setValidationPrompt(e.target.value)}
            placeholder="Enter validation prompt..."
          />
        </div>
        <div className="mb-6">
          <label className="block font-semibold mb-2">Validation Model</label>
          <select
            className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={validationModel}
            onChange={(e) => setValidationModel(e.target.value)}
          >
            <option value="gemini-2.0-flash">gemini-2.0-flash (Google)</option>
            <option value="gemini-2.5-flash">gemini-2.5-flash (Google)</option>
            {OPENROUTER_MODELS.map((model) => (
              <option key={model} value={model}>
                {model} (OpenRouter)
              </option>
            ))}
          </select>
        </div>

       <div className="mb-6">
         <label className="block font-semibold mb-2">Prompt Enhancement Input</label>
         <textarea
           className="w-full h-40 p-2 bg-gray-700 border border-gray-600 rounded text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
           value={promptEnhancementInput}
           onChange={(e) => setPromptEnhancementInput(e.target.value)}
           placeholder="Enter text to enhance the prompt (e.g., 'I entered this input: ..., and got this result: ..., It should have been: ... Please improve the prompt.')"
         />
       </div>

       <div className="flex gap-4">
         <button
           className="bg-blue-600 text-white px-4 py-2 rounded"
           onClick={handleSave}
         >
           Save
         </button>
         <button
           className="bg-gray-400 text-white px-4 py-2 rounded"
           onClick={handleReset}
         >
           Reset to Default
         </button>
         <button
           className="bg-green-600 text-white px-4 py-2 rounded"
           onClick={handleEnhancePrompt}
         >
           Enhance Prompt
         </button>
         <Link href="/" className="ml-auto underline text-blue-300">
           Back to App
         </Link>
       </div>
      </div>
    </div>
  );
}
