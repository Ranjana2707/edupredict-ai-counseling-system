import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  Brain,
  Search,
  User,
  AlertTriangle,
  TrendingDown,
  ChevronDown,
  Info,
  Clock,
  CheckCircle2,
  AlertCircle,
  CornerDownRight,
  RefreshCw,
  Minus,
  Maximize2,
  Minimize2,
  Copy,
  Check,
  BookOpen,
  Award,
  FileSpreadsheet,
  GraduationCap,
  ClipboardCheck,
  Building,
  DollarSign
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { counselorService } from '../../services/counselorService';
import { CounselorStudentDetails } from '../../types';
import { cn, getRiskColorClass } from '../../utils';

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  thinking?: string;
  timestamp: string;
}

export function CounselorFloatingChat() {
  const { user } = useAuth();
  
  // Only show this floating helper for counselors, faculty, and admins
  const isAuthorized = user && ['counselor', 'faculty', 'admin'].includes(user.role);

  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [students, setStudents] = useState<CounselorStudentDetails[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [selectedStudent, setSelectedStudent] = useState<CounselorStudentDetails | null>(null);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);
  
  // Settings
  const [enableThinking, setEnableThinking] = useState(false);
  const [enableSearch, setEnableSearch] = useState(false);
  
  // Chat state
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Load students on authorized mount
  useEffect(() => {
    if (!isAuthorized) return;
    setIsLoadingStudents(true);
    counselorService.getStudents()
      .then((data) => {
        setStudents(data);
      })
      .catch((err) => {
        console.error('Failed to load students in chat assistant', err);
      })
      .finally(() => {
        setIsLoadingStudents(false);
      });
  }, [isAuthorized]);

  // Handle student selection and update greeting
  useEffect(() => {
    if (selectedStudentId) {
      const found = students.find(s => s.id === selectedStudentId);
      if (found) {
        setSelectedStudent(found);
        
        // Setup specialized student-grounded greeting
        const greeting: ChatMessage = {
          id: 'greeting-grounded',
          role: 'model',
          text: `### Grounded Intervention Assistant Active

I've loaded **${found.name}**'s details into my cognitive workspace. 
* **Current Risk Score**: **${found.predictionScore}%** (${found.riskLevel?.toUpperCase()} Risk)
* **CGPA**: **${found.cgpa} / 4.0**
* **Overall Attendance**: **${found.attendance}%**

How can I help you design the optimal intervention or recovery path for ${found?.name ? found.name.split(' ')[0] : 'the student'} today? You can select any of the action chips below to instantly generate customized resources.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages([greeting]);
        return;
      }
    }
    
    setSelectedStudent(null);
    // Generic counseling assistant greeting
    const defaultGreeting: ChatMessage = {
      id: 'greeting-generic',
      role: 'model',
      text: `### AI Counselor Assistant

Welcome to your proactive intervention workspace. I'm here to assist with student risk diagnostics, recovery planning, and outreach assets drafting.

**Select a student** from the dropdown menu above to automatically ground my suggestions in their live academic, attendance, and behavioral profile.

What can I help you investigate or draft today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages([defaultGreeting]);
  }, [selectedStudentId, students]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isSending]);

  if (!isAuthorized) return null;

  // Build grounded system instruction
  const getSystemInstruction = () => {
    if (selectedStudent) {
      const s = selectedStudent;
      return `You are EduPredict AI, an expert educational retention expert and intervention planning strategist.
You are assisting a university counselor.
You have been strictly grounded on the live profile details of:
Name: ${s.name} (ID: ${s.id})
Department: ${s.department}, Semester: ${s.semester}
Academic Standing: CGPA ${s.cgpa} / 4.0
Overall Attendance Rate: ${s.attendance}%
Current ML dropout risk probability: ${s.predictionScore}% (${s.riskLevel.toUpperCase()} RISK)
Prediction Confidence: ${s.predictionConfidence}%
Financial Status: ${s.financialStatus}, Scholarship Info: ${s.scholarshipDetails || 'None'}

Subject Attendance Tracking:
${s.attendanceHistory?.map(h => `- ${h.subject}: ${h.percentage}% (${h.classesAttended}/${h.classesTotal} classes)`).join('\n') || 'No records available'}

Assignments & Deliverables:
${s.assignmentStatus?.map(a => `- ${a.title} (Due: ${a.dueDate}): ${a.status} ${a.grade ? `[Grade: ${a.grade}]` : ''}`).join('\n') || 'No records available'}

Recent Psychological / Counseling Intake:
${s.counselingHistory?.map(h => `- [${h.date}] ${h.type} notes: "${h.notes}" -> Outcome: "${h.outcome}"`).join('\n') || 'No previous sessions logged'}

Faculty Alerts and Remark Log:
${s.facultyRemarks?.map(f => `- [${f.date}] Prof. ${f.facultyName} wrote: "${f.remark}"`).join('\n') || 'No faculty remarks logged'}

LMS/Library Engagement Metrics:
- LMS Platform Activity: ${s.engagementMetrics?.lmsActivityHours || 'N/A'} hours/week
- Library Physical Check-ins: ${s.engagementMetrics?.libraryCheckins || 0} times this month
- Discussion Forum Contributions: ${s.engagementMetrics?.forumContributions || 0} posts

RESPONSE PROTOCOL:
1. Provide extremely specific, practical, actionable, and non-punitive support strategies tailored directly to ${s.name}'s risk factors.
2. Maintain professional, compassionate counselor-to-student and counselor-to-faculty tone.
3. Suggest concrete actions: e.g., tuition installments, tutoring services, assignment extensions, or wellness contracts.
4. When requested, draft counselor templates, parental notification emails, or student outreach messages directly.
5. Highlight how specific drivers (like missing assignments or attendance slips) are impacting their overall predictive index.
6. Format your responses in clean, highly readable Markdown with bold titles, bullets, and clear spacing. Do not write generic advice.`;
    }

    return `You are EduPredict AI, an advanced counselor support system and educational analytics assistant.
You are helping university counselors, faculty, and academic directors.
Your core expertise lies in student dropout risk assessment, proactive counseling, intervention design, and institutional retention best practices.
Format all answers with high-quality, professional counselor terminology, clean Markdown layout, scannable lists, and bullet points.`;
  };

  const handleSendMessage = async (textToSend?: string) => {
    const messageText = textToSend || inputMessage;
    if (!messageText.trim() || isSending) return;

    const userMessageId = `msg-user-${Date.now()}`;
    const userMessage: ChatMessage = {
      id: userMessageId,
      role: 'user',
      text: messageText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    if (!textToSend) setInputMessage('');
    setIsSending(true);

    try {
      const systemInstruction = getSystemInstruction();
      
      const apiHistory = messages.map(m => ({
        role: m.role,
        text: m.text
      }));

      const response = await api.post('/api/ai/chat', {
        message: messageText,
        history: apiHistory,
        systemInstruction,
        enableSearch,
        enableThinking
      }, {
        timeout: 90000 // 90 seconds custom timeout for complex AI generation
      });

      const aiMessage: ChatMessage = {
        id: `msg-ai-${Date.now()}`,
        role: 'model',
        text: response.data.text || 'I failed to generate a response. Please try again.',
        thinking: response.data.thinking,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (err: any) {
      console.error('Chat AI failure:', err);
      const errorMessage: ChatMessage = {
        id: `msg-err-${Date.now()}`,
        role: 'model',
        text: `⚠️ **API Error**: ${err.response?.data?.error || err.message || 'Unable to communicate with the server. Please verify your GEMINI_API_KEY is properly set in the Settings Panel.'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsSending(false);
    }
  };

  const handleCopyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMessageId(id);
    setTimeout(() => {
      setCopiedMessageId(null);
    }, 2000);
  };

  const handleQuickAction = (actionKey: string) => {
    if (!selectedStudent) {
      if (actionKey === 'attendance') {
        handleSendMessage("What are the most effective university policies to reverse class attendance slide in computer science cohorts?");
      } else if (actionKey === 'interventions') {
        handleSendMessage("List three proactive intervention frameworks to support student retention without increasing administrative workload.");
      } else {
        handleSendMessage("Draft an institutional outreach email template for students who have fallen below the 75% attendance criteria.");
      }
      return;
    }

    const s = selectedStudent;
    switch (actionKey) {
      case 'risk_factors':
        handleSendMessage(`Analyze the core predictive risk factors for ${s.name} and explain how we can mitigate her ${s.predictionScore}% dropout probability.`);
        break;
      case 'outreach':
        handleSendMessage(`Draft a highly supportive, non-punitive outreach email to ${s.name} (${s.email}) regarding her overdue assignments and attendance warning. Encourage her to schedule a catch-up session.`);
        break;
      case 'parent':
        handleSendMessage(`Draft a professional and cooperative email to ${s.name}'s guardian, ${s.guardianName}, requesting a physical or online consultation to align academic and financial support plans.`);
        break;
      case 'recovery':
        handleSendMessage(`Generate a comprehensive 4-week Academic & Attendance Recovery Contract for ${s.name} containing actionable biweekly milestones, peer tutoring times, and clear attendance targets.`);
        break;
    }
  };

  const renderFormattedText = (rawText: string) => {
    if (!rawText) return null;

    const lines = rawText.split('\n');
    let insideList = false;
    const elements: React.ReactNode[] = [];

    lines.forEach((line, index) => {
      let currentLine = line.trim();

      if (currentLine.startsWith('### ')) {
        if (insideList) {
          insideList = false;
        }
        elements.push(
          <h4 key={`h3-${index}`} className="font-sans text-xs font-black uppercase text-primary tracking-wider mt-4 mb-2 select-none">
            {parseBoldText(currentLine.replace('### ', ''))}
          </h4>
        );
        return;
      }

      if (currentLine.startsWith('## ') || currentLine.startsWith('# ')) {
        if (insideList) {
          insideList = false;
        }
        const text = currentLine.startsWith('## ') ? currentLine.replace('## ', '') : currentLine.replace('# ', '');
        elements.push(
          <h3 key={`h2-${index}`} className="font-sans text-sm font-black text-on-surface tracking-tight mt-5 mb-2.5 border-b border-outline-variant/30 pb-1.5 select-none">
            {parseBoldText(text)}
          </h3>
        );
        return;
      }

      if (currentLine.startsWith('* ') || currentLine.startsWith('- ')) {
        insideList = true;
        const text = currentLine.replace(/^[\*\-]\s+/, '');
        elements.push(
          <div key={`li-${index}`} className="flex items-start gap-2 text-xs text-on-surface-variant pl-2 my-1 leading-relaxed animate-fade-in">
            <CornerDownRight className="h-3.5 w-3.5 text-primary/60 shrink-0 mt-0.5" />
            <span className="font-medium">{parseBoldText(text)}</span>
          </div>
        );
        return;
      }

      if (currentLine.length > 0) {
        if (insideList) {
          insideList = false;
        }
        elements.push(
          <p key={`p-${index}`} className="text-xs font-medium text-on-surface-variant leading-relaxed my-2">
            {parseBoldText(currentLine)}
          </p>
        );
      } else {
        if (insideList) {
          insideList = false;
        }
      }
    });

    return elements;
  };

  const parseBoldText = (text: string) => {
    const parts = (text || '').split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={i} className="font-bold text-on-surface select-text">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return <span key={i} className="select-text">{part}</span>;
    });
  };

  return (
    <>
      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-40 select-none">
        <motion.button
          id="counselor-floating-chat-btn"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "h-14 w-14 rounded-full flex items-center justify-center shadow-2xl cursor-pointer border relative transition-all duration-300",
            isOpen 
              ? "bg-slate-900 border-slate-800 dark:bg-slate-950 text-white" 
              : "bg-gradient-to-tr from-blue-600 via-indigo-600 to-indigo-500 text-white border-blue-500/20 shadow-blue-500/20 hover:shadow-indigo-500/30"
          )}
        >
          {isOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <>
              <MessageSquare className="h-6 w-6 animate-pulse-slow" />
              <div className="absolute -top-1 -right-1 h-4 w-4 bg-emerald-500 rounded-full border-2 border-surface flex items-center justify-center">
                <Sparkles className="h-2 w-2 text-white animate-pulse" />
              </div>
            </>
          )}
        </motion.button>
      </div>

      {/* Floating Chat Panel with Desktop expanded layout capability */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="counselor-floating-chat-panel"
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ 
              opacity: 1, 
              y: 0, 
              scale: 1,
              width: isExpanded ? '920px' : '420px',
              height: isExpanded ? '680px' : '625px'
            }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ type: 'spring', damping: 24, stiffness: 210 }}
            className="fixed bottom-24 right-6 max-w-[calc(100vw-32px)] max-h-[calc(100vh-120px)] bg-surface-container-lowest border border-outline-variant shadow-2xl rounded-2xl z-50 flex overflow-hidden transition-all duration-200"
          >
            {/* Left Main Pane: Interactive Chat Engine */}
            <div className="flex-1 flex flex-col overflow-hidden h-full">
              {/* Header Area */}
              <div className="p-4 border-b border-outline-variant/50 bg-gradient-to-b from-surface-container-low to-surface-container-lowest/30 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-indigo-500 flex items-center justify-center shadow-md shadow-indigo-500/10 border border-indigo-400/20">
                      <Sparkles className="h-4.5 w-4.5 text-white animate-pulse-slow" />
                    </div>
                    <div>
                      <h3 className="font-sans text-[11px] font-black uppercase text-on-surface tracking-wider leading-none">
                        Intervention Strategist
                      </h3>
                      <p className="font-sans text-[9px] font-extrabold text-outline flex items-center gap-1 uppercase tracking-widest mt-1 leading-none select-none">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Grounded Core Engine
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1.5">
                    {/* Clear Context button */}
                    {selectedStudentId && (
                      <button 
                        onClick={() => { setSelectedStudentId(''); }}
                        className="h-7 px-2 text-[9.5px] font-black uppercase rounded-lg bg-surface hover:bg-surface-container-low text-on-surface-variant hover:text-on-surface cursor-pointer flex items-center gap-1 border border-outline-variant/40 hover:border-outline-variant transition-all"
                        title="Clear selected student context"
                      >
                        Reset
                      </button>
                    )}

                    {/* Desktop View Switcher */}
                    <button 
                      onClick={() => setIsExpanded(!isExpanded)}
                      className="p-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low transition-colors cursor-pointer hidden md:flex border border-transparent hover:border-outline-variant/20"
                      title={isExpanded ? "Collapse Inspector Panel" : "Expand Context Inspector Side-by-Side"}
                    >
                      {isExpanded ? (
                        <Minimize2 className="h-4 w-4" />
                      ) : (
                        <Maximize2 className="h-4 w-4" />
                      )}
                    </button>

                    {/* Minimize Button */}
                    <button 
                      onClick={() => setIsOpen(false)}
                      className="p-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low transition-colors cursor-pointer"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Student Context Grounding Dropdown */}
                <div className="relative">
                  <select
                    value={selectedStudentId}
                    onChange={(e) => setSelectedStudentId(e.target.value)}
                    className="w-full h-10 pl-3.5 pr-10 bg-surface/90 hover:bg-surface text-xs font-bold text-on-surface rounded-xl border border-outline-variant/80 hover:border-outline-variant focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all appearance-none cursor-pointer"
                  >
                    <option value="">🎯 General Counseling (No Student Grounding)</option>
                    {students.map((student) => (
                      <option key={student.id} value={student.id}>
                        🧑‍🎓 {student.name} ({student.id} - Risk: {student.predictionScore}%)
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3.5 top-3 h-4 w-4 text-outline pointer-events-none" />
                </div>
              </div>

              {/* Quick Summary Strip for Selected Student (Rendered inside left pane as well) */}
              {selectedStudent && (
                <div className="px-4 py-2 bg-blue-500/5 dark:bg-blue-500/[0.02] border-b border-outline-variant/40 flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-2">
                    <img
                      src={selectedStudent.avatarUrl}
                      alt={selectedStudent.name}
                      referrerPolicy="no-referrer"
                      className="h-5 w-5 rounded-full object-cover border border-blue-500/20"
                    />
                    <div>
                      <span className="font-bold text-on-surface">{selectedStudent.name}</span>
                      <span className="text-on-surface-variant font-medium ml-1">GPA: {selectedStudent.cgpa} &bull; Attendance: {selectedStudent.attendance}%</span>
                    </div>
                  </div>
                  <span className={cn('text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full border', getRiskColorClass(selectedStudent.riskLevel))}>
                    {selectedStudent.riskLevel}
                  </span>
                </div>
              )}

              {/* Messages Log Container */}
              <div 
                ref={chatContainerRef}
                className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/40 dark:bg-slate-950/20"
              >
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={cn(
                      "flex flex-col max-w-[88%] rounded-2xl p-3.5 text-xs shadow-xs relative group transition-all duration-150",
                      msg.role === 'user'
                        ? "bg-gradient-to-tr from-blue-600 to-indigo-600 text-white rounded-tr-none ml-auto"
                        : "bg-surface-container rounded-tl-none border border-outline-variant/30 text-on-surface pr-10"
                    )}
                  >
                    {/* Copy button displayed on hover of any message (superb desktop utility) */}
                    <button
                      onClick={() => handleCopyMessage(msg.id, msg.text)}
                      className={cn(
                        "absolute top-2.5 right-2.5 p-1.5 rounded-lg bg-surface-container-high hover:bg-surface-container-highest border border-outline-variant/30 text-outline hover:text-on-surface opacity-0 group-hover:opacity-100 transition-all duration-150 cursor-pointer",
                        msg.role === 'user' && "bg-blue-700/50 hover:bg-blue-800 text-white/80 hover:text-white border-white/10"
                      )}
                      title="Copy response to clipboard"
                    >
                      {copiedMessageId === msg.id ? (
                        <Check className="h-3 w-3 text-emerald-500 dark:text-emerald-400" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </button>

                    {/* AI Logo Icon inside message */}
                    {msg.role === 'model' && (
                      <div className="flex items-center gap-1.5 mb-1.5 border-b border-outline-variant/20 pb-1 text-[10px] font-black uppercase text-primary tracking-wider select-none">
                        <Sparkles className="h-3 w-3 animate-pulse" />
                        EduPredict AI Assistant
                      </div>
                    )}

                    {/* Thinking Sub-Block for reasoning models */}
                    {msg.thinking && (
                      <div className="mb-2 bg-surface-container-low p-2 rounded-lg border border-outline-variant/30 text-[10.5px] font-mono text-outline leading-relaxed max-h-32 overflow-y-auto">
                        <div className="font-bold flex items-center gap-1.5 uppercase text-[9px] mb-1 tracking-wider text-on-surface-variant">
                          <Brain className="h-3 w-3 text-primary" /> Thinking Process
                        </div>
                        <p className="whitespace-pre-wrap">{msg.thinking}</p>
                      </div>
                    )}

                    {/* Message Main Body */}
                    <div className="space-y-1.5 break-words select-text">
                      {msg.role === 'user' ? (
                        <p className="leading-relaxed font-semibold select-text whitespace-pre-wrap">{msg.text}</p>
                      ) : (
                        renderFormattedText(msg.text)
                      )}
                    </div>

                    {/* Message Timestamp */}
                    <div className="mt-1.5 text-[9px] text-outline text-right select-none opacity-60">
                      {msg.timestamp}
                    </div>
                  </div>
                ))}

                {/* Typing/Inference Loader */}
                {isSending && (
                  <div className="flex flex-col max-w-[85%] rounded-2xl p-3.5 text-xs bg-surface-container border border-outline-variant/30 text-on-surface rounded-tl-none mr-auto">
                    <div className="flex items-center gap-1.5 mb-1.5 border-b border-outline-variant/20 pb-1 text-[10px] font-black uppercase text-primary tracking-wider">
                      <Sparkles className="h-3 w-3 animate-spin-slow" />
                      Inferencing Gemini...
                    </div>
                    <div className="flex items-center gap-1.5 py-1 text-on-surface-variant font-medium">
                      <div className="flex space-x-1">
                        <div className="h-2 w-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="h-2 w-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="h-2 w-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider ml-1.5 animate-pulse text-outline">
                        {enableThinking ? 'Drafting deep chain plan...' : 'Synthesizing intervention options...'}
                      </span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Action Suggestion Chips Box */}
              <div className="px-4 py-2.5 border-t border-outline-variant/40 bg-surface-container/20 overflow-x-auto whitespace-nowrap flex gap-1.5 select-none scrollbar-none">
                {selectedStudent ? (
                  <>
                    <button
                      onClick={() => handleQuickAction('risk_factors')}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 text-[10px] font-black uppercase tracking-wider bg-surface border border-outline-variant text-primary hover:bg-surface-container-low rounded-lg transition-all shrink-0 cursor-pointer active:scale-95"
                    >
                      💡 Analyze Risk Drivers
                    </button>
                    <button
                      onClick={() => handleQuickAction('recovery')}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 text-[10px] font-black uppercase tracking-wider bg-surface border border-outline-variant text-secondary hover:bg-surface-container-low rounded-lg transition-all shrink-0 cursor-pointer active:scale-95"
                    >
                      📜 Recovery Contract
                    </button>
                    <button
                      onClick={() => handleQuickAction('outreach')}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 text-[10px] font-black uppercase tracking-wider bg-surface border border-outline-variant text-tertiary hover:bg-surface-container-low rounded-lg transition-all shrink-0 cursor-pointer active:scale-95"
                    >
                      ✉️ Student Outreach
                    </button>
                    <button
                      onClick={() => handleQuickAction('parent')}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 text-[10px] font-black uppercase tracking-wider bg-surface border border-outline-variant text-orange-500 hover:bg-surface-container-low rounded-lg transition-all shrink-0 cursor-pointer active:scale-95"
                    >
                      🧑‍🧑‍🧒 Contact Guardian
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => handleQuickAction('attendance')}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 text-[10px] font-black uppercase tracking-wider bg-surface border border-outline-variant text-primary hover:bg-surface-container-low rounded-lg transition-all shrink-0 cursor-pointer active:scale-95"
                    >
                      📉 Attendance Recovery
                    </button>
                    <button
                      onClick={() => handleQuickAction('interventions')}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 text-[10px] font-black uppercase tracking-wider bg-surface border border-outline-variant text-secondary hover:bg-surface-container-low rounded-lg transition-all shrink-0 cursor-pointer active:scale-95"
                    >
                      📂 Proactive Frameworks
                    </button>
                    <button
                      onClick={() => handleQuickAction('cohort_outreach')}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 text-[10px] font-black uppercase tracking-wider bg-surface border border-outline-variant text-tertiary hover:bg-surface-container-low rounded-lg transition-all shrink-0 cursor-pointer active:scale-95"
                    >
                      📝 Cohort Outreach Mail
                    </button>
                  </>
                )}
              </div>

              {/* Input Form & Toggles panel */}
              <div className="p-3 border-t border-outline-variant bg-surface-container/40 space-y-2">
                {/* Pro Settings Bar (Thinking & Search) */}
                <div className="flex items-center justify-between text-[10px] border-b border-outline-variant/30 pb-2 mb-1 px-1">
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-1.5 font-bold uppercase cursor-pointer select-none text-on-surface-variant hover:text-on-surface">
                      <input
                        type="checkbox"
                        checked={enableThinking}
                        onChange={(e) => setEnableThinking(e.target.checked)}
                        className="rounded border-outline-variant text-primary focus:ring-blue-500/20 h-3.5 w-3.5"
                      />
                      <Brain className="h-3 w-3 text-primary animate-pulse-slow" /> Deep reasoning
                    </label>

                    <label className="flex items-center gap-1.5 font-bold uppercase cursor-pointer select-none text-on-surface-variant hover:text-on-surface">
                      <input
                        type="checkbox"
                        checked={enableSearch}
                        onChange={(e) => setEnableSearch(e.target.checked)}
                        className="rounded border-outline-variant text-primary focus:ring-blue-500/20 h-3.5 w-3.5"
                      />
                      <Search className="h-3 w-3 text-cyan-500" /> Google Grounding
                    </label>
                  </div>

                  <div className="text-outline font-black uppercase text-[9px] select-none flex items-center gap-1">
                    <Clock className="h-3 w-3" /> v3.5-flash
                  </div>
                </div>

                {/* Chat Input row */}
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder={selectedStudent?.name ? `Ask anything about ${selectedStudent.name.split(' ')[0]}...` : "Type academic risk or counseling questions..."}
                    className="flex-1 h-11 px-3.5 bg-surface text-xs font-semibold text-on-surface rounded-xl border border-outline-variant focus:outline-none focus:ring-2 focus:ring-blue-500/20 placeholder:text-outline"
                  />
                  <button
                    type="submit"
                    disabled={!inputMessage.trim() || isSending}
                    className="h-11 w-11 shrink-0 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-blue-500/10 cursor-pointer hover:shadow-lg disabled:opacity-40 disabled:pointer-events-none active:scale-[0.96] transition-all"
                  >
                    <Send className="h-4.5 w-4.5" />
                  </button>
                </form>
              </div>
            </div>

            {/* Right Desktop Pane: Context Inspector & Interactive Insights (Active Side-by-Side if isExpanded) */}
            {isExpanded && (
              <div className="w-[440px] border-l border-outline-variant bg-surface-container-lowest flex flex-col overflow-hidden hidden md:flex h-full animate-fade-in">
                {/* Header of Inspector */}
                <div className="p-4 border-b border-outline-variant bg-surface-container-low flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-black uppercase text-on-surface tracking-wider select-none">
                    <Brain className="h-4 w-4 text-primary" /> Live Context Workspace
                  </div>
                  <span className="text-[9px] font-black uppercase bg-primary/10 text-primary px-2 py-0.5 rounded-full border border-primary/20">
                    Desktop Active
                  </span>
                </div>

                {/* Content area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-5">
                  {selectedStudent ? (
                    <>
                      {/* Section 1: Core Performance Badge Indicators */}
                      <div className="grid grid-cols-3 gap-2">
                        <div className="p-2.5 rounded-xl border border-outline-variant bg-surface-container-low text-center">
                          <span className="text-[9px] font-bold uppercase text-outline">Risk Factor</span>
                          <p className="text-base font-black text-on-surface mt-1">{selectedStudent.predictionScore}%</p>
                          <span className={cn('text-[8px] font-black uppercase block mt-0.5', getRiskColorClass(selectedStudent.riskLevel))}>
                            {selectedStudent.riskLevel} Risk
                          </span>
                        </div>
                        <div className="p-2.5 rounded-xl border border-outline-variant bg-surface-container-low text-center">
                          <span className="text-[9px] font-bold uppercase text-outline">Standing GPA</span>
                          <p className="text-base font-black text-on-surface mt-1">{selectedStudent.cgpa}</p>
                          <span className="text-[8px] font-bold text-on-surface-variant block mt-0.5">/ 4.0 Standard</span>
                        </div>
                        <div className="p-2.5 rounded-xl border border-outline-variant bg-surface-container-low text-center">
                          <span className="text-[9px] font-bold uppercase text-outline">Attendance</span>
                          <p className="text-base font-black text-on-surface mt-1">{selectedStudent.attendance}%</p>
                          <span className={cn('text-[8px] font-black block mt-0.5', selectedStudent.attendance < 75 ? 'text-rose-500' : 'text-emerald-500')}>
                            {selectedStudent.attendance < 75 ? 'Below 75%' : 'Passing'}
                          </span>
                        </div>
                      </div>

                      {/* Section 2: Attendance warning markers per subject */}
                      <div className="space-y-2">
                        <h4 className="text-[10px] font-black uppercase tracking-wider text-on-surface-variant flex items-center gap-1 select-none">
                          <TrendingDown className="h-3.5 w-3.5 text-secondary" /> Subject Attendance Breakdown
                        </h4>
                        <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                          {selectedStudent.attendanceHistory?.map((subj, sIdx) => (
                            <div key={sIdx} className="p-2 rounded-lg border border-outline-variant/60 bg-surface flex items-center justify-between text-xs">
                              <div className="flex flex-col">
                                <span className="font-bold text-on-surface truncate max-w-[190px]">{subj.subject}</span>
                                <span className="text-[10px] text-on-surface-variant font-medium">Attended: {subj.classesAttended}/{subj.classesTotal} lectures</span>
                              </div>
                              <span className={cn(
                                "font-black px-2 py-0.5 rounded-md border text-[10px]",
                                subj.percentage < 75 
                                  ? "bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400" 
                                  : "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                              )}>
                                {subj.percentage}%
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Section 3: Pending/Missed Assignments */}
                      <div className="space-y-2">
                        <h4 className="text-[10px] font-black uppercase tracking-wider text-on-surface-variant flex items-center gap-1 select-none">
                          <ClipboardCheck className="h-3.5 w-3.5 text-primary" /> Deliverables & Grading Flags
                        </h4>
                        <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                          {selectedStudent.assignmentStatus?.map((asg, aIdx) => (
                            <div key={aIdx} className="p-2 rounded-lg border border-outline-variant/60 bg-surface flex items-center justify-between text-xs">
                              <div className="flex flex-col">
                                <span className="font-bold text-on-surface truncate max-w-[190px]">{asg.title}</span>
                                <span className="text-[10px] text-on-surface-variant font-medium">Deadline: {asg.dueDate}</span>
                              </div>
                              <span className={cn(
                                "text-[9px] font-black uppercase px-2 py-0.5 rounded-md border",
                                asg.status === 'Missing' || asg.status === 'Overdue'
                                  ? "bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400"
                                  : asg.status === 'Pending'
                                  ? "bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400"
                                  : "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                              )}>
                                {asg.status}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Section 4: LMS Physical Physical Check-ins and Financial status */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-2.5 rounded-xl border border-outline-variant/60 bg-surface">
                          <span className="text-[9.5px] font-bold uppercase text-outline flex items-center gap-1 select-none">
                            <BookOpen className="h-3 w-3 text-cyan-500" /> Physical Engagement
                          </span>
                          <div className="mt-1.5 space-y-1 text-xs">
                            <div className="flex justify-between">
                              <span className="text-on-surface-variant font-medium">LMS Time:</span>
                              <strong className="text-on-surface">{selectedStudent.engagementMetrics?.lmsActivityHours || 'N/A'}h/w</strong>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-on-surface-variant font-medium">Library visits:</span>
                              <strong className="text-on-surface">{selectedStudent.engagementMetrics?.libraryCheckins || 0} visits</strong>
                            </div>
                          </div>
                        </div>

                        <div className="p-2.5 rounded-xl border border-outline-variant/60 bg-surface">
                          <span className="text-[9.5px] font-bold uppercase text-outline flex items-center gap-1 select-none">
                            <Building className="h-3 w-3 text-emerald-500" /> Economic Profile
                          </span>
                          <div className="mt-1.5 space-y-1 text-xs">
                            <div className="flex justify-between">
                              <span className="text-on-surface-variant font-medium">Status:</span>
                              <strong className="text-on-surface font-bold uppercase tracking-wide text-[10px]">{selectedStudent.financialStatus}</strong>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-on-surface-variant font-medium">Scholarship:</span>
                              <strong className="text-on-surface font-bold truncate max-w-[60px] text-[10px]">{selectedStudent.scholarshipDetails || 'No'}</strong>
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Reference hub content when no student is selected */}
                      <div className="space-y-4">
                        <div className="p-3 bg-blue-500/5 dark:bg-blue-500/[0.02] border border-blue-500/10 rounded-xl">
                          <h4 className="text-xs font-black text-on-surface mb-1 uppercase tracking-wide">
                            Grounded System Active
                          </h4>
                          <p className="text-xs font-medium text-on-surface-variant leading-relaxed">
                            No student is selected. EduPredict is in general counselor reference mode. Choose a student from the dropdown menu to feed live grades and attendance records directly to Gemini.
                          </p>
                        </div>

                        {/* Early Warning system guidelines */}
                        <div className="space-y-2">
                          <h4 className="text-[10px] font-black uppercase tracking-wider text-on-surface-variant flex items-center gap-1 select-none">
                            <GraduationCap className="h-3.5 w-3.5 text-primary" /> Retention Model Mapping
                          </h4>
                          <div className="space-y-2 text-xs">
                            <div className="p-2.5 rounded-lg border border-outline-variant bg-surface space-y-1">
                              <div className="flex justify-between items-center">
                                <span className="font-bold text-on-surface">Critical Risk (&ge;85%)</span>
                                <span className="text-[9px] font-black uppercase text-rose-500">Immediate Action</span>
                              </div>
                              <p className="text-[11px] text-on-surface-variant">Requires immediate telephone call, physical counselor invitation, and alert to guardians.</p>
                            </div>

                            <div className="p-2.5 rounded-lg border border-outline-variant bg-surface space-y-1">
                              <div className="flex justify-between items-center">
                                <span className="font-bold text-on-surface">High Risk (70-84%)</span>
                                <span className="text-[9px] font-black uppercase text-orange-500 font-bold">Intervention Plan</span>
                              </div>
                              <p className="text-[11px] text-on-surface-variant">Draft custom recovery contract, assign peer tutor, check attendance logs daily.</p>
                            </div>

                            <div className="p-2.5 rounded-lg border border-outline-variant bg-surface space-y-1">
                              <div className="flex justify-between items-center">
                                <span className="font-bold text-on-surface">Medium Risk (30-69%)</span>
                                <span className="text-[9px] font-black uppercase text-amber-500 font-bold">Monitor & Advise</span>
                              </div>
                              <p className="text-[11px] text-on-surface-variant">Send supportive automated outreach email and schedule 1-on-1 counseling intake session.</p>
                            </div>
                          </div>
                        </div>

                        {/* Institutional Prompts List */}
                        <div className="space-y-2">
                          <h4 className="text-[10px] font-black uppercase tracking-wider text-on-surface-variant flex items-center gap-1 select-none">
                            <Info className="h-3.5 w-3.5 text-secondary" /> Common Outreach Scenarios
                          </h4>
                          <div className="space-y-1.5">
                            <button
                              onClick={() => handleSendMessage("What are the leading sociological causes of sudden class absenteeism among freshman university cohorts?")}
                              className="w-full text-left p-2 rounded-lg border border-outline-variant/60 bg-surface hover:bg-surface-container/30 text-xs font-semibold text-on-surface-variant hover:text-on-surface transition-all flex items-center justify-between group cursor-pointer"
                            >
                              <span>Freshman absenteeism factors</span>
                              <CornerDownRight className="h-3.5 w-3.5 opacity-40 group-hover:opacity-100 transition-opacity" />
                            </button>
                            <button
                              onClick={() => handleSendMessage("Design a framework template for academic probation advising to minimize psychological stress.")}
                              className="w-full text-left p-2 rounded-lg border border-outline-variant/60 bg-surface hover:bg-surface-container/30 text-xs font-semibold text-on-surface-variant hover:text-on-surface transition-all flex items-center justify-between group cursor-pointer"
                            >
                              <span>Advising probation framework</span>
                              <CornerDownRight className="h-3.5 w-3.5 opacity-40 group-hover:opacity-100 transition-opacity" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Footer of Inspector */}
                <div className="p-3 border-t border-outline-variant bg-surface-container/40 text-center">
                  <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider select-none">
                    EduPredict Pro Counselor Console &copy; 2026
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
