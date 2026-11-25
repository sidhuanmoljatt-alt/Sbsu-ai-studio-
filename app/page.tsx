
"use client";

import { useState } from "react";
import {
  Sparkles, MessageCircle, Code2, Globe, Gamepad2,
  Bot, Image, Mic, FolderOpen, Search, Settings,
  Plus, Send, Paperclip, Menu, X, Download,
  Github, Zap, ChevronDown, SlidersHorizontal
} from "lucide-react";

const navigation = [
  { name: "AI Chat", icon: MessageCircle },
  { name: "Build Anything", icon: Code2 },
  { name: "Websites", icon: Globe },
  { name: "Games", icon: Gamepad2 },
  { name: "Agent Builder", icon: Bot },
  { name: "Image Studio", icon: Image },
  { name: "Voice Studio", icon: Mic },
  { name: "My Projects", icon: FolderOpen },
  { name: "AI Research", icon: Search }
];

const suggestions = [
  {
    title: "Build an AI App",
    description: "Create intelligent applications",
    icon: Bot
  },
  {
    title: "Build a Website",
    description: "Design modern websites",
    icon: Globe
  },
  {
    title: "Create a 3D Game",
    description: "Build interactive games",
    icon: Gamepad2
  },
  {
    title: "Create an AI Agent",
    description: "Build your own AI assistant",
    icon: Sparkles
  }
];

export default function Home() {
  const [active, setActive] = useState("AI Chat");
  const [prompt, setPrompt] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [model, setModel] = useState("Puter AI");
  const [temperature, setTemperature] = useState(0.7);
  const [showSettings, setShowSettings] = useState(false);

  function submitPrompt() {
    if (!prompt.trim()) return;

    const request = prompt.trim();
    setPrompt("");

    window.dispatchEvent(
      new CustomEvent("sofia:prompt", {
        detail: { prompt: request, mode: active }
      })
    );
  }

  function chooseSuggestion(title: string) {
    setActive("Build Anything");
    setPrompt(
      title === "Build an AI App"
        ? "Build me a complete working AI application"
        : title === "Build a Website"
        ? "Build me a modern responsive website"
        : title === "Create a 3D Game"
        ? "Build me an interactive 3D game"
        : "Create a complete AI agent"
    );
  }

  return (
    <main className="app-shell">
      {mobileOpen && (
        <button
          className="fixed-overlay"
          aria-label="Close menu"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className="sidebar"
        style={{
          transform: mobileOpen ? "translateX(0)" : undefined
        }}
      >
        <div className="brand">
          <div className="brand-logo">S</div>
          <div>
            <h1 className="brand-name">SOFIA AI</h1>
            <p className="brand-caption">STUDIO 2.0</p>
          </div>
          <button
            className="icon-btn"
            style={{ marginLeft: "auto" }}
            onClick={() => setMobileOpen(false)}
            aria-label="Close sidebar"
          >
            <X size={17} />
          </button>
        </div>

        <button
          className="btn btn-primary w-full"
          onClick={() => {
            setActive("AI Chat");
            setPrompt("");
          }}
        >
          <Plus size={17} /> New Chat
        </button>

        <p className="nav-label">Workspace</p>

        {navigation.map((item) => {
          const Icon = item.icon;

          return (
            <button
              key={item.name}
              className={`nav-item ${
                active === item.name ? "active" : ""
              }`}
              onClick={() => {
                setActive(item.name);
                setMobileOpen(false);
              }}
            >
              <Icon size={18} />
              {item.name}
            </button>
          );
        })}

        <div className="sidebar-bottom">
          <div className="divider" />

          <button
            className="nav-item"
            onClick={() => setShowSettings(!showSettings)}
          >
            <Settings size={18} /> Settings
          </button>

          <div className="card" style={{ padding: 13 }}>
            <div className="flex-between">
              <span style={{ fontWeight: 700 }}>Sofia AI Studio</span>
              <Zap size={17} color="#9d91ff" />
            </div>
            <p style={{ fontSize: 11, marginBottom: 0 }}>
              Your creative AI workspace.
            </p>
          </div>
        </div>
      </aside>

      <section className="main-area">
        <header className="topbar">
          <div className="flex gap-8" style={{ alignItems: "center" }}>
            <button
              className="icon-btn mobile-menu-btn"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={20} />
            </button>

            <span style={{ fontWeight: 700 }}>{active}</span>
            <span className="badge badge-success">
              <span>●</span> Online
            </span>
          </div>

          <div className="flex gap-8">
            <button
              className="btn"
              onClick={() =>
                window.dispatchEvent(
                  new CustomEvent("sofia:connect")
                )
              }
            >
              <Zap size={16} /> Connect
            </button>

            <button
              className="icon-btn"
              onClick={() => setShowSettings(!showSettings)}
              aria-label="Open settings"
            >
              <SlidersHorizontal size={18} />
            </button>
          </div>
        </header>

        <div className="page-content">
          {showSettings && (
            <section className="card mb-16">
              <div className="flex-between">
                <h3>Model Settings</h3>
                <button
                  className="icon-btn"
                  onClick={() => setShowSettings(false)}
                  aria-label="Close settings"
                >
                  <X size={17} />
                </button>
              </div>

              <label className="field">
                <span className="field-label">AI Provider</span>
                <select
                  className="select"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                >
                  <option>Puter AI</option>
                  <option>Custom API</option>
                </select>
              </label>

              <label className="field mt-16">
                <span className="field-label">
                  Temperature: {temperature.toFixed(1)}
                </span>
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.1"
                  value={temperature}
                  onChange={(e) =>
                    setTemperature(Number(e.target.value))
                  }
                />
              </label>

              <button
                className="btn btn-primary mt-16"
                onClick={() => {
                  localStorage.setItem(
                    "sofia-settings",
                    JSON.stringify({ model, temperature })
                  );
                }}
              >
                Save Settings
              </button>
            </section>
          )}

          <div
            style={{
              maxWidth: 920,
              margin: "35px auto 0"
            }}
          >
            <div style={{ textAlign: "center", marginBottom: 36 }}>
              <div
                className="brand-logo"
                style={{
                  width: 65,
                  height: 65,
                  margin: "0 auto 20px",
                  fontSize: 30,
                  borderRadius: 20
                }}
              >
                S
              </div>

              <h1 style={{ fontSize: "clamp(29px, 5vw, 46px)" }}>
                Hello! Welcome to{" "}
                <span className="gradient-text">Sofia AI</span>
              </h1>

              <p>
                How can I help you today?
              </p>

              <p style={{ fontSize: 12 }}>
                Shaheed Bhagat Singh State University, Ferozepur
              </p>
            </div>

            <section className="card">
              <div className="flex-between mb-16">
                <span style={{ fontWeight: 700 }}>
                  <Sparkles
                    size={17}
                    style={{
                      display: "inline",
                      verticalAlign: "middle",
                      marginRight: 7,
                      color: "#a99fff"
                    }}
                  />
                  Build Anything
                </span>

                <span className="badge">AI Workspace</span>
              </div>

              <textarea
                className="textarea"
                placeholder="Ask Sofia anything, or describe what you want to build..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    submitPrompt();
                  }
                }}
              />

              <div
                className="flex-between"
                style={{ marginTop: 13, flexWrap: "wrap" }}
              >
                <div className="flex gap-8">
                  <button
                    className="icon-btn"
                    aria-label="Upload file"
                    onClick={() =>
                      document.getElementById("sofia-file")?.click()
                    }
                  >
                    <Paperclip size={18} />
                  </button>

                  <input
                    id="sofia-file"
                    type="file"
                    hidden
                    accept="image/*,.pdf,.txt"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        window.dispatchEvent(
                          new CustomEvent("sofia:file", {
                            detail: { file }
                          })
                        );
                      }
                    }}
                  />

                  <button
                    className="icon-btn"
                    aria-label="Voice input"
                    onClick={() =>
                      window.dispatchEvent(
                        new CustomEvent("sofia:voice")
                      )
                    }
                  >
                    <Mic size={18} />
                  </button>

                  <button
                    className="icon-btn"
                    aria-label="Generate image"
                    onClick={() => setActive("Image Studio")}
                  >
                    <Image size={18} />
                  </button>
                </div>

                <button
                  className="btn btn-primary"
                  disabled={!prompt.trim()}
                  onClick={submitPrompt}
                >
                  <Send size={16} /> Send to Sofia
                </button>
              </div>
            </section>

            <h3 style={{ marginTop: 32 }}>
              What would you like to create?
            </h3>

            <div className="card-grid">
              {suggestions.map((item) => {
                const Icon = item.icon;

                return (
                  <button
                    key={item.title}
                    className="feature-card"
                    onClick={() => chooseSuggestion(item.title)}
                  >
                    <div className="feature-icon">
                      <Icon size={22} />
                    </div>

                    <strong>{item.title}</strong>

                    <span className="muted" style={{ fontSize: 12 }}>
                      {item.description}
                    </span>
                  </button>
                );
              })}
            </div>

            <section className="card mt-16">
              <div className="flex-between">
                <div>
                  <h3>Connect Your AI Services</h3>
                  <p style={{ fontSize: 13 }}>
                    Connect providers and your development accounts.
                  </p>
                </div>
                <Github size={25} />
              </div>

              <button
                className="btn btn-primary"
                onClick={() =>
                  window.dispatchEvent(
                    new CustomEvent("sofia:connect")
                  )
                }
              >
                <Zap size={16} /> Open Connect Centre
              </button>
            </section>

            <footer
              style={{
                textAlign: "center",
                marginTop: 35,
                color: "#7885a1",
                fontSize: 12
              }}
            >
              Sofia AI Studio 2.0 · Build Anything · 2026
            </footer>
          </div>
        </div>
      </section>
    </main>
  );
                }
            
