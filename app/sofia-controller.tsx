
"use client";

import { useEffect, useState } from "react";
import {
  chatWithSofia,
  analyzeSofiaImage,
  signInToSofia,
  getSofiaUser
} from "./sofia-engine";
import { MessageCircle, X, Send, Mic, Loader2, User, Sparkles } from "lucide-react";

type Message = {
  role: "user" | "assistant";
  content: string;
  time: number;
};

type SofiaEvent = CustomEvent<{
  prompt?: string;
  mode?: string;
  file?: File;
}>;

const STORAGE_KEY = "sofia-chat-history-v2";

function loadHistory(): Message[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

export default function SofiaController() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");

  useEffect(() => {
    setMessages(loadHistory());
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch {
      setError("Unable to save chat history on this device.");
    }
  }, [messages]);

  async function sendMessage(text: string, mode = "AI Chat") {
    const prompt = text.trim();
    if (!prompt || loading) return;

    setOpen(true);
    setInput("");
    setError("");

    const userMessage: Message = {
      role: "user",
      content: prompt,
      time: Date.now()
    };

    setMessages((old) => [...old, userMessage]);
    setLoading(true);

    try {
      const settings = JSON.parse(
        localStorage.getItem("sofia-settings") || "{}"
      );

      const answer = await chatWithSofia(
        mode === "Build Anything"
          ? `You are Sofia AI Studio, an expert software developer. Help the user build this project with complete code, architecture, and clear instructions.\n\n${prompt}`
          : prompt,
        {
          model: settings.model === "Puter AI" ? undefined : settings.model,
          temperature: settings.temperature ?? 0.7
        }
      );

      setMessages((old) => [
        ...old,
        {
          role: "assistant",
          content: answer,
          time: Date.now()
        }
      ]);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Sofia could not respond."
      );
    } finally {
      setLoading(false);
    }
  }

  async function connect() {
    setError("");

    try {
      await signInToSofia();
      const user = await getSofiaUser();
      setConnected(Boolean(user));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Connection failed."
      );
    }
  }

  async function analyzeFile(file: File) {
    setOpen(true);
    setLoading(true);
    setError("");

    setMessages((old) => [
      ...old,
      {
        role: "user",
        content: `Analyze file: ${file.name}`,
        time: Date.now()
      }
    ]);

    try {
      if (!file.type.startsWith("image/")) {
        throw new Error(
          "Image analysis is supported here. PDF text extraction will be added in the document module."
        );
      }

      const result = await analyzeSofiaImage(file);

      setMessages((old) => [
        ...old,
        {
          role: "assistant",
          content: result,
          time: Date.now()
        }
      ]);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "File analysis failed."
      );
    } finally {
      setLoading(false);
    }
  }

  function startVoice() {
    type RecognitionResult = {
      transcript: string;
    };

    type RecognitionEvent = {
      results: ArrayLike<ArrayLike<RecognitionResult>>;
    };

    type Recognition = {
      lang: string;
      continuous: boolean;
      interimResults: boolean;
      onresult: ((event: RecognitionEvent) => void) | null;
      onerror: (() => void) | null;
      start: () => void;
    };

    const browser = window as unknown as {
      SpeechRecognition?: new () => Recognition;
      webkitSpeechRecognition?: new () => Recognition;
    };

    const Speech =
      browser.SpeechRecognition ||
      browser.webkitSpeechRecognition;

    if (!Speech) {
      setError("Voice input is not supported by this browser.");
      return;
    }

    const recognition = new Speech();

    recognition.lang = "en-IN";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
    };

    recognition.onerror = () => {
      setError("Voice recognition failed. Please try again.");
    };

    recognition.start();
  }

  useEffect(() => {
    const onPrompt = (event: Event) => {
      const detail = (event as SofiaEvent).detail;
      if (detail?.prompt) {
        void sendMessage(detail.prompt, detail.mode);
      }
    };

    const onConnect = () => {
      void connect();
    };

    const onVoice = () => {
      setOpen(true);
      startVoice();
    };

    const onFile = (event: Event) => {
      const file = (event as SofiaEvent).detail?.file;
      if (file) void analyzeFile(file);
    };

    window.addEventListener("sofia:prompt", onPrompt);
    window.addEventListener("sofia:connect", onConnect);
    window.addEventListener("sofia:voice", onVoice);
    window.addEventListener("sofia:file", onFile);

    return () => {
      window.removeEventListener("sofia:prompt", onPrompt);
      window.removeEventListener("sofia:connect", onConnect);
      window.removeEventListener("sofia:voice", onVoice);
      window.removeEventListener("sofia:file", onFile);
    };
  });

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        aria-label="Open Sofia assistant"
        style={{
          position: "fixed",
          right: 20,
          bottom: 20,
          width: 56,
          height: 56,
          borderRadius: "50%",
          border: 0,
          color: "white",
          background: "linear-gradient(135deg,#7868ff,#35d7e8)",
          boxShadow: "0 8px 30px #7868ff55",
          zIndex: 50,
          display: "grid",
          placeItems: "center"
        }}
      >
        <Sparkles size={25} />
      </button>
    );
  }

  return (
    <section
      style={{
        position: "fixed",
        right: 16,
        bottom: 16,
        zIndex: 60,
        width: "min(420px, calc(100vw - 32px))",
        height: "min(620px, calc(100dvh - 32px))",
        display: "flex",
        flexDirection: "column",
        border: "1px solid rgba(160,180,220,.2)",
        borderRadius: 20,
        background: "#101629",
        boxShadow: "0 20px 70px #0009",
        overflow: "hidden"
      }}
    >
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: 16,
          borderBottom: "1px solid #ffffff18"
        }}
      >
        <div>
          <strong>✦ Sofia AI</strong>
          <div style={{ fontSize: 11, color: "#98a5c1" }}>
            {connected ? "Connected" : "AI Assistant"}
          </div>
        </div>

        <button
          className="icon-btn"
          onClick={() => setOpen(false)}
          aria-label="Close assistant"
        >
          <X size={18} />
        </button>
      </header>

      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: 14,
          display: "flex",
          flexDirection: "column",
          gap: 12
        }}
      >
        {messages.length === 0 && (
          <div style={{ textAlign: "center", margin: "auto" }}>
            <Sparkles size={34} color="#a99fff" />
            <h3>Hello! I'm Sofia.</h3>
            <p>How can I help you today?</p>
          </div>
        )}

        {messages.map((message, index) => (
          <div
            key={`${message.time}-${index}`}
            style={{
              display: "flex",
              gap: 9,
              alignSelf:
                message.role === "user" ? "flex-end" : "flex-start",
              maxWidth: "95%"
            }}
          >
            <div className="message-avatar">
              {message.role === "user" ? (
                <User size={16} />
              ) : (
                <Sparkles size={16} />
              )}
            </div>

            <div className="message-content">
              <p style={{ whiteSpace: "pre-wrap" }}>
                {message.content}
              </p>
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ display: "flex", gap: 9, alignItems: "center" }}>
            <Loader2 size={18} className="animate-spin" />
            <span className="muted">Sofia is thinking...</span>
          </div>
        )}

        {error && (
          <div
            role="alert"
            style={{
              color: "#ff8a9c",
              padding: 10,
              borderRadius: 10,
              background: "#ff647c15",
              fontSize: 12
            }}
          >
            {error}
          </div>
        )}
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          void sendMessage(input);
        }}
        style={{
          padding: 12,
          borderTop: "1px solid #ffffff18"
        }}
      >
        <div style={{ display: "flex", gap: 8 }}>
          <button
            type="button"
            className="icon-btn"
            onClick={startVoice}
            aria-label="Voice input"
          >
            <Mic size={18} />
          </button>

          <input
            className="input"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Talk to Sofia..."
            disabled={loading}
          />

          <button
            className="btn btn-primary"
            type="submit"
            disabled={loading || !input.trim()}
            aria-label="Send message"
          >
            <Send size={17} />
          </button>
        </div>
      </form>
    </section>
  );
        }
