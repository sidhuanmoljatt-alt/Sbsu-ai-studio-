
"use client";

import { useEffect, useState } from "react";
import {
  getSofiaUser,
  signInToSofia,
  signOutFromSofia,
} from "./sofia-engine";

type Provider = {
  id: string;
  name: string;
  description: string;
  placeholder: string;
  docs: string;
};

const PROVIDERS: Provider[] = [
  {
    id: "openai",
    name: "OpenAI",
    description: "Connect an OpenAI API key.",
    placeholder: "sk-...",
    docs: "https://platform.openai.com/api-keys",
  },
  {
    id: "anthropic",
    name: "Anthropic",
    description: "Connect an Anthropic API key.",
    placeholder: "sk-ant-...",
    docs: "https://console.anthropic.com/settings/keys",
  },
  {
    id: "google",
    name: "Google Gemini",
    description: "Connect a Gemini API key.",
    placeholder: "AIza...",
    docs: "https://aistudio.google.com/app/apikey",
  },
];

const STORAGE_KEY = "sofia_provider_keys";
const GITHUB_KEY = "sofia_github_token";

function readStoredKeys(): Record<string, string> {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value ? JSON.parse(value) : {};
  } catch {
    return {};
  }
}

export default function SofiaConnect() {
  const [open, setOpen] = useState(false);
  const [keys, setKeys] = useState<Record<string, string>>({});
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [githubToken, setGithubToken] = useState("");
  const [githubStatus, setGithubStatus] = useState("");
  const [puterUser, setPuterUser] = useState("");
  const [puterStatus, setPuterStatus] = useState("Not connected");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    setKeys(readStoredKeys());

    try {
      setGithubToken(localStorage.getItem(GITHUB_KEY) || "");
    } catch {
      // Local storage may be unavailable.
    }

    const currentUser = getSofiaUser();
    if (currentUser) {
      setPuterUser(
        typeof currentUser === "string"
          ? currentUser
          : currentUser.username || currentUser.email || "Signed in"
      );
      setPuterStatus("Connected");
    }

    const openPanel = () => setOpen(true);
    window.addEventListener("sofia:connect", openPanel);

    return () => {
      window.removeEventListener("sofia:connect", openPanel);
    };
  }, []);

  function saveProviderKey(providerId: string) {
    const value = (drafts[providerId] || "").trim();

    if (!value) {
      setMessage("Enter an API key first.");
      return;
    }

    const updated = { ...keys, [providerId]: value };

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      setKeys(updated);
      setDrafts((previous) => ({ ...previous, [providerId]: "" }));
      setMessage("API key saved on this device.");
    } catch {
      setMessage("Could not save the key in this browser.");
    }
  }

  function removeProviderKey(providerId: string) {
    const updated = { ...keys };
    delete updated[providerId];

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      setKeys(updated);
      setMessage("API key removed.");
    } catch {
      setMessage("Could not update local storage.");
    }
  }

  async function connectPuter() {
    setBusy(true);
    setMessage("");

    try {
      await signInToSofia();
      const user = getSofiaUser();

      setPuterUser(
        user
          ? typeof user === "string"
            ? user
            : user.username || user.email || "Signed in"
          : "Signed in"
      );
      setPuterStatus("Connected");
      setMessage("Puter connection completed.");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Puter sign-in failed."
      );
    } finally {
      setBusy(false);
    }
  }

  async function disconnectPuter() {
    setBusy(true);

    try {
      await signOutFromSofia();
      setPuterUser("");
      setPuterStatus("Not connected");
      setMessage("Puter disconnected.");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Could not disconnect Puter."
      );
    } finally {
      setBusy(false);
    }
  }

  async function connectGithub() {
    const token = githubToken.trim();

    if (!token) {
      setGithubStatus("Enter a GitHub personal access token.");
      return;
    }

    setBusy(true);
    setGithubStatus("Checking token...");

    try {
      const response = await fetch("https://api.github.com/user", {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github+json",
        },
      });

      if (!response.ok) {
        throw new Error(
          response.status === 401
            ? "Invalid GitHub token."
            : `GitHub returned error ${response.status}.`
        );
      }

      const user = await response.json();

      localStorage.setItem(GITHUB_KEY, token);
      setGithubStatus(`Connected as ${user.login}.`);
      setMessage("GitHub token verified and saved on this device.");
    } catch (error) {
      setGithubStatus(
        error instanceof Error
          ? error.message
          : "Could not connect to GitHub."
      );
    } finally {
      setBusy(false);
    }
  }

  function disconnectGithub() {
    localStorage.removeItem(GITHUB_KEY);
    setGithubToken("");
    setGithubStatus("Disconnected.");
    setMessage("GitHub token removed from this device.");
  }

  if (!open) return null;

  return (
    <div
      className="fixed-overlay"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        background: "rgba(0,0,0,.72)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: 16,
        overflowY: "auto",
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) setOpen(false);
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="sofia-connect-title"
        style={{
          width: "100%",
          maxWidth: 650,
          maxHeight: "90vh",
          overflowY: "auto",
          background: "#111827",
          color: "#f9fafb",
          border: "1px solid #374151",
          borderRadius: 18,
          padding: 22,
          boxShadow: "0 20px 80px rgba(0,0,0,.45)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
          }}
        >
          <div>
            <h2 id="sofia-connect-title" style={{ margin: 0, fontSize: 23 }}>
              Connect Centre
            </h2>
            <p style={{ color: "#9ca3af", margin: "6px 0 0" }}>
              Connect AI services and developer accounts.
            </p>
          </div>

          <button
            onClick={() => setOpen(false)}
            aria-label="Close Connect Centre"
            style={{
              background: "#374151",
              color: "white",
              border: 0,
              borderRadius: 9,
              padding: "9px 13px",
              cursor: "pointer",
            }}
          >
            ✕
          </button>
        </div>

        <div
          style={{
            marginTop: 20,
            padding: 16,
            borderRadius: 12,
            background: "#1f2937",
          }}
        >
          <h3 style={{ marginTop: 0 }}>Puter AI</h3>
          <p style={{ color: "#9ca3af", fontSize: 14 }}>
            Sign in to use the Puter services supported by Sofia AI Studio.
          </p>
          <p style={{ fontSize: 14 }}>
            Status: <strong>{puterStatus}</strong>
            {puterUser ? ` · ${puterUser}` : ""}
          </p>

          {puterStatus === "Connected" ? (
            <button
              onClick={disconnectPuter}
              disabled={busy}
              style={buttonStyle}
            >
              Disconnect Puter
            </button>
          ) : (
            <button
              onClick={connectPuter}
              disabled={busy}
              style={buttonStyle}
            >
              {busy ? "Connecting..." : "Sign in with Puter"}
            </button>
          )}
        </div>

        <div style={{ marginTop: 22 }}>
          <h3>AI Provider API Keys</h3>
          <p style={{ color: "#9ca3af", fontSize: 13 }}>
            Add your own provider keys. A key is not supplied automatically
            with Sofia AI Studio.
          </p>

          {PROVIDERS.map((provider) => (
            <div
              key={provider.id}
              style={{
                padding: 15,
                marginTop: 12,
                border: "1px solid #374151",
                borderRadius: 12,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 10,
                  alignItems: "center",
                }}
              >
                <strong>{provider.name}</strong>
                <a
                  href={provider.docs}
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: "#93c5fd", fontSize: 12 }}
                >
                  Get API key
                </a>
              </div>

              <p style={{ color: "#9ca3af", fontSize: 13 }}>
                {provider.description}
              </p>

              {keys[provider.id] ? (
                <div>
                  <p style={{ color: "#86efac", fontSize: 13 }}>
                    <span aria-hidden="true">●</span> Key saved
                  </p>
                  <button
                    onClick={() => removeProviderKey(provider.id)}
                    style={secondaryButtonStyle}
                  >
                    Remove key
                  </button>
                </div>
              ) : (
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <input
                    type="password"
                    value={drafts[provider.id] || ""}
                    onChange={(event) =>
                      setDrafts((previous) => ({
                        ...previous,
                        [provider.id]: event.target.value,
                      }))
                    }
                    placeholder={provider.placeholder}
                    autoComplete="off"
                    style={inputStyle}
                  />
                  <button
                    onClick={() => saveProviderKey(provider.id)}
                    style={buttonStyle}
                  >
                    Save key
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        <div
          style={{
            marginTop: 22,
            padding: 16,
            background: "#1f2937",
            borderRadius: 12,
          }}
        >
          <h3 style={{ marginTop: 0 }}>GitHub</h3>
          <p style={{ color: "#9ca3af", fontSize: 13 }}>
            Verify a GitHub personal access token. This checks your account
            connection; repository publishing is a separate feature.
          </p>
          <a
            href="https://github.com/settings/personal-access-tokens"
            target="_blank"
            rel="noreferrer"
            style={{ color: "#93c5fd", fontSize: 13 }}
          >
            Create a GitHub token
          </a>

          <input
            type="password"
            value={githubToken}
            onChange={(event) => setGithubToken(event.target.value)}
            placeholder="GitHub personal access token"
            autoComplete="off"
            style={{ ...inputStyle, marginTop: 12 }}
          />

          <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
            <button
              onClick={connectGithub}
              disabled={busy}
              style={buttonStyle}
            >
              Verify and connect
            </button>
            <button onClick={disconnectGithub} style={secondaryButtonStyle}>
              Disconnect
            </button>
          </div>

          {githubStatus && (
            <p style={{ color: "#bfdbfe", fontSize: 13 }}>{githubStatus}</p>
          )}
        </div>

        <p
          style={{
            marginTop: 20,
            padding: 12,
            borderRadius: 10,
            background: "#422006",
            color: "#fde68a",
            fontSize: 12,
            lineHeight: 1.6,
          }}
        >
          Security warning: API keys and GitHub tokens saved here are stored
          in this browser's local storage. They are not encrypted by this
          component and should not be used on shared devices or in a public
          production app. A production deployment should keep secrets on a
          secure server.
        </p>

        {message && (
          <p role="status" style={{ color: "#86efac", fontSize: 13 }}>
            {message}
          </p>
        )}
      </section>
    </div>
  );
}

const buttonStyle: React.CSSProperties = {
  background: "#2563eb",
  color: "white",
  border: 0,
  borderRadius: 9,
  padding: "10px 14px",
  cursor: "pointer",
  fontWeight: 600,
};

const secondaryButtonStyle: React.CSSProperties = {
  background: "#374151",
  color: "white",
  border: "1px solid #4b5563",
  borderRadius: 9,
  padding: "9px 13px",
  cursor: "pointer",
};

const inputStyle: React.CSSProperties = {
  flex: 1,
  minWidth: 0,
  width: "100%",
  boxSizing: "border-box",
  background: "#030712",
  color: "white",
  border: "1px solid #4b5563",
  borderRadius: 9,
  padding: "11px 12px",
};
      
