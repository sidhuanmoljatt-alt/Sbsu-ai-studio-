// ============================================
// File 9: config.js
// Unbeatable App - PUBLIC CONFIG ONLY
// ⚠️ NEVER PUT SECRET KEYS HERE - NO sk-... , NO API KEYS
// Anyone can see this file on GitHub - Only public data
// ============================================

const CONFIG = {

  // --- 1. APP INFO ---
  appName: "Unbeatable App",
  appTagline: "Build Apps, Websites, Games & AI Agents - Free, No Coding",
  version: "1.0.0",
  author: "Your Name",

  // --- 2. GITHUB - CHANGE THIS TO YOURS ---
  // Your GitHub username - e.g. "rahul123"
  githubUsername: "YOUR-GITHUB-USERNAME",
  githubRepo: "unbeatable-app",
  // This will be your live link after GitHub Pages:
  // https://YOUR-GITHUB-USERNAME.github.io/unbeatable-app/
  get baseUrl() {
    return `https://${this.githubUsername}.github.io/${this.githubRepo}/`;
  },

  // --- 3. ADS - CHANGE AFTER ADSENSE APPROVAL ---
  // Leave blank until you get approved, app will work without ads
  adsenseId: "", // e.g. "ca-pub-1234567890123456"
  adsenseSlotHome: "", // e.g. "1234567890"
  adsenseSlotBuilder: "",
  showAds: false, // Set to true ONLY after AdSense approval

  // --- 4. CONTACT / WHATSAPP ---
  // Your WhatsApp number with country code, NO + , NO spaces
  // Example India: "919876543210"
  whatsappNumber: "919999999999", // <-- Change this
  contactEmail: "you@example.com", // <-- Change this
  telegramUsername: "", // e.g. "yourusername" - optional

  // --- 5. FREE AI MODELS - Auto-Shifter Order ---
  // App tries in this order: Puter -> Pollinations -> Keys -> Popup
  // DO NOT put keys here
  freeModels: ["puter", "pollinations"],
  aiProviders: {
    puter: {
      enabled: true,
      name: "Puter.js (Free)",
      models: ["gpt-4o-mini", "claude-3-5-sonnet", "llama-3.1-8b"],
      defaultModel: "gpt-4o-mini",
      needsKey: false,
      needsLogin: true
    },
    pollinations: {
      enabled: true,
      name: "Pollinations (Free, No Login)",
      apiUrl: "https://text.pollinations.ai/",
      needsKey: false,
      needsLogin: false
    },
    // User's own keys are stored in localStorage / Puter KV, NOT here
    userKeys: {
      enabled: true,
      name: "My Keys (From Keys Page)",
      needsKey: true,
      storageKey: "unbeatable_user_keys"
    }
  },

  // --- 6. BUILDER SETTINGS ---
  builders: {
    app: {
      enabled: true,
      maxPromptLength: 2000,
      categories: ["Todo", "Calculator", "Quiz", "Chat", "Notes", "Timer", "Converter", "Other"]
    },
    website: {
      enabled: true,
      types: ["Portfolio", "Business", "Shop", "Blog", "Landing Page", "Restaurant"]
    },
    game: {
      enabled: true,
      types: ["Snake", "Memory", "Quiz Game", "Flappy", "Tic Tac Toe", "2048"]
    },
    agent: {
      enabled: true,
      personalities: ["Helpful", "Funny", "Strict Teacher", "Friend", "Coder"],
      maxInstructionsLength: 2000
    }
  },

  // --- 7. STORAGE KEYS (LocalStorage + Puter KV) ---
  storage: {
    myApps: "unbeatable_my_apps",
    userKeys: "unbeatable_user_keys",
    settings: "unbeatable_settings",
    userProfile: "unbeatable_user",
    theme: "unbeatable_theme",
    language: "unbeatable_lang"
  },

  // --- 8. THEME / LANGUAGE ---
  defaultTheme: "dark", // "dark" or "light"
  defaultLanguage: "en", // "en" or "hi"
  languages: [
    { code: "en", label: "English" },
    { code: "hi", label: "हिन्दी" }
  ],

  // --- 9. LIMITS (Free Plan) ---
  limits: {
    freeGenerationsPerDay: 20,
    maxSavedApps: 100,
    maxCodeLength: 50000
  },

  // --- 10. FEATURE FLAGS ---
  features: {
    loginRequiredForSave: true,
    loginRequiredForHost: true,
    allowGuestPlayGames: true,
    allowGuestBuild: true,
    showWhatsAppShare: true,
    showPuterLogin: true
  },

  // --- 11. HELPER FUNCTIONS ---
  getShareText: function(appName, appLink) {
    return `Check my app: ${appName} - Made with ${this.appName} 🚀\n${appLink}`;
  },
  getWhatsAppLink: function(text) {
    return `https://wa.me/?text=${encodeURIComponent(text)}`;
  },
  getWhatsAppContactLink: function(message) {
    return `https://wa.me/${this.whatsappNumber}?text=${encodeURIComponent(message || "Hi! I need help with " + this.appName)}`;
  }
};

// Make available globally + for modules
if (typeof window !== 'undefined') {
  window.CONFIG = CONFIG;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CONFIG;
}

// Debug log - safe, no secrets
console.log(`✅ CONFIG loaded: ${CONFIG.appName} v${CONFIG.version}`);
