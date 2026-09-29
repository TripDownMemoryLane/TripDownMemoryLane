# 📸 TripDownMemoryLane — Full-Stack AI Journaling Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Architecture: Decoupled](https://img.shields.io/badge/Architecture-Decoupled%20Microservices-blue.svg)](#-system-architecture--engineering-breakdown)
[![Submodules](https://img.shields.io/badge/Git-Submodules%20Orchestration-orange.svg)](#-project-structure--submodules)

An interactive multimodal platform combining computer vision, generative AI storytelling, adaptive quizzes, and synthesized audio playback to archive and revisit personal memories.


## 📽️ System Demo & Architecture Presentation

| 📺 Video Demonstration | 📑 Technical Presentation |
| :--- | :--- |
| [![Watch the Demo](https://img.youtube.com/vi/AnKT1Wh7sXg/hqdefault.jpg)](https://www.youtube.com/watch?v=AnKT1Wh7sXg) | **Trip Down Memory Lane**<br>*System Architecture, AI Pipeline & Project Evaluation Deck*<br><br>[![View Presentation PDF](https://img.shields.io/badge/View_Presentation-PDF-red?style=for-the-badge&logo=adobe-acrobat-reader&logoColor=white)](./docs/FinalProjectPresentation.pdf) |
| **Platform Walkthrough:** End-to-end user workflow showing photo memory uploads, AI story generation, interactive quizzes, and TTS audio playback. | **Architecture Slide Deck:** Covers cognitive health motivation, multimodal AI orchestration, client-side IndexedDB privacy, and team task allocation. |

## 🏛️ System Architecture & Engineering Breakdown

This repository serves as the umbrella orchestration monorepo integrating two decoupled services via Git submodules:

| Tier | Sub-Repository | Engineering Owner(s) | Primary Stack | Key Responsibilities |
| :--- | :--- | :--- | :--- | :--- |
| **Frontend Client** | [TripDownMemoryLane/memoryLaneFrontend](https://github.com/TripDownMemoryLane/memoryLaneFrontend) | [@cts0424](https://github.com/cts0424), JL | React, Tailwind CSS | Responsive UI/UX, image upload compression, audio playback, interactive quiz views |
| **Backend API** | [TripDownMemoryLane/backend](https://github.com/TripDownMemoryLane/backend) | [@jyliew1912](https://github.com/jyliew1912) | Node.js, Express 5, Google Vision, Google TTS, Hugging Face, Jest | AI vision/story pipelines, audio synthesis, REST API contracts, automated integration tests |

### Data Flow Diagram

```text
[ React Frontend Client (:4000) ]
              │
    Base64 Image Payload
              │
              ▼
[ Express API Gateway (:4001) ]
  ├── 1. Google Cloud Vision API    → Feature & Entity Extraction
  ├── 2. Hugging Face Inference API → Contextual Story & Quiz Generation
  └── 3. Google Cloud TTS           → Dynamic Base64 Audio Synthesis
              │
    Quiz + Audio Response
              │
              ▼
[ Client Audio Playback & Quiz Interface ]
```


## 📂 Project Structure & Submodules

```text
TripDownMemoryLane/
├── frontend/             # Submodule: React client application
├── backend/              # Submodule: Express multimodal backend API
├── .gitmodules           # Tracks submodule references and remote commits
├── package.json          # Root concurrency orchestration script
└── README.md             # High-level architecture and developer guide
```


## 🚀 Quickstart: Single-Command Execution

### 1. Clone with Submodules

To clone the monorepo along with all tracked sub-repositories:

```bash
git clone --recurse-submodules https://github.com/TripDownMemoryLane/TripDownMemoryLane.git
cd TripDownMemoryLane
```

> **Note for standard clones:** If you cloned without `--recurse-submodules`, initialize them manually:
> ```bash
> git submodule update --init --recursive
> ```


### 2. Configure Environment Variables

Create and configure your API credentials in the backend service:

```bash
cp backend/.env.example backend/.env
```

### 3. Install & Launch Concurrently
Run both services simultaneously from the project root:

```bash
npm run install:all
npm run dev
```

* **Frontend Client:** `http://localhost:4000`
* **Backend API:** `http://localhost:4001`
* **Backend Automated Tests:** `npm run test:backend`


## 🔄 Keeping Submodules Updated

To pull the latest commits from both the `frontend` and `backend` repositories:

```bash
git submodule update --remote --merge
```


## 📄 License

This project is open-source and distributed under the [MIT License](LICENSE).

