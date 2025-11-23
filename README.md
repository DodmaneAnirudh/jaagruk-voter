# JaagrukVoter - Clear Ballot India

A web application for getting clear, unbiased facts on Indian political candidates, parties, and policies.

## Prerequisites

- **Node.js** (v14 or higher) - [Download here](https://nodejs.org/)
- A **Perplexity API Key** - Get one from [Perplexity API Dashboard](https://www.perplexity.ai/settings/api)

## How to Run

### Step 1: Install Dependencies

Open a terminal in the project root directory and run:

```bash
cd backend/node-server
npm install
cd ../..
```

### Step 2: Start the Backend Server

In the same terminal, run:

```bash
cd backend/node-server
npm start
```

The backend server will start on **http://localhost:4000**

**Keep this terminal window open!**

### Step 3: Start the Frontend Server

Open a **NEW terminal window** in the project root directory and run:

```bash
node serve.js
```

The frontend server will start on **http://localhost:3000**

**Keep this terminal window open too!**

### Step 4: Access the Website

Open your web browser and go to:

**http://localhost:3000/login.html**

## Quick Start (Using Batch Script - Windows)

1. Double-click `start.bat` (if available)
2. Or run in PowerShell:
   ```powershell
   .\start.bat
   ```

## Features

- ✅ Multi-page authentication (Login → Home)
- ✅ Email and Guest login options
- ✅ Search candidates, parties, and policies
- ✅ Voice assistant with text-to-speech
- ✅ Chatbot for questions
- ✅ Login history tracking

## API Configuration

1. Get your Perplexity API Key from [Perplexity API Dashboard](https://www.perplexity.ai/settings/api)
2. Enter it in the "Perplexity API Key" field on the home page
3. The API key is not stored - you'll need to enter it each session

## Troubleshooting

### Port Already in Use

If port 3000 or 4000 is already in use:

1. **For Frontend (port 3000):** Edit `serve.js` and change `const PORT = 3000;` to another port (e.g., 3001)
2. **For Backend (port 4000):** Edit `backend/node-server/server.js` and change `const PORT = process.env.PORT || 4000;` to another port (e.g., 4001)
3. **Update API URL:** If you change the backend port, also update `NODE_API_BASE` in `index.html` and `login.html`

### Cannot Connect to Backend

- Make sure the backend server is running on port 4000
- Check that `backend/data/` directory exists
- Verify Node.js is installed: `node --version`

## Project Structure

```
CSE/
├── index.html          # Home page (main application)
├── login.html          # Login page
├── serve.js            # Frontend server
├── backend/
│   ├── node-server/    # Backend API server
│   │   ├── server.js
│   │   └── package.json
│   └── data/           # Data storage (auto-created)
│       ├── logins.json
│       └── search_history.json
└── README.md           # This file
```

## Stopping the Servers

Press `Ctrl + C` in each terminal window to stop the servers.





