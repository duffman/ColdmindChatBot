import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { createGoogle } from "@ai-sdk/google";
import { generateObject } from "ai";
import { z } from "zod";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Initialize Google AI provider for Vercel AI SDK
function getGoogleProvider() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is missing.");
  }
  return createGoogle({
    apiKey,
  });
}

// Chat API Endpoint using Vercel AI SDK
app.post("/api/chat", async (req, res) => {
  try {
    const { messages, currentCode, model, agent } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Invalid messages array." });
    }

    const googleProvider = getGoogleProvider();
    
    // Auto-map model based on agent choice to maximize capabilities and avoid UI clutter
    let selectedModel = "gemini-2.5-flash";
    if (agent === "architect") {
      selectedModel = "gemini-2.5-pro"; // Powerful reasoning for structural blueprinting
    } else if (model) {
      selectedModel = model;
    }

    // System instruction to guide the developer agent
    let systemInstruction = `You are an expert AI software developer assistant. 
You communicate with the user and build single-file web application sandboxes.
You MUST always respond with a single JSON object containing "text" and "code".
1. "text": Your friendly, helpful explanation or description of the changes/features. Keep it concise, helpful, and professional.
2. "code": A complete, fully functional, self-contained single-file HTML page containing all required CSS and JavaScript. Include CSS framework via CDN if needed (Tailwind CDN: <script src="https://cdn.tailwindcss.com"></script> is highly recommended). If the user is just asking a question and no code needs to be displayed or previewed, set "code" to empty string ("").

Ensure all code is modern, visually stunning, fully interactive, and free of placeholder code.`;

    // Dynamic Specialist Agent Personality Enrichment (Rules 1, 2, 3 & 4)
    if (agent === "architect") {
      systemInstruction += `\n\n=== SPECIALIST PROFILE: SOFTWARE ARCHITECT ===
Your primary focus is high-fidelity state management, multi-view routing, and clean structural integrity.
- Design seamless client-side routing that swaps views gracefully without dropping global application states.
- Establish clean, scalable JS functions, clear data schemas, and efficient data-handling pathways.
- Ensure that sections, sidebars, and grid containers are logically structured and modular.`;
    } else if (agent === "designer") {
      systemInstruction += `\n\n=== SPECIALIST PROFILE: UI/UX CRAFT DESIGNER ===
Your primary focus is gorgeous typography, color palettes, motion animations, and luxurious layout density.
Strictly adhere to these visual and layout craft guidelines:
- Default to elegant, high-contrast light theme styling unless dark mode is specifically requested by the settings.
- Avoid flat solid whites: use rich gradients, off-white background backdrops, and subtle sectional deltas.
- Sectional contrast: Adjacent areas (sidebars, panels) should have clear elevation or lightness deltas in the 2-6% range.
- Directional lighting: Main viewport areas must look diagonally lit from the top-left (light gradients cascading to dark, top-left highlights, bottom-right casts).
- Realistic shadows: Modeled from realistic light (2-3px blur, tight) — never a huge levitating glow.
- Tactile rounding: Subtle 3-5px border-rounding on buttons or inner cards; zero rounding on parent-filling panels (which must be rounded-none to remain flush).
- Typography pairing: Use Inter or Plus Jakarta Sans for sans-serif UI text, and JetBrains Mono for tabular numbers and status metrics.
- State depth: Standardize hover states, focus rings, and active button presses. Use CSS/Tailwind transitions.`;
    } else if (agent === "qa") {
      systemInstruction += `\n\n=== SPECIALIST PROFILE: QUALITY ASSURANCE & LINT OPTIMIZER ===
Your primary focus is defensive programming, validation robustness, and flawless runtime compliance.
- Carefully inspect and resolve any potential Javascript exceptions, type-coercion bugs, or layout overflows.
- Add strict form inputs validations, detailed empty states, error loaders, and descriptive notifications.
- Ensure all DOM selectors (document.getElementById, etc.) exist, are guarded against null references, and update elements safely.`;
    }

    if (currentCode) {
      systemInstruction += `\n\nCRITICAL: The user has the following active code loaded in their code editor. When the user asks for updates, fixes, changes, or additions, you MUST use this code as your base, preserve its style and functionality, and modify it cleanly according to their request. Do not write from scratch unless they ask for a completely new app.
=== ACTIVE CODE IN EDITOR ===
${currentCode}
=== END ACTIVE CODE ===`;
    }

    // Call generateObject using Vercel AI SDK
    const { object } = await generateObject({
      model: googleProvider(selectedModel),
      schema: z.object({
        text: z.string().describe("Explains what you did or chats with the user."),
        code: z.string().describe("The complete, self-contained HTML page. Empty string if no visual preview is needed."),
      }),
      system: systemInstruction,
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    });

    res.json(object);
  } catch (error: any) {
    console.error("Vercel AI SDK / Google Provider Error:", error);
    res.status(500).json({
      error: error.message || "An error occurred while generating content.",
    });
  }
});

async function startServer() {
  // Vite dev server integration or static file server
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
