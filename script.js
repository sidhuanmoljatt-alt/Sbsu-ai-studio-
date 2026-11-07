// ============================================
// File 11: script.js
// Unbeatable App - COMMON JS
// Shared functions used by ALL pages
// Login check, Auto-Shifter, Share, Save, Popup
// ============================================

// ---------- 0. SAFETY: CONFIG fallback if config.js missing ----------
if (typeof CONFIG === 'undefined') {
  var CONFIG = {
    appName: "Unbeatable App",
    version: "1.0.0",
    githubUsername: "YOUR-GITHUB-USERNAME",
    githubRepo: "unbeatable-app",
    whatsappNumber: "919999999999",
    storage: {
      myApps: "unbeatable_my_apps",
      userKeys: "unbeatable_user_keys",
      settings: "unbeatable_settings",
      userProfile: "unbeatable_user",
      theme: "unbeatable_theme",
      language: "unbeatable_lang"
    }
  };
  console.warn("⚠️ config.js not loaded - using fallback CONFIG");
}

// ---------- 1. TOAST ----------
function showToast(msg, duration = 2500) {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add('show');
  toast.style.display = 'block';
  setTimeout(() => {
    toast.classList.remove('show');
    toast.style.display = 'none';
  }, duration);
}

// ---------- 2. STATUS BOX ----------
function showStatus(elId, msg, type = 'info') {
  const el = typeof elId === 'string' ? document.getElementById(elId) : elId;
  if (!el) return;
  el.textContent = msg;
  el.className = 'status ' + type + ' show';
  el.style.display = 'block';
  if (type === 'ok' || type === 'info') {
    setTimeout(() => { el.style.display = 'none'; }, 4000);
  }
}

// ---------- 3. THEME + LANGUAGE (from Settings) ----------
function applySavedTheme() {
  const theme = localStorage.getItem(CONFIG.storage.theme) || 'dark';
  document.body.classList.toggle('light', theme === 'light');
  const themeSelect = document.getElementById('themeSelect');
  if (themeSelect) themeSelect.value = theme;
}
function applySavedLanguage() {
  const lang = localStorage.getItem(CONFIG.storage.language) || 'en';
  document.body.setAttribute('lang', lang);
}
function setTheme(theme) {
  localStorage.setItem(CONFIG.storage.theme, theme);
  applySavedTheme();
  showToast(theme === 'light' ? '☀️ Light theme' : '🌙 Dark theme');
}
function setLanguage(lang) {
  localStorage.setItem(CONFIG.storage.language, lang);
  applySavedLanguage();
  showToast(lang === 'hi' ? 'भाषा: हिन्दी' : 'Language: English');
}

// ---------- 4. LOGIN CHECK (Puter) ----------
function isLoggedIn() {
  // Puter auth check - if puter not loaded, check localStorage fallback
  if (typeof puter !== 'undefined' && puter.auth && puter.auth.isSignedIn) {
    try { return puter.auth.isSignedIn(); } catch (e) { }
  }
  return !!localStorage.getItem(CONFIG.storage.userProfile);
}

function getCurrentUser() {
  try {
    const raw = localStorage.getItem(CONFIG.storage.userProfile);
    return raw ? JSON.parse(raw) : null;
  } catch (e) { return null; }
}

async function requireLogin(actionName = 'save') {
  if (isLoggedIn()) return true;
  const goLogin = confirm(`🔐 Login needed to ${actionName}.\n\nLogin with Puter (Free, no password)?\n\nClick OK to Login, Cancel to continue as Guest.`);
  if (!goLogin) return false;
  return await loginWithPuter();
}

async function loginWithPuter() {
  if (typeof puter === 'undefined') {
    showToast('Puter.js not loaded - check internet');
    return false;
  }
  try {
    const user = await puter.auth.signIn();
    if (user) {
      localStorage.setItem(CONFIG.storage.userProfile, JSON.stringify({
        username: user.username || user.uuid || 'user',
        uuid: user.uuid || '',
        loginAt: Date.now()
      }));
      showToast('✅ Logged in as ' + (user.username || 'user'));
      updateLoginButtons();
      return true;
    }
  } catch (e) {
    showToast('Login cancelled or failed');
  }
  return false;
}

async function logoutUser() {
  if (typeof puter !== 'undefined' && puter.auth) {
    try { await puter.auth.signOut(); } catch (e) { }
  }
  localStorage.removeItem(CONFIG.storage.userProfile);
  showToast('Logged out');
  updateLoginButtons();
}

function updateLoginButtons() {
  const btns = document.querySelectorAll('[data-login-btn]');
  const user = getCurrentUser();
  btns.forEach(btn => {
    if (user) {
      btn.textContent = '👋 ' + user.username + ' (Logout)';
      btn.onclick = () => { if (confirm('Logout?')) logoutUser(); };
    } else {
      btn.textContent = '🔐 Login';
      btn.onclick = () => loginWithPuter();
    }
  });
}

// ---------- 5. AUTO-SHIFTER - Puter → Pollinations → Keys → Popup ----------
async function autoShiftGenerate(prompt, options = {}) {
  const systemPrompt = options.systemPrompt || 'You are an expert web developer. Return ONLY complete HTML code in one file, with <style> and <script> inside. No markdown, no explanation.';
  const fullPrompt = systemPrompt + '\n\nUSER REQUEST: ' + prompt;

  // --- Try 1: Puter.js (Free) ---
  try {
    if (typeof puter !== 'undefined' && puter.ai && puter.ai.chat) {
      showToast('🤖 Trying Puter AI (Free)...');
      const res = await puter.ai.chat(fullPrompt, { model: 'gpt-4o-mini' });
      const text = res?.message?.content || res?.text || '';
      if (text && text.length > 100) {
        console.log('✅ Generated via Puter');
        return { success: true, code: cleanAIResponse(text), provider: 'puter' };
      }
    }
  } catch (e) { console.warn('Puter failed:', e.message); }

  // --- Try 2: Pollinations (Free, No Login) ---
  try {
    showToast('🤖 Trying Pollinations (Free)...');
    const url = 'https://text.pollinations.ai/' + encodeURIComponent(fullPrompt);
    const res = await fetch(url);
    const text = await res.text();
    if (text && text.length > 100) {
      console.log('✅ Generated via Pollinations');
      return { success: true, code: cleanAIResponse(text), provider: 'pollinations' };
    }
  } catch (e) { console.warn('Pollinations failed:', e.message); }

  // --- Try 3: User's Own Keys (from Keys page) ---
  try {
    const keys = getUserKeys();
    const openaiKey = keys.find(k => k.provider === 'openai' || k.name.toLowerCase().includes('openai'));
    if (openaiKey) {
      showToast('🔑 Trying Your OpenAI Key...');
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + openaiKey.value
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: fullPrompt }],
          max_tokens: 4000
        })
      });
      const data = await res.json();
      const text = data?.choices?.[0]?.message?.content || '';
      if (text) {
        console.log('✅ Generated via User Key');
        return { success: true, code: cleanAIResponse(text), provider: 'user-key' };
      }
    }
  } catch (e) { console.warn('User key failed:', e.message); }

  // --- Try 4: Popup - Ask user to paste code / use ChatGPT ---
  console.log('⚠️ All AI failed - showing popup');
  showPopup(
    'All Free AI Busy',
    'All free AI are busy right now. Try:\n\n1. Wait 1 minute and try again\n2. Go to ChatGPT / Gemini, paste your prompt, copy the HTML code here\n3. Add your own API Key in Keys page\n\nClick "Paste Code" to paste code manually.'
  );
  return { success: false, provider: 'none', needManual: true };
}

// Clean AI response - remove ```html ... ```
function cleanAIResponse(text) {
  let t = text.trim();
  // Remove markdown code fences
  t = t.replace(/^```html\s*/i, '').replace(/^```\s*/i, '');
  t = t.replace(/\s*```$/i, '');
  // If AI added explanation before <html, cut to first < or <!DOCTYPE
  const htmlStart = t.search(/<!DOCTYPE|<html|<div|<style|<h1/i);
  if (htmlStart > 0 && htmlStart < 500) t = t.slice(htmlStart);
  return t.trim();
}

// ---------- 6. SAVE APP ----------
function saveApp(appData) {
  // appData: { name, type, code, prompt }
  const key = CONFIG.storage.myApps;
  let apps = [];
  try { apps = JSON.parse(localStorage.getItem(key) || '[]'); } catch (e) { apps = []; }

  const newApp = {
    id: 'app_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
    name: appData.name || 'Untitled App',
    type: appData.type || 'app',
    code: appData.code || '',
    prompt: appData.prompt || '',
    created: Date.now(),
    source: 'LocalStorage'
  };
  apps.unshift(newApp);
  localStorage.setItem(key, JSON.stringify(apps));

  // Also try Puter KV (if logged in)
  saveToPuterKV(apps);

  showToast('✅ Saved to My Apps');
  return newApp;
}

async function saveToPuterKV(apps) {
  if (typeof puter === 'undefined' || !isLoggedIn()) return;
  try {
    await puter.kv.set('my_apps_list', JSON.stringify(apps));
    console.log('✅ Saved to Puter KV');
  } catch (e) { console.warn('Puter KV save failed', e); }
}

// ---------- 7. SHARE ----------
function shareApp(appName, appLink) {
  const text = `Check my app: ${appName} - Made with ${CONFIG.appName} 🚀\n${appLink}`;
  // Try native share
  if (navigator.share) {
    navigator.share({ title: appName, text: text, url: appLink }).catch(() => copyToClipboard(text));
  } else {
    copyToClipboard(text);
  }
}

function shareOnWhatsApp(text) {
  const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
  window.open(url, '_blank');
}

async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    showToast('📋 Copied to clipboard ✓');
    return true;
  } catch (e) {
    // Fallback for old browsers
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    showToast('📋 Copied ✓');
    return true;
  }
}

// ---------- 8. POPUP ----------
function showPopup(title, message) {
  let modal = document.getElementById('globalPopup');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'globalPopup';
    modal.className = 'modal';
    modal.innerHTML = `
      <div class="modal-box">
        <h3 id="globalPopupTitle"></h3>
        <p id="globalPopupMsg" style="white-space:pre-line;margin-top:10px;color:var(--text-muted);font-size:14px"></p>
        <div style="display:flex;gap:10px;margin-top:16px">
          <button onclick="closeGlobalPopup()">OK</button>
          <button class="secondary" onclick="closeGlobalPopup()">Close</button>
        </div>
      </div>`;
    document.body.appendChild(modal);
    modal.addEventListener('click', (e) => { if (e.target.id === 'globalPopup') closeGlobalPopup(); });
  }
  document.getElementById('globalPopupTitle').textContent = title;
  document.getElementById('globalPopupMsg').textContent = message;
  modal.classList.add('show');
}
function closeGlobalPopup() {
  const m = document.getElementById('globalPopup');
  if (m) m.classList.remove('show');
}

// ---------- 9. USER KEYS (from Keys page) ----------
function getUserKeys() {
  try {
    const raw = localStorage.getItem(CONFIG.storage.userKeys) ||
                localStorage.getItem('keys_host_share_v1') || '[]';
    const arr = JSON.parse(raw);
    // Decode if base64 (keys-host-share format)
    return arr.map(k => {
      let val = k.value || '';
      try {
        // Try decode base64 - if fails, keep original
        if (val && /^[A-Za-z0-9+/=]+$/.test(val) && val.length > 20) {
          const decoded = decodeURIComponent(escape(atob(val)));
          if (decoded && decoded.length > 0) val = decoded;
        }
      } catch (e) {}
      return { ...k, value: val };
    });
  } catch (e) { return []; }
}

// ---------- 10. DOWNLOAD HELPER ----------
function downloadFile(filename, content, type = 'text/html') {
  const blob = new Blob([content], { type });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
  showToast('⬇️ Downloaded ' + filename);
}

// ---------- 11. PREVIEW HELPER ----------
function openPreview(code, title = 'Preview') {
  const w = window.open('', '_blank');
  if (!w) { showToast('Allow popups to preview'); return; }
  w.document.write(code);
  w.document.close();
  w.document.title = title;
}

// ---------- 12. ADS HELPER (AdSense - only if approved) ----------
function loadAds() {
  // Only load if showAds true and adsenseId set in config.js
  if (!CONFIG.showAds || !CONFIG.adsenseId) {
    // Hide all ad boxes
    document.querySelectorAll('.ad-box').forEach(el => {
      el.style.display = 'none';
    });
    return;
  }
  // If approved, AdSense script would load here
  console.log('Ads enabled:', CONFIG.adsenseId);
}

// ---------- 13. INIT - Runs on EVERY page ----------
document.addEventListener('DOMContentLoaded', () => {
  applySavedTheme();
  applySavedLanguage();
  updateLoginButtons();
  loadAds();

  // Auto-wire theme / language selects if they exist
  const themeSel = document.getElementById('themeSelect');
  if (themeSel) themeSel.addEventListener('change', (e) => setTheme(e.target.value));
  const langSel = document.getElementById('langSelect');
  if (langSel) langSel.addEventListener('change', (e) => setLanguage(e.target.value));

  console.log(`✅ ${CONFIG.appName} v${CONFIG.version} - script.js loaded`);
});

// Expose globally for inline onclick
window.showToast = showToast;
window.showStatus = showStatus;
window.showPopup = showPopup;
window.closeGlobalPopup = closeGlobalPopup;
window.copyToClipboard = copyToClipboard;
window.shareApp = shareApp;
window.shareOnWhatsApp = shareOnWhatsApp;
window.saveApp = saveApp;
window.autoShiftGenerate = autoShiftGenerate;
window.loginWithPuter = loginWithPuter;
window.logoutUser = logoutUser;
window.requireLogin = requireLogin;
window.downloadFile = downloadFile;
window.openPreview = openPreview;
window.getUserKeys = getUserKeys;
