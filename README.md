# AI Assistant

It's a RAG (Retrieval-Augmented Generation) application with a WordPress frontend interface.

<br>

## Architecture Overview

```
┌──────────────────────────────────────────────────────────────────────┐
│                          User Interface                              │
│                     (WordPress Admin Panel)                          │
│                         http://localhost:8000                        │
│  Provides interactive web interface for document management          │
│  and AI-powered question answering                                   │
└────────────────────────────────┬─────────────────────────────────────┘
                                 │
                                 │ User Interaction
                                 ▼
┌──────────────────────────────────────────────────────────────────────┐
│              WordPress Plugin (assistant-interface)                  │
│         Location: assistant-interface/wordpress/wp-content/          │
│                      plugins/assistant-interface/                    │
│  ┌───────────────────────────────────────────────────────────────┐   │
│  │  Frontend Layer (React + Webpack)                             │   │
│  │  • Renders responsive UI components                           │   │
│  │  • Handles user input and form submissions                    │   │
│  │  • Manages client-side state and interactions                 │   │
│  │  • Compiles JSX/CSS into optimized bundles                    │   │
│  └───────────────────────────────────────────────────────────────┘   │
│  ┌───────────────────────────────────────────────────────────────┐   │
│  │  Backend Layer (PHP)                                          │   │
│  │  • Processes HTTP requests from frontend                      │   │
│  │  • Manages WordPress integration and hooks                    │   │
│  │  • Forwards API calls to semantic-engine                      │   │
│  │  • Handles authentication and authorization                   │   │
│  └───────────────────────────────────────────────────────────────┘   │
│  ┌───────────────────────────────────────────────────────────────┐   │
│  │  Infrastructure (Docker)                                      │   │
│  │  • Nginx serves static assets and routes requests             │   │
│  │  • PHP-FPM processes WordPress application logic              │   │
│  │  • MySQL stores WordPress data and configurations             │   │
│  └───────────────────────────────────────────────────────────────┘   │
└────────────────────────────────┬─────────────────────────────────────┘
                                 │
                                 │ REST API Calls (HTTP/HTTPS)
                                 │
                                 ▼
┌──────────────────────────────────────────────────────────────────────┐
│              RAG Backend (semantic-engine)                           │
│              Location: ai-assistant/semantic-engine/                 │
│  ┌───────────────────────────────────────────────────────────────┐   │
│  │  Indexing Module (app/index/)                                 │   │
│  │  • Dynamically indexes documents in vector database           │   │
│  │  • Processes and chunks documents for embedding               │   │
│  │  • Manages document lifecycle (store/delete/re-index)         │   │
│  │  • Generates vector embeddings using Ollama                   │   │
│  │                                                               │   │
│  │  API Endpoints:                                               │   │
│  │    POST   /index/store     - Index new documents              │   │
│  │    DELETE /index/delete    - Remove indexed documents         │   │
│  │    POST   /index/re-store  - Reindex existing documents       │   │
│  └───────────────────────────────────────────────────────────────┘   │
│  ┌───────────────────────────────────────────────────────────────┐   │
│  │  Retrieval Module (app/retrieval/)                            │   │
│  │  • Performs semantic search on user queries                   │   │
│  │  • Augments prompts with retrieved context                    │   │
│  │  • Generates AI responses using RAG approach                  │   │
│  │  • Retrieves relevant document chunks and metadata            │   │
│  │                                                               │   │
│  │  API Endpoints:                                               │   │
│  │    POST /retrieval          - Query with RAG                  │   │
│  │    GET  /retrieval/document - Fetch specific document         │   │
│  │    GET  /retrieval/documents- List all documents              │   │
│  │    GET  /retrieval/points   - Get vector points               │   │
│  └───────────────────────────────────────────────────────────────┘   │
│  ┌───────────────────────────────────────────────────────────────┐   │
│  │  Infrastructure (Docker)                                      │   │
│  │  • Node.js runtime executes application logic                 │   │
│  │  • Nginx reverse proxy with SSL termination                   │   │
│  │  • Ollama integration for embeddings and generation           │   │
│  └───────────────────────────────────────────────────────────────┘   │
└────────────────────────────────┬─────────────────────────────────────┘
                                 │
                                 │ Vector Operations
                                 │ (Embedding Storage & Retrieval)
                                 ▼
┌──────────────────────────────────────────────────────────────────────┐
│                  Vector Database (Qdrant)                            │
│                      Storage: qdrant_db/                             │
│  • Stores high-dimensional vector embeddings                         │
│  • Performs fast similarity search using HNSW algorithm              │
│  • Manages document metadata and payloads                            │
│  • Enables semantic retrieval for RAG operations                     │
└──────────────────────────────────────────────────────────────────────┘
                                 ▲
                                 │
                          Powered by Ollama
                                 │
                    ┌────────────────────────────┐
                    │    Ollama (Local AI)       │
                    │  • Generates embeddings    │
                    │  • Produces AI responses   │
                    │  • Runs locally on host    │
                    └────────────────────────────┘
```

<br>

## Conversation flow

The RAG system maintains conversation context through an intelligent summarization approach that preserves conversation history while optimizing token usage.

### Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                     First Question (Initial Query)                  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  User Query                                                         │
│       │                                                             │
│       ├─► Semantic Search (Qdrant)                                  │
│       │                                                             │
│       ├─► Context Retrieval                                         │
│       │                                                             │
│       ├─► Prompt Augmentation                                       │
│       │                                                             │
│       └─► AI Response Generation                                    │
│                                                                     │
│  Output:                                                            │
│    • AI Answer                                                      │
│    • Summary (Initial Context)                                      │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│              Second and Nth Question (Context-Aware Query)          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  User Query + Previous Summary                                      │
│       │                                                             │
│       ├─► Semantic Search (with conversation context)               │
│       │                                                             │
│       ├─► Context Retrieval                                         │
│       │                                                             │
│       ├─► Prompt Augmentation                                       │
│       │   (Previous Summary + New Context)                          │
│       │                                                             │
│       └─► AI Response Generation                                    │
│                                                                     │
│  Output:                                                            │
│    • AI Answer                                                      │
│    • Updated Summary                                                │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Benefits of This Approach

1. **Context Preservation**: Each question builds upon previous interactions
2. **Token Efficiency**: Summaries compress conversation history without losing key information
3. **Semantic Continuity**: Follow-up questions can reference earlier topics naturally
4. **Scalable Conversations**: Long conversations remain manageable through progressive summarization
5. **Enhanced Retrieval**: Cumulative context improves relevance of retrieved documents

<br>

## Project Structure

```
ai-assistant-services/
│
├── ai-assistant/                          # Main Git Repository
│   ├── semantic-engine/                   # RAG Backend Application
│   │   ├── app/
│   │   │   ├── index/                     # Document Indexing Module
│   │   │   │   ├── controllers/
│   │   │   │   │   ├── storeController.js
│   │   │   │   │   ├── deleteController.js
│   │   │   │   │   └── reStoreController.js
│   │   │   │   ├── services/
│   │   │   │   │   ├── createDocumentService.js
│   │   │   │   │   └── deleteDocumentService.js
│   │   │   │   └── routes.js
│   │   │   │
│   │   │   ├── retrieval/                 # Query & Retrieval Module
│   │   │   │   ├── controllers/
│   │   │   │   │   ├── retrievalController.js
│   │   │   │   │   ├── getDocumentController.js
│   │   │   │   │   ├── getDocumentsController.js
│   │   │   │   │   └── getPointsController.js
│   │   │   │   ├── services/
│   │   │   │   │   └── prompt-augmentation.js
│   │   │   │   └── routes.js
│   │   │   │
│   │   │   ├── helpers/
│   │   │   │   └── utilities.js
│   │   │   └── types/
│   │   │       └── point.js
│   │   │
│   │   ├── docker-configs/                # Docker Configuration
│   │   │   ├── certs/
│   │   │   │   ├── cert.pem
│   │   │   │   └── key.pem
│   │   │   ├── default.conf
│   │   │   ├── nginx.dockerfile
│   │   │   └── node.dockerfile
│   │   │
│   │   ├── qdrant_db/                     # Vector Database Storage
│   │   ├── app.js                         # Main Application Entry
│   │   ├── docker-compose.yml
│   │   ├── package.json
│   │   ├── nodemon.json
│   │   ├── .env
│   │   └── .env-example
│   │
│   └── assistant-interface/               # a copy of the plugin
│
└── assistant-interface/                   # WordPress Development Environment
    ├── wordpress/                         # WordPress Core
    │   ├── wp-content/
    │   │   ├── plugins/
    │   │   │   └── assistant-interface/   # Main WordPress Plugin
    │   │   │       ├── app/
    │   │   │       │   ├── Core.php       # Plugin Core
    │   │   │       │   ├── Lib/           # Library Classes
    │   │   │       │   │   ├── Response.php
    │   │   │       │   │   ├── Http.php
    │   │   │       │   │   └── SingleTon.php
    │   │   │       │   ├── Services/      # Business Logic
    │   │   │       │   │   ├── KnowledgeBase.php
    │   │   │       │   │   ├── AdminInterface.php
    │   │   │       │   │   └── Assets.php
    │   │   │       │   └── Views/
    │   │   │       │       └── admin.php
    │   │   │       │
    │   │   │       ├── resources/         # Frontend Assets (Source)
    │   │   │       │   ├── components/
    │   │   │       │   │   └── IndexForm.jsx
    │   │   │       │   ├── app.js
    │   │   │       │   └── app.css
    │   │   │       │
    │   │   │       ├── build/             # Compiled Frontend Assets
    │   │   │       ├── vendor/            # PHP Dependencies (Composer)
    │   │   │       ├── node_modules/      # JS Dependencies (npm)
    │   │   │       ├── index.php          # Plugin Entry Point
    │   │   │       ├── composer.json
    │   │   │       ├── package.json
    │   │   │       ├── webpack.config.js
    │   │   │       ├── postcss.config.js
    │   │   │       └── README.md
    │   │   │
    │   │   ├── themes/
    │   │   └── uploads/
    │   │
    │   ├── wp-admin/
    │   ├── wp-includes/
    │   ├── wp-config.php
    │   └── index.php
    │
    ├── configs/                           # Server Configurations
    │   └── nginx/
    │
    ├── db/                                # MySQL Database Files
    │   ├── mysql/
    │   ├── performance_schema/
    │   ├── sys/
    │   └── wp/
    │
    └── docker-compose.yml                 # WordPress Docker Setup
```

## Technology Stack

### semantic-engine (Backend)
- **Runtime**: Node.js
- **Web Server**: Nginx (Reverse Proxy)
- **Vector Database**: Qdrant
- **Container**: Docker
- **AI/ML**: Ollama (for embeddings and generation)

### assistant-interface (Frontend)
- **CMS**: WordPress
- **Backend Language**: PHP
- **Frontend Framework**: React (JSX)
- **Build Tool**: Webpack
- **CSS**: PostCSS
- **Dependency Management**: Composer (PHP), npm (JavaScript)
- **Web Server**: Nginx
- **Database**: MySQL
- **Container**: Docker

## Communication Flow

1. **User Input**: User interacts with WordPress admin panel
2. **Frontend Processing**: React components handle user interactions
3. **API Request**: WordPress plugin sends HTTP requests to semantic-engine
4. **Document Indexing**: semantic-engine processes and stores documents in Qdrant
5. **Query Processing**: User queries are augmented and sent to Qdrant for semantic search
6. **AI Generation**: Retrieved context is used for RAG-based response generation
7. **Response Delivery**: Results are returned to WordPress and displayed to user

## Development Setup

### Prerequisites
- Docker & Docker Compose
- Node.js & npm
- Composer
- Ollama (for AI capabilities)

### Getting Started

#### 1. Start WordPress Environment
```bash
cd assistant-interface
docker-compose up -d --build
```

Access WordPress at: `http://localhost:8000`

#### 2. Install Plugin Dependencies
```bash
# Inside the PHP container
cd wordpress/wp-content/plugins/assistant-interface
composer install
npm install
npm run build
```

#### 3. Start RAG Backend
```bash
cd ai-assistant/semantic-engine
docker-compose up -d --build
```

#### 4. Install Backend Dependencies
```bash
# Inside the engine container
npm install
```

## API Endpoints

### semantic-engine Endpoints
- **POST** `/index/store` - Index new documents
- **DELETE** `/index/delete` - Delete documents
- **POST** `/index/re-store` - Re-index documents
- **POST** `/retrieval` - Query documents (RAG)
- **GET** `/retrieval/document` - Get specific document
- **GET** `/retrieval/documents` - Get all documents
- **GET** `/retrieval/points` - Get vector points

## Key Features

### Document Management
- Upload and index documents
- Delete and re-index capabilities
- Vector-based storage in Qdrant

### Semantic Search
- Context-aware query processing
- Prompt augmentation for better results
- Vector similarity search

### WordPress Integration
- Native WordPress admin interface
- React-based interactive UI
- RESTful API integration

