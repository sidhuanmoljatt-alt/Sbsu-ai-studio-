# SBSU Ferozepur AI Studio - Sofia AI

**Live Demo:** https://sidhuanmoljatt-alt.github.io/Sbsu-ai-studio-/

Build Apps, Websites, Games, AI Agents in 2026 with Sofia AI.

## Features

- **Chat + Answer** - Sofia AI talks without API key, voice OUT with high quality
- **Voice IN (Punjabi/Hindi/English) + Voice OUT** - Web Speech API
- **Image Generation Placeholder** - Canvas + Pexels/Unsplash ready
- **File Upload (PDF/Image analysis)** - client-side preview
- **Model Settings + Temperature** - slider 0-1
- **Chat History + Export** - localStorage Project Memory
- **Agent Builder** - Study, Coding, Research, Personal Assistant
- **Project Memory** - each app/game has its own files, memory, DB
- **Build Anything Command Bar** - Type "Build me..."
- **Three.js / Babylon.js Auto Selector**
    - Three.js for Minecraft, Snake, voxel games (fast)
    - Babylon.js for PUBG/BGMI/GTA 5/6 open world (heavy graphics, physics)
- **PWA Ready** - manifest.json + service worker, works offline, installable
- **Safe QR Connect** - WebRTC P2P, share project with QR, no full device control
- **Download ZIP + Edit Button**

## Tech Stack

Single HTML file with Tailwind CSS, JavaScript, importmap for Three.js & Babylon.js.
Works totally offline + online both.

## How to Test PWA (Real App Check)

1.  Add expense > Refresh page - If expense still there = WORKING TOTALLY ✅
2.  Turn off internet > Open app - If app opens = PWA Working ✅
3.  Install on phone > Turn off WiFi > Open - If works = Real App ✅

## Supabase Setup (Free)

1. Go to supabase.com > New Project
2. Copy URL and anon key
3. Add in Vercel Dashboard > Settings > Environment Variables:
      - `SUPABASE_URL`
      - `SUPABASE_ANON_KEY`
4. Redeploy

Local test: Create `.env` from `.env.example`

## Vercel Deploy

1. Import GitHub repo `Sbsu-ai-studio-` in Vercel
2. Framework: Other, Root dir: ./
3. Add env vars from .env.example
4. Deploy

## APK Build

1. Go to pwabuilder.com
2. Paste your live URL: https://sidhuanmoljatt-alt.github.io/Sbsu-ai-studio-/
3. Build Android Package

## Sofia AI

Sofia auto-adds high quality graphics, writes full frontend + backend, checks bugs and debugs.

Made for Shaheed Bhagat Singh State University, Ferozepur.

## License

MIT - Free for students.
