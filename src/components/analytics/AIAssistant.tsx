import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PredictionResult } from '../../types/prediction';
import { predictionService } from '../../services/predictionService';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import { MessageSquare, Send, Sparkles, User, Loader2, ArrowRight } from 'lucide-react';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: Date;
}

interface AIAssistantProps {
  predictionResult: PredictionResult;
}

export function AIAssistant({ predictionResult }: AIAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'msg-init',
      sender: 'ai',
      text: `Hello! I am your **EduPredict AI Assistant**. I have analyzed the ML predictive vector for **${predictionResult.studentName}** (Dropout Probability: **${predictionResult.dropoutProbability}%**, Risk Level: **${(predictionResult.riskLevel || 'low').toUpperCase()}**).\n\nYou can query me about the primary risk drivers, continuous improvement pathways, or wellness interventions.`,
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = async (text: string) => {
    if (!text.trim()) return;

    // Append User Message
    const userMsg: Message = {
      id: `msg-${Date.now()}-user`,
      sender: 'user',
      text,
      timestamp: new Date()
    };
    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    try {
      // Fetch dynamic custom AI explanation
      const aiResponse = await predictionService.askAIAssistant(text, predictionResult);
      
      const aiMsg: Message = {
        id: `msg-${Date.now()}-ai`,
        sender: 'ai',
        text: aiResponse,
        timestamp: new Date()
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      const errorMsg: Message = {
        id: `msg-${Date.now()}-ai-err`,
        sender: 'ai',
        text: 'I apologize, but I encountered an error compiling the mathematical explanatory vector. Please retry shortly.',
        timestamp: new Date()
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const preQueryOptions = [
    { label: 'Why is this student at risk?', query: `Why is ${predictionResult.studentName} high risk?` },
    { label: 'What should the student improve?', query: `What should ${predictionResult.studentName} improve?` },
    { label: 'What intervention is recommended?', query: `What intervention is recommended for ${predictionResult.studentName}?` }
  ];

  return (
    <Card className="border border-outline-variant/60 shadow-xs h-[500px] flex flex-col justify-between">
      {/* Header */}
      <CardHeader className="p-lg pb-3 border-b border-outline-variant/30 bg-surface-container/15 shrink-0">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-indigo-500 animate-pulse" />
          <div>
            <CardTitle className="text-xs font-black uppercase text-on-surface flex items-center gap-1.5">
              Conversational AI Diagnostics
            </CardTitle>
            <CardDescription className="text-xs font-medium text-on-surface-variant">
              Ask deep questions about this student's specific dropout risk drivers.
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      {/* Message Feed */}
      <CardContent className="p-lg flex-1 overflow-y-auto space-y-4 font-sans text-xs min-h-0">
        <AnimatePresence initial={false}>
          {(messages || []).map((m) => {
            const isUser = m.sender === 'user';
            return (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`flex gap-3 max-w-[85%] ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
              >
                {/* Avatar Icon */}
                <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${isUser ? 'bg-primary text-surface-container-lowest' : 'bg-indigo-500/10 text-indigo-500'}`}>
                  {isUser ? <User className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
                </div>

                {/* Bubble message */}
                <div className={`p-3.5 rounded-2xl leading-relaxed whitespace-pre-wrap font-semibold border ${
                  isUser
                    ? 'bg-primary border-primary text-surface-container-lowest rounded-tr-none'
                    : 'bg-surface-container-lowest border-outline-variant/30 text-on-surface rounded-tl-none'
                }`}>
                  {m.text}
                </div>
              </motion.div>
            );
          })}

          {/* Typing Indicator */}
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-3 mr-auto items-center"
            >
              <div className="h-8 w-8 rounded-full bg-indigo-500/10 text-indigo-500 flex items-center justify-center shrink-0 animate-spin">
                <Loader2 className="h-4 w-4" />
              </div>
              <div className="p-3 bg-surface-container-low border border-outline-variant/20 rounded-2xl rounded-tl-none text-outline text-[11px] font-black uppercase tracking-wider animate-pulse">
                Analyzing SHAP feature importance vectors...
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </CardContent>

      {/* Suggested prompts footer */}
      <div className="px-lg pb-3 space-y-1.5 border-t border-outline-variant/10 bg-surface-container/5 pt-3 shrink-0">
        <p className="text-[9px] font-black uppercase text-outline select-none">Quick Queries</p>
        <div className="flex flex-wrap gap-2">
          {preQueryOptions.map((opt, idx) => (
            <button
              key={idx}
              disabled={isTyping}
              onClick={() => handleSend(opt.query)}
              className="text-[10px] font-bold text-on-surface-variant hover:text-primary hover:bg-primary/5 bg-surface-container-low hover:border-primary/30 border border-outline-variant/40 px-3 py-1.5 rounded-full transition cursor-pointer select-none text-left flex items-center gap-1 shrink-0"
            >
              {opt.label} <ArrowRight className="h-3 w-3" />
            </button>
          ))}
        </div>
      </div>

      {/* Input bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend(inputText);
        }}
        className="p-lg border-t border-outline-variant/30 bg-surface-container/15 flex gap-3 items-center shrink-0"
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={`Query student risk vectors e.g. "What is the primary cause?"`}
          className="flex-1 px-4 py-2.5 bg-surface-container-lowest border border-outline-variant/50 rounded-xl font-semibold text-xs focus:outline-hidden focus:border-primary text-on-surface shadow-xs leading-relaxed"
        />
        <button
          type="submit"
          disabled={!inputText.trim() || isTyping}
          className="h-9 w-9 bg-primary hover:bg-primary/95 text-surface-container-lowest rounded-xl flex items-center justify-center transition disabled:opacity-50 cursor-pointer select-none"
        >
          <Send className="h-4.5 w-4.5" />
        </button>
      </form>
    </Card>
  );
}
