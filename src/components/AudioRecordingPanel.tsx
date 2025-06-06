"use client";

import { Mic, Square, ArrowRight, Upload } from "lucide-react";
import { useRef } from "react";

interface AudioRecordingPanelProps {
  textInput: string;
  setTextInput: (value: string) => void;
  isRecording: boolean;
  isProcessing: boolean;
  isTranscribing: boolean;
  isValidating: boolean;
  onMicClick: () => void;
  onTextSubmit: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  onFileUpload: (file: File) => void;
}

const AudioRecordingPanel = ({
  textInput,
  setTextInput,
  isRecording,
  isProcessing,
  isTranscribing,
  isValidating,
  onMicClick,
  onTextSubmit,
  onKeyDown,
  onFileUpload,
}: AudioRecordingPanelProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type.startsWith("audio/")) {
        onFileUpload(file);
      } else {
        alert("Please select an audio file");
      }
      e.target.value = "";
    }
  };

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

      <div className="w-96 h-full bg-gray-800 border-r border-gray-600 p-4 flex flex-col">
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*"
          onChange={handleFileChange}
          className="hidden"
        />

        {/* Text Input Area */}
        <div className="mb-4 flex-1 flex flex-col">
          <textarea
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Type your text here..."
            className="w-full h-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-100 placeholder-gray-400 scrollbar-hide"
            disabled={isProcessing || isTranscribing || isValidating}
          />
        </div>

        {/* Button Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {/* Mic Button */}
            <button
              onClick={onMicClick}
              disabled={isProcessing || isTranscribing || isValidating}
              className={`flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200 ${
                isRecording
                  ? "bg-red-600 hover:bg-red-700"
                  : isTranscribing
                  ? "bg-yellow-600"
                  : "bg-blue-600 hover:bg-blue-700"
              } text-white shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed`}
              title={
                isRecording
                  ? "Stop Recording"
                  : isTranscribing
                  ? "Transcribing..."
                  : "Start Recording"
              }
            >
              {isTranscribing ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : isRecording ? (
                <Square className="w-4 h-4" />
              ) : (
                <Mic className="w-4 h-4" />
              )}
            </button>

            {/* Upload Button */}
            <button
              onClick={handleFileClick}
              disabled={
                isProcessing || isTranscribing || isRecording || isValidating
              }
              className="flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200 bg-purple-600 hover:bg-purple-700 text-white shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              title="Upload Audio File"
            >
              <Upload className="w-4 h-4" />
            </button>

            {/* Recording/Processing/Validating Indicator */}
            {(isRecording || isTranscribing || isValidating) && (
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-red-400 font-medium">
                  {isRecording
                    ? "Recording..."
                    : isTranscribing
                    ? "Transcribing..."
                    : isValidating
                    ? "Validating..."
                    : ""}
                </span>
              </div>
            )}
          </div>

          {/* Send Button */}
          <button
            onClick={onTextSubmit}
            disabled={
              !textInput.trim() ||
              isProcessing ||
              isTranscribing ||
              isValidating
            }
            className={`flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200 ${
              textInput.trim() &&
              !isProcessing &&
              !isTranscribing &&
              !isValidating
                ? "bg-green-600 hover:bg-green-700 cursor-pointer"
                : "bg-gray-600 cursor-not-allowed"
            } text-white shadow-lg hover:shadow-xl disabled:hover:shadow-lg`}
            title="Send Message"
          >
            {isProcessing ? (
              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
            ) : isValidating ? (
              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
            ) : (
              <ArrowRight className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </>
  );
};

export default AudioRecordingPanel;
