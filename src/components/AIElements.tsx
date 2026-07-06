import React from "react";
import { 
  Sparkles, 
  Cpu, 
  Trash2, 
  Send, 
  Sun, 
  Moon, 
  Compass, 
  Zap, 
  Activity,
  ArrowRight,
  Shield
} from "lucide-react";
import { motion } from "motion/react";

interface ThemeProps {
  isDark: boolean;
}

// 1. COMPACT AGENT SELECTOR (Ultra-slim segmented control)
interface AIAgentSelectorProps {
  selectedAgent: "architect" | "designer" | "qa";
  onChange: (agent: "architect" | "designer" | "qa") => void;
  disabled?: boolean;
}

export function AIAgentSelector({ selectedAgent, onChange, disabled }: AIAgentSelectorProps) {
  const agents = [
    { id: "architect" as const, name: "Architect", icon: Cpu },
    { id: "designer" as const, name: "Designer", icon: Sparkles },
    { id: "qa" as const, name: "QA", icon: Shield }
  ];

  return (
    <div className="flex items-center justify-between gap-2 p-1.5 bg-[var(--surface-2)] border border-[var(--border)] rounded-[var(--radius)] select-none w-full shadow-inner">
      <span className="text-[9px] font-bold uppercase tracking-wider text-[var(--text-soft)] pl-1.5">Agent:</span>
      <div className="flex gap-0.5">
        {agents.map((agent) => {
          const IconComponent = agent.icon;
          const isSelected = selectedAgent === agent.id;
          return (
            <button
              key={agent.id}
              type="button"
              disabled={disabled}
              onClick={() => onChange(agent.id)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-[var(--radius)] text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                isSelected
                  ? "bg-[var(--nav-active)] border border-[var(--border)] shadow-sm text-indigo-600 dark:text-indigo-400"
                  : "text-[var(--text-soft)] hover:text-[var(--text)]"
              }`}
            >
              <IconComponent className="w-3 h-3" />
              <span>{agent.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// 2. STATUS BAR (Ultra-slim inline row)
interface AIStatusBarProps extends ThemeProps {
  isGenerating: boolean;
  model: string;
  onReset: () => void;
}

export function AIStatusBar({ isGenerating, model }: AIStatusBarProps) {
  return (
    <div className="flex items-center gap-1.5 text-[9px] text-[var(--text-meta)] font-mono select-none">
      <span className={`inline-block w-1.5 h-1.5 rounded-full ${isGenerating ? "bg-indigo-500 animate-pulse" : "bg-emerald-500"}`}></span>
      <span className="font-bold uppercase">{isGenerating ? "Working" : "Ready"}</span>
      <span>({model})</span>
    </div>
  );
}

// 3. ACTION PILLS (Premium accent details, subtle 4px borders)
interface AIActionPillsProps extends ThemeProps {
  onAction: (prompt: string) => void;
  disabled?: boolean;
}

export function AIActionPills({ onAction, disabled }: AIActionPillsProps) {
  const actions = [
    {
      label: "✨ Polish Design",
      prompt: "Analyze the active code in the editor, and redesign the user interface to look incredibly polished, modern, and beautiful. Use elegant colors, soft glassmorphism card layouts, clean shadows, well-balanced spacing, and premium details. Keep everything fully interactive and functional.",
      color: "bg-indigo-500/10 text-indigo-600 hover:bg-indigo-500/20 border-indigo-500/20"
    },
    {
      label: "⚡ Animations",
      prompt: "Update the active code to add smooth custom hover states, click animations, fluid layout transitions, or interactive hover micro-interactions using Tailwind utility classes.",
      color: "bg-cyan-500/10 text-cyan-600 hover:bg-cyan-500/20 border-cyan-500/20"
    },
    {
      label: "🐞 Auto-Fix Bugs",
      prompt: "Inspect the active code in the editor, find any javascript bugs, syntax errors, layout overflow problems, or broken state variables, and fix them flawlessly.",
      color: "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-emerald-500/20"
    }
  ];

  return (
    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none select-none">
      {actions.map((act, i) => (
        <button
          key={i}
          type="button"
          disabled={disabled}
          onClick={() => onAction(act.prompt)}
          className={`shrink-0 flex items-center gap-1 px-2 py-1 rounded-[4px] border text-[9px] font-semibold uppercase tracking-tight transition-all duration-110 cursor-pointer disabled:opacity-50 ${act.color}`}
        >
          <Sparkles className="w-2.5 h-2.5" />
          <span>{act.label}</span>
        </button>
      ))}
    </div>
  );
}

// 4. CHAT INPUT (Visual depth, precise custom rounding, focus and active states)
interface AIChatInputProps extends ThemeProps {
  value: string;
  onChange: (val: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
}

export function AIChatInput({ value, onChange, onSubmit, disabled }: AIChatInputProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSubmit();
    }
  };

  return (
    <div className="relative flex items-end gap-2 p-2 border border-[var(--border)] rounded-[var(--radius)] transition-all duration-150 bg-gradient-to-b from-[var(--surface-2)] to-[var(--card)] shadow-sm focus-within:shadow-md focus-within:border-indigo-500">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Describe the application you'd like to build..."
        rows={2}
        disabled={disabled}
        className="flex-1 text-[12px] bg-transparent border-0 focus:outline-none focus:ring-0 p-1.5 resize-none leading-normal placeholder:font-normal text-[var(--text)] placeholder:text-[var(--text-meta)] disabled:opacity-50"
      />
      
      <div className="flex flex-col shrink-0 justify-end pb-0.5 pr-0.5">
        <button
          type="button"
          onClick={onSubmit}
          disabled={disabled || !value.trim()}
          className="p-2 bg-indigo-600 hover:bg-indigo-500 active:scale-95 disabled:bg-[var(--surface-1)] disabled:text-[var(--text-meta)] text-white rounded-[var(--radius)] transition-all h-8 w-8 flex items-center justify-center shrink-0 shadow-sm cursor-pointer"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

// 5. SUGGESTION CARDS (Streamlined minimalist tag list)
interface AISuggestionCardsProps extends ThemeProps {
  onSelect: (prompt: string) => void;
}

export function AISuggestionCards({ onSelect }: AISuggestionCardsProps) {
  const suggestions = [
    {
      title: "Pomodoro Timer",
      prompt: "Build an elegant responsive Pomodoro Timer with alarm buzzer sounds, customizable intervals, and clean animations."
    },
    {
      title: "CSS Gradient Maker",
      prompt: "Create a fully interactive CSS Gradient Generator with multiple color stops, linear/radial toggle, random button, and copyable CSS output."
    },
    {
      title: "Canvas Paint App",
      prompt: "Create a fully functional painting/drawing app on HTML5 Canvas. Add color picker, brush sizes, eraser, undo/redo, clear board, and image downloader."
    },
    {
      title: "Currency Converter",
      prompt: "Build a sleek Currency and Unit Converter. Supports weight, distance, temp, and includes currency conversion with dynamic ratios."
    }
  ];

  return (
    <div className="space-y-1.5 p-1 select-none">
      <div className="flex items-center gap-1">
        <Compass className="w-3 h-3 text-[var(--text-soft)]" />
        <span className="text-[9px] font-bold uppercase tracking-wider text-[var(--text-soft)]">
          Suggestions:
        </span>
      </div>
      <div className="flex flex-wrap gap-1">
        {suggestions.map((s, idx) => (
          <button
            key={idx}
            onClick={() => onSelect(s.prompt)}
            className="text-[10px] font-semibold text-indigo-500 hover:text-indigo-600 dark:text-indigo-400 hover:underline px-2.5 py-1 rounded-[var(--radius)] bg-indigo-500/5 hover:bg-indigo-500/10 border border-indigo-500/10 transition cursor-pointer shadow-sm"
          >
            {s.title}
          </button>
        ))}
      </div>
    </div>
  );
}

// 6. THEME SWITCHER (State depth implementation)
interface AIThemeSwitcherProps {
  theme: "dark" | "light";
  onToggle: () => void;
}

export function AIThemeSwitcher({ theme, onToggle }: AIThemeSwitcherProps) {
  const isDark = theme === "dark";
  return (
    <button
      onClick={onToggle}
      title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      className="p-1.5 rounded-[var(--radius)] cursor-pointer btn-lit"
    >
      {isDark ? <Sun className="w-3.5 h-3.5 text-amber-500" /> : <Moon className="w-3.5 h-3.5 text-indigo-600" />}
    </button>
  );
}
