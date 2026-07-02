import React, { useState, useRef, useEffect } from "react";
import { 
  MessageSquare, 
  Send, 
  Code, 
  Eye, 
  RefreshCw, 
  Sparkles, 
  Trash2, 
  Copy, 
  Check, 
  Play, 
  Laptop,
  ArrowRight,
  Info
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  codeGenerated?: string;
}

const DEFAULT_STARTER_CODE = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome Sandbox</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');
    body { font-family: 'Plus Jakarta Sans', sans-serif; }
  </style>
</head>
<body class="bg-slate-950 text-slate-100 min-h-screen flex flex-col justify-between p-6">
  <div class="max-w-4xl mx-auto w-full flex-1 flex flex-col justify-center space-y-8">
    <div class="space-y-4 text-center">
      <span class="px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-full text-xs font-semibold uppercase tracking-wider">Interactive Playground</span>
      <h1 id="headline" class="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-violet-400 via-indigo-400 to-cyan-400 bg-clip-text text-transparent">Sandbox Welcome Workspace</h1>
      <p class="text-slate-400 max-w-lg mx-auto text-sm md:text-base">Ask the AI on the left to design a custom application, a game, or an interactive widget, and see it run right here in real time!</p>
    </div>
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto w-full">
      <div class="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl flex flex-col justify-between space-y-4">
        <div>
          <h3 class="font-semibold text-slate-200">Interactive Clicker</h3>
          <p class="text-xs text-slate-400 mt-1">Test the interactive sandbox capabilities below.</p>
        </div>
        <div class="flex items-center justify-between">
          <span id="click-count" class="text-2xl font-bold text-indigo-400">0 clicks</span>
          <button onclick="increment()" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 active:scale-95 transition text-white font-medium text-sm rounded-xl">Click Me</button>
        </div>
      </div>
      
      <div class="bg-slate-900/60 border border-slate-800/80 p-5 rounded-2xl flex flex-col justify-between space-y-4">
        <div>
          <h3 class="font-semibold text-slate-200">Theme Selector</h3>
          <p class="text-xs text-slate-400 mt-1">Customize the theme accent color dynamically.</p>
        </div>
        <div class="flex gap-2">
          <button onclick="changeTheme('indigo')" class="w-6 h-6 rounded-full bg-indigo-500 border border-white/20 active:scale-95 transition"></button>
          <button onclick="changeTheme('emerald')" class="w-6 h-6 rounded-full bg-emerald-500 border border-white/20 active:scale-95 transition"></button>
          <button onclick="changeTheme('amber')" class="w-6 h-6 rounded-full bg-amber-500 border border-white/20 active:scale-95 transition"></button>
          <button onclick="changeTheme('rose')" class="w-6 h-6 rounded-full bg-rose-500 border border-white/20 active:scale-95 transition"></button>
        </div>
      </div>
    </div>
  </div>
  
  <div class="text-center text-xs text-slate-600 border-t border-slate-900 pt-4 max-w-xs mx-auto w-full mt-8">
    Sandbox active & running
  </div>

  <script>
    let clicks = 0;
    function increment() {
      clicks++;
      document.getElementById('click-count').innerText = clicks === 1 ? '1 click' : clicks + ' clicks';
    }
    
    function changeTheme(color) {
      const headline = document.getElementById('headline');
      const counter = document.getElementById('click-count');
      
      if (color === 'indigo') {
        headline.className = "text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-violet-400 via-indigo-400 to-cyan-400 bg-clip-text text-transparent";
        counter.className = "text-2xl font-bold text-indigo-400";
      } else if (color === 'emerald') {
        headline.className = "text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent";
        counter.className = "text-2xl font-bold text-emerald-400";
      } else if (color === 'amber') {
        headline.className = "text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-amber-400 via-orange-400 to-yellow-400 bg-clip-text text-transparent";
        counter.className = "text-2xl font-bold text-amber-400";
      } else if (color === 'rose') {
        headline.className = "text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-rose-400 via-pink-400 to-red-400 bg-clip-text text-transparent";
        counter.className = "text-2xl font-bold text-rose-400";
      }
    }
  </script>
</body>
</html>`;

export default function App() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hello! I am your AI Sandbox coding assistant. Tell me what you'd like to build (e.g. 'A beautiful calculator', 'Pomodoro clock', or 'Interactive custom drawing canvas'), and I will design, write, and deploy it to your browser preview instantly!",
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<"preview" | "code">("preview");
  const [generatedCode, setGeneratedCode] = useState(DEFAULT_STARTER_CODE);
  const [editorCode, setEditorCode] = useState(DEFAULT_STARTER_CODE);
  const [copied, setCopied] = useState(false);
  const [previewKey, setPreviewKey] = useState(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const editorLineRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Sync line numbers scrolling with editor textarea
  const handleEditorScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    if (editorLineRef.current) {
      editorLineRef.current.scrollTop = e.currentTarget.scrollTop;
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const prompt = textToSend || input.trim();
    if (!prompt || isGenerating) return;

    if (!textToSend) {
      setInput("");
    }

    const newUserMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: prompt,
      timestamp: new Date(),
    };

    const updatedMessages = [...messages, newUserMessage];
    setMessages(updatedMessages);
    setIsGenerating(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedMessages.map(m => ({
            role: m.role,
            content: m.content
          })),
          currentCode: editorCode
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to communicate with AI server.");
      }

      const data = await response.json();
      
      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: data.text || "I have updated the sandbox code.",
        timestamp: new Date(),
        codeGenerated: data.code || undefined,
      };

      setMessages(prev => [...prev, assistantMessage]);

      if (data.code) {
        setGeneratedCode(data.code);
        setEditorCode(data.code);
        // Automatically switch to browser preview when new code is made
        setActiveTab("preview");
        setPreviewKey(prev => prev + 1);
      }
    } catch (err: any) {
      console.error(err);
      setMessages(prev => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: `⚠️ Error: ${err.message || "An error occurred. Make sure your GEMINI_API_KEY is configured in the Secrets panel."}`,
          timestamp: new Date(),
        }
      ]);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApplyCodeChanges = () => {
    setGeneratedCode(editorCode);
    setPreviewKey(prev => prev + 1);
    setActiveTab("preview");
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(editorCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  const resetSandbox = () => {
    if (confirm("Reset the sandbox playground to the default starter template?")) {
      setGeneratedCode(DEFAULT_STARTER_CODE);
      setEditorCode(DEFAULT_STARTER_CODE);
      setPreviewKey(prev => prev + 1);
      setMessages([
        {
          id: "welcome-reset",
          role: "assistant",
          content: "Sandbox reset to starter welcome dashboard. What would you like to build next?",
          timestamp: new Date(),
        }
      ]);
    }
  };

  const lineCount = editorCode.split("\n").length;

  return (
    <div id="app_workspace" class="flex flex-col md:flex-row h-screen w-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      
      {/* LEFT COLUMN: Docked Chatbot */}
      <div id="chatbot_column" class="w-full md:w-[420px] shrink-0 border-b md:border-b-0 md:border-r border-slate-900 bg-slate-950/80 flex flex-col h-[50vh] md:h-full">
        
        {/* Chatbot Header */}
        <div id="chatbot_header" class="px-5 py-4 border-b border-slate-900 flex items-center justify-between">
          <div class="flex items-center gap-2.5">
            <div class="relative flex items-center justify-center">
              <div class="w-8 h-8 rounded-xl bg-indigo-600/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <MessageSquare className="w-4 h-4" />
              </div>
              <span class="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-slate-950"></span>
            </div>
            <div>
              <h2 class="text-sm font-semibold text-slate-100 tracking-tight">AI Developer</h2>
              <p class="text-[10px] text-slate-400 font-medium">Ready to write code</p>
            </div>
          </div>
          
          <button 
            onClick={resetSandbox} 
            title="Reset Sandbox"
            class="p-2 text-slate-400 hover:text-slate-100 bg-slate-900/60 hover:bg-slate-900 rounded-lg border border-slate-900 transition-all active:scale-95"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {/* Messages List */}
        <div id="chat_messages_area" class="flex-1 overflow-y-auto p-5 space-y-4">
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                class={`flex flex-col max-w-[85%] ${
                  msg.role === "user" ? "ml-auto items-end" : "mr-auto items-start"
                }`}
              >
                <div 
                  class={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-indigo-600 text-white rounded-br-none"
                      : "bg-slate-900/80 border border-slate-800/80 text-slate-300 rounded-bl-none"
                  }`}
                >
                  <p class="whitespace-pre-wrap">{msg.content}</p>
                </div>
                
                {msg.codeGenerated && (
                  <button
                    onClick={() => {
                      setGeneratedCode(msg.codeGenerated || "");
                      setEditorCode(msg.codeGenerated || "");
                      setPreviewKey(prev => prev + 1);
                      setActiveTab("preview");
                    }}
                    class="mt-1.5 flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300 bg-indigo-500/5 hover:bg-indigo-500/10 px-2.5 py-1 rounded-lg border border-indigo-500/10 transition-all"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Load version in preview
                  </button>
                )}
                
                <span class="text-[9px] text-slate-500 mt-1 px-1 font-mono">
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </motion.div>
            ))}
          </AnimatePresence>

          {isGenerating && (
            <div class="flex items-center gap-2.5 max-w-[80%] bg-slate-900/40 border border-slate-900 p-4 rounded-2xl rounded-bl-none text-sm text-slate-400 animate-pulse">
              <Sparkles className="w-4 h-4 text-indigo-400 animate-spin" />
              <span>Architecting, coding & launching sandbox...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggestions Quick Buttons */}
        {messages.length === 1 && !isGenerating && (
          <div id="chat_suggestions" class="px-5 py-2.5 border-t border-slate-900 bg-slate-950/40">
            <p class="text-[10px] uppercase font-bold tracking-wider text-slate-500 mb-2">Try asking for:</p>
            <div class="grid grid-cols-2 gap-2">
              <button 
                onClick={() => handleSendMessage("Build an elegant responsive Pomodoro Timer with alarm buzzer sounds, customizable intervals, and clean animations.")}
                class="text-left px-3 py-2 bg-slate-900/50 hover:bg-slate-900 border border-slate-900 hover:border-slate-800 rounded-xl text-[11px] font-medium text-slate-300 hover:text-slate-100 transition-all flex items-center justify-between"
              >
                <span>Pomodoro Timer</span>
                <ArrowRight className="w-3 h-3 text-slate-500" />
              </button>
              <button 
                onClick={() => handleSendMessage("Create a fully interactive CSS Gradient Generator with multiple color stops, linear/radial toggle, random button, and copyable CSS output.")}
                class="text-left px-3 py-2 bg-slate-900/50 hover:bg-slate-900 border border-slate-900 hover:border-slate-800 rounded-xl text-[11px] font-medium text-slate-300 hover:text-slate-100 transition-all flex items-center justify-between"
              >
                <span>CSS Gradient Maker</span>
                <ArrowRight className="w-3 h-3 text-slate-500" />
              </button>
              <button 
                onClick={() => handleSendMessage("Create a fully functional painting/drawing app on HTML5 Canvas. Add color picker, brush sizes, eraser, undo/redo, clear board, and image downloader.")}
                class="text-left px-3 py-2 bg-slate-900/50 hover:bg-slate-900 border border-slate-900 hover:border-slate-800 rounded-xl text-[11px] font-medium text-slate-300 hover:text-slate-100 transition-all flex items-center justify-between"
              >
                <span>Canvas Paint App</span>
                <ArrowRight className="w-3 h-3 text-slate-500" />
              </button>
              <button 
                onClick={() => handleSendMessage("Build a sleek Currency and Unit Converter. Supports weight, distance, temp, and includes currency conversion with dynamic ratios.")}
                class="text-left px-3 py-2 bg-slate-900/50 hover:bg-slate-900 border border-slate-900 hover:border-slate-800 rounded-xl text-[11px] font-medium text-slate-300 hover:text-slate-100 transition-all flex items-center justify-between"
              >
                <span>Unit Converter</span>
                <ArrowRight className="w-3 h-3 text-slate-500" />
              </button>
            </div>
          </div>
        )}

        {/* Input Form */}
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          class="p-4 border-t border-slate-900 bg-slate-950 flex flex-col gap-2.5"
        >
          {/* Quick AI Assist Pills */}
          <div class="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none select-none">
            <button
              type="button"
              disabled={isGenerating}
              onClick={() => handleSendMessage("Analyze the active code in the editor, and redesign the user interface to look incredibly polished, modern, and beautiful. Use elegant colors, soft glassmorphism card layouts, clean shadows, well-balanced spacing, and premium details. Keep everything fully interactive and functional.")}
              class="shrink-0 flex items-center gap-1 px-2.5 py-1 bg-indigo-500/10 hover:bg-indigo-500/20 active:scale-95 text-[10px] font-bold text-indigo-400 rounded-lg border border-indigo-500/10 transition-all cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-3 h-3" />
              <span>✨ Polish Design</span>
            </button>
            <button
              type="button"
              disabled={isGenerating}
              onClick={() => handleSendMessage("Update the active code to add smooth custom hover states, click animations, fluid layout transitions, or interactive hover micro-interactions using Tailwind utility classes.")}
              class="shrink-0 flex items-center gap-1 px-2.5 py-1 bg-cyan-500/10 hover:bg-cyan-500/20 active:scale-95 text-[10px] font-bold text-cyan-400 rounded-lg border border-cyan-500/10 transition-all cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-3 h-3" />
              <span>⚡ Animations</span>
            </button>
            <button
              type="button"
              disabled={isGenerating}
              onClick={() => handleSendMessage("Inspect the active code in the editor, find any javascript bugs, syntax errors, layout overflow problems, or broken state variables, and fix them flawlessly.")}
              class="shrink-0 flex items-center gap-1 px-2.5 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 active:scale-95 text-[10px] font-bold text-emerald-400 rounded-lg border border-emerald-500/10 transition-all cursor-pointer disabled:opacity-50"
            >
              <Check className="w-3 h-3" />
              <span>🐞 Auto-Fix Bugs</span>
            </button>
          </div>

          <div class="flex gap-2.5 items-end">
            <div class="flex-1 relative">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Ask me to build or edit something..."
                rows={2}
                disabled={isGenerating}
                class="w-full bg-slate-900/80 hover:bg-slate-900 text-sm text-slate-100 placeholder-slate-500 rounded-xl border border-slate-900 hover:border-slate-800 focus:border-indigo-500 focus:outline-none py-3 px-4 transition-all resize-none disabled:opacity-50"
              />
              <div class="absolute bottom-2.5 right-3 text-[9px] text-slate-500 hidden sm:block pointer-events-none">
                Press Enter to send
              </div>
            </div>
            <button
              type="submit"
              disabled={!input.trim() || isGenerating}
              class="p-3 bg-indigo-600 hover:bg-indigo-500 active:scale-95 disabled:bg-slate-900 disabled:text-slate-600 rounded-xl text-white transition-all duration-150 h-[46px] w-[46px] flex items-center justify-center shrink-0 shadow-lg shadow-indigo-600/10"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>

      {/* RIGHT COLUMN: Tabbed Interface for Browser Preview & Code Editor */}
      <div id="tabs_column" class="flex-1 bg-slate-900 flex flex-col h-[50vh] md:h-full overflow-hidden">
        
        {/* Workspace Controls Header */}
        <div id="tabs_header" class="h-14 px-5 border-b border-slate-900 bg-slate-950 flex items-center justify-between shrink-0">
          
          {/* Custom Tabs */}
          <div class="flex items-center gap-1.5 bg-slate-900/60 p-1 rounded-xl border border-slate-900">
            <button
              onClick={() => setActiveTab("preview")}
              class={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "preview"
                  ? "bg-slate-800 text-slate-50 shadow-sm shadow-slate-950"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/30"
              }`}
            >
              <Eye className="w-3.5 h-3.5 text-indigo-400" />
              <span>Browser Preview</span>
            </button>
            <button
              onClick={() => setActiveTab("code")}
              class={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "code"
                  ? "bg-slate-800 text-slate-50 shadow-sm shadow-slate-950"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/30"
              }`}
            >
              <Code className="w-3.5 h-3.5 text-indigo-400" />
              <span>Code Editor</span>
            </button>
          </div>

          {/* Contextual actions */}
          <div class="flex items-center gap-2">
            {activeTab === "preview" ? (
              <button
                onClick={() => setPreviewKey(p => p + 1)}
                title="Refresh Preview"
                class="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-slate-300 rounded-xl border border-slate-800 transition-all"
              >
                <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
                <span>Reload</span>
              </button>
            ) : (
              <div class="flex items-center gap-2">
                <button
                  onClick={handleCopyCode}
                  class="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-slate-300 rounded-xl border border-slate-800 transition-all"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span class="text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-400" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
                <button
                  onClick={handleApplyCodeChanges}
                  class="flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white rounded-xl transition-all shadow-md shadow-indigo-600/5 active:scale-95"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Run Changes</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Tab Contents */}
        <div id="tabs_content_container" class="flex-1 overflow-hidden relative bg-[#090d16]">
          
          {/* TAB 1: BROWSER PREVIEW */}
          {activeTab === "preview" && (
            <div class="w-full h-full flex flex-col overflow-hidden bg-slate-950">
              
              {/* Fake Browser Toolbar */}
              <div class="h-9 px-4 bg-slate-900/50 border-b border-slate-950 flex items-center gap-3 shrink-0">
                <div class="flex items-center gap-1.5">
                  <span class="w-2.5 h-2.5 rounded-full bg-rose-500/80"></span>
                  <span class="w-2.5 h-2.5 rounded-full bg-amber-500/80"></span>
                  <span class="w-2.5 h-2.5 rounded-full bg-emerald-500/80"></span>
                </div>
                <div class="flex-1 bg-slate-950/80 rounded-lg h-6 px-3 flex items-center justify-between text-[10px] text-slate-400 font-mono border border-slate-900 select-none">
                  <span class="truncate">http://localhost:3000/preview.html</span>
                  <Laptop className="w-3 h-3 text-slate-600" />
                </div>
              </div>

              {/* Iframe Preview stage */}
              <div class="flex-1 relative bg-slate-950">
                <iframe
                  key={previewKey}
                  title="Browser Preview"
                  srcDoc={generatedCode}
                  sandbox="allow-scripts"
                  class="w-full h-full border-none bg-slate-950"
                />
              </div>
            </div>
          )}

          {/* TAB 2: CODE EDITOR */}
          {activeTab === "code" && (
            <div class="w-full h-full flex flex-col bg-[#05070f] overflow-hidden">
              
              {/* Editor Header Info */}
              <div class="h-8 px-4 border-b border-slate-900/60 bg-slate-950 flex items-center justify-between text-[10px] text-slate-500 font-mono select-none">
                <div class="flex items-center gap-1.5">
                  <span class="w-2 h-2 rounded-full bg-indigo-500/60"></span>
                  <span>index.html</span>
                </div>
                <div class="flex items-center gap-1.5">
                  <Info className="w-3 h-3 text-slate-600" />
                  <span>Interactive Playground. Edit directly and press "Run Changes"</span>
                </div>
              </div>

              {/* Source Code Container */}
              <div class="flex-1 flex overflow-hidden relative font-mono text-sm leading-6">
                
                {/* Line Numbers column */}
                <div 
                  ref={editorLineRef}
                  class="w-12 select-none text-right pr-3.5 text-slate-600 bg-slate-950/50 border-r border-slate-900/40 py-4 font-mono overflow-hidden text-xs"
                >
                  {Array.from({ length: lineCount }).map((_, i) => (
                    <div key={i} class="h-6 leading-6">
                      {i + 1}
                    </div>
                  ))}
                </div>

                {/* Textarea Code Input */}
                <textarea
                  ref={textareaRef}
                  value={editorCode}
                  onChange={(e) => setEditorCode(e.target.value)}
                  onScroll={handleEditorScroll}
                  spellCheck={false}
                  class="flex-1 bg-transparent text-slate-300 p-4 focus:outline-none resize-none font-mono overflow-y-auto leading-6 py-4 h-full text-xs"
                  placeholder="<!-- Put your custom HTML, scripts and styles here -->"
                />
              </div>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
