# Voice-to-Knowledge Graph Application

A real-time voice-to-knowledge graph application that converts speech into structured knowledge graphs using Gemini AI and **NeoVis.js** for graph visualization.

## Features

- 🎤 **Voice Recording**: Real-time voice input with browser MediaRecorder API
- 🧠 **AI-Powered Extraction**: Uses Google Gemini to extract entities and relationships
- 📊 **Graph Visualization**: Real-time visualization using **NeoVis.js**
- 🔄 **Real-time Updates**: Auto-refresh visualization when new data is added
- 💾 **Session State**: Maintains context across multiple voice inputs
- 🗄️ **Neo4j Ready**: Configured for Neo4j database integration
- ⚡ **Fallback Visualization**: Custom HTML visualization when Neo4j unavailable

## Architecture

### NeoVis.js Integration

This application uses **NeoVis.js** - the official Neo4j visualization library that renders graphs directly from Neo4j databases in web browsers.

**Key Benefits:**

- **Direct Neo4j Connection**: Queries Neo4j directly using Cypher
- **Interactive Graphs**: Pan, zoom, drag nodes, hover tooltips
- **Real-time Updates**: Automatic re-rendering when data changes
- **Customizable**: Node colors, sizes, relationships styling
- **Performance**: Handles large graphs efficiently

### Real-time Strategy

To handle real-time updates (since NeoVis.js doesn't auto-refresh):

1. **React State Triggers**: `refreshKey` state changes trigger re-initialization
2. **Smart Re-rendering**: Only re-render when entities/relationships change
3. **Fallback Mode**: Custom HTML visualization when Neo4j unavailable
4. **Smooth Transitions**: Visual feedback during graph updates

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

The key packages installed:

- `neovis.js` - Neo4j graph visualization
- `neo4j-driver` - Neo4j database connectivity
- `@langchain/google-genai` - Gemini AI integration

### 2. Neo4j Setup (Optional)

#### Option A: Neo4j Desktop (Recommended)

1. Download [Neo4j Desktop](https://neo4j.com/download/)
2. Create a new project and database
3. Start the database and note the connection details

#### Option B: Neo4j AuraDB (Cloud)

1. Go to [Neo4j AuraDB](https://neo4j.com/cloud/aura/)
2. Create a free instance
3. Save the connection credentials

#### Option C: Docker

```bash
docker run \
    --name neo4j \
    -p7474:7474 -p7687:7687 \
    -d \
    -v $HOME/neo4j/data:/data \
    -v $HOME/neo4j/logs:/logs \
    -v $HOME/neo4j/import:/var/lib/neo4j/import \
    -v $HOME/neo4j/plugins:/plugins \
    --env NEO4J_AUTH=neo4j/yourpassword \
    neo4j:latest
```

### 3. Environment Configuration

Create a `.env.local` file:

```bash
# Google Gemini API Key (Required)
NEXT_PUBLIC_GOOGLE_API_KEY=your-google-api-key-here

# Neo4j Connection (Optional - will use fallback visualization if not provided)
NEXT_PUBLIC_NEO4J_URI=bolt://localhost:7687
NEXT_PUBLIC_NEO4J_USER=neo4j
NEXT_PUBLIC_NEO4J_PASSWORD=yourpassword

# For Neo4j AuraDB, use:
# NEXT_PUBLIC_NEO4J_URI=neo4j+s://your-instance.databases.neo4j.io
```

### 4. Run the Application

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage Modes

### Mode 1: With Neo4j (Full Features)

- Real Neo4j database storage
- NeoVis.js interactive graph visualization
- Persistent data across sessions
- Advanced graph analytics

### Mode 2: Without Neo4j (Demo Mode)

- In-memory graph storage
- Custom HTML visualization
- Session-only data
- Perfect for testing and demos

## How NeoVis.js Works

### Configuration

```javascript
const config = {
  container_id: "neovis-container",
  server_url: "bolt://localhost:7687",
  server_user: "neo4j",
  server_password: "password",
  labels: {
    Person: { caption: "name", size: "pagerank" },
    Organization: { caption: "name", size: "pagerank" },
  },
  relationships: {
    WORKS_AT: { thickness: "weight", caption: true },
  },
  initial_cypher: "MATCH (n)-[r]->(m) RETURN n, r, m LIMIT 100",
};
```

### Real-time Updates

```javascript
// Trigger re-render when data changes
setRefreshKey((prev) => prev + 1);

// NeoVis re-initialization
useEffect(() => {
  if (sessionEntities.length > 0) {
    initializeNeovis();
  }
}, [refreshKey]);
```

## Graph Data Flow

1. **Voice Input** → MediaRecorder API
2. **Speech-to-Text** → Mock/Web Speech API
3. **Text Processing** → Gemini LLM extracts entities/relationships
4. **Conflict Resolution** → Smart merging with existing graph
5. **Neo4j Update** → Cypher queries store data
6. **Visualization Refresh** → NeoVis.js re-renders graph

## Advanced Features

### Entity Types & Styling

- **Person**: Blue nodes, medium size
- **Organization**: Green nodes, large size
- **Concept**: Purple nodes, small size
- **Technology**: Orange nodes, medium size

### Relationship Types

- **WORKS_AT**: Professional relationships
- **LIKES**: Preference relationships
- **DEVELOPS**: Creation relationships
- **COLLEAGUE_OF**: Peer relationships

### Smart Context Management

- Tracks recent entities for context
- Filters relevant entities by keywords
- Prevents LLM token limit issues
- Maintains conversation continuity

## Development Notes

### Current Implementation Status

- ✅ NeoVis.js integration complete
- ✅ Real-time refresh mechanism
- ✅ Fallback visualization
- ✅ TypeScript support
- 🔄 Mock speech-to-text (ready for real implementation)
- 🔄 Neo4j Cypher queries (logged, ready to execute)

### Next Development Steps

1. **Real Speech-to-Text**: Replace mock with Web Speech API
2. **Neo4j Cypher Execution**: Activate database writes
3. **Advanced Graph Features**: Clustering, filtering, search
4. **Performance Optimization**: Large graph handling
5. **Export Features**: JSON, GraphML, CSV export

## Troubleshooting

### NeoVis.js Issues

- **Graph not rendering**: Check Neo4j connection in browser console
- **Blank visualization**: Verify Cypher query returns data
- **Performance slow**: Limit nodes with `LIMIT` in Cypher queries

### Common Fixes

- Ensure Neo4j allows remote connections
- Check CORS settings for Neo4j browser access
- Verify credentials in `.env.local`
- Use fallback mode for development without Neo4j

## Why NeoVis.js?

**Advantages over alternatives:**

- **Native Neo4j Integration**: Direct Cypher query support
- **Professional Quality**: Enterprise-grade visualization
- **Customizable**: Full control over appearance
- **Interactive**: Built-in graph interaction features
- **Maintained**: Official Neo4j project

**vs. React Flow**: More graph-database specific
**vs. D3.js**: Less development overhead
**vs. Vis.js**: Better Neo4j integration
