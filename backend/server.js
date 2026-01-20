// server.js - Fitbit API Proxy Server
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3001;

// Enable CORS for your frontend
app.use(cors());

app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Fitbit proxy server is running' });
});

// Proxy all Fitbit API requests - use regex pattern instead of wildcard
app.all(/^\/api\/fitbit\/(.*)$/, async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({ 
        error: 'No authorization token provided',
        message: 'Please include Authorization header with Bearer token'
      });
    }

    // Extract the Fitbit API path from the regex match
    const fitbitPath = req.params[0] || '';
    const fitbitUrl = `https://api.fitbit.com/${fitbitPath}`;

    console.log(`[${new Date().toISOString()}] ${req.method} ${fitbitUrl}`);

    // Build query string
    const queryString = new URLSearchParams(req.query).toString();
    const fullUrl = queryString ? `${fitbitUrl}?${queryString}` : fitbitUrl;

    // Forward request to Fitbit
    const response = await fetch(fullUrl, {
      method: req.method,
      headers: {
        'Authorization': authHeader,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: req.method !== 'GET' && req.body ? JSON.stringify(req.body) : undefined,
    });

    const data = await response.json();

    if (!response.ok) {
      console.error(`[ERROR] Fitbit API returned ${response.status}:`, data);
      return res.status(response.status).json(data);
    }

    console.log(`[SUCCESS] ${response.status} - Data received`);
    res.json(data);
    
  } catch (error) {
    console.error('[PROXY ERROR]:', error.message);
    res.status(500).json({ 
      error: 'Proxy request failed',
      message: error.message,
      details: 'Check server logs for more information'
    });
  }
});

app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════╗
║   Fitbit Proxy Server                          ║
║   Running on: http://localhost:${PORT}         ║
║   Status: Ready to proxy requests              ║
╚════════════════════════════════════════════════╝
  `);
});