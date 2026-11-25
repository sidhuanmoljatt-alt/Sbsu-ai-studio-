
"use client";

type PuterClient = {
  ai: {
    chat: (
      prompt: string,
      options?: Record<string, unknown>
    ) => Promise<unknown>;
    txt2img: (
      prompt: string,
      options?: Record<string, unknown>
    ) => Promise<unknown>;
    img2txt: (
      image: File | string
    ) => Promise<unknown>;
    txt2speech: (
      text: string,
      options?: Record<string, unknown>
    ) => Promise<unknown>;
  };
  auth: {
    signIn: () => Promise<unknown>;
    signOut: () => Promise<unknown>;
    getUser: () => Promise<unknown>;
  };
};

declare global {
  interface Window {
    puter?: PuterClient;
  }
}

let puterLoading: Promise<PuterClient> | null = null;

function getPuter(): PuterClient | undefined {
  if (typeof window === "undefined") return undefined;
  return window.puter;
}

export async function loadPuter(): Promise<PuterClient> {
  if (typeof window === "undefined") {
    throw new Error("Puter AI is only available in the browser.");
  }

  if (window.puter) return window.puter;

  if (!puterLoading) {
    puterLoading = new Promise<PuterClient>((resolve, reject) => {
      const existing = document.querySelector<HTMLScriptElement>(
        'script[src="https://js.puter.com/v2/"]'
      );

      const script = existing ?? document.createElement("script");

      const onLoad = () => {
        if (window.puter) {
          resolve(window.puter);
        } else {
          reject(new Error("Puter loaded, but its AI service is unavailable."));
        }
      };

      const onError = () => {
        reject(new Error("Unable to load Puter AI. Check your internet connection."));
      };

      script.addEventListener("load", onLoad, { once: true });
      script.addEventListener("error", onError, { once: true });

      if (!existing) {
        script.src = "https://js.puter.com/v2/";
        script.async = true;
        document.head.appendChild(script);
      } else if (window.puter) {
        resolve(window.puter);
      }
    }).catch((error: unknown) => {
      puterLoading = null;
      throw error;
    });
  }

  return puterLoading;
}

function extractText(result: unknown): string {
  if (typeof result === "string") return result;

  if (result && typeof result === "object") {
    const data = result as Record<string, unknown>;

    if (typeof data.text === "string") return data.text;

    const message = data.message;

    if (typeof message === "string") return message;

    if (message && typeof message === "object") {
      const content = (message as Record<string, unknown>).content;

      if (typeof content === "string") return content;

      if (Array.isArray(content)) {
        return content
          .map((part) => {
            if (typeof part === "string") return part;
            if (
              part &&
              typeof part === "object" &&
              typeof (part as Record<string, unknown>).text === "string"
            ) {
              return (part as Record<string, unknown>).text;
            }
            return "";
          })
          .filter(Boolean)
          .join("\n");
      }
    }
  }

  return String(result ?? "");
}

export async function chatWithSofia(
  prompt: string,
  options?: {
    model?: string;
    temperature?: number;
  }
): Promise<string> {
  const cleanPrompt = prompt.trim();

  if (!cleanPrompt) {
    throw new Error("Please enter a message first.");
  }

  const puter = await loadPuter();

  const modelOptions: Record<string, unknown> = {};

  if (options?.model && options.model !== "auto") {
    modelOptions.model = options.model;
  }

  if (typeof options?.temperature === "number") {
    modelOptions.temperature = Math.min(
      2,
      Math.max(0, options.temperature)
    );
  }

  const result = await puter.ai.chat(cleanPrompt, modelOptions);
  const answer = extractText(result);

  if (!answer.trim()) {
    throw new Error("The AI returned an empty response. Please try again.");
  }

  return answer;
}

export async function generateSofiaImage(
  prompt: string
): Promise<unknown> {
  const cleanPrompt = prompt.trim();

  if (!cleanPrompt) {
    throw new Error("Describe the image you want to create.");
  }

  const puter = await loadPuter();
  return puter.ai.txt2img(cleanPrompt);
}

export async function analyzeSofiaImage(
  image: File
): Promise<string> {
  if (!image || !image.type.startsWith("image/")) {
    throw new Error("Please select a valid image file.");
  }

  const puter = await loadPuter();
  const result = await puter.ai.img2txt(image);

  return extractText(result);
}

export async function speakWithSofia(
  text: string
): Promise<unknown> {
  const cleanText = text.trim();

  if (!cleanText) {
    throw new Error("There is no text to speak.");
  }

  const puter = await loadPuter();
  return puter.ai.txt2speech(cleanText);
}

export async function signInToSofia(): Promise<unknown> {
  const puter = await loadPuter();
  return puter.auth.signIn();
}

export async function getSofiaUser(): Promise<unknown> {
  const puter = getPuter();

  if (!puter) {
    return null;
  }

  return puter.auth.getUser();
}

export async function signOutFromSofia(): Promise<void> {
  const puter = await loadPuter();
  await puter.auth.signOut();
          }
