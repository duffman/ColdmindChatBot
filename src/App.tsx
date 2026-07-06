import React, { useState, useRef, useEffect, useMemo } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { html as langHtml } from "@codemirror/lang-html";
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
  Info,
  Sun,
  Moon,
  GripVertical,
  Terminal,
  AlertCircle,
  AlertTriangle,
  X,
  Folder,
  Plus,
  Settings,
  Palette,
  Layers,
  Target,
  ChevronRight,
  Cpu,
  Shield
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { 
  AIAgentSelector, 
  AIStatusBar, 
  AIActionPills, 
  AIChatInput, 
  AISuggestionCards, 
  AIThemeSwitcher 
} from "./components/AIElements";
import { Project, ProjectItem, ProjectSettings } from "./types";
import { generateProceduralStarterCode } from "./lib/projectTemplates";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  codeGenerated?: string;
}

interface ConsoleLog {
  id: string;
  type: "log" | "warn" | "error" | "info";
  args: string[];
  timestamp: Date;
}

const INITIAL_PROJECT: Project = {
  name: "Clean Sandbox",
  settings: {
    theme: "light",
    primaryColor: "indigo",
    borderRadius: "subtle",
    layoutStyle: "sidebar"
  },
  items: []
};

export default function App() {
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    const saved = localStorage.getItem("sandbox_theme");
    return (saved === "dark" || saved === "light") ? saved : "light";
  });
  const [chatbotWidth, setChatbotWidth] = useState<number>(() => {
    const saved = localStorage.getItem("sandbox_chatbot_width");
    if (saved) {
      const parsed = parseInt(saved, 10);
      if (!isNaN(parsed)) return parsed;
    }
    return 420;
  });
  const [isResizing, setIsResizing] = useState(false);

  const startResizing = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  };

  const [project, setProject] = useState<Project>(() => {
    const saved = localStorage.getItem("sandbox_project");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_PROJECT;
  });
  const [activeItemTarget, setActiveItemTarget] = useState<string>(() => {
    return localStorage.getItem("sandbox_active_target") || "project-wide";
  });
  const [activeLeftTab, setActiveLeftTab] = useState<"chat" | "project">("chat");
  const [selectedAgent, setSelectedAgent] = useState<"architect" | "designer" | "qa">("architect");

  // State-driven automatic compilation handler
  const applyProceduralCompilation = (updatedProj: Project) => {
    const compiled = generateProceduralStarterCode(updatedProj);
    setGeneratedCode(compiled);
    setEditorCode(compiled);
    setPreviewKey(prev => prev + 1);
  };

  // Inline Add View Form states
  const [showAddViewForm, setShowAddViewForm] = useState(false);
  const [newViewName, setNewViewName] = useState("");
  const [newViewDesc, setNewViewDesc] = useState("");

  const handleAddNewView = () => {
    if (!newViewName.trim()) return;
    const viewId = `view-${newViewName.toLowerCase().replace(/\s+/g, "-")}-${Date.now().toString().slice(-4)}`;
    const newItem: ProjectItem = {
      id: viewId,
      name: newViewName.trim(),
      description: newViewDesc.trim() || "A beautiful customized view module in your workspace."
    };
    const updatedProject = {
      ...project,
      items: [...project.items, newItem]
    };
    
    setProject(updatedProject);
    setActiveItemTarget(viewId); // Focus chat target on the new view!
    setShowAddViewForm(false);
    setNewViewName("");
    setNewViewDesc("");
    
    // Procedurally update the iframe code instantly
    applyProceduralCompilation(updatedProject);
    
    // Smooth transition to chat tab
    setActiveLeftTab("chat");
    
    // Instantly queue the specialist developer agent to build it
    handleSendMessage(`Build the interactive interface and content for our newly added view: "${newItem.name}". Its purpose is defined as: "${newItem.description}". Fully design and integrate its core dashboard charts, table widgets, inputs, and functional JS handlers cleanly within our existing layout.`);
  };

  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem("sandbox_messages");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.map((m: any) => ({
            ...m,
            timestamp: m.timestamp ? new Date(m.timestamp) : m.timestamp
          }));
        }
      } catch (e) {
        console.error(e);
      }
    }
    return [
      {
        id: "welcome",
        role: "assistant",
        content: "Hello! I am your Project-based AI Coding assistant. I have initialized a clean, empty workspace for you. Use the **Project Settings** tab to configure your project, add views, or ask me directly to build your application!",
        timestamp: new Date(),
      }
    ];
  });
  const [input, setInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<"preview" | "code">("preview");
  const [generatedCode, setGeneratedCode] = useState<string>(() => {
    const saved = localStorage.getItem("sandbox_generated_code");
    if (saved) return saved;
    const savedProject = localStorage.getItem("sandbox_project");
    let proj = INITIAL_PROJECT;
    if (savedProject) {
      try {
        proj = JSON.parse(savedProject);
      } catch (e) {}
    }
    return generateProceduralStarterCode(proj);
  });
  const [editorCode, setEditorCode] = useState<string>(() => {
    return localStorage.getItem("sandbox_editor_code") || generatedCode;
  });
  const [copied, setCopied] = useState(false);
  const [previewKey, setPreviewKey] = useState(0);

  // Preview Console log state & refs
  const [consoleLogs, setConsoleLogs] = useState<ConsoleLog[]>([]);
  const [isConsoleOpen, setIsConsoleOpen] = useState(false);
  const consoleEndRef = useRef<HTMLDivElement>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Local Storage Persistence Effects
  useEffect(() => {
    localStorage.setItem("sandbox_project", JSON.stringify(project));
  }, [project]);

  useEffect(() => {
    localStorage.setItem("sandbox_editor_code", editorCode);
  }, [editorCode]);

  useEffect(() => {
    localStorage.setItem("sandbox_generated_code", generatedCode);
  }, [generatedCode]);

  useEffect(() => {
    localStorage.setItem("sandbox_active_target", activeItemTarget);
  }, [activeItemTarget]);

  useEffect(() => {
    localStorage.setItem("sandbox_theme", theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem("sandbox_chatbot_width", chatbotWidth.toString());
  }, [chatbotWidth]);

  useEffect(() => {
    localStorage.setItem("sandbox_messages", JSON.stringify(messages));
  }, [messages]);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMeta = e.metaKey || e.ctrlKey;

      // 1. Cmd+Enter / Ctrl+Enter: Send messages
      if (isMeta && e.key === "Enter") {
        e.preventDefault();
        handleSendMessage();
      }

      // 2. Cmd+S / Ctrl+S: Run changes
      if (isMeta && e.key.toLowerCase() === "s") {
        e.preventDefault();
        handleApplyCodeChanges();
      }

      // 3. Cmd+B / Ctrl+B: Toggle between preview and code tabs
      if (isMeta && e.key.toLowerCase() === "b") {
        e.preventDefault();
        setActiveTab(prev => prev === "preview" ? "code" : "preview");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [input, isGenerating, editorCode, activeTab]);

  // Capture sandbox console messages and synthetic keys from iframe
  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (e.data && e.data.source === "sandbox-console") {
        setConsoleLogs(prev => [
          ...prev,
          {
            id: crypto.randomUUID(),
            type: e.data.type,
            args: e.data.args,
            timestamp: new Date(e.data.timestamp)
          }
        ].slice(-200));
      } else if (e.data && e.data.source === "sandbox-keyboard") {
        const { key, metaKey, ctrlKey } = e.data;
        const isMeta = metaKey || ctrlKey;
        
        if (isMeta && key === "Enter") {
          handleSendMessage();
        } else if (isMeta && key.toLowerCase() === "s") {
          handleApplyCodeChanges();
        } else if (isMeta && key.toLowerCase() === "b") {
          setActiveTab(prev => prev === "preview" ? "code" : "preview");
        }
      }
    };

    window.addEventListener("message", handleMessage);
    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [input, isGenerating, editorCode, activeTab]);

  // Scroll console to bottom when new logs are added
  useEffect(() => {
    if (isConsoleOpen) {
      consoleEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [consoleLogs, isConsoleOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Splitter/Resize Drag Handler
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      const newWidth = Math.max(280, Math.min(750, e.clientX));
      setChatbotWidth(newWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing]);

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
      // Format Project and Target View context to make LLM context-aware
      const activeViewItem = activeItemTarget !== "project-wide" 
        ? project.items.find(i => i.id === activeItemTarget) 
        : null;

      const workspaceMetaContext = `
=== CURRENT WORKSPACE CONTEXT ===
You are working on the project: "${project.name}"
Overarching Design Settings:
- Theme Mode: ${project.settings.theme} (Style in light mode unless settings are dark)
- Accent Palette: ${project.settings.primaryColor}
- Border Rounding Style: ${project.settings.borderRadius} (sharp = 0px, subtle = 4px, md = 8px, lg = 12px)
- Layout Framework: ${project.settings.layoutStyle} (Sidebar navigation left, Top Navbar, or Tabs inside a centered card)

Project Views / Items:
${project.items.map((item, idx) => `${idx + 1}. [View] ID: "${item.id}" | Name: "${item.name}": ${item.description}`).join("\n")}

CHAT TARGET CONTEXT:
${
  activeViewItem 
    ? `You are explicitly targeting the view: "${activeViewItem.name}" (ID: "${activeViewItem.id}"). Focus your edits and implementations specifically on this view, keeping all other views intact but integrated in the master single-file navigation frame.`
    : `You are targeting modifications to the ENTIRE PROJECT. Ensure all views stay integrated, consistent, and cohesive inside the single-file prototype.`
}
=================================
`;

      const processedMessages = updatedMessages.map((m, idx) => {
        if (idx === updatedMessages.length - 1) {
          return {
            role: m.role,
            content: `${workspaceMetaContext}\n\n[USER PROMPT]\n${m.content}`
          };
        }
        return {
          role: m.role,
          content: m.content
        };
      });

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: processedMessages,
          currentCode: editorCode,
          agent: selectedAgent
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
        setActiveTab("preview");
        setPreviewKey(prev => prev + 1);
        
        // If the AI generated code, let's parse if it created any new views implicitly (fallback)
      }
    } catch (err: any) {
      console.error(err);
      setMessages(prev => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: `⚠️ Error: ${err.message || "An error occurred. Make sure your GEMINI_API_KEY is configured."}`,
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
      const compiled = generateProceduralStarterCode(INITIAL_PROJECT);
      setProject(INITIAL_PROJECT);
      setGeneratedCode(compiled);
      setEditorCode(compiled);
      setPreviewKey(prev => prev + 1);
      setActiveItemTarget("project-wide");
      setMessages([
        {
          id: "welcome-reset",
          role: "assistant",
          content: "Sandbox reset to starter welcome dashboard containing your Welcome Feed and Performance Charts. What would you like to build next?",
          timestamp: new Date(),
        }
      ]);
    }
  };

  const toggleTheme = () => {
    setTheme(prev => prev === "dark" ? "light" : "dark");
  };

  const isDark = theme === "dark";

  // Dynamic style mapper using CSS Variables (Rules 2, 3 & 10)
  const themeClasses = {
    bgApp: "bg-[var(--bg)] text-[var(--text)]",
    bgChatbot: "bg-[var(--region-sidebar)] border-[var(--border)]",
    bgChatMessages: "bg-transparent",
    border: "border-[var(--border)]",
    textMuted: "text-[var(--text-soft)]",
    textTitle: "text-[var(--text)] font-semibold",
    chatBubbleUser: "bg-indigo-600 text-white rounded-[var(--radius)] shadow-sm",
    chatBubbleAI: "bg-gradient-to-b from-[var(--surface-2)] to-[var(--card)] border border-[var(--border)] text-[var(--text)] rounded-[var(--radius)] shadow-sm",
    inputBg: "bg-[var(--surface-2)] border-[var(--border)] text-[var(--text)]",
    tabsHeader: "bg-[var(--region-toolbar)] border-[var(--border)] shadow-[var(--toolbar-shadow)]",
    tabsBg: "bg-[var(--surface-1)]/40 border border-[var(--border)] rounded-[var(--radius)] p-0.5",
    tabActive: "bg-[var(--nav-active)] border border-[var(--border)] text-indigo-600 dark:text-indigo-400 rounded-[var(--radius)] shadow-sm font-bold",
    tabInactive: "text-[var(--text-soft)] hover:text-[var(--text)] hover:bg-[var(--surface-2)]/50 rounded-[var(--radius)]",
    codeEditorBg: "bg-transparent",
    codeEditorGutter: "bg-[var(--surface-1)]/40 text-[var(--text-meta)] border-[var(--border)]",
    fakeBrowserToolbar: "bg-[var(--region-toolbar)] border-[var(--border)]",
    fakeBrowserInput: "bg-[var(--surface-2)] text-[var(--text)] border border-[var(--border)] shadow-inner rounded-[var(--radius)]",
  };

  return (
    <div 
      id="app_workspace" 
      className={`flex flex-col md:flex-row h-screen w-screen overflow-hidden font-sans relative transition-colors duration-200 md:p-2 md:gap-2 ${themeClasses.bgApp} ${theme === "dark" ? "dark" : ""}`}
    >
      {/* Resizing mouse lock overlay to protect iframe mouse drops */}
      {isResizing && (
        <div className="absolute inset-0 z-50 cursor-col-resize select-none pointer-events-auto" />
      )}
      
      {/* LEFT COLUMN: Docked Chatbot with dynamic resizable width */}
      <div 
        id="chatbot_column" 
        style={{ width: `${chatbotWidth}px` }}
        className={`shrink-0 border flex flex-col h-[50vh] md:h-full relative transition-colors duration-200 rounded-none md:rounded-[var(--radius)] overflow-hidden shadow-sm ${themeClasses.bgChatbot} ${themeClasses.border}`}
      >
        
        {/* Chatbot Header */}
        <div id="chatbot_header" className={`px-4 py-2.5 border-b flex items-center justify-between shrink-0 ${themeClasses.border} bg-[var(--region-toolbar)] shadow-[var(--toolbar-shadow)] z-10`}>
          <div className="flex items-center gap-1.5 select-none">
            <Cpu className="w-3.5 h-3.5 text-indigo-500" />
            <h2 className={`text-xs font-bold tracking-tight ${themeClasses.textTitle}`}>Project Sandbox</h2>
          </div>
          
          <div className="flex items-center gap-1">
            <button
              onClick={resetSandbox}
              title="Reset Sandbox"
              className="p-1.5 text-[var(--text-soft)] hover:text-rose-500 transition cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
            <AIThemeSwitcher theme={theme} onToggle={toggleTheme} />
          </div>
        </div>

        {/* Workspace Column Mode Tabs */}
        <div className={`px-3 py-1.5 border-b flex gap-1.5 bg-[var(--region-status)] ${themeClasses.border} shrink-0 select-none`}>
          <button
            type="button"
            onClick={() => setActiveLeftTab("chat")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1 text-[10px] font-bold uppercase tracking-wider transition-all duration-110 cursor-pointer ${
              activeLeftTab === "chat"
                ? "bg-[var(--nav-active)] border border-[var(--border)] shadow-[inset_0_2px_0_var(--nav-rail)] text-indigo-600 dark:text-indigo-400 rounded-[var(--radius)] font-bold shadow-sm"
                : "text-[var(--text-soft)] hover:text-[var(--text)] hover:bg-[var(--surface-2)]/60 rounded-[var(--radius)]"
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Chat</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveLeftTab("project")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1 text-[10px] font-bold uppercase tracking-wider transition-all duration-110 cursor-pointer ${
              activeLeftTab === "project"
                ? "bg-[var(--nav-active)] border border-[var(--border)] shadow-[inset_0_2px_0_var(--nav-rail)] text-indigo-600 dark:text-indigo-400 rounded-[var(--radius)] font-bold shadow-sm"
                : "text-[var(--text-soft)] hover:text-[var(--text)] hover:bg-[var(--surface-2)]/60 rounded-[var(--radius)]"
            }`}
          >
            <Folder className="w-3.5 h-3.5" />
            <span>Project Settings</span>
          </button>
        </div>

        {/* TAB 1: AI Chat Area */}
        {activeLeftTab === "chat" && (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* AI System Control Deck (Sticky) */}
            <div id="chatbot_control_deck" className={`p-2.5 border-b shrink-0 bg-[var(--surface-1)] ${themeClasses.border}`}>
              <AIAgentSelector 
                selectedAgent={selectedAgent} 
                onChange={setSelectedAgent} 
                disabled={isGenerating} 
              />
            </div>

            {/* Messages List */}
            <div id="chat_messages_area" className={`flex-1 overflow-y-auto p-4 space-y-3.5 ${themeClasses.bgChatMessages}`}>
              <AnimatePresence initial={false}>
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex flex-col max-w-[85%] ${
                      msg.role === "user" ? "ml-auto items-end" : "mr-auto items-start"
                    }`}
                  >
                    <div 
                      className={`px-3 py-2.5 rounded-[var(--radius)] text-xs leading-relaxed ${
                        msg.role === "user"
                          ? themeClasses.chatBubbleUser
                          : themeClasses.chatBubbleAI
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    </div>
                    {msg.codeGenerated && (
                      <button
                        onClick={() => {
                          setGeneratedCode(msg.codeGenerated || "");
                          setEditorCode(msg.codeGenerated || "");
                          setPreviewKey(prev => prev + 1);
                          setActiveTab("preview");
                        }}
                        className="mt-1 flex items-center gap-1 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-500/5 hover:bg-indigo-500/10 rounded-[4px] border border-indigo-500/15 transition-all cursor-pointer"
                      >
                        <Eye className="w-3 h-3" />
                        Load version in preview
                      </button>
                    )}
                    
                    <span className="text-[8px] text-[var(--text-meta)] mt-0.5 px-1 font-mono select-none">
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </motion.div>
                ))}
              </AnimatePresence>

              {isGenerating && (
                <div className="flex items-center gap-2 max-w-[85%] bg-indigo-500/5 border border-indigo-500/10 p-2 rounded-[var(--radius)] text-[11px] text-indigo-600 dark:text-indigo-400 animate-pulse select-none">
                  <Sparkles className="w-3 h-3 text-indigo-500 animate-spin" />
                  <span>Compiling project...</span>
                </div>
              )}
              
              {/* AI Suggestion Cards */}
              {messages.length === 1 && !isGenerating && (
                <div id="chat_suggestions" className="p-0.5 mt-1">
                  <AISuggestionCards 
                    onSelect={(prompt) => handleSendMessage(prompt)} 
                    isDark={isDark} 
                  />
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input Control Console Form */}
            <div 
              className={`p-3 border-t bg-[var(--region-status)] flex flex-col gap-2 shrink-0 ${themeClasses.border}`}
            >
              {/* Minimal Active Target Badge */}
              <div className="flex items-center justify-between px-1 text-[9px] text-[var(--text-soft)] select-none">
                <span className="flex items-center gap-1 font-semibold">
                  <Target className="w-3 h-3 text-indigo-500" />
                  Focus: <strong className="text-[var(--text)]">{activeItemTarget === "project-wide" ? "🌐 Entire Project" : `🎯 View: ${project.items.find(i => i.id === activeItemTarget)?.name}`}</strong>
                </span>
                {activeItemTarget !== "project-wide" && (
                  <button 
                    onClick={() => setActiveItemTarget("project-wide")} 
                    className="text-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:underline font-bold cursor-pointer transition-colors"
                  >
                    Reset to Project
                  </button>
                )}
              </div>

              {/* AI Action Pills */}
              <AIActionPills 
                onAction={handleSendMessage} 
                disabled={isGenerating} 
                isDark={isDark} 
              />

              {/* AI Chat Input Component */}
              <AIChatInput 
                value={input} 
                onChange={setInput} 
                onSubmit={handleSendMessage} 
                disabled={isGenerating} 
                isDark={isDark} 
              />
            </div>
          </div>
        )}

        {/* TAB 2: Project Blueprint / Explorer */}
        {activeLeftTab === "project" && (
          <div className="flex-1 flex flex-col overflow-y-auto p-5 space-y-5 select-none scrollbar-none">
            {/* Project Overview Card */}
            <div className="p-4 bg-gradient-to-b from-[var(--surface-2)] to-[var(--card)] border border-[var(--border)] rounded-[var(--radius)] shadow-sm space-y-2.5">
              <div className="flex items-center gap-2">
                <Folder className="w-4 h-4 text-indigo-500" />
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-soft)]">Active Project Profile</span>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-semibold text-[var(--text-meta)]">Project Name</label>
                <input
                  type="text"
                  value={project.name}
                  onChange={(e) => {
                    const updated = { ...project, name: e.target.value };
                    setProject(updated);
                    applyProceduralCompilation(updated);
                  }}
                  className="px-3 py-1.5 text-xs bg-[var(--surface-1)] text-[var(--text)] border border-[var(--border)] rounded-[var(--radius)] focus:outline-none focus:border-indigo-500 font-medium shadow-inner"
                  placeholder="Enter project hub name..."
                />
              </div>
            </div>

            {/* Global Design & Theme Tokens */}
            <div className="p-4 bg-gradient-to-b from-[var(--surface-1)] to-[var(--bg)] border border-[var(--border)] rounded-[var(--radius)] shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-b border-[var(--border)] pb-2">
                <Palette className="w-4 h-4 text-indigo-500" />
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-soft)]">Overarching Theme Tokens</span>
              </div>
              
              <div className="grid grid-cols-2 gap-3.5">
                {/* 1. Theme Scheme Mode */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-semibold text-[var(--text-meta)]">Preset Theme</label>
                  <div className="grid grid-cols-2 gap-1 bg-[var(--surface-2)] border border-[var(--border)] rounded-[var(--radius)] p-0.5 shadow-inner">
                    <button
                      type="button"
                      onClick={() => {
                        const updated = { ...project, settings: { ...project.settings, theme: "light" as const } };
                        setProject(updated);
                        applyProceduralCompilation(updated);
                      }}
                      className={`py-1 text-[10px] font-semibold tracking-tight text-center rounded-[var(--radius)] transition cursor-pointer ${
                        project.settings.theme === "light"
                          ? "bg-[var(--nav-active)] border border-[var(--border)] text-indigo-600 dark:text-indigo-400 font-bold shadow-sm"
                          : "text-[var(--text-soft)] hover:text-[var(--text)]"
                      }`}
                    >
                      Light
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const updated = { ...project, settings: { ...project.settings, theme: "dark" as const } };
                        setProject(updated);
                        applyProceduralCompilation(updated);
                      }}
                      className={`py-1 text-[10px] font-semibold tracking-tight text-center rounded-[var(--radius)] transition cursor-pointer ${
                        project.settings.theme === "dark"
                          ? "bg-[var(--nav-active)] border border-[var(--border)] text-indigo-600 dark:text-indigo-400 font-bold shadow-sm"
                          : "text-[var(--text-soft)] hover:text-[var(--text)]"
                      }`}
                    >
                      Dark
                    </button>
                  </div>
                </div>

                {/* 2. Primary Color */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-semibold text-[var(--text-meta)]">Primary Accent</label>
                  <select
                    value={project.settings.primaryColor}
                    onChange={(e) => {
                      const updated = { 
                        ...project, 
                        settings: { ...project.settings, primaryColor: e.target.value as any } 
                      };
                      setProject(updated);
                      applyProceduralCompilation(updated);
                    }}
                    className="px-2 py-1 text-[11px] bg-[var(--surface-2)] text-[var(--text)] border border-[var(--border)] rounded-[var(--radius)] focus:outline-none focus:border-indigo-500 font-semibold shadow-sm cursor-pointer"
                  >
                    <option value="indigo">Indigo Blue</option>
                    <option value="emerald">Emerald Green</option>
                    <option value="amber">Amber Gold</option>
                    <option value="rose">Rose Blush</option>
                    <option value="violet">Violet Grape</option>
                  </select>
                </div>

                {/* 3. Outer Frame Layout */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-semibold text-[var(--text-meta)]">Layout Framework</label>
                  <select
                    value={project.settings.layoutStyle}
                    onChange={(e) => {
                      const updated = { 
                        ...project, 
                        settings: { ...project.settings, layoutStyle: e.target.value as any } 
                      };
                      setProject(updated);
                      applyProceduralCompilation(updated);
                    }}
                    className="px-2 py-1 text-[11px] bg-[var(--surface-2)] text-[var(--text)] border border-[var(--border)] rounded-[var(--radius)] focus:outline-none focus:border-indigo-500 font-semibold shadow-sm cursor-pointer"
                  >
                    <option value="sidebar">Sidebar Shell</option>
                    <option value="navbar">Top Navigation</option>
                    <option value="tabs">Card-based Tabs</option>
                  </select>
                </div>

                {/* 4. Rounded Borders */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-semibold text-[var(--text-meta)]">Tactile Rounding</label>
                  <select
                    value={project.settings.borderRadius}
                    onChange={(e) => {
                      const updated = { 
                        ...project, 
                        settings: { ...project.settings, borderRadius: e.target.value as any } 
                      };
                      setProject(updated);
                      applyProceduralCompilation(updated);
                    }}
                    className="px-2 py-1 text-[11px] bg-[var(--surface-2)] text-[var(--text)] border border-[var(--border)] rounded-[var(--radius)] focus:outline-none focus:border-indigo-500 font-semibold shadow-sm cursor-pointer"
                  >
                    <option value="sharp">Sharp (0px)</option>
                    <option value="subtle">Subtle (4px)</option>
                    <option value="md">Balanced (8px)</option>
                    <option value="lg">Organic (16px)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Project items / views list */}
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-[var(--border)] pb-2 select-none">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-indigo-500" />
                  <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-soft)]">Views & Items ({project.items.length})</span>
                </div>
                <button
                  onClick={() => setShowAddViewForm(prev => !prev)}
                  className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-500/5 hover:bg-indigo-500/10 rounded-[var(--radius)] border border-indigo-500/15 transition duration-100 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 shrink-0" />
                  <span>Add View</span>
                </button>
              </div>

              {/* Add View Inline Form */}
              {showAddViewForm && (
                <div className="p-3.5 bg-indigo-500/[0.02] border border-indigo-500/20 rounded-[var(--radius)] space-y-3 shadow-inner">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">Scaffold New Module</span>
                    <button onClick={() => setShowAddViewForm(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="space-y-2">
                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] font-semibold text-[var(--text-meta)]">Module Title</label>
                      <input
                        type="text"
                        placeholder="e.g. Sales Pipeline, Task Planner"
                        value={newViewName}
                        onChange={(e) => setNewViewName(e.target.value)}
                        className="px-2.5 py-1.5 text-xs bg-[var(--bg)] text-[var(--text)] border border-[var(--border)] rounded-[var(--radius)] focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] font-semibold text-[var(--text-meta)]">Purpose & Intent</label>
                      <textarea
                        placeholder="Describe what elements this view should render..."
                        value={newViewDesc}
                        onChange={(e) => setNewViewDesc(e.target.value)}
                        rows={2}
                        className="px-2.5 py-1.5 text-xs bg-[var(--bg)] text-[var(--text)] border border-[var(--border)] rounded-[var(--radius)] focus:outline-none focus:border-indigo-500 resize-none"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-1.5 pt-1">
                    <button
                      onClick={() => setShowAddViewForm(false)}
                      className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-[10px] font-semibold rounded-[var(--radius)] hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleAddNewView}
                      disabled={!newViewName.trim()}
                      className="px-3.5 py-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-[10px] font-bold uppercase tracking-wider rounded-[var(--radius)] shadow-sm transition active:scale-[0.98]"
                    >
                      Scaffold View
                    </button>
                  </div>
                </div>
              )}

              {/* Items List */}
              <div className="space-y-2">
                {project.items.map((item) => {
                  const isTargeted = activeItemTarget === item.id;
                  return (
                    <div
                      key={item.id}
                      className={`p-3 border rounded-[var(--radius)] flex flex-col gap-2 transition-all duration-110 ${
                        isTargeted
                          ? "bg-gradient-to-b from-[var(--surface-2)] to-[var(--card)] border-indigo-500/40 shadow-sm"
                          : "bg-[var(--surface-1)]/50 border border-[var(--border)] hover:border-[var(--text-meta)]"
                      }`}
                    >
                      <div className="flex justify-between items-start min-w-0">
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className="text-[11px] font-bold text-[var(--text)] truncate">{item.name}</span>
                            {isTargeted && (
                              <span className="px-1.5 py-0.5 bg-indigo-500/10 text-[7px] font-bold text-indigo-500 rounded uppercase font-mono shrink-0">
                                Active Focus
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-[var(--text-meta)] mt-0.5 leading-normal">
                            {item.description}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between pt-1 border-t border-[var(--border)]/40 mt-1">
                        <button
                          type="button"
                          onClick={() => {
                            setActiveItemTarget(item.id);
                            setActiveLeftTab("chat"); // Bounce back to Chat for immediate conversational action!
                          }}
                          className={`flex items-center gap-1 px-2 py-0.5 rounded-[var(--radius)] text-[9px] font-bold uppercase tracking-tight transition cursor-pointer border ${
                            isTargeted
                              ? "bg-indigo-600 border-indigo-600 text-white"
                              : "bg-[var(--surface-1)] border border-[var(--border)] text-[var(--text-soft)] hover:text-indigo-600 dark:hover:text-indigo-400"
                          }`}
                        >
                          <Target className="w-2.5 h-2.5 shrink-0" />
                          <span>{isTargeted ? "Focused in Chat" : "Target view in Chat"}</span>
                        </button>

                        {project.items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              const updatedItems = project.items.filter(i => i.id !== item.id);
                              const updatedProj = { ...project, items: updatedItems };
                              setProject(updatedProj);
                              if (activeItemTarget === item.id) {
                                setActiveItemTarget("project-wide");
                              }
                              applyProceduralCompilation(updatedProj);
                            }}
                            className="p-1 text-rose-500 hover:bg-rose-500/10 rounded-[var(--radius)] transition cursor-pointer"
                            title="Delete view"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MID RESIZE HANDLE BAR: Draggable Resizer (Rule 8) */}
      <div
        onMouseDown={startResizing}
        className={`hidden md:flex w-1 h-full cursor-col-resize select-none items-center justify-center relative group shrink-0 transition-all duration-110 ${
          isResizing 
            ? "bg-indigo-500" 
            : "bg-[var(--border)] hover:bg-indigo-400"
        }`}
      >
        {/* Subtle, floating handle pill */}
        <div className="absolute w-3 h-7 rounded-[var(--radius)] bg-[var(--surface-2)] border border-[var(--border)] flex items-center justify-center text-[var(--text-soft)] shadow-sm pointer-events-none transition-all duration-110 group-hover:scale-105 group-hover:text-[var(--text)]">
          <GripVertical className="w-2.5 h-2.5" />
        </div>
      </div>

      {/* RIGHT COLUMN: Tabbed Interface for Browser Preview & Code Editor */}
      <div 
        id="tabs_column" 
        className={`flex-1 flex flex-col h-[50vh] md:h-full overflow-hidden border rounded-none md:rounded-[var(--radius)] shadow-sm bg-[var(--surface-1)] ${themeClasses.border}`}
      >
        
        {/* Workspace Controls Header */}
        <div 
          id="tabs_header" 
          className={`h-12 px-4 border-b flex items-center justify-between shrink-0 transition-colors duration-200 ${themeClasses.tabsHeader}`}
        >
          
          {/* Custom Tabs */}
          <div className={`flex items-center gap-1 p-0.5 rounded-[var(--radius)] border transition-colors duration-200 ${themeClasses.tabsBg}`}>
            <button
              onClick={() => setActiveTab("preview")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-[var(--radius)] text-xs font-semibold transition-all cursor-pointer ${
                activeTab === "preview"
                  ? themeClasses.tabActive
                  : themeClasses.tabInactive
              }`}
            >
              <Eye className="w-3.5 h-3.5 text-indigo-500" />
              <span>Browser Preview</span>
            </button>
            <button
              onClick={() => setActiveTab("code")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-[var(--radius)] text-xs font-semibold transition-all cursor-pointer ${
                activeTab === "code"
                  ? themeClasses.tabActive
                  : themeClasses.tabInactive
              }`}
            >
              <Code className="w-3.5 h-3.5 text-indigo-500" />
              <span>Code Editor</span>
            </button>
          </div>

          {/* Contextual actions */}
          <div className="flex items-center gap-2">
            {activeTab === "preview" ? (
              <button
                onClick={() => setPreviewKey(p => p + 1)}
                title="Refresh Preview"
                className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-[var(--radius)] cursor-pointer btn-lit"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reload</span>
              </button>
            ) : (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleCopyCode}
                  className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-[var(--radius)] cursor-pointer btn-lit"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                      <span className="text-emerald-600 font-medium">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-[var(--text-soft)]" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
                <button
                  onClick={handleApplyCodeChanges}
                  className="flex items-center gap-1 px-3 py-1 bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] text-xs font-bold text-white rounded-[var(--radius)] transition-all shadow-sm cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Run Changes</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Tab Contents - DIAGONAL-LIT MAIN CONTENT AREA (Rule 4) */}
        <div 
          id="tabs_content_container" 
          className={`flex-1 overflow-hidden relative transition-all duration-200 ${
            isDark ? "main-surface-dark" : "main-surface-light"
          }`}
        >
          
          {/* TAB 1: BROWSER PREVIEW */}
          {activeTab === "preview" && (
            <div className={`w-full h-full flex flex-col overflow-hidden`}>
              
              {/* Fake Browser Toolbar */}
              <div className={`h-9 px-4 border-b flex items-center gap-3 shrink-0 transition-colors duration-200 ${themeClasses.fakeBrowserToolbar}`}>
                <div className="flex items-center gap-1.5 select-none">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80"></span>
                </div>
                <div className={`flex-1 rounded-[var(--radius)] h-6 px-3 flex items-center justify-between text-[10px] font-mono select-none transition-colors duration-200 ${themeClasses.fakeBrowserInput}`}>
                  <span className="truncate">sandbox://localhost/preview.html</span>
                  <div className="flex items-center gap-2.5">
                    {/* Console Toggle inside Fake Browser URL bar */}
                    <button
                      onClick={() => setIsConsoleOpen(prev => !prev)}
                      className={`px-2 py-0.5 rounded-[var(--radius)] flex items-center gap-1.5 cursor-pointer transition-all ${
                        isConsoleOpen
                          ? "bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 font-bold"
                          : "text-[var(--text-soft)] hover:text-[var(--text)]"
                      }`}
                      title="Toggle DevTools Console"
                    >
                      <Terminal className="w-3 h-3" />
                      <span className="text-[9px]">Console</span>
                      {consoleLogs.length > 0 && (
                        <span className={`px-1 rounded-full text-[8px] font-bold ${
                          consoleLogs.some(l => l.type === "error")
                            ? "bg-rose-500 text-white"
                            : "bg-indigo-500 text-white"
                        }`}>
                          {consoleLogs.length}
                        </span>
                      )}
                    </button>
                    <Laptop className="w-3 h-3 opacity-60" />
                  </div>
                </div>
              </div>

              {/* Iframe Preview stage & Console drawer */}
              <div className="flex-1 flex flex-col overflow-hidden relative bg-[var(--bg)] h-full">
                <div className="flex-1 relative">
                  <iframe
                    key={previewKey}
                    title="Browser Preview"
                    srcDoc={injectConsoleBridge(generatedCode)}
                    sandbox="allow-scripts"
                    className="w-full h-full border-none bg-white"
                  />
                </div>

                {/* Embedded Console Drawer */}
                <div className={`border-t transition-all duration-200 flex flex-col font-mono text-xs ${
                  isConsoleOpen ? "h-52" : "h-0"
                } bg-[var(--surface-1)] border-[var(--border)] text-[var(--text)]`}>
                  {/* Drawer Header */}
                  <div className={`h-8 px-4 flex items-center justify-between select-none shrink-0 border-b border-[var(--border)] bg-gradient-to-b from-[var(--surface-2)] to-[var(--surface-1)]`}>
                    <div className="flex items-center gap-2 text-[var(--text-soft)]">
                      <Terminal className="w-3.5 h-3.5" />
                      <span className="font-semibold text-[10px] uppercase tracking-wider">Console Logs</span>
                      {consoleLogs.length > 0 && (
                        <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold ${
                          consoleLogs.some(l => l.type === "error")
                            ? "bg-rose-500/20 text-rose-500"
                            : "bg-indigo-500/20 text-indigo-500"
                        }`}>
                          {consoleLogs.length}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-[var(--text-soft)]">
                      <button
                        onClick={() => setConsoleLogs([])}
                        title="Clear Console"
                        className="p-1 rounded-[var(--radius)] hover:text-[var(--text)] hover:bg-[var(--surface-2)] transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setIsConsoleOpen(false)}
                        title="Close Console"
                        className="p-1 rounded-[var(--radius)] hover:text-[var(--text)] hover:bg-[var(--surface-2)] transition-colors cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Logs Container */}
                  <div className="flex-1 overflow-y-auto p-3 space-y-1.5 select-text selection:bg-indigo-500/30">
                    {consoleLogs.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-[var(--text-soft)] gap-1 opacity-60">
                        <Terminal className="w-6 h-6" />
                        <span className="text-[10px]">No logs captured yet. Trigger console.log inside your script!</span>
                      </div>
                    ) : (
                      consoleLogs.map((log) => {
                        let textClass = "text-[var(--text)]";
                        let bgClass = "";
                        let Icon = null;
                        if (log.type === "error") {
                          textClass = "text-rose-500 font-medium";
                          bgClass = "bg-rose-500/5 px-2 py-0.5 rounded-[var(--radius)] border border-rose-500/10";
                          Icon = AlertTriangle;
                        } else if (log.type === "warn") {
                          textClass = "text-amber-500 font-medium";
                          bgClass = "bg-amber-500/5 px-2 py-0.5 rounded-[var(--radius)] border border-amber-500/10";
                          Icon = AlertCircle;
                        } else if (log.type === "info") {
                          textClass = "text-sky-500 font-semibold";
                        }
                        return (
                          <div key={log.id} className={`flex gap-2 text-[11px] leading-5 font-mono ${bgClass || "px-2"}`}>
                            {Icon && <Icon className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${textClass}`} />}
                            <span className="text-[var(--text-meta)] shrink-0 text-[10px]">
                              {log.timestamp.toLocaleTimeString([], { hour12: false })}
                            </span>
                            <div className={`flex-1 break-all ${textClass}`}>
                              {log.args.join(" ")}
                            </div>
                          </div>
                        );
                      })
                    )}
                    <div ref={consoleEndRef} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CODE EDITOR */}
          {activeTab === "code" && (
            <div className={`w-full h-full flex flex-col overflow-hidden transition-colors duration-200 ${themeClasses.codeEditorBg}`}>
              
              {/* Editor Header Info */}
              <div className={`h-8 px-4 border-b bg-[var(--surface-1)] flex items-center justify-between text-[10px] text-[var(--text-meta)] font-mono select-none ${themeClasses.border}`}>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-indigo-500/60"></span>
                  <span>index.html</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Info className="w-3 h-3 opacity-60" />
                  <span>Sandbox code space. Type freely and click "Run Changes"</span>
                </div>
              </div>

              {/* CodeMirror Editor Container */}
              <div className="flex-1 flex flex-col overflow-hidden text-xs h-full bg-[var(--surface-1)]">
                <CodeMirror
                  value={editorCode}
                  height="100%"
                  extensions={[langHtml()]}
                  onChange={(val) => setEditorCode(val)}
                  theme={isDark ? "dark" : "light"}
                  className="flex-1 h-full outline-none"
                  placeholder="<!-- Write custom HTML, scripts and styles here -->"
                />
              </div>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}

// ==========================================
// IFRAME CONSOLE BRIDGE & SHORTCUT FORWARDER
// ==========================================
function injectConsoleBridge(htmlCode: string): string {
  if (!htmlCode) return "";

  const bridgeScript = `
    <script>
      (function() {
        const _log = console.log;
        const _warn = console.warn;
        const _error = console.error;
        const _info = console.info;

        function sendToParent(type, args) {
          try {
            const serializedArgs = Array.from(args).map(arg => {
              if (arg === null) return "null";
              if (arg === undefined) return "undefined";
              if (arg instanceof Error) {
                return arg.name + ": " + arg.message + (arg.stack ? "\\\n" + arg.stack : "");
              }
              if (typeof arg === "object") {
                try {
                  return JSON.stringify(arg);
                } catch (e) {
                  return String(arg);
                }
              }
              return String(arg);
            });
            window.parent.postMessage({
              source: "sandbox-console",
              type: type,
              args: serializedArgs,
              timestamp: new Date().toISOString()
            }, "*");
          } catch (e) {
            _error("Error in sandbox console bridge:", e);
          }
        }

        console.log = function() {
          _log.apply(console, arguments);
          sendToParent("log", arguments);
        };
        console.warn = function() {
          _warn.apply(console, arguments);
          sendToParent("warn", arguments);
        };
        console.error = function() {
          _error.apply(console, arguments);
          sendToParent("error", arguments);
        };
        console.info = function() {
          _info.apply(console, arguments);
          sendToParent("info", arguments);
        };

        window.onerror = function(message, source, lineno, colno, error) {
          const errStr = error && error.stack ? error.stack : message;
          window.parent.postMessage({
            source: "sandbox-console",
            type: "error",
            args: [errStr + (lineno ? " (Line " + lineno + ":" + colno + ")" : "")],
            timestamp: new Date().toISOString()
          }, "*");
          return false;
        };

        // Forward keyboard events to parent so Cmd+S / Cmd+Enter / Cmd+B work inside the preview iframe!
        window.addEventListener("keydown", function(e) {
          window.parent.postMessage({
            source: "sandbox-keyboard",
            key: e.key,
            metaKey: e.metaKey,
            ctrlKey: e.ctrlKey,
            shiftKey: e.shiftKey,
            altKey: e.altKey
          }, "*");
        });
      })();
    </script>
  `;

  if (htmlCode.includes("<head>")) {
    return htmlCode.replace("<head>", "<head>" + bridgeScript);
  } else if (htmlCode.includes("<html>")) {
    return htmlCode.replace("<html>", "<html>" + bridgeScript);
  } else {
    return bridgeScript + htmlCode;
  }
}

