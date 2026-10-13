Phase 2 is built — Connect (WebRTC + QR + Bluetooth), Supabase cloud sync with auth, APK/PWABuilder flow, and the upgraded ZIP, all layered onto Phase 1 in one file:

```html
<!DOCTYPE html>
<html lang="en" class="dark">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover"/>
<title>SBSU AI Studio</title>
<meta name="theme-color" content="#0f172a"/>
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet"/>
<script src="https://cdn.tailwindcss.com"></script>
<script>tailwind.config={darkMode:'class',theme:{extend:{colors:{accent:'#38bdf8'},fontFamily:{sans:['Inter','system-ui','sans-serif']}}}}</script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.45.0/min/vs/loader.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/qrcodejs@1.0.0/qrcode.min.js"></script>
<script src="https://unpkg.com/peerjs@1.5.4/dist/peerjs.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.39.0/dist/umd/supabase.min.js"></script>
<style>
:root{--bg:#0f172a;--panel:rgba(15,23,42,.62);--glass:rgba(30,41,59,.42);--border:rgba(148,163,184,.15);--text:#e6edf7;--muted:#8fa3bd;--accent:#38bdf8}
html.light{--bg:#eef2f8;--panel:rgba(255,255,255,.72);--glass:rgba(255,255,255,.55);--border:rgba(15,23,42,.10);--text:#0f172a;--muted:#5b6b84}
*{-webkit-tap-highlight-color:transparent}
html,body{height:100%}
body{background:var(--bg);color:var(--text);font-family:Inter,system-ui,sans-serif;overflow:hidden}
.blob{position:fixed;border-radius:9999px;filter:blur(90px);opacity:.35;pointer-events:none;z-index:0}
html.light .blob{opacity:.22}
.panel{background:var(--panel);backdrop-filter:blur(22px);-webkit-backdrop-filter:blur(22px);border:1px solid var(--border)}
.glass{background:var(--glass);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);border:1px solid var(--border)}
.t1{color:var(--text)}.t2{color:var(--muted)}
.grad-text{background:linear-gradient(92deg,#38bdf8,#818cf8,#e879f9);-webkit-background-clip:text;background-clip:text;color:transparent}
.grad-btn{background:linear-gradient(92deg,#0ea5e9,#6366f1);transition:.25s}
.grad-btn:hover{filter:brightness(1.15);transform:translateY(-1px)}
.grad-border{position:relative;background:var(--glass)}
.grad-border::before{content:"";position:absolute;inset:0;border-radius:inherit;padding:1.5px;background:linear-gradient(120deg,#38bdf8,#818cf8,#e879f9,#38bdf8);-webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);-webkit-mask-composite:xor;mask-composite:exclude;pointer-events:none;opacity:.7}
::-webkit-scrollbar{width:8px;height:8px}
::-webkit-scrollbar-thumb{background:rgba(148,163,184,.25);border-radius:8px}
::-webkit-scrollbar-track{background:transparent}
@keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
.msg{animation:fadeUp .35s ease both}
@keyframes pulse-dot{0%,80%,100%{transform:scale(.6);opacity:.4}40%{transform:scale(1);opacity:1}}
.tdot{width:7px;height:7px;border-radius:50%;background:var(--accent);animation:pulse-dot 1.2s infinite}
.tdot:nth-child(2){animation-delay:.15s}.tdot:nth-child(3){animation-delay:.3s}
@keyframes blink{50%{opacity:0}}
.caret{display:inline-block;width:2px;height:1.1em;background:var(--accent);vertical-align:-2px;animation:blink 1s infinite}
.mic-on{color:#f87171!important;animation:micpulse 1.2s infinite}
@keyframes micpulse{0%,100%{opacity:1}50%{opacity:.5}}
.btn-ic{color:var(--muted);transition:.2s;border:1px solid transparent}
.btn-ic:hover{color:var(--accent);border-color:var(--border);background:var(--glass)}
.hist-item:hover .del{opacity:1}
.tab-on{background:var(--glass);color:var(--accent)!important;border-color:var(--border)!important}
pre.codebox{background:rgba(2,6,23,.55);border:1px solid var(--border)}
html.light pre.codebox{background:rgba(15,23,42,.06)}
input[type=range]{accent-color:#38bdf8}
.chip{border:1px solid var(--border);color:var(--muted);transition:.2s}
.chip:hover{color:var(--accent);border-color:var(--accent)}
#monacoBox{min-height:55vh}
.drawer{transition:transform .3s ease}
@keyframes orb{0%,100%{transform:translate(0,0)}50%{transform:translate(30px,-24px)}}
.orb-anim{animation:orb 12s ease-in-out infinite}
.live-dot{width:8px;height:8px;border-radius:50%;background:#4ade80;animation:micpulse 1.4s infinite}
pre.setup{background:rgba(2,6,23,.5);border:1px solid var(--border);font-size:10.5px}
html.light pre.setup{background:rgba(15,23,42,.06)}
img.attach{max-width:180px;border-radius:14px;border:1px solid var(--border)}
</style>
</head>
<body class="antialiased">

<div class="blob orb-anim" style="width:480px;height:480px;background:#0ea5e9;top:-140px;left:-120px"></div>
<div class="blob orb-anim" style="width:420px;height:420px;background:#6366f1;bottom:-140px;right:-100px;animation-delay:-6s"></div>
<div class="blob" style="width:300px;height:300px;background:#e879f9;top:40%;left:55%;opacity:.18"></div>

<div class="relative z-10 flex flex-col h-screen">

  <!-- ══════════ HEADER ══════════ -->
  <header class="panel h-16 shrink-0 flex items-center gap-2 px-3 sm:px-5 border-x-0 border-t-0" style="border-radius:0">
    <button id="btnMenu" class="btn-ic lg:hidden p-2 rounded-xl" aria-label="Menu">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 6h16M4 12h16M4 18h16"/></svg>
    </button>
    <div class="flex items-center gap-3 min-w-0">
      <div class="w-10 h-10 rounded-2xl grad-btn flex items-center justify-center font-extrabold text-white text-sm shadow-lg shadow-sky-500/25 shrink-0">SB</div>
      <div class="min-w-0">
        <div class="font-bold leading-tight truncate flex items-center gap-2">SBSU <span class="grad-text">AI Studio</span>
          <span id="liveBadge" class="hidden items-center gap-1.5 text-[10px] font-bold text-green-400 glass px-2 py-0.5 rounded-full"><span class="live-dot"></span>LIVE</span>
        </div>
        <div class="text-[11px] t2 leading-tight truncate">Shaheed Bhagat Singh State University · Powered by Sofia</div>
      </div>
    </div>
    <div class="flex-1"></div>
    <button id="btnInstall" class="btn-ic hidden items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold" title="Install app">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 3v12m0 0l-4-4m4 4l4-4M4 21h16"/></svg>Install
    </button>
    <button id="btnConnect" class="btn-ic flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold" title="Connect a second device">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg><span class="hidden sm:inline">Connect</span>
    </button>
    <button id="btnApk" class="btn-ic hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold" title="Get Android APK">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="7" y="2" width="10" height="20" rx="2.5"/><path d="M11 18.5h2"/></svg>APK
    </button>
    <button id="btnZip" class="btn-ic flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold" title="Download project ZIP">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg><span class="hidden sm:inline">ZIP</span>
    </button>
    <button id="btnEdit" class="btn-ic flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold" title="Edit code in Monaco">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 20h9M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></svg><span class="hidden sm:inline">Edit</span>
    </button>
    <button id="btnTheme" class="btn-ic p-2.5 rounded-xl" title="Toggle theme">
      <svg id="icMoon" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 12.8A9 9 0 1111.2 3 7 7 0 0021 12.8z"/></svg>
      <svg id="icSun" class="hidden" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4l1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>
    </button>
    <button id="btnPreviewM" class="btn-ic lg:hidden p-2.5 rounded-xl" title="Preview">
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="4" width="18" height="14" rx="2"/><path d="M8 21h8"/></svg>
    </button>
  </header>

  <!-- ══════════ MAIN 3-PANE ══════════ -->
  <main class="flex-1 min-h-0 lg:grid lg:grid-cols-[288px_minmax(0,1fr)_400px] relative">
    <div id="backdrop" class="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 hidden lg:hidden"></div>

    <!-- LEFT SIDEBAR -->
    <aside id="sidebar" class="drawer fixed lg:static z-40 inset-y-0 left-0 w-72 lg:w-auto -translate-x-full lg:translate-x-0 panel border-y-0 border-l-0 flex flex-col min-h-0" style="border-radius:0">
      <div class="p-3">
        <button id="btnNewChat" class="grad-btn w-full py-2.5 rounded-2xl text-white text-sm font-semibold flex items-center justify-center gap-2 shadow-lg shadow-sky-500/20">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>New Chat
        </button>
      </div>
      <div class="px-4 pb-1 text-[11px] font-bold uppercase tracking-widest t2">Chats</div>
      <div id="histList" class="px-2 space-y-1 overflow-y-auto max-h-[32%]"></div>
      <div class="px-4 pt-3 pb-1 text-[11px] font-bold uppercase tracking-widest t2">Projects</div>
      <div id="projList" class="px-2 space-y-1 overflow-y-auto flex-1"></div>
      <div class="p-3 border-t flex items-center gap-2" style="border-color:var(--border)">
        <button id="btnSettings" class="btn-ic flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 11-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 110-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 114 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 110 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>Settings
        </button>
        <button id="btnExport" class="btn-ic flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>Export Chat
        </button>
      </div>
    </aside>

    <!-- CENTER : SOFIA -->
    <section class="flex flex-col min-h-0 h-full relative">
      <div id="hero" class="flex-1 flex flex-col items-center justify-center px-4 sm:px-8 text-center overflow-y-auto py-8">
        <div class="w-16 h-16 rounded-3xl grad-btn flex items-center justify-center text-white font-extrabold text-2xl shadow-2xl shadow-sky-500/30 mb-5">S</div>
        <h1 class="text-2xl sm:text-4xl font-extrabold leading-snug max-w-2xl min-h-[2.6em]"><span id="heroText"></span><span class="caret"></span></h1>
        <p class="t2 mt-3 mb-8 max-w-xl text-sm sm:text-base">Your friendly AI developer &amp; designer. Describe anything — I build it live, explain the design, and hand you the code.</p>
        <div class="grad-border rounded-3xl w-full max-w-2xl p-1.5 shadow-2xl shadow-sky-500/10">
          <div class="flex items-center gap-2 px-3">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2" stroke-linecap="round" class="shrink-0"><path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3zM19 15l.9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9L19 15z"/></svg>
            <input id="buildInput" class="flex-1 bg-transparent outline-none py-4 text-sm sm:text-base t1 placeholder:text-slate-500" placeholder="Build me a... (app, website, game, expense tracker)"/>
            <button class="micBtn btn-ic p-2.5 rounded-xl shrink-0" data-target="buildInput" title="Voice input">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10a7 7 0 0014 0M12 19v3"/></svg>
            </button>
            <button id="buildGo" class="grad-btn text-white text-sm font-semibold px-4 py-2.5 rounded-2xl shrink-0">Build</button>
          </div>
        </div>
        <div class="flex flex-wrap justify-center gap-2 mt-5 max-w-2xl">
          <button class="chip sugg px-3.5 py-1.5 rounded-full text-xs font-medium">Build me an expense tracker</button>
          <button class="chip sugg px-3.5 py-1.5 rounded-full text-xs font-medium">Build me a snake game</button>
          <button class="chip sugg px-3.5 py-1.5 rounded-full text-xs font-medium">Build me a portfolio website</button>
          <button class="chip sugg px-3.5 py-1.5 rounded-full text-xs font-medium">Build me a quiz app</button>
        </div>
      </div>

      <div id="chatPanel" class="hidden flex-col flex-1 min-h-0">
        <div class="px-3 sm:px-6 pt-3">
          <div class="glass rounded-2xl flex items-center gap-2 px-3 py-1.5">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2" stroke-linecap="round" class="shrink-0"><path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3z"/></svg>
            <input id="buildInput2" class="flex-1 bg-transparent outline-none py-2.5 text-sm t1 placeholder:text-slate-500" placeholder="Build something else..."/>
            <button class="micBtn btn-ic p-2 rounded-lg shrink-0" data-target="buildInput2" title="Voice input">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10a7 7 0 0014 0M12 19v3"/></svg>
            </button>
          </div>
        </div>
        <div id="msgs" class="flex-1 overflow-y-auto px-3 sm:px-6 py-4 space-y-4"></div>
        <div class="px-3 sm:px-6 pb-4">
          <div class="glass rounded-2xl flex items-end gap-1.5 p-2">
            <button id="btnAttach" class="btn-ic p-2.5 rounded-xl shrink-0" title="Attach PDF or image">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21.4 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 115.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"/></svg>
            </button>
            <input type="file" id="fileInput" accept="image/*,.pdf,application/pdf" class="hidden"/>
            <textarea id="chatInput" rows="1" class="flex-1 bg-transparent outline-none resize-none py-2.5 text-sm t1 placeholder:text-slate-500 max-h-36" placeholder="Message Sofia..."></textarea>
            <button class="micBtn btn-ic p-2.5 rounded-xl shrink-0" data-target="chatInput" title="Voice input">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 10a7 7 0 0014 0M12 19v3"/></svg>
            </button>
            <button id="btnSend" class="grad-btn p-2.5 rounded-xl text-white shrink-0" title="Send">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>
            </button>
          </div>
          <div class="text-center text-[10px] t2 mt-2">Sofia Phase 2 · on-device + optional Supabase cloud · chats &amp; projects saved locally</div>
        </div>
      </div>
    </section>

    <!-- RIGHT : LIVE PREVIEW -->
    <aside id="rightbar" class="drawer fixed lg:static z-40 inset-y-0 right-0 w-full sm:w-[420px] lg:w-auto translate-x-full lg:translate-x-0 panel border-y-0 border-r-0 flex flex-col min-h-0" style="border-radius:0">
      <div class="p-3 flex items-center gap-2 border-b" style="border-color:var(--border)">
        <div class="flex glass rounded-xl p-1 gap-1 text-xs font-semibold">
          <button id="tabPreview" class="tab-on px-3.5 py-1.5 rounded-lg t2 border border-transparent">Preview</button>
          <button id="tabCode" class="px-3.5 py-1.5 rounded-lg t2 border border-transparent">Code</button>
        </div>
        <div class="flex-1"></div>
        <button id="btnEdit2" class="btn-ic p-2 rounded-lg" title="Edit in Monaco">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 20h9M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
        </button>
        <button id="btnDlHtml" class="btn-ic p-2 rounded-lg" title="Download HTML">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
        </button>
        <button id="btnCloseR" class="btn-ic lg:hidden p-2 rounded-lg" title="Close">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>
      </div>
      <div id="panePreview" class="flex-1 min-h-0 relative">
        <iframe id="previewFrame" class="w-full h-full border-0 bg-white hidden" sandbox="allow-scripts"></iframe>
        <div id="previewEmpty" class="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
          <div class="w-14 h-14 rounded-2xl glass flex items-center justify-center mb-4">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2" stroke-linecap="round"><rect x="3" y="4" width="18" height="14" rx="2"/><path d="M8 21h8"/></svg>
          </div>
          <div class="font-semibold text-sm">Live Preview</div>
          <p class="t2 text-xs mt-1.5 max-w-[220px]">Ask Sofia to build anything and it renders here instantly — with the code and design rationale.</p>
        </div>
      </div>
      <div id="paneCode" class="flex-1 min-h-0 hidden flex-col">
        <div class="flex items-center gap-2 px-3 py-2">
          <span id="codeName" class="text-xs t2 truncate flex-1">—</span>
          <button id="btnCopy" class="btn-ic px-2.5 py-1.5 rounded-lg text-[11px] font-semibold">Copy</button>
        </div>
        <pre id="codeView" class="codebox flex-1 overflow-auto m-3 mt-0 rounded-2xl p-4 text-[11px] leading-relaxed t1" style="font-family:ui-monospace,Menlo,monospace">// build something and the code appears here</pre>
      </div>
      <div id="whyBox" class="hidden p-3 border-t" style="border-color:var(--border)">
        <div class="glass rounded-2xl p-3.5" style="border-left:3px solid var(--accent)">
          <div class="text-[11px] font-bold uppercase tracking-widest" style="color:var(--accent)">Why this design</div>
          <p id="whyText" class="text-xs t2 mt-1.5 leading-relaxed"></p>
        </div>
      </div>
    </aside>
  </main>
</div>

<!-- ══════════ SETTINGS MODAL (incl. Supabase Cloud) ══════════ -->
<div id="settingsModal" class="fixed inset-0 z-50 hidden items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
  <div class="panel rounded-3xl w-full max-w-md p-6 max-h-[88vh] overflow-y-auto">
    <div class="flex items-center justify-between mb-5">
      <h2 class="font-bold text-lg">Sofia Settings</h2>
      <button class="btn-ic p-2 rounded-xl closeModal"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg></button>
    </div>
    <label class="text-xs font-semibold t2">Model</label>
    <select id="setModel" class="glass w-full mt-1.5 mb-1 rounded-xl px-3 py-2.5 text-sm t1 outline-none">
      <option>Gemini 2.5 Flash</option><option>Groq · Llama 3.3 70B</option><option>OpenRouter · Auto</option>
    </select>
    <p class="text-[10px] t2 mb-4">Phase 2 runs on-device — the choice is saved with your workspace and shapes Sofia's style.</p>
    <label class="text-xs font-semibold t2 flex justify-between">Temperature <span id="tempVal" class="t1">0.7</span></label>
    <input id="setTemp" type="range" min="0" max="2" step="0.1" value="0.7" class="w-full mt-1.5 mb-4"/>
    <label class="text-xs font-semibold t2">Voice language</label>
    <select id="setLang" class="glass w-full mt-1.5 mb-4 rounded-xl px-3 py-2.5 text-sm t1 outline-none">
      <option value="en-IN">English (India)</option><option value="pa-IN">Punjabi (ਪੰਜਾਬੀ)</option><option value="hi-IN">Hindi (हिन्दी)</option>
    </select>
    <label class="flex items-center justify-between glass rounded-xl px-3 py-3 mb-4 cursor-pointer">
      <span class="text-sm font-medium">Sofia speaks replies <span class="t2 text-xs">(female voice)</span></span>
      <input id="setVoiceOut" type="checkbox" class="w-4 h-4" checked/>
    </label>
    <label class="text-xs font-semibold t2">Custom instructions for Sofia</label>
    <textarea id="setPrompt" rows="2" class="glass w-full mt-1.5 mb-5 rounded-xl px-3 py-2.5 text-sm t1 outline-none resize-none" placeholder="e.g. Always explain like I'm a beginner, use ₹ for prices..."></textarea>

    <!-- SUPABASE CLOUD -->
    <div class="glass rounded-2xl p-4 mb-5" style="border-left:3px solid #34d399">
      <div class="flex items-center justify-between">
        <div class="text-xs font-bold uppercase tracking-widest text-emerald-400">Cloud · Supabase (optional)</div>
        <span id="sbStatus" class="text-[10px] t2 font-semibold">localStorage mode</span>
      </div>
      <p class="text-[11px] t2 mt-2 leading-relaxed">Paste your project URL + anon key to sync projects to your own Supabase table. Without keys, everything stays on this device.</p>
      <input id="sbUrl" class="glass w-full mt-2.5 rounded-xl px-3 py-2 text-xs t1 outline-none" placeholder="SUPABASE_URL — https://xyz.supabase.co"/>
      <input id="sbKey" type="password" class="glass w-full mt-2 rounded-xl px-3 py-2 text-xs t1 outline-none" placeholder="SUPABASE_ANON_KEY"/>
      <div id="sbAuthBox" class="hidden mt-3">
        <div id="sbAuthedOut">
          <div class="flex gap-2">
            <input id="sbEmail" type="email" class="glass flex-1 rounded-xl px-3 py-2 text-xs t1 outline-none" placeholder="email"/>
            <input id="sbPass" type="password" class="glass flex-1 rounded-xl px-3 py-2 text-xs t1 outline-none" placeholder="password"/>
          </div>
          <div class="flex gap-2 mt-2">
            <button id="btnSbLogin" class="grad-btn flex-1 py-2 rounded-xl text-white text-xs font-semibold">Log in</button>
            <button id="btnSbSignup" class="glass flex-1 py-2 rounded-xl text-xs font-semibold">Sign up</button>
          </div>
        </div>
        <div id="sbAuthedIn" class="hidden items-center justify-between gap-2">
          <span id="sbUserLabel" class="text-xs t2 truncate"></span>
          <button id="btnSbOut" class="text-xs font-semibold text-red-400 shrink-0">Sign out</button>
        </div>
        <div id="sbAuthMsg" class="text-[10px] t2 mt-2"></div>
      </div>
      <details class="mt-3">
        <summary class="text-[11px] font-semibold cursor-pointer" style="color:var(--accent)">Setup steps + .env.example</summary>
        <ol class="text-[11px] t2 mt-2 space-y-1 list-decimal list-inside leading-relaxed">
          <li>Create a free project at <b>supabase.com</b> → Project Settings → API.</li>
          <li>Copy the <b>Project URL</b> and <b>anon public key</b> into the fields above.</li>
          <li>In the SQL editor, run:</li>
        </ol>
        <pre class="setup rounded-xl p-2.5 mt-1.5 overflow-x-auto t1">create table projects (
  id text primary key, owner uuid,
  name text, html text, rationale text,
  updated_at timestamptz
);
alter table projects enable row level security;
create policy "own rows" on projects for all
using (auth.uid() = owner)
with check (auth.uid() = owner);</pre>
        <div class="text-[11px] t2 mt-2">Your <b>.env.example</b> (also in the ZIP):</div>
        <pre class="setup rounded-xl p-2.5 mt-1.5 t1"># SBSU AI Studio — Supabase (optional)
SUPABASE_URL=
SUPABASE_ANON_KEY=</pre>
        <button id="btnCopyEnv" class="btn-ic mt-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold">Copy .env.example</button>
      </details>
    </div>

    <div class="flex gap-2">
      <button id="btnSaveSettings" class="grad-btn flex-1 py-2.5 rounded-2xl text-white text-sm font-semibold">Save</button>
      <button id="btnWipe" class="px-4 py-2.5 rounded-2xl text-sm font-semibold text-red-400 glass">Clear all data</button>
    </div>
  </div>
</div>

<!-- ══════════ CONNECT MODAL (WebRTC + QR) ══════════ -->
<div id="connectModal" class="fixed inset-0 z-50 hidden items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
  <div class="panel rounded-3xl w-full max-w-md p-6 max-h-[88vh] overflow-y-auto">
    <div class="flex items-center justify-between mb-1">
      <h2 class="font-bold text-lg">Connect a device</h2>
      <button class="btn-ic p-2 rounded-xl closeModal"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg></button>
    </div>
    <p class="text-[11px] t2 leading-relaxed mb-4">Scan the QR with a phone on any network. It opens a collaboration page → the other person taps <b>Allow</b> → your live preview, code edits and chat sync over a WebRTC data channel. <b>Project sync only — no device control.</b></p>
    <div class="flex justify-center">
      <div class="bg-white p-3 rounded-2xl shadow-xl">
        <div id="qrBox" class="w-[180px] h-[180px] flex items-center justify-center text-slate-400 text-xs">starting…</div>
      </div>
    </div>
    <div class="text-center mt-3">
      <div class="text-[10px] t2 uppercase tracking-widest font-bold">Peer ID</div>
      <div id="peerIdLabel" class="text-xs font-mono t1 select-all">—</div>
      <div id="connStatus" class="text-[11px] t2 mt-1">Initialising WebRTC…</div>
    </div>
    <div class="mt-4">
      <div class="text-[10px] t2 uppercase tracking-widest font-bold mb-2">Connection path</div>
      <div class="grid grid-cols-3 gap-2 text-[11px] font-semibold">
        <button id="modeWifi" class="chip rounded-xl px-2 py-2.5">Wi-Fi · Hotspot</button>
        <button id="modeHotspot" class="chip rounded-xl px-2 py-2.5">Hotspot · Wi-Fi</button>
        <button id="modeBt" class="chip rounded-xl px-2 py-2.5">Bluetooth</button>
      </div>
      <p id="modeInfo" class="text-[11px] t2 mt-2 leading-relaxed">Both devices on the same Wi-Fi? Just scan the QR — WebRTC picks the fastest route automatically.</p>
    </div>
    <div class="mt-4">
      <div class="text-[10px] t2 uppercase tracking-widest font-bold mb-2">Invite via</div>
      <div class="grid grid-cols-3 gap-2 text-[11px] font-semibold">
        <button id="shareWa" class="chip rounded-xl px-2 py-2.5" style="color:#25D366">WhatsApp</button>
        <button id="shareFb" class="chip rounded-xl px-2 py-2.5" style="color:#60a5fa">Facebook</button>
        <button id="shareIg" class="chip rounded-xl px-2 py-2.5" style="color:#e879f9">Instagram</button>
      </div>
    </div>
    <div id="peerList" class="mt-4 space-y-1.5"></div>
  </div>
</div>

<!-- ══════════ APK MODAL ══════════ -->
<div id="apkModal" class="fixed inset-0 z-50 hidden items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
  <div class="panel rounded-3xl w-full max-w-md p-6">
    <div class="flex items-center justify-between mb-4">
      <h2 class="font-bold text-lg">Get the Android APK</h2>
      <button class="btn-ic p-2 rounded-xl closeModal"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg></button>
    </div>
    <p class="text-xs t2 leading-relaxed">SBSU AI Studio is a full PWA — manifest + service worker are already built in. PWABuilder wraps that same PWA into a signed Android package, no native code needed:</p>
    <ol class="text-xs t2 mt-3 space-y-2 list-decimal list-inside leading-relaxed">
      <li>Click <b>ZIP</b> in the header, unzip, deploy to Vercel (<span class="t1">vercel deploy</span> or drag into vercel.com/new).</li>
      <li>Open <b>pwabuilder.com</b> and paste your HTTPS URL.</li>
      <li>It reads the manifest (