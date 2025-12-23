# AI Assistant

It's a RAG (Retrieval-Augmented Generation) application with a WordPress frontend interface.

<br>

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    User Interface                       │
│              (WordPress Admin Panel)                    │
└─────────────────────┬───────────────────────────────────┘
                      │
                      │ User Interaction
                      ▼
┌─────────────────────────────────────────────────────────┐
│          WordPress Plugin (assistant-interface)         │
│  ┌──────────────────────────────────────────────────┐   │
│  │  Frontend (React)                                │   │
│  │                              					  │   │
│  └──────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────┐   │
│  │  Backend (PHP)                          		  │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────┬───────────────────────────────────┘
                      │
                      │ REST API Calls
                      ▼
┌─────────────────────────────────────────────────────────┐
│         RAG Backend (semantic-engine)                   │
│  ┌──────────────────────────────────────────────────┐   │
│  │  Indexing Module (app/index)                     │   │
│  │  - Store/Delete/Re-store Documents               │   │
│  │  - Document Processing                           │   │
│  └──────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────┐   │
│  │  Retrieval Module (app/retrieval)                │   │
│  │  - Semantic Search                               │   │
│  │  - Prompt Augmentation                           │   │
│  │  - Document Retrieval                            │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────┬───────────────────────────────────┘
                      │
                      │ Vector Operations
                      ▼
┌─────────────────────────────────────────────────────────┐
│              Vector Database (Qdrant)                   │
│                   (qdrant_db/)                          │
└─────────────────────────────────────────────────────────┘
```

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

