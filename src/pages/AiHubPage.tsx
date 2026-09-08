import { useState, useEffect, useRef, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Mic,
  MicOff,
  Search,
  Globe,
  Sparkles,
  MessageSquare,
  Send,
  Bot,
  User,
  Trash2,
  AudioLines,
  Volume2,
  Phone,
  PhoneOff,
  Brain,
  CheckCircle,
  HelpCircle,
  Loader2,
  GraduationCap,
  HeartHandshake,
  DollarSign,
  Compass
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { toast } from 'sonner';

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  thinking?: string;
  timestamp: string;
  searchGrounded?: boolean;
}

interface ChatbotRole {
  id: string;
  name: string;
  icon: any;
  description: string;
  systemInstruction: string;
  bgColor: string;
  textColor: string;
}

const CHATBOT_ROLES: ChatbotRole[] = [
  {
    id: 'counselor',
    name: 'Mental Health Counselor',
    icon: HeartHandshake,
    description: 'Empathetic counselor for academic stress, anxiety, and work-life balance.',
    systemInstruction: 'You are an empathetic, professional university counselor. Your goal is to listen deeply, support students with academic and personal stressors, ask open-ended questions, and offer comforting, constructive, and stress-reducing advice. Keep your tone gentle and supportive.',
    bgColor: 'bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400',
    textColor: 'text-rose-600 dark:text-rose-400'
  },
  {
    id: 'advisor',
    name: 'Academic Mentor',
    icon: GraduationCap,
    description: 'Specialist in class schedules, course recovery, and study planning.',
    systemInstruction: 'You are an expert university academic mentor. Help the student schedule coursework, outline exam recovery plans, suggest specific study techniques (like Pomodoro or active recall), and build clear steps to resolve low grade or attendance risks.',
    bgColor: 'bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400',
    textColor: 'text-blue-600 dark:text-blue-400'
  },
  {
    id: 'financial',
    name: 'Scholarship & Financial Aid',
    icon: DollarSign,
    description: 'Guide for student employment, emergency grants, and tuition planning.',
    systemInstruction: 'You are a supportive financial aid advisor. Guide students through tuition planning, emergency funds, scholarship application strategies, and finding student worker roles on campus. Keep responses encouraging and clear.',
    bgColor: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400',
    textColor: 'text-emerald-600 dark:text-emerald-400'
  },
  {
    id: 'coach',
    name: 'Peer Career Coach',
    icon: Compass,
    description: 'Advises on resumes, portfolios, internships, and interview coaching.',
    systemInstruction: 'You are a peer career coach. Help students build resumes, structure internship search funnels, draft networking templates, and coach them through mock behavioral interview questions. Keep your tone encouraging, practical, and highly actionable.',
    bgColor: 'bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400',
    textColor: 'text-amber-600 dark:text-amber-400'
  }
];

export default function AiHubPage() {
  const { user } = useAuth();
  
  // States
  const [selectedRole, setSelectedRole] = useState<ChatbotRole>(CHATBOT_ROLES[0]);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'model',
      text: `Hello ${user?.name || 'there'}! I am your tailored Gemini assistant. Please select my specialized role from the bento options, and we can begin solving your academic and counseling needs.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  
  // Grounding & Thinking Toggles
  const [enableSearch, setEnableSearch] = useState(false);
  const [enableThinking, setEnableThinking] = useState(false);

  // Audio Transcription States
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Live API (Voice call) States
  const [isLiveActive, setIsLiveActive] = useState(false);
  const [isLiveConnecting, setIsLiveConnecting] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const micProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  
  const inputAudioCtxRef = useRef<AudioContext | null>(null);
  const outputAudioCtxRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef<number>(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isSending]);

  // Cleanup Live API audio context and WS on unmount
  useEffect(() => {
    return () => {
      cleanupLiveSession();
    };
  }, []);

  // Clear Chat History
  const handleClearChat = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        role: 'model',
        text: `Welcome! I am now operating as your **${selectedRole.name}**. How can I support you today?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    toast.success('Chat History Cleared');
  };

  // Change Role Callback
  const handleRoleChange = (role: ChatbotRole) => {
    setSelectedRole(role);
    setMessages([
      {
        id: `role-change-${Date.now()}`,
        role: 'model',
        text: `Switched perspective to **${role.name}**.\n\n*${role.description}* How can I assist you?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    toast.info(`Perspective Switched to ${role.name}`);
  };

  // Submit Text Message
  const handleSendMessage = async (e?: FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || isSending) return;

    const userMsg = inputText.trim();
    setInputText('');
    setIsSending(true);

    const newMsg: Message = {
      id: `msg-${Date.now()}-user`,
      role: 'user',
      text: userMsg,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, newMsg]);

    try {
      // Package payload with chat history up to last 10 messages
      const chatHistory = messages
        .filter((m) => m.id !== 'welcome' && !m.id.startsWith('role-change'))
        .slice(-10)
        .map((m) => ({
          role: m.role,
          text: m.text
        }));

      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: userMsg,
          history: chatHistory,
          systemInstruction: selectedRole.systemInstruction,
          enableSearch,
          enableThinking
        })
      });

      if (!response.ok) {
        throw new Error('Server responded with an error');
      }

      const data = await response.json();

      setMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now()}-model`,
          role: 'model',
          text: data.text,
          thinking: data.thinking || undefined,
          searchGrounded: enableSearch,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch (err: any) {
      console.error(err);
      toast.error('AI Response Failed', {
        description: err.message || 'Could not contact Gemini engine.'
      });
    } finally {
      setIsSending(false);
    }
  };

  // Start Microphone Audio Recording for Transcription
  const startRecording = async () => {
    try {
      audioChunksRef.current = [];
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        
        // Stop all track streams
        stream.getTracks().forEach((track) => track.stop());

        // Convert to base64
        setIsTranscribing(true);
        toast.loading('Transcribing audio with gemini-3.5-flash...', { id: 'transcribe' });

        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          try {
            const resultStr = typeof reader.result === 'string' ? reader.result : '';
            const base64Data = resultStr.includes(',') ? resultStr.split(',')[1] : resultStr;
            
            const response = await fetch('/api/ai/transcribe', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                audio: base64Data,
                mimeType: 'audio/webm'
              })
            });

            if (!response.ok) {
              throw new Error('Transcription api returned error');
            }

            const data = await response.json();
            if (data.text && data.text.trim()) {
              setInputText((prev) => (prev ? prev + ' ' + data.text : data.text));
              toast.success('Audio Transcribed Successfully', { id: 'transcribe' });
            } else {
              toast.warning('No spoken text detected in audio.', { id: 'transcribe' });
            }
          } catch (err: any) {
            console.error(err);
            toast.error('Audio Transcription Failed', { id: 'transcribe', description: err.message });
          } finally {
            setIsTranscribing(false);
          }
        };
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start(250); // Slice chunks every 250ms
      setIsRecording(true);
      toast.info('Microphone active. Speak now...');
    } catch (err: any) {
      console.error(err);
      toast.error('Microphone access denied', { description: err.message });
    }
  };

  // Stop Recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // ----------------------------------------------------
  // GEMINI LIVE API - VOICE REAL-TIME STREAMING BRIDGE
  // ----------------------------------------------------

  const startVoiceCall = async () => {
    if (isLiveActive || isLiveConnecting) return;
    setIsLiveConnecting(true);
    toast.loading('Initializing Gemini Live Connection...', { id: 'live-call' });

    try {
      // 1. Establish Audio Contexts
      inputAudioCtxRef.current = new AudioContext({ sampleRate: 16000 });
      outputAudioCtxRef.current = new AudioContext({ sampleRate: 24000 });
      nextStartTimeRef.current = 0;

      // 2. Request mic access
      const micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStreamRef.current = micStream;

      // 3. Connect WebSocket to backend bridge
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/api/live`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('Voice WebSocket link established');
        setIsLiveConnecting(false);
        setIsLiveActive(true);
        toast.success('Live voice call connected. Speak naturally!', { id: 'live-call' });

        // Begin capturing and streaming mic data
        const source = inputAudioCtxRef.current!.createMediaStreamSource(micStream);
        const processor = inputAudioCtxRef.current!.createScriptProcessor(4096, 1, 1);
        micProcessorRef.current = processor;

        source.connect(processor);
        processor.connect(inputAudioCtxRef.current!.destination);

        processor.onaudioprocess = (e) => {
          if (ws.readyState !== WebSocket.OPEN) return;
          const float32Data = e.inputBuffer.getChannelData(0);
          const base64PCM = pcmToBase64(float32Data);
          ws.send(JSON.stringify({ audio: base64PCM }));
        };
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.error) {
            toast.error('Voice Service Error', { description: msg.error });
            cleanupLiveSession();
            return;
          }
          if (msg.audio) {
            playAudioChunk(msg.audio);
          }
          if (msg.interrupted) {
            console.log('Model speech interrupted by user.');
            // Stop current playbacks and clear schedule
            nextStartTimeRef.current = outputAudioCtxRef.current?.currentTime || 0;
          }
        } catch (e) {
          console.error('Error parsing live WS audio chunk', e);
        }
      };

      ws.onclose = () => {
        console.log('Live WS link closed.');
        cleanupLiveSession();
      };

      ws.onerror = (err) => {
        console.error('Voice call WebSocket error:', err);
        toast.error('Voice Connection Error');
        cleanupLiveSession();
      };

    } catch (err: any) {
      console.error('Voice call setup failed:', err);
      toast.error('Failed to start Voice Call', { id: 'live-call', description: err.message });
      cleanupLiveSession();
    }
  };

  const stopVoiceCall = () => {
    cleanupLiveSession();
    toast.info('Voice conversation ended.');
  };

  const cleanupLiveSession = () => {
    setIsLiveActive(false);
    setIsLiveConnecting(false);

    // Stop and close ws
    if (wsRef.current) {
      if (wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.close();
      }
      wsRef.current = null;
    }

    // Stop mic processor and tracks
    if (micProcessorRef.current) {
      micProcessorRef.current.disconnect();
      micProcessorRef.current = null;
    }
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((track) => track.stop());
      micStreamRef.current = null;
    }

    // Close Audio Contexts
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
  };

  // Convert Float32 PCM to 16-bit Int16 base64
  const pcmToBase64 = (float32Array: Float32Array): string => {
    const buffer = new ArrayBuffer(float32Array.length * 2);
    const view = new DataView(buffer);
    for (let i = 0; i < float32Array.length; i++) {
      const s = Math.max(-1, Math.min(1, float32Array[i]));
      view.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    }
    let binary = '';
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  };

  // Play 24kHz Int16 base64 PCM audio chunk precisely
  const playAudioChunk = (base64PCM: string) => {
    const outputAudioCtx = outputAudioCtxRef.current;
    if (!outputAudioCtx) return;

    const binary = atob(base64PCM);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    const int16Array = new Int16Array(bytes.buffer);
    const float32Array = new Float32Array(int16Array.length);
    for (let i = 0; i < int16Array.length; i++) {
      float32Array[i] = int16Array[i] / 32768.0;
    }

    const audioBuffer = outputAudioCtx.createBuffer(1, float32Array.length, 24000);
    audioBuffer.getChannelData(0).set(float32Array);

    const source = outputAudioCtx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(outputAudioCtx.destination);

    const currentTime = outputAudioCtx.currentTime;
    if (nextStartTimeRef.current < currentTime) {
      nextStartTimeRef.current = currentTime + 0.05; // small scheduling buffer padding
    }
    source.start(nextStartTimeRef.current);
    nextStartTimeRef.current += audioBuffer.duration;
  };

  return (
    <div className="flex flex-col gap-lg lg:grid lg:grid-cols-12 max-w-7xl mx-auto">
      {/* Title Header */}
      <div className="lg:col-span-12 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-md border-b border-outline-variant pb-md">
        <div>
          <h1 className="font-sans text-2xl font-black text-on-surface tracking-tight flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary animate-pulse" />
            Gemini Intelligence Hub
          </h1>
          <p className="font-sans text-xs text-on-surface-variant font-medium mt-0.5">
            Empower your university decisions using high-reasoning Gemini models, custom counseling, and live audio translations.
          </p>
        </div>

        {/* Real-Time Live API voice call button */}
        <div className="flex items-center gap-3">
          <AnimatePresence mode="wait">
            {isLiveActive ? (
              <motion.button
                key="active-voice"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                onClick={stopVoiceCall}
                className="h-10 px-md rounded-lg flex items-center gap-2 bg-rose-600 text-white font-bold font-sans text-xs shadow-md cursor-pointer hover:bg-rose-700 transition-colors"
              >
                <PhoneOff className="h-4 w-4" />
                Disconnect Voice ({selectedRole.name})
              </motion.button>
            ) : (
              <motion.button
                key="start-voice"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                onClick={startVoiceCall}
                disabled={isLiveConnecting}
                className="h-10 px-md rounded-lg flex items-center gap-2 bg-primary text-on-primary font-bold font-sans text-xs shadow-md cursor-pointer hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {isLiveConnecting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Phone className="h-4 w-4" />
                )}
                Connect Live Voice Session
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ----------------- BENTO GRID perspective chooser ----------------- */}
      <div className="lg:col-span-4 space-y-md">
        <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-lg shadow-sm space-y-md">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            <h2 className="font-sans text-sm font-extrabold text-on-surface uppercase tracking-wider">
              Choose AI Perspective
            </h2>
          </div>
          <p className="font-sans text-xs text-on-surface-variant leading-relaxed">
            Switch between specialized roles to tailor Gemini's system instructions and help you solve academic barriers.
          </p>

          <div className="grid grid-cols-1 gap-2">
            {CHATBOT_ROLES.map((role) => {
              const Icon = role.icon;
              const isSelected = selectedRole.id === role.id;
              return (
                <button
                  key={role.id}
                  onClick={() => handleRoleChange(role)}
                  type="button"
                  className={`flex items-start gap-4 p-md rounded-xl text-left border cursor-pointer transition-all duration-300 ${
                    isSelected
                      ? `${role.bgColor} border-2 ring-1 ring-primary`
                      : 'border-outline-variant/60 bg-surface-container-low/40 hover:bg-surface-container-low hover:border-outline-variant'
                  }`}
                >
                  <div className={`p-2 rounded-lg shrink-0 ${isSelected ? 'bg-primary text-on-primary' : 'bg-surface-container-high text-on-surface-variant'}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="font-sans text-xs sm:text-sm font-extrabold text-on-surface block">
                      {role.name}
                    </span>
                    <span className="font-sans text-[11px] text-on-surface-variant leading-snug mt-1 block">
                      {role.description}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ----------------- LIVE VOICE CALL WAVE (When active) ----------------- */}
        {isLiveActive && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-outline-variant bg-slate-950 text-white p-lg shadow-md space-y-md flex flex-col items-center text-center"
          >
            <div className="p-2 bg-rose-600/20 text-rose-500 rounded-full animate-ping h-3 w-3" />
            <div className="space-y-1">
              <h3 className="font-sans text-sm font-bold">Voice Session Live</h3>
              <p className="font-mono text-[10px] text-slate-400">Model: gemini-3.1-flash-live-preview</p>
            </div>

            <div className="flex justify-center items-center gap-1.5 py-4 w-full h-12">
              <div className="h-8 w-1 bg-primary rounded-full animate-bounce delay-100" />
              <div className="h-12 w-1 bg-cyan-400 rounded-full animate-bounce delay-250" />
              <div className="h-6 w-1 bg-primary rounded-full animate-bounce delay-500" />
              <div className="h-10 w-1 bg-rose-400 rounded-full animate-bounce delay-75" />
              <div className="h-4 w-1 bg-emerald-400 rounded-full animate-bounce delay-150" />
              <div className="h-12 w-1 bg-amber-400 rounded-full animate-bounce delay-300" />
              <div className="h-7 w-1 bg-cyan-400 rounded-full animate-bounce delay-200" />
            </div>

            <p className="font-sans text-[11px] text-slate-400 leading-relaxed px-md">
              Ask your counselor about exam pressure, attendance worries, or financial loans. Talk directly into your microphone.
            </p>

            <Button
              variant="outline"
              size="sm"
              onClick={stopVoiceCall}
              className="text-rose-500 border-rose-500/20 hover:bg-rose-500/10 cursor-pointer text-xs"
            >
              <PhoneOff className="h-3.5 w-3.5 mr-2" />
              Disconnect Session
            </Button>
          </motion.div>
        )}

        {/* ----------------- CAPABILITIES & CONTROLS BENTO ----------------- */}
        <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-lg shadow-sm space-y-md">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            <h2 className="font-sans text-sm font-extrabold text-on-surface uppercase tracking-wider">
              Gemini Settings
            </h2>
          </div>

          <div className="space-y-4">
            {/* Search Grounding Control */}
            <div className="flex items-start justify-between gap-md border-b border-outline-variant/40 pb-md">
              <div className="space-y-0.5">
                <span className="font-sans text-xs font-bold text-on-surface flex items-center gap-1.5">
                  <Globe className="h-3.5 w-3.5 text-blue-500" />
                  Google Search Grounding
                </span>
                <span className="font-sans text-[10.5px] text-on-surface-variant block leading-snug">
                  Equips gemini-3.5-flash with the `googleSearch` tool for real-time web search integration.
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={enableSearch}
                  onChange={(e) => setEnableSearch(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-surface-container-high peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-outline-variant after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary" />
              </label>
            </div>

            {/* High Reasoning / Thinking Control */}
            <div className="flex items-start justify-between gap-md">
              <div className="space-y-0.5">
                <span className="font-sans text-xs font-bold text-on-surface flex items-center gap-1.5">
                  <Brain className="h-3.5 w-3.5 text-amber-500 animate-pulse" />
                  Thinking Mode (HIGH)
                </span>
                <span className="font-sans text-[10.5px] text-on-surface-variant block leading-snug">
                  Uses gemini-3.1-pro-preview with thinking level set to HIGH to handle complex university problems.
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={enableThinking}
                  onChange={(e) => setEnableThinking(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-surface-container-high peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-outline-variant after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary" />
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* ----------------- CHAT COMPONENT (8 cols wide) ----------------- */}
      <div className="lg:col-span-8 flex flex-col min-h-[550px] max-h-[680px] rounded-xl border border-outline-variant bg-surface-container-lowest overflow-hidden shadow-sm">
        {/* Chat Header */}
        <div className="flex items-center justify-between border-b border-outline-variant px-lg py-md bg-surface-container-low/45">
          <div className="flex items-center gap-2.5">
            <div className={`p-1.5 rounded-lg ${selectedRole.bgColor}`}>
              {<selectedRole.icon className="h-4.5 w-4.5" />}
            </div>
            <div>
              <span className="font-sans text-xs font-black uppercase tracking-wider text-primary">
                Chat Stream
              </span>
              <span className="font-sans text-[11px] font-bold text-on-surface-variant block">
                Target: {selectedRole.name}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleClearChat}
              type="button"
              className="p-2 rounded-lg text-outline hover:text-rose-500 hover:bg-rose-500/10 cursor-pointer transition-colors"
              title="Clear conversation history"
            >
              <Trash2 className="h-4.5 w-4.5" />
            </button>
          </div>
        </div>

        {/* Chat Scroll Thread */}
        <div className="flex-1 p-lg overflow-y-auto space-y-md bg-surface-container-lowest">
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div key={msg.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'} w-full`}>
                <div className={`flex gap-3 max-w-[85%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                  {/* Avatar Bubble */}
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 border select-none ${
                    isUser
                      ? 'bg-primary/10 border-primary/20 text-primary'
                      : 'bg-outline-variant/10 border-outline-variant/30 text-outline'
                  }`}>
                    {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                  </div>

                  {/* Text Container */}
                  <div className="space-y-1.5">
                    {/* Thinking Process box (If model had thought process) */}
                    {msg.thinking && (
                      <div className="rounded-lg bg-amber-500/5 border border-amber-500/15 p-md space-y-1 select-none">
                        <span className="font-sans text-[10px] font-black uppercase tracking-wider text-amber-600 flex items-center gap-1">
                          <Brain className="h-3 w-3 animate-pulse" />
                          Gemini Thinking Output
                        </span>
                        <p className="font-mono text-[10.5px] text-on-surface-variant/80 whitespace-pre-line leading-relaxed italic">
                          {msg.thinking}
                        </p>
                      </div>
                    )}

                    {/* Final text response */}
                    <div className={`rounded-xl px-lg py-md text-xs sm:text-sm font-sans shadow-xs whitespace-pre-line leading-relaxed ${
                      isUser
                        ? 'bg-primary text-on-primary font-medium'
                        : 'bg-surface-container-low text-on-surface border border-outline-variant/40'
                    }`}>
                      {msg.text}
                    </div>

                    {/* Metadata tags */}
                    <div className={`flex items-center gap-2 px-1 text-[9px] text-on-surface-variant/70 font-semibold ${isUser ? 'justify-end' : 'justify-start'}`}>
                      <span>{msg.timestamp}</span>
                      {msg.searchGrounded && (
                        <span className="bg-blue-500/10 text-blue-600 dark:text-cyan-400 px-1 py-0.5 rounded text-[8px] uppercase tracking-wider font-extrabold flex items-center gap-0.5 select-none border border-blue-500/10">
                          <Globe className="h-2 w-2" /> Search Grounded
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* AI Loader */}
          {isSending && (
            <div className="flex justify-start w-full">
              <div className="flex gap-3 items-center">
                <div className="h-8 w-8 rounded-full flex items-center justify-center border bg-outline-variant/10 border-outline-variant/30 text-outline">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="flex items-center gap-2 bg-surface-container-low border border-outline-variant/40 rounded-xl px-lg py-md">
                  <Loader2 className="h-4.5 w-4.5 animate-spin text-primary" />
                  <span className="font-sans text-xs text-on-surface-variant font-bold uppercase tracking-wider animate-pulse">
                    Gemini reasoning...
                  </span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input form bar */}
        <div className="border-t border-outline-variant p-md bg-surface-container-low/25">
          <form onSubmit={handleSendMessage} className="flex gap-3 items-center">
            {/* Audio Transcription Mic Trigger Button */}
            <AnimatePresence mode="wait">
              {isRecording ? (
                <motion.button
                  key="rec-active"
                  type="button"
                  onClick={stopRecording}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="h-10 w-10 flex items-center justify-center rounded-lg bg-rose-600 text-white cursor-pointer hover:bg-rose-700 shadow-sm"
                  title="Stop recording"
                >
                  <MicOff className="h-4.5 w-4.5 animate-bounce" />
                </motion.button>
              ) : (
                <motion.button
                  key="rec-idle"
                  type="button"
                  onClick={startRecording}
                  disabled={isTranscribing}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="h-10 w-10 flex items-center justify-center rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-on-surface-variant border border-outline-variant/60 cursor-pointer disabled:opacity-50 shadow-xs"
                  title="Transcribe audio with microphone input"
                >
                  {isTranscribing ? (
                    <Loader2 className="h-4.5 w-4.5 animate-spin text-primary" />
                  ) : (
                    <Mic className="h-4.5 w-4.5" />
                  )}
                </motion.button>
              )}
            </AnimatePresence>

            {/* Main input textbox */}
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={isRecording ? 'Listening...' : 'Type a query, ask a counselor, plan schedules...'}
              disabled={isSending || isRecording}
              className="flex-1 h-10 px-lg text-xs sm:text-sm font-sans bg-surface-container-lowest text-on-surface border border-outline-variant/70 rounded-lg focus:outline-hidden focus:border-primary focus:ring-1 focus:ring-primary transition-all disabled:opacity-60"
            />

            {/* Send submit button */}
            <Button
              type="submit"
              disabled={!inputText.trim() || isSending || isRecording}
              className="h-10 px-md shrink-0 rounded-lg flex items-center justify-center"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
          {isRecording && (
            <p className="font-sans text-[10px] text-rose-500 font-bold uppercase tracking-wider text-center mt-2 animate-pulse select-none">
              ● Recording Active: Speak clearly. Tap microphone to transcribe.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
