
import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.sbsu.sofiaai",
  appName: "Sofia AI Studio",
  webDir: "public",

  server: {
    url: "https://sbsu-ai-studio.vercel.app",
    cleartext: false,
    allowNavigation: [
      "sbsu-ai-studio.vercel.app",
      "*.puter.com",
      "*.puter.site"
    ]
  },

  android: {
    allowMixedContent: false
  },

  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#080B18",
      showSpinner: false
    }
  }
};

export default config;
