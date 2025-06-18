"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
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
  const [validationPrompt, setValidationPrompt] = useState(
    DEFAULT_VALIDATION_PROMPT
  );
  const [extractionModel, setExtractionModel] = useState(
    DEFAULT_EXTRACTION_MODEL
  );
  const [validationModel, setValidationModel] = useState(
    DEFAULT_VALIDATION_MODEL
  );

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
  }, []);

  // Save to localStorage on change
  const handleSave = () => {
    localStorage.setItem("extractionPrompt", extractionPrompt);
    localStorage.setItem("validationPrompt", validationPrompt);
    localStorage.setItem("extractionModel", extractionModel);
    localStorage.setItem("validationModel", validationModel);
    alert("Settings saved!");
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
          <Link href="/" className="ml-auto underline text-blue-300">
            Back to App
          </Link>
        </div>
      </div>
    </div>
  );
}
