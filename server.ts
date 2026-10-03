/**
 * Lion Group Agency - Server Entry Point
 * Express API + Vite Middleware Integration + Gemini AI Features:
 * - Live Voice Conversations with gemini-3.8-live (Live API)
 * - Search Grounding with gemini-3.5-flash and googleSearch tool
 */

import 'dotenv/config';
import express from 'express';
import type { Request, Response } from 'express';
import http from 'http';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { WebSocketServer, WebSocket } from 'ws';
import { GoogleGenAI, Modality, type LiveServerMessage } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Shared Gemini AI Client instance on the server
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Ensure local data storage directory exists on the disk
const dataDir = path.resolve(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}
const dbFilePath = path.join(dataDir, 'agency_db.json');

// Favicon Handler - returns lion-logo.svg with 200 OK
app.get('/favicon.ico', (req: Request, res: Response) => {
  const logoPath = path.resolve(__dirname, 'public', 'lion-logo.svg');
  if (fs.existsSync(logoPath)) {
    res.setHeader('Content-Type', 'image/svg+xml');
    res.sendFile(logoPath);
  } else {
    res.status(204).end();
  }
});

// Health Check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    app: 'Lion Group Agency Recovery & Collection Management System',
    location: 'Dahod, Gujarat, India',
    geminiLiveSupported: true,
    searchGroundingSupported: true,
    timestamp: new Date().toISOString(),
  });
});

// Local Disk Database Persistence Endpoints
app.get('/api/database', (req: Request, res: Response) => {
  try {
    if (fs.existsSync(dbFilePath)) {
      const raw = fs.readFileSync(dbFilePath, 'utf-8');
      res.json(JSON.parse(raw));
    } else {
      res.json(null);
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/database', (req: Request, res: Response) => {
  try {
    const data = req.body;
    fs.writeFileSync(dbFilePath, JSON.stringify(data, null, 2), 'utf-8');
    res.json({ success: true, savedAt: new Date().toISOString() });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// System Information
app.get('/api/info', (req: Request, res: Response) => {
  res.json({
    company: 'LION GROUP AGENCY',
    branch: 'Dahod Central Office, Gujarat',
    aiModules: [
      'Gemini 3.8 Live Voice Copilot (Live API)',
      'Gemini 3.5 Flash Search Grounding (Google Search)',
    ],
    modules: [
      'Dashboard',
      'Finance Company Master',
      'Case Management',
      'Bulk Excel Import/Export',
      'Daily Collection & Receipts',
      'Daily Hisab Register',
      'Officer & Attendance',
      'Salary & Payout Engine',
      'Vehicle & Yard Management',
      'Repo, Release & Same-Day Release',
      'Comprehensive Reports',
      'Admin Settings & Custom Field Builder',
      'User Roles & Permissions',
      'Audit Trail Logs',
      'Database Backup & Restore',
      'Mobile Officer Dashboard',
    ],
  });
});

// ==========================================
// FEATURE: GOOGLE SEARCH GROUNDING
// ==========================================
// Uses gemini-3.5-flash with googleSearch tool for real-time up-to-date accurate web information
app.post('/api/search/grounding', async (req: Request, res: Response) => {
  try {
    const { query, category = 'regulatory' } = req.body;

    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: query,
      config: {
        systemInstruction: `You are the chief legal, regulatory, and vehicle recovery intelligence officer for Lion Group Agency located in Dahod, Gujarat, India.
Always use Google Search to obtain the latest, real-time verified information.
Focus on:
1. Reserve Bank of India (RBI) Fair Practices Code for Recovery Agents, non-harassment rules, authorized calling windows (8 AM to 7 PM), and loan repossession standards.
2. SARFAESI Act legal procedures, demand notice rules, Section 13(4) vehicle possession protocols, and Magistrate/Collector order requirements.
3. Gujarat RTO (GJ-20 Dahod, GJ-17 Godhra, etc.), Parivahan vehicle registration, NOC, hypothecation termination, and transport circulars.
4. Dahod police station intimation protocols prior to and immediately after repossession of commercial and private vehicles.
5. Commercial vehicle market resale valuations in Gujarat (Tata, Mahindra, Eicher, Ashok Leyland).
Format responses with clean Markdown headers, bullet points, exact circular/court references if found, and actionable takeaways for recovery officers.`,
        tools: [{ googleSearch: {} }],
      },
    });

    const text = response.text || '';
    const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
    const groundingChunks = groundingMetadata?.groundingChunks || [];
    const searchQueries = groundingMetadata?.webSearchQueries || [];

    res.json({
      success: true,
      model: 'gemini-3.5-flash',
      text,
      groundingChunks,
      searchQueries,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error('Search grounding error:', err);
    res.status(500).json({
      error: err.message || 'Failed to execute grounded search',
      details: String(err),
    });
  }
});

// ==========================================
// FEATURE 3: LIVE VOICE CONVERSATIONS
// ==========================================
// Live WebSocket server bridging client to gemini-3.8-live (Live API)
const wss = new WebSocketServer({ noServer: true });

wss.on('connection', async (clientWs: WebSocket, req: http.IncomingMessage) => {
  const urlObj = new URL(req.url || '', `http://${req.headers.host || 'localhost'}`);
  const requestedVoice = urlObj.searchParams.get('voice') || 'Zephyr';

  if (!process.env.GEMINI_API_KEY) {
    clientWs.send(JSON.stringify({
      type: 'error',
      error: 'GEMINI_API_KEY is not configured on the server. Please ensure an API key is selected in AI Studio.',
    }));
    clientWs.close();
    return;
  }

  let session: any = null;

  try {
    session = await ai.live.connect({
      model: 'gemini-3.8-live',
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {
              voiceName: requestedVoice,
            },
          },
        },
        systemInstruction: `You are the Lion Group Agency AI Voice Copilot in Dahod, Gujarat.
You assist vehicle recovery officers, repo field agents, and yard supervisors during field operations and office hours.
You speak clearly, warmly, and concisely in English, Gujarati, or Hindi as needed.
Give practical, lawful, and actionable guidance regarding:
- Dealing with overdue borrowers and peaceful conflict de-escalation
- RBI Fair Practices Code for recovery agents (strict no-intimidation rule)
- Dahod local yard procedures, vehicle release receipts, and same-day release fees
- SARFAESI Act Section 13(4) notices, inventory lists, and police intimation
- Daily hisab reconciliations (cash collected, fuel, towing, yard rent)
Keep all voice answers concise, clear, and direct so they are easily understood when listened to over audio.`,
      },
      callbacks: {
        onmessage: (message: LiveServerMessage) => {
          const parts = message.serverContent?.modelTurn?.parts;
          if (parts && parts.length > 0) {
            for (const part of parts) {
              if (part.inlineData?.data) {
                clientWs.send(JSON.stringify({
                  type: 'audio',
                  audio: part.inlineData.data,
                }));
              }
              if (part.text) {
                clientWs.send(JSON.stringify({
                  type: 'transcript',
                  role: 'assistant',
                  text: part.text,
                }));
              }
            }
          }
          if (message.serverContent?.interrupted) {
            clientWs.send(JSON.stringify({ type: 'interrupted' }));
          }
        },
        onclose: () => {
          if (clientWs.readyState === WebSocket.OPEN) {
            clientWs.send(JSON.stringify({ type: 'status', status: 'closed' }));
          }
        },
        onerror: (err: any) => {
          if (clientWs.readyState === WebSocket.OPEN) {
            clientWs.send(JSON.stringify({
              type: 'error',
              error: err?.message || 'Live session error occurred',
            }));
          }
        },
      },
    });

    // Notify client of successful connection
    clientWs.send(JSON.stringify({
      type: 'status',
      status: 'connected',
      model: 'gemini-3.8-live',
      voice: requestedVoice,
    }));

    clientWs.on('message', (raw: any) => {
      try {
        const data = JSON.parse(raw.toString());
        if (data.type === 'audio' && data.audio) {
          session.sendRealtimeInput({
            audio: {
              data: data.audio,
              mimeType: 'audio/pcm;rate=16000',
            },
          });
        } else if (data.type === 'text' && data.text) {
          session.sendRealtimeInput({
            text: data.text,
          });
        }
      } catch (err: any) {
        console.error('Error handling WebSocket client data:', err);
      }
    });

    clientWs.on('close', () => {
      try {
        if (session) session.close();
      } catch (e) {}
    });

    clientWs.on('error', (err) => {
      console.error('Client WebSocket error:', err);
      try {
        if (session) session.close();
      } catch (e) {}
    });
  } catch (err: any) {
    console.error('Failed to establish Gemini 3.8 Live session:', err);
    if (clientWs.readyState === WebSocket.OPEN) {
      clientWs.send(JSON.stringify({
        type: 'error',
        error: err?.message || 'Failed to connect to Gemini 3.8 Live API.',
      }));
      clientWs.close();
    }
  }
});

// Route WebSocket upgrades: /api/live goes to our Live API server, others to Vite HMR
server.on('upgrade', (request, socket, head) => {
  const pathname = request.url ? new URL(request.url, `http://${request.headers.host || 'localhost'}`).pathname : '';
  if (pathname === '/api/live') {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request);
    });
  }
});

// Mount Vite in development or serve static dist in production
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: {
          server,
        },
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);

    // Fallback for HTML5 history API navigation
    app.use('*', async (req: Request, res: Response, next) => {
      const url = req.originalUrl;
      try {
        let template = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e: any) {
        vite.ssrFixStacktrace(e);
        next(e);
      }
    });
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (req: Request, res: Response) => {
        res.sendFile(path.resolve(distPath, 'index.html'));
      });
    }
  }

  server.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`[Lion Group Agency] Full-stack Server running at http://0.0.0.0:${PORT}`);
    console.log(`[Gemini AI] Live API (gemini-3.8-live) and Search Grounding (gemini-3.5-flash) active.`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
