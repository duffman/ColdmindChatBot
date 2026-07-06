import { Project } from "../types";

export function generateProceduralStarterCode(project: Project): string {
  const { name, settings, items } = project;
  const isDark = settings.theme === "dark";

  if (items.length === 0) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${name}</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="${settings.theme === "dark" ? "bg-slate-950 text-white" : "bg-slate-50 text-slate-900"} min-h-screen">
</body>
</html>`;
  }

  // Accent Colors Mapper
  const accents = {
    indigo: {
      text: "text-indigo-600 dark:text-indigo-400",
      textHover: "hover:text-indigo-700 dark:hover:text-indigo-300",
      bg: "bg-indigo-600 dark:bg-indigo-500",
      bgHover: "hover:bg-indigo-700 dark:hover:bg-indigo-600",
      border: "border-indigo-600 dark:border-indigo-500",
      lightBg: "bg-indigo-500/10",
      accentHex: "#4f46e5",
      gradient: "from-indigo-500 to-violet-600",
    },
    emerald: {
      text: "text-emerald-600 dark:text-emerald-400",
      textHover: "hover:text-emerald-700 dark:hover:text-emerald-300",
      bg: "bg-emerald-600 dark:bg-emerald-500",
      bgHover: "hover:bg-emerald-700 dark:hover:bg-emerald-600",
      border: "border-emerald-600 dark:border-emerald-500",
      lightBg: "bg-emerald-500/10",
      accentHex: "#059669",
      gradient: "from-emerald-500 to-teal-600",
    },
    amber: {
      text: "text-amber-600 dark:text-amber-400",
      textHover: "hover:text-amber-700 dark:hover:text-amber-300",
      bg: "bg-amber-500 dark:bg-amber-400",
      bgHover: "hover:bg-amber-600 dark:hover:bg-amber-500",
      border: "border-amber-500 dark:border-amber-400",
      lightBg: "bg-amber-500/10",
      accentHex: "#d97706",
      gradient: "from-amber-400 to-orange-500",
    },
    rose: {
      text: "text-rose-600 dark:text-rose-400",
      textHover: "hover:text-rose-700 dark:hover:text-rose-300",
      bg: "bg-rose-600 dark:bg-rose-500",
      bgHover: "hover:bg-rose-700 dark:hover:bg-rose-600",
      border: "border-rose-600 dark:border-rose-500",
      lightBg: "bg-rose-500/10",
      accentHex: "#e11d48",
      gradient: "from-rose-500 to-pink-600",
    },
    violet: {
      text: "text-violet-600 dark:text-violet-400",
      textHover: "hover:text-violet-700 dark:hover:text-violet-300",
      bg: "bg-violet-600 dark:bg-violet-500",
      bgHover: "hover:bg-violet-700 dark:hover:bg-violet-600",
      border: "border-violet-600 dark:border-violet-500",
      lightBg: "bg-violet-500/10",
      accentHex: "#7c3aed",
      gradient: "from-violet-500 to-fuchsia-600",
    },
  };

  const c = accents[settings.primaryColor] || accents.indigo;

  // Rounding styles map
  const radius = {
    sharp: "rounded-none",
    subtle: "rounded-[4px]",
    md: "rounded-[8px]",
    lg: "rounded-[16px]",
  };
  const rClass = radius[settings.borderRadius] || radius.subtle;

  // Global styles
  const bgApp = isDark ? "bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-800";
  const bgCard = isDark ? "bg-slate-900/60 border-slate-800/80" : "bg-white border-slate-200/80";
  const textMuted = isDark ? "text-slate-400" : "text-slate-500";
  const borderMuted = isDark ? "border-slate-900" : "border-slate-100";

  // Navigation Items
  const navItemsHTML = items.map((item, index) => {
    return `
      <button 
        onclick="navigateTo('${item.id}')" 
        id="nav-btn-${item.id}"
        class="nav-link flex items-center gap-2.5 px-4 py-2 text-xs font-semibold transition-all duration-110 ${rClass} text-left w-full cursor-pointer select-none"
      >
        <span class="w-1.5 h-1.5 rounded-full bg-slate-400 nav-indicator"></span>
        <span class="truncate">${item.name}</span>
      </button>
    `;
  }).join("\n");

  // Render individual View sections
  const viewsHTML = items.map((item, index) => {
    const isWelcome = item.name.toLowerCase().includes("welcome") || index === 0;
    const isAnalytics = item.name.toLowerCase().includes("analytics") || item.name.toLowerCase().includes("chart") || item.name.toLowerCase().includes("performance");

    let specialContent = "";

    if (isWelcome) {
      specialContent = `
        <!-- Welcome View Active Stats -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="${bgCard} border p-4 ${rClass} shadow-sm">
            <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">System Activity</span>
            <div class="text-2xl font-bold mt-1 num-tabular">2,840</div>
            <p class="text-[10px] ${textMuted} mt-0.5 font-medium">+14.2% from last week</p>
          </div>
          <div class="${bgCard} border p-4 ${rClass} shadow-sm">
            <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Operational Cost</span>
            <div class="text-2xl font-bold mt-1 num-tabular">$142.50</div>
            <p class="text-[10px] ${textMuted} mt-0.5 font-medium">Under monthly quota limit</p>
          </div>
          <div class="${bgCard} border p-4 ${rClass} shadow-sm">
            <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Interactive Test</span>
            <div class="flex items-center justify-between mt-1">
              <span id="welcome-click-count" class="text-xl font-bold ${c.text} num-tabular">0 clicks</span>
              <button onclick="incrementWelcomeCounter()" class="px-2.5 py-1 ${c.bg} ${c.bgHover} text-white text-[10px] font-bold uppercase tracking-wider ${rClass} shadow-sm transition-all active:scale-[0.98]">
                Click
              </button>
            </div>
          </div>
        </div>

        <div class="${bgCard} border p-5 ${rClass} space-y-3 shadow-sm">
          <h3 class="text-sm font-semibold">Workspace Quick actions</h3>
          <p class="text-xs ${textMuted}">Quickly trigger playground system events to verify JS logic execution.</p>
          <div class="flex flex-wrap gap-2 pt-1">
            <button onclick="triggerAlert('System Health Checks passed successfully.')" class="px-3.5 py-1.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-semibold ${rClass} transition">
              Verify Health
            </button>
            <button onclick="logToConsole('Sandbox Diagnostic triggered: Memory safe at 4.2 MB.')" class="px-3.5 py-1.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-semibold ${rClass} transition">
              Emit Console Log
            </button>
          </div>
        </div>
      `;
    } else if (isAnalytics) {
      specialContent = `
        <!-- Analytics View -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="${bgCard} border p-5 ${rClass} shadow-sm flex flex-col justify-between">
            <div>
              <h3 class="text-sm font-semibold">Interactive Trend Analysis</h3>
              <p class="text-xs ${textMuted} mt-0.5">Real-time vector graphs constructed dynamically inside the sandbox viewport.</p>
            </div>
            
            <!-- Beautiful inline SVG Chart -->
            <div class="py-4">
              <svg class="w-full h-32" viewBox="0 0 400 120" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="chart-gradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="${c.accentHex}" stop-opacity="0.3"/>
                    <stop offset="100%" stop-color="${c.accentHex}" stop-opacity="0.0"/>
                  </linearGradient>
                </defs>
                <!-- Grid Lines -->
                <line x1="0" y1="20" x2="400" y2="20" stroke="currentColor" stroke-opacity="0.08" stroke-dasharray="2,2" class="text-slate-400" />
                <line x1="0" y1="60" x2="400" y2="60" stroke="currentColor" stroke-opacity="0.08" stroke-dasharray="2,2" class="text-slate-400" />
                <line x1="0" y1="100" x2="400" y2="100" stroke="currentColor" stroke-opacity="0.08" stroke-dasharray="2,2" class="text-slate-400" />
                
                <!-- Area Path -->
                <path d="M 0,110 L 40,85 L 80,95 L 120,50 L 160,75 L 200,40 L 240,65 L 280,30 L 320,45 L 360,15 L 400,20 L 400,120 L 0,120 Z" fill="url(#chart-gradient)" />
                
                <!-- Line Path -->
                <path d="M 0,110 L 40,85 L 80,95 L 120,50 L 160,75 L 200,40 L 240,65 L 280,30 L 320,45 L 360,15 L 400,20" fill="none" stroke="${c.accentHex}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </div>
            
            <div class="flex items-center justify-between border-t ${borderMuted} pt-3">
              <span class="text-[10px] ${textMuted} font-mono">Real-time SVG Renderer</span>
              <button onclick="regenerateMockTrends()" class="text-xs font-semibold ${c.text} hover:opacity-85">
                Refresh Trend Data
              </button>
            </div>
          </div>

          <div class="${bgCard} border p-5 ${rClass} shadow-sm flex flex-col justify-between">
            <div>
              <h3 class="text-sm font-semibold">User Conversion Pipeline</h3>
              <p class="text-xs ${textMuted} mt-0.5">Sleek funnel breakdown with interactive state multipliers.</p>
            </div>
            
            <div class="space-y-2.5 my-3">
              <div>
                <div class="flex justify-between text-[10px] font-semibold mb-1">
                  <span>Inbound Traffic</span>
                  <span class="num-tabular">94,203 visitors</span>
                </div>
                <div class="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div class="${c.bg} h-full" style="width: 85%;"></div>
                </div>
              </div>
              <div>
                <div class="flex justify-between text-[10px] font-semibold mb-1">
                  <span>Signups Generated</span>
                  <span class="num-tabular">42,504 users</span>
                </div>
                <div class="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div class="${c.bg} h-full" style="width: 48%;"></div>
                </div>
              </div>
              <div>
                <div class="flex justify-between text-[10px] font-semibold mb-1">
                  <span>Active Subscribers</span>
                  <span class="num-tabular">12,402 accounts</span>
                </div>
                <div class="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div class="${c.bg} h-full" style="width: 22%;"></div>
                </div>
              </div>
            </div>
            
            <div class="text-[10px] ${textMuted} leading-tight">
              Funnel updates automatically based on background thread processes.
            </div>
          </div>
        </div>
      `;
    } else {
      // Standard dynamic placeholder view
      specialContent = `
        <div class="${bgCard} border p-6 ${rClass} space-y-4 shadow-sm text-center">
          <div class="w-12 h-12 ${c.lightBg} ${c.text} rounded-full flex items-center justify-center mx-auto">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
            </svg>
          </div>
          <div class="space-y-1">
            <h3 class="text-sm font-semibold">Specialized Prototype Module Ready</h3>
            <p class="text-xs ${textMuted} max-w-sm mx-auto">This item is targeted. Ask the AI agent in the chat to fill this module with custom dashboard components, interactive checklists, or custom APIs!</p>
          </div>
          
          <!-- Live Sandbox Element Builder test -->
          <div class="max-w-xs mx-auto pt-2">
            <div class="flex gap-2">
              <input type="text" id="input-${item.id}" placeholder="Enter a task name..." class="flex-1 px-3 py-1.5 text-xs bg-slate-100 dark:bg-slate-900 border ${borderMuted} ${rClass} focus:outline-none focus:border-indigo-500">
              <button onclick="addCustomTask('${item.id}')" class="px-3 py-1.5 ${c.bg} hover:opacity-90 text-white text-xs font-semibold ${rClass}">Add</button>
            </div>
            <ul id="list-${item.id}" class="text-left mt-3 text-xs space-y-1 text-slate-500 dark:text-slate-400">
              <li class="flex items-center gap-1.5"><span class="w-1 h-1 rounded-full bg-slate-400"></span>Starter Task A</li>
            </ul>
          </div>
        </div>
      `;
    }

    return `
      <div id="view-${item.id}" class="view-content hidden space-y-5 animate-fade-in">
        <div class="space-y-1 select-none">
          <h2 class="text-xl font-bold tracking-tight">${item.name}</h2>
          <p class="text-xs ${textMuted}">${item.description}</p>
        </div>
        
        ${specialContent}
      </div>
    `;
  }).join("\n");

  // Determine standard layout structure
  let mainLayoutHTML = "";

  if (settings.layoutStyle === "sidebar") {
    mainLayoutHTML = `
      <div class="min-h-screen flex flex-col md:flex-row">
        <!-- Sidebar Column -->
        <aside class="w-full md:w-64 border-b md:border-b-0 md:border-r ${borderMuted} ${isDark ? "bg-slate-900/40" : "bg-slate-100/60"} shrink-0 p-5 flex flex-col justify-between">
          <div class="space-y-6">
            <!-- App Branding -->
            <div class="flex items-center gap-2 select-none">
              <div class="w-6 h-6 rounded-[4px] bg-gradient-to-tr ${c.gradient} flex items-center justify-center text-white text-xs font-bold">
                P
              </div>
              <div>
                <h1 class="text-xs font-bold tracking-tight">${name}</h1>
                <p class="text-[9px] ${textMuted} font-mono uppercase tracking-wider">Multi-View App</p>
              </div>
            </div>
            
            <!-- Navigation Links -->
            <div class="space-y-1">
              <span class="text-[9px] font-bold uppercase tracking-wider ${textMuted} px-4 select-none">Views</span>
              <div class="space-y-0.5 pt-1">
                ${navItemsHTML}
              </div>
            </div>
          </div>
          
          <!-- Bottom Metadata -->
          <div class="pt-4 border-t ${borderMuted} flex items-center justify-between select-none">
            <span class="text-[9px] ${textMuted} font-mono">Accent Color:</span>
            <span class="px-1.5 py-0.5 ${c.lightBg} ${c.text} text-[8px] font-bold rounded uppercase">${settings.primaryColor}</span>
          </div>
        </aside>
        
        <!-- Main Content View Stage -->
        <main class="flex-1 p-6 md:p-8 overflow-y-auto max-w-5xl mx-auto w-full">
          ${viewsHTML}
        </main>
      </div>
    `;
  } else if (settings.layoutStyle === "navbar") {
    mainLayoutHTML = `
      <div class="min-h-screen flex flex-col">
        <!-- Top Navigation Header -->
        <header class="h-14 border-b ${borderMuted} ${isDark ? "bg-slate-900/40" : "bg-white"} px-6 flex items-center justify-between select-none shadow-sm shrink-0">
          <div class="flex items-center gap-6">
            <!-- App Branding -->
            <div class="flex items-center gap-2">
              <div class="w-6 h-6 rounded-[4px] bg-gradient-to-tr ${c.gradient} flex items-center justify-center text-white text-xs font-bold">
                P
              </div>
              <h1 class="text-xs font-bold tracking-tight">${name}</h1>
            </div>
            
            <!-- Horizontal Navigation Links -->
            <nav class="flex items-center gap-1">
              ${items.map((item) => `
                <button 
                  onclick="navigateTo('${item.id}')" 
                  id="nav-btn-${item.id}"
                  class="nav-link px-3 py-1.5 text-xs font-semibold transition-all duration-110 ${rClass} cursor-pointer"
                >
                  ${item.name}
                </button>
              `).join("\n")}
            </nav>
          </div>
          
          <div class="flex items-center gap-2">
            <span class="px-2 py-0.5 ${c.lightBg} ${c.text} text-[8px] font-bold rounded uppercase font-mono">${settings.borderRadius} borders</span>
          </div>
        </header>
        
        <!-- Main Content View Stage -->
        <main class="flex-1 p-6 md:p-8 overflow-y-auto max-w-5xl mx-auto w-full">
          ${viewsHTML}
        </main>
      </div>
    `;
  } else {
    // Tabs centered layout style
    mainLayoutHTML = `
      <div class="min-h-screen flex flex-col items-center justify-center p-4 md:p-8">
        <div class="w-full max-w-4xl space-y-6">
          
          <!-- Card Container containing Tabs and dynamic views -->
          <div class="${bgCard} border ${rClass} shadow-md overflow-hidden flex flex-col min-h-[500px]">
            <!-- Header Tabs -->
            <div class="px-5 py-3.5 border-b ${borderMuted} flex items-center justify-between select-none ${isDark ? "bg-slate-900/20" : "bg-slate-50"} shrink-0">
              <div class="flex items-center gap-2">
                <div class="w-5 h-5 rounded-[4px] bg-gradient-to-tr ${c.gradient} flex items-center justify-center text-white text-[10px] font-bold">
                  P
                </div>
                <h1 class="text-xs font-bold tracking-tight">${name}</h1>
              </div>
              
              <!-- Tab Navigation button group -->
              <div class="flex items-center gap-1 p-0.5 bg-slate-200/50 dark:bg-slate-950/60 border ${borderMuted} ${rClass}">
                ${items.map((item) => `
                  <button 
                    onclick="navigateTo('${item.id}')" 
                    id="nav-btn-${item.id}"
                    class="nav-link px-3 py-1 text-xs font-semibold transition-all duration-110 ${rClass} cursor-pointer"
                  >
                    ${item.name}
                  </button>
                `).join("\n")}
              </div>
            </div>
            
            <!-- Content view ports -->
            <div class="flex-1 p-6 md:p-8">
              ${viewsHTML}
            </div>
          </div>
          
          <div class="text-center text-[10px] ${textMuted} font-mono select-none uppercase">
            Designed automatically matching overarching project settings guidelines
          </div>
        </div>
      </div>
    `;
  }

  // Complete HTML template
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${name}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap');
    
    body { 
      font-family: 'Plus Jakarta Sans', sans-serif; 
    }
    
    .num-tabular {
      font-family: 'JetBrains Mono', monospace;
    }
    
    /* Elegant micro fades and entries */
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(3px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-in {
      animation: fadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
    
    /* Scrollbar aesthetics */
    ::-webkit-scrollbar {
      width: 6px;
      height: 6px;
    }
    ::-webkit-scrollbar-track {
      background: transparent;
    }
    ::-webkit-scrollbar-thumb {
      background: rgba(156, 163, 175, 0.25);
      border-radius: 9999px;
    }
    ::-webkit-scrollbar-thumb:hover {
      background: rgba(156, 163, 175, 0.45);
    }
  </style>
  <script>
    // Console proxy to send iframe console messages back to host parent (Rule 9)
    const _log = console.log;
    const _warn = console.warn;
    const _error = console.error;

    function sendToHost(type, args) {
      window.parent.postMessage({
        source: 'sandbox-console',
        type,
        args: Array.from(args).map(arg => {
          if (typeof arg === 'object') {
            try { return JSON.stringify(arg); } catch (e) { return String(arg); }
          }
          return String(arg);
        }),
        timestamp: new Date().toISOString()
      }, '*');
    }

    console.log = function() {
      _log.apply(console, arguments);
      sendToHost('log', arguments);
    };
    console.warn = function() {
      _warn.apply(console, arguments);
      sendToHost('warn', arguments);
    };
    console.error = function() {
      _error.apply(console, arguments);
      sendToHost('error', arguments);
    };

    // Keyboard event proxy for workspace shortcut synergy
    window.addEventListener('keydown', (e) => {
      window.parent.postMessage({
        source: 'sandbox-keyboard',
        key: e.key,
        metaKey: e.metaKey,
        ctrlKey: e.ctrlKey
      }, '*');
    });
  </script>
</head>
<body class="${bgApp} min-h-screen transition-all duration-200">

  ${mainLayoutHTML}

  <script>
    // Client-side router logic
    const views = [${items.map(i => `'${i.id}'`).join(", ")}];
    let currentViewId = '${items[0]?.id || ""}';

    function navigateTo(viewId) {
      if (!views.includes(viewId)) return;
      currentViewId = viewId;
      
      // Toggle visibility of each view stage
      views.forEach(id => {
        const viewEl = document.getElementById('view-' + id);
        const navEl = document.getElementById('nav-btn-' + id);
        
        if (id === viewId) {
          viewEl.classList.remove('hidden');
          
          // Style active button
          if (navEl) {
            navEl.className = "nav-link flex items-center gap-2.5 px-4 py-2 text-xs font-semibold transition-all duration-110 ${rClass} text-left w-full cursor-pointer select-none ${c.lightBg} ${c.text}";
            
            // Handle navbar or tab layout style too
            if ("${settings.layoutStyle}" === "navbar") {
              navEl.className = "nav-link px-3 py-1.5 text-xs font-semibold transition-all duration-110 ${rClass} cursor-pointer ${c.lightBg} ${c.text}";
            } else if ("${settings.layoutStyle}" === "tabs") {
              navEl.className = "nav-link px-3 py-1 text-xs font-semibold transition-all duration-110 ${rClass} cursor-pointer bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm font-semibold";
            }
          }
        } else {
          viewEl.classList.add('hidden');
          
          // Style inactive button
          if (navEl) {
            navEl.className = "nav-link flex items-center gap-2.5 px-4 py-2 text-xs font-semibold transition-all duration-110 ${rClass} text-left w-full cursor-pointer select-none text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200/40 dark:hover:bg-slate-800/40";
            
            if ("${settings.layoutStyle}" === "navbar") {
              navEl.className = "nav-link px-3 py-1.5 text-xs font-semibold transition-all duration-110 ${rClass} cursor-pointer text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200/40 dark:hover:bg-slate-800/40";
            } else if ("${settings.layoutStyle}" === "tabs") {
              navEl.className = "nav-link px-3 py-1 text-xs font-semibold transition-all duration-110 ${rClass} cursor-pointer text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200/20 dark:hover:bg-slate-800/20";
            }
          }
        }
      });
      
      console.log('Sandbox router: Navigated to ' + viewId);
    }

    // 1. Welcome Counter Feature
    let clicks = 0;
    function incrementWelcomeCounter() {
      clicks++;
      const el = document.getElementById('welcome-click-count');
      if (el) {
        el.innerText = clicks === 1 ? '1 click' : clicks + ' clicks';
      }
      console.log('Sandbox clicker: Counter set to ' + clicks);
    }

    // 2. Custom Task adding trigger inside dynamic placeholder view
    function addCustomTask(viewId) {
      const inputEl = document.getElementById('input-' + viewId);
      const listEl = document.getElementById('list-' + viewId);
      
      if (!inputEl || !listEl || !inputEl.value.trim()) return;
      
      const val = inputEl.value.trim();
      const li = document.createElement('li');
      li.className = "flex items-center gap-1.5 animate-fade-in";
      li.innerHTML = '<span class="w-1 h-1 rounded-full bg-slate-400"></span>' + val;
      
      listEl.appendChild(li);
      inputEl.value = "";
      console.log('Sandbox checklist: Added task "' + val + '" inside view ' + viewId);
    }

    // Quick verification alert popups
    function triggerAlert(msg) {
      alert(msg);
      console.log('Sandbox alert triggered: "' + msg + '"');
    }

    function logToConsole(msg) {
      console.log(msg);
    }

    // Trend re-generator (SVG update mock)
    function regenerateMockTrends() {
      console.log('Sandbox graph: Refreshing mock SVG vectors...');
      // Subtle alert simulation
      alert('Graph vector paths recalculated matching updated parameters.');
    }

    // Boot router on mount
    window.onload = () => {
      navigateTo(currentViewId);
    };
  </script>
</body>
</html>`;
}
