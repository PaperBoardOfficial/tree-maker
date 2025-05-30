"use client";

import { Mic, Square, ArrowRight } from "lucide-react";

interface AudioRecordingPanelProps {
  textInput: string;
  setTextInput: (value: string) => void;
  isRecording: boolean;
  isProcessing: boolean;
  isTranscribing: boolean;
  onMicClick: () => void;
  onTextSubmit: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
}

const AudioRecordingPanel = ({
  textInput,
  setTextInput,
  isRecording,
  isProcessing,
  isTranscribing,
  onMicClick,
  onTextSubmit,
  onKeyDown,
}: AudioRecordingPanelProps) => {
  return (
    <div className="w-96 h-full bg-gray-100 dark:bg-gray-800 border-r border-gray-300 dark:border-gray-600 p-4 flex flex-col">
      {/* Text Input Area */}
      <div className="mb-4 flex-1 flex flex-col">
        <textarea
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Type your text here..."
          className="w-full h-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
          disabled={isProcessing || isTranscribing}
        />
      </div>

      {/* Button Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {/* Mic Button */}
          <button
            onClick={onMicClick}
            disabled={isProcessing || isTranscribing}
            className={`flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200 ${
              isRecording
                ? "bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700"
                : isTranscribing
                ? "bg-yellow-500 dark:bg-yellow-600"
                : "bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
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

          {/* Recording/Processing Indicator */}
          {(isRecording || isTranscribing) && (
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-red-500 dark:text-red-400 font-medium">
                {isRecording ? "Recording..." : "Transcribing..."}
              </span>
            </div>
          )}
        </div>

        {/* Send Button */}
        <button
          onClick={onTextSubmit}
          disabled={!textInput.trim() || isProcessing || isTranscribing}
          className={`flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200 ${
            textInput.trim() && !isProcessing && !isTranscribing
              ? "bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 cursor-pointer"
              : "bg-gray-400 dark:bg-gray-600 cursor-not-allowed"
          } text-white shadow-lg hover:shadow-xl disabled:hover:shadow-lg`}
          title="Send Message"
        >
          {isProcessing ? (
            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
          ) : (
            <ArrowRight className="w-4 h-4" />
          )}
        </button>
      </div>
    </div>
  );
};

export default AudioRecordingPanel;
