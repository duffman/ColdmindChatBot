import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Initialize GoogleGenAI client securely
let aiClient: GoogleGenAI | null = null;

function getAiClient() {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is missing.");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Chat API Endpoint
app.post("/api/chat", async (req, res) => {
  try {
    const { messages, currentCode } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Invalid messages array." });
    }

    const ai = getAiClient();

    // System instruction to ensure structured output
    let systemInstruction = `You are an expert AI software developer assistant. 
You communicate with the user and build single-file web application sandboxes.
You MUST always respond with a single JSON object. The JSON object MUST have exactly these two fields:
1. "text": (string) Your friendly, helpful explanation or description of the changes/features. Keep it concise, helpful, and professional.
2. "code": (string) A complete, fully functional, self-contained single-file HTML page containing all required CSS and JavaScript. Include CSS framework via CDN if needed (Tailwind CDN: <script src="https://cdn.tailwindcss.com"></script> is highly recommended). If the user is just asking a question and no code needs to be displayed or previewed, set "code" to empty string ("").

Example JSON response format:
{
  "text": "I have created a simple interactive timer with a beautiful design. You can start, pause, and reset the timer.",
  "code": "<!DOCTYPE html><html><head><script src=\\"https://cdn.tailwindcss.com\\"></script></head><body class=\\"bg-slate-900 text-white min-h-screen flex items-center justify-center\\">...</body></html>"
}

Ensure all code is modern, visually stunning, fully interactive, and free of placeholder code.`;

    if (currentCode) {
      systemInstruction += `\n\nCRITICAL: The user has the following active code loaded in their code editor. When the user asks for updates, fixes, changes, or additions, you MUST use this code as your base, preserve its style and functionality, and modify it cleanly according to their request. Do not write from scratch unless they ask for a completely new app.
=== ACTIVE CODE IN EDITOR ===
${currentCode}
=== END ACTIVE CODE ===`;
    }

    // Map client messages to Gemini content format
    const contents = messages.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            text: {
              type: Type.STRING,
              description: "Text response explaining what you did or chatting with the user.",
            },
            code: {
              type: Type.STRING,
              description: "The complete, self-contained HTML page. Empty string if no visual preview is needed.",
            },
          },
          required: ["text", "code"],
        },
      },
    });

    const textResult = response.text || "{}";
    res.json(JSON.parse(textResult));
  } catch (error: any) {
    console.error("Gemini API Error:", error);
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
