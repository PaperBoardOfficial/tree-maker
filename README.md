# Voice-to-Topic Tree Application

A real-time voice-to-topic extraction application that converts speech into hierarchical topic trees using Gemini AI with LLM validation and a beautiful custom visualization interface.

## Features

- 🎤 **Voice Recording**: Real-time voice input with browser MediaRecorder API
- 📁 **File Upload**: Support for various audio formats (MP3, WAV, M4A, OGG, FLAC, AAC, WebM)
- 🗣️ **Speech-to-Text**: High-quality transcription using AssemblyAI
- 🧠 **AI-Powered Extraction**: Uses Google Gemini 2.0-flash to extract hierarchical topics
- ✅ **LLM Validation**: Gemini 2.5-flash-preview validates and refines extracted topics
- 🎨 **Beautiful Visualization**: Custom circular node interface with 23 soft pastel colors
- 📱 **Mobile-Friendly**: Vertical drill-down interface optimized for all screen sizes
- 🎯 **Interactive Navigation**: Click nodes to explore, select children to drill down
- 🌈 **Random Colors**: Each topic gets a beautiful random soft color for visual variety

## Architecture

### Dual-LLM Processing Pipeline

**Topic Extraction → Validation → Visualization**

1. **Gemini 2.0-flash**: Initial hierarchical topic extraction from text
2. **Gemini 2.5-flash-preview**: Validates accuracy, completeness, and structure
3. **Custom Interface**: Renders topics in an intuitive drill-down format

### Custom Visualization Interface

**Split Layout Design:**

- **Left Panel (50%)**: Vertical linear flow with circular topic nodes
- **Right Panel (50%)**: Interactive children selection area
- **No External Dependencies**: Built from scratch, no React Flow or graph libraries

### Real-time Processing Flow

1. **Audio Input** → MediaRecorder API or file upload
2. **Transcription** → AssemblyAI converts speech to text
3. **Topic Extraction** → Gemini 2.0-flash extracts hierarchical structure
4. **Validation** → Gemini 2.5-flash-preview validates and corrects
5. **Visualization** → Custom interface renders interactive topic tree

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

Key packages:

- `@langchain/google-genai` - Gemini AI integration
- `assemblyai` - Speech-to-text transcription
- `lucide-react` - Icons for the interface

### 2. Environment Configuration

Create a `.env.local` file:

```bash
# Google Gemini API Key (Required)
NEXT_PUBLIC_GOOGLE_API_KEY=your-google-api-key-here

# AssemblyAI API Key (Required)
NEXT_PUBLIC_ASSEMBLYAI_API_KEY=your-assemblyai-api-key-here
```

### 3. Get API Keys

#### Google Gemini API

1. Go to [Google AI Studio](https://aistudio.google.com/)
2. Create a new API key
3. Add to `.env.local` as `NEXT_PUBLIC_GOOGLE_API_KEY`

#### AssemblyAI API

1. Go to [AssemblyAI](https://www.assemblyai.com/)
2. Sign up and get your API key
3. Add to `.env.local` as `NEXT_PUBLIC_ASSEMBLYAI_API_KEY`

### 4. Run the Application

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

### Input Methods

1. **Text Input**: Type directly in the left panel textarea
2. **Voice Recording**: Click the microphone button to record
3. **File Upload**: Click upload button to process audio files

### Navigation

1. **Start**: Process text/audio to see the root topic
2. **Explore**: Click circular nodes to see their children in the right panel
3. **Drill Down**: Click children to add them to the linear path
4. **Navigate Back**: Click any previous node to return to that level

### Interface Elements

- **Circular Nodes**: Main topics displayed as colorful circles
- **Accuracy Badges**: Show AI confidence levels (percentage)
- **Children Indicators**: Small badges showing number of subtopics
- **Connection Lines**: Visual links between parent and child topics
- **Right Panel**: Interactive area for selecting and exploring children

## Visual Design

### Color Palette (23 Soft Colors)

**Greens**: Emerald, Lime, Green, Teal (various shades)
**Blues**: Cyan, Sky, Blue, Indigo (various shades)  
**Purples**: Violet, Purple, Fuchsia (various shades)
**Pinks**: Pink, Rose (multiple tones)
**Warm**: Red, Orange, Amber, Yellow (soft versions)
**Light Variants**: Ultra-light versions of core colors

### Node Design

- **Size**: 128px diameter circles
- **Random Colors**: Each topic gets a unique soft pastel color
- **Hover Effects**: Scale animation on interaction
- **Selection State**: White ring around active node
- **Typography**: Dark text on light backgrounds for readability

## LLM Processing Details

### Topic Extraction Prompt

- Focuses on explicitly mentioned topics only
- Creates logical hierarchical structures
- Captures specific values, measurements, and names
- Assigns accuracy scores based on content prominence
- Uses consistent ID naming patterns

### Validation Prompt

- Reviews extraction accuracy against original text
- Checks for completeness and missing topics
- Validates hierarchical relationships
- Adjusts accuracy scores for better precision
- Removes hallucinated or incorrect topics

### Accuracy Scoring (0.3-1.0 scale)

- **0.9-1.0**: Extensively discussed with multiple details
- **0.7-0.9**: Clearly mentioned with context
- **0.5-0.7**: Mentioned with some detail
- **0.3-0.5**: Briefly mentioned or implied