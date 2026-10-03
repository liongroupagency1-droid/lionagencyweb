import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Radio,
  Volume2,
  VolumeX,
  PhoneCall,
  PhoneOff,
  Sparkles,
  Shield,
  HelpCircle,
  MessageSquare,
  AlertCircle,
  ChevronRight,
  RefreshCw,
  Send,
  Zap,
} from 'lucide-react';
import { float32ToPcmBase64, pcmBase64ToFloat32 } from '../utils/audioLive';

interface ChatTurn {
  id: string;
  role: 'user' | 'assistant' | 'system';
  text: string;
  timestamp: string;
}

const VOICES = [
  { id: 'Zephyr', name: 'Zephyr (Warm & Professional)', desc: 'Balanced, authoritative guidance' },
  { id: 'Puck', name: 'Puck (Energetic & Sharp)', desc: 'Fast, high-pace field direction' },
  { id: 'Charon', name: 'Charon (Deep & Calm)', desc: 'Measured, serious de-escalation' },
  { id: 'Kore', name: 'Kore (Gentle & Clear)', desc: 'Patient, compliance explanation' },
  { id: 'Fenrir', name: 'Fenrir (Direct & Resolute)', desc: 'Firm, decisive enforcement protocols' },
];

const PRESET_PROMPTS = [
  'What are the mandatory SARFAESI Section 13(4) steps before repossessing a vehicle in Gujarat?',
  'A defaulter in Dahod is blocking the tow truck aggressively. How should field officers handle this lawfully?',
  'What is the RBI Fair Practices Code rule regarding contacting borrowers at odd hours?',
  'Calculate hisab: 65,000 cash collected, 8,500 yard entry, 3,200 towing diesel, 4,000 officer daily allowance.',
  'Draft a polite Gujarati & Hindi spoken reminder for a 3-month overdue tractor loan.',
  'What police station paperwork is needed in Dahod after securing a commercial truck?',
];

export const VoiceCopilotModule: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState('Zephyr');
  const [statusMessage, setStatusMessage] = useState('Standby • Ready to connect');
  const [turns, setTurns] = useState<ChatTurn[]>([]);
  const [textInput, setTextInput] = useState('');
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const inputAudioCtxRef = useRef<AudioContext | null>(null);
  const outputAudioCtxRef = useRef<AudioContext | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const activeSourcesRef = useRef<AudioBufferSourceNode[]>([]);
  const isMutedRef = useRef(isMuted);
  const turnsEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    isMutedRef.current = isMuted;
  }, [isMuted]);

  useEffect(() => {
    turnsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [turns]);

  // Clean up Web Audio and WebSocket on unmount
  useEffect(() => {
    return () => {
      disconnectSession();
    };
  }, []);

  const addTurn = (role: 'user' | 'assistant' | 'system', text: string) => {
    setTurns((prev) => [
      ...prev,
      {
        id: Math.random().toString(36).substring(2, 9),
        role,
        text,
        timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      },
    ]);
  };

  const stopAllPlayback = () => {
    activeSourcesRef.current.forEach((src) => {
      try {
        src.stop();
        src.disconnect();
      } catch (e) {}
    });
    activeSourcesRef.current = [];
    nextStartTimeRef.current = 0;
    setIsAiSpeaking(false);
  };

  const scheduleAudioChunk = (pcmBase64: string) => {
    try {
      if (!outputAudioCtxRef.current) {
        outputAudioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({
          sampleRate: 24000,
        });
      }

      const audioCtx = outputAudioCtxRef.current;
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }

      const float32Data = pcmBase64ToFloat32(pcmBase64);
      const audioBuffer = audioCtx.createBuffer(1, float32Data.length, 24000);
      audioBuffer.getChannelData(0).set(float32Data);

      const sourceNode = audioCtx.createBufferSource();
      sourceNode.buffer = audioBuffer;
      sourceNode.connect(audioCtx.destination);

      const currentTime = audioCtx.currentTime;
      const startTime = Math.max(currentTime, nextStartTimeRef.current);
      sourceNode.start(startTime);
      nextStartTimeRef.current = startTime + audioBuffer.duration;

      activeSourcesRef.current.push(sourceNode);
      setIsAiSpeaking(true);

      sourceNode.onended = () => {
        activeSourcesRef.current = activeSourcesRef.current.filter((s) => s !== sourceNode);
        if (activeSourcesRef.current.length === 0) {
          setIsAiSpeaking(false);
        }
      };
    } catch (err) {
      console.error('Failed to play audio chunk:', err);
    }
  };

  const connectSession = async () => {
    setErrorMessage(null);
    setIsConnecting(true);
    setStatusMessage('Requesting microphone & initializing Live API session...');

    try {
      // 1. Initialize output AudioContext (24kHz for Gemini Live model output)
      outputAudioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 24000,
      });

      // 2. Request user microphone
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      micStreamRef.current = stream;

      // 3. Initialize input AudioContext (16kHz for Gemini input)
      inputAudioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 16000,
      });
      const micSource = inputAudioCtxRef.current.createMediaStreamSource(stream);

      // 4. Connect WebSocket to backend bridge
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/api/live?voice=${encodeURIComponent(selectedVoice)}`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnecting(false);
        setIsConnected(true);
        setStatusMessage(`Live Voice Active • Model: gemini-3.8-live (${selectedVoice})`);
        addTurn('system', `Connected to Lion Group Agency Voice Copilot using Gemini 3.8 Live API with voice '${selectedVoice}'. Speak clearly into your microphone.`);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          if (data.type === 'audio' && data.audio) {
            scheduleAudioChunk(data.audio);
          } else if (data.type === 'interrupted') {
            stopAllPlayback();
            addTurn('system', 'User interruption detected — stopping speech.');
          } else if (data.type === 'transcript' && data.text) {
            addTurn('assistant', data.text);
          } else if (data.type === 'error') {
            setErrorMessage(data.error);
            addTurn('system', `Error: ${data.error}`);
          } else if (data.type === 'status' && data.status === 'closed') {
            setStatusMessage('Session closed by server');
            setIsConnected(false);
          }
        } catch (e) {
          console.error('Failed to parse WebSocket message:', e);
        }
      };

      ws.onerror = (err) => {
        console.error('WebSocket connection error:', err);
        setErrorMessage('Failed to connect to Live API backend. Please check server logs.');
        setIsConnecting(false);
        setIsConnected(false);
      };

      ws.onclose = () => {
        setIsConnected(false);
        setIsConnecting(false);
        setStatusMessage('Disconnected');
      };

      // 5. Setup Audio Processing Node for streaming mic input
      const processor = inputAudioCtxRef.current.createScriptProcessor(4096, 1, 1);
      scriptProcessorRef.current = processor;

      processor.onaudioprocess = (e) => {
        if (isMutedRef.current || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
          return;
        }

        const inputChannel = e.inputBuffer.getChannelData(0);

        // Simple volume meter
        let sum = 0;
        for (let i = 0; i < inputChannel.length; i++) {
          sum += Math.abs(inputChannel[i]);
        }
        const avg = sum / inputChannel.length;
        setAudioLevel(Math.min(100, Math.round(avg * 400)));

        // Send 16-bit PCM little-endian base64 chunk
        const base64Pcm = float32ToPcmBase64(inputChannel);
        wsRef.current.send(
          JSON.stringify({
            type: 'audio',
            audio: base64Pcm,
          })
        );
      };

      micSource.connect(processor);
      processor.connect(inputAudioCtxRef.current.destination);
    } catch (err: any) {
      console.error('Voice setup error:', err);
      setErrorMessage(err.message || 'Microphone access denied or audio initialization failed.');
      setIsConnecting(false);
      setIsConnected(false);
      setStatusMessage('Connection failed');
    }
  };

  const disconnectSession = () => {
    stopAllPlayback();

    if (scriptProcessorRef.current) {
      try {
        scriptProcessorRef.current.disconnect();
      } catch (e) {}
      scriptProcessorRef.current = null;
    }

    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((track) => track.stop());
      micStreamRef.current = null;
    }

    if (inputAudioCtxRef.current) {
      try {
        inputAudioCtxRef.current.close();
      } catch (e) {}
      inputAudioCtxRef.current = null;
    }

    if (outputAudioCtxRef.current) {
      try {
        outputAudioCtxRef.current.close();
      } catch (e) {}
      outputAudioCtxRef.current = null;
    }

    if (wsRef.current) {
      try {
        wsRef.current.close();
      } catch (e) {}
      wsRef.current = null;
    }

    setIsConnected(false);
    setIsConnecting(false);
    setAudioLevel(0);
    setStatusMessage('Standby • Disconnected');
    addTurn('system', 'Voice session ended.');
  };

  const handleSendTextMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!textInput.trim() || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      return;
    }

    const text = textInput.trim();
    addTurn('user', text);
    wsRef.current.send(
      JSON.stringify({
        type: 'text',
        text,
      })
    );
    setTextInput('');
  };

  const handleSelectPreset = (prompt: string) => {
    if (isConnected && wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      addTurn('user', prompt);
      wsRef.current.send(
        JSON.stringify({
          type: 'text',
          text: prompt,
        })
      );
    } else {
      setTextInput(prompt);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900 border border-amber-500/30 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-full bg-gradient-to-l from-amber-500/10 to-transparent pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs uppercase font-extrabold tracking-widest text-amber-300 bg-amber-500/20 px-2.5 py-0.5 rounded border border-amber-500/40 flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                Live Audio Engine
              </span>
              <span className="text-xs font-mono text-slate-400">
                Model: <strong className="text-slate-200">gemini-3.8-live</strong> (Live API)
              </span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <span>Lion Group Live Voice Copilot</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold">
                Real-Time Audio
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
              Real-time conversational voice assistant powered by Gemini 3.8 Live API. Talk directly to the AI for field recovery instructions, SARFAESI legal procedures, loan dispute de-escalation, and Dahod vehicle calculations.
            </p>
          </div>

          {/* Connect / Disconnect Action Button */}
          <div className="flex items-center gap-3">
            {!isConnected ? (
              <button
                onClick={connectSession}
                disabled={isConnecting}
                className="px-5 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-extrabold text-sm shadow-lg shadow-amber-500/25 flex items-center gap-2 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
              >
                {isConnecting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Connecting Live...</span>
                  </>
                ) : (
                  <>
                    <PhoneCall className="w-4 h-4" />
                    <span>Start Voice Call</span>
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={disconnectSession}
                className="px-5 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-sm shadow-lg shadow-red-600/30 flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
              >
                <PhoneOff className="w-4 h-4" />
                <span>End Voice Call</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Error Alert if any */}
      {errorMessage && (
        <div className="bg-red-950/60 border border-red-500/50 rounded-xl p-4 flex items-start gap-3 text-red-200 text-xs">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-bold text-red-100">Live Voice Connection Error</p>
            <p className="mt-0.5">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Visualizer & Live Controller */}
        <div className="lg:col-span-1 space-y-6">
          {/* Active Voice Call Visualizer Card */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 flex flex-col items-center justify-center text-center relative overflow-hidden shadow-xl">
            {/* Pulsing ring indicator */}
            <div className="relative mb-6">
              <div
                className={`w-32 h-32 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isConnected
                    ? isAiSpeaking
                      ? 'bg-amber-500/20 border-2 border-amber-400 shadow-2xl shadow-amber-400/50 scale-105'
                      : audioLevel > 15
                      ? 'bg-emerald-500/20 border-2 border-emerald-400 shadow-2xl shadow-emerald-400/50 scale-105'
                      : 'bg-slate-800 border-2 border-amber-500/40 shadow-lg shadow-amber-500/20'
                    : 'bg-slate-800/80 border border-slate-700'
                }`}
              >
                <div
                  className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-200 ${
                    isConnected
                      ? isAiSpeaking
                        ? 'bg-gradient-to-tr from-amber-600 to-yellow-400 text-slate-950 animate-pulse'
                        : audioLevel > 15
                        ? 'bg-gradient-to-tr from-emerald-600 to-teal-400 text-slate-950'
                        : 'bg-slate-900 text-amber-400'
                      : 'bg-slate-950 text-slate-500'
                  }`}
                >
                  {isAiSpeaking ? (
                    <Volume2 className="w-10 h-10 animate-bounce" />
                  ) : isConnected ? (
                    <Mic className="w-10 h-10" />
                  ) : (
                    <MicOff className="w-10 h-10" />
                  )}
                </div>
              </div>

              {/* Dynamic waveform bars below */}
              {isConnected && (
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1">
                  {[...Array(7)].map((_, i) => (
                    <span
                      key={i}
                      className={`w-1 rounded-full transition-all duration-150 ${
                        isAiSpeaking
                          ? 'bg-amber-400'
                          : audioLevel > 15
                          ? 'bg-emerald-400'
                          : 'bg-slate-700'
                      }`}
                      style={{
                        height: isAiSpeaking
                          ? `${14 + Math.sin(Date.now() / 150 + i) * 12}px`
                          : audioLevel > 15
                          ? `${Math.max(6, Math.min(26, (audioLevel / 4) + (i % 3) * 4))}px`
                          : '6px',
                      }}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Status Text */}
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-slate-800 border border-slate-700 text-slate-200">
                <span
                  className={`w-2 h-2 rounded-full ${
                    isConnected
                      ? isAiSpeaking
                        ? 'bg-amber-400 animate-ping'
                        : audioLevel > 15
                        ? 'bg-emerald-400 animate-pulse'
                        : 'bg-emerald-400'
                      : 'bg-slate-500'
                  }`}
                />
                <span>
                  {isConnected
                    ? isAiSpeaking
                      ? 'AI Speaking via Live Audio...'
                      : audioLevel > 15
                      ? 'Listening to your voice...'
                      : 'Connected & Ready'
                    : 'Disconnected'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">{statusMessage}</p>
            </div>

            {/* Interactive In-call Buttons */}
            {isConnected && (
              <div className="flex items-center justify-center gap-3 mt-6 pt-5 border-t border-slate-800 w-full">
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className={`p-3 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all ${
                    isMuted
                      ? 'bg-red-500/20 border-red-500/50 text-red-300'
                      : 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700'
                  }`}
                  title={isMuted ? 'Unmute Microphone' : 'Mute Microphone'}
                >
                  {isMuted ? <MicOff className="w-4 h-4 text-red-400" /> : <Mic className="w-4 h-4 text-emerald-400" />}
                  <span>{isMuted ? 'Muted' : 'Mic Active'}</span>
                </button>

                <button
                  onClick={stopAllPlayback}
                  disabled={!isAiSpeaking}
                  className="p-3 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-2 disabled:opacity-40"
                  title="Interrupt AI Speech"
                >
                  <VolumeX className="w-4 h-4 text-amber-400" />
                  <span>Interrupt</span>
                </button>
              </div>
            )}
          </div>

          {/* Voice Personality Selector */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Live Voice Persona
              </span>
              <span className="text-[10px] text-slate-400">Prebuilt Voice Config</span>
            </div>

            <div className="space-y-2">
              {VOICES.map((v) => (
                <button
                  key={v.id}
                  onClick={() => setSelectedVoice(v.id)}
                  disabled={isConnected}
                  className={`w-full text-left p-3 rounded-xl border text-xs transition-all ${
                    selectedVoice === v.id
                      ? 'bg-amber-500/15 border-amber-500/50 text-amber-200 font-bold'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  } ${isConnected ? 'opacity-60 cursor-not-allowed' : ''}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-200">{v.name}</span>
                    {selectedVoice === v.id && (
                      <span className="w-2 h-2 rounded-full bg-amber-400" />
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">{v.desc}</p>
                </button>
              ))}
            </div>
            {isConnected && (
              <p className="text-[10px] text-slate-400 text-center">
                To switch voices, disconnect the active call first.
              </p>
            )}
          </div>

          {/* Quick Dahod Field Scenarios */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              Quick Officer Prompts
            </span>
            <div className="space-y-2">
              {PRESET_PROMPTS.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectPreset(prompt)}
                  className="w-full text-left p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 hover:border-amber-500/40 hover:bg-slate-800 text-[11px] text-slate-300 transition-all flex items-center justify-between group"
                >
                  <span className="truncate pr-2">{prompt}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-400 shrink-0" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Live Transcript & Direct Input */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col h-[650px] shadow-xl overflow-hidden">
          {/* Transcript Header */}
          <div className="p-4 border-b border-slate-800 bg-slate-950/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-amber-400" />
              <h2 className="text-sm font-bold text-slate-200">Conversation Transcripts & Live Feed</h2>
            </div>
            <span className="text-[11px] text-slate-400">
              {turns.length} interaction{turns.length === 1 ? '' : 's'}
            </span>
          </div>

          {/* Transcript Conversation Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-slate-950/20">
            {turns.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400 space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-amber-400">
                  <Mic className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-200">No voice conversation yet</h3>
                  <p className="text-xs text-slate-400 max-w-sm mt-1">
                    Click <strong>&quot;Start Voice Call&quot;</strong> above to begin a real-time spoken session with the Lion Group Copilot using Gemini 3.8 Live API.
                  </p>
                </div>
              </div>
            ) : (
              turns.map((t) => (
                <div
                  key={t.id}
                  className={`flex flex-col ${
                    t.role === 'user'
                      ? 'items-end'
                      : t.role === 'assistant'
                      ? 'items-start'
                      : 'items-center'
                  }`}
                >
                  {t.role === 'system' ? (
                    <div className="px-3 py-1.5 rounded-full bg-slate-800/80 border border-slate-700 text-[11px] text-slate-400 font-mono my-1">
                      {t.text}
                    </div>
                  ) : (
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-md ${
                        t.role === 'user'
                          ? 'bg-amber-500 text-slate-950 rounded-br-xs font-medium'
                          : 'bg-slate-800 text-slate-100 rounded-bl-xs border border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3 mb-1 text-[10px] opacity-75">
                        <span className="font-bold uppercase tracking-wider">
                          {t.role === 'user' ? 'Recovery Officer' : `Lion AI (${selectedVoice})`}
                        </span>
                        <span>{t.timestamp}</span>
                      </div>
                      <p className="text-xs leading-relaxed whitespace-pre-wrap">{t.text}</p>
                    </div>
                  )}
                </div>
              ))
            )}
            <div ref={turnsEndRef} />
          </div>

          {/* Bottom Text Input (Fallback / Supplement) */}
          <form onSubmit={handleSendTextMessage} className="p-3 border-t border-slate-800 bg-slate-950/80 flex items-center gap-2">
            <input
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder={
                isConnected
                  ? 'Speak into microphone or type a query for the Live Copilot...'
                  : 'Start call above or type a question here...'
              }
              className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-amber-400"
            />
            <button
              type="submit"
              disabled={!isConnected || !textInput.trim()}
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors shadow-sm"
              title="Send to Live Session"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
