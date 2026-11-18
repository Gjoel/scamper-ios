// Builds the iPhone app's web content (www/) from the Scamper web app (web/index.html).
// It bundles the fonts, uses the iPhone's own Spanish voice, and removes website-only bits.
const fs = require("fs"), path = require("path");
const ROOT = path.join(__dirname, "..");
const WWW = path.join(ROOT, "www");
let html = fs.readFileSync(path.join(ROOT, "web", "index.html"), "utf8");

function rep(oldStr, newStr) {
  const n = html.split(oldStr).length - 1;
  if (n !== 1) throw new Error("Expected 1 match, found " + n + " for: " + oldStr.slice(0, 80));
  html = html.replace(oldStr, newStr);
}

// 1. Fonts bundled inside the app instead of loaded from Google
rep('<link rel="preconnect" href="https://fonts.googleapis.com">\n<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Young+Serif&family=Figtree:wght@400;500;600;700&family=JetBrains+Mono:wght@500&display=swap">',
    '<link rel="stylesheet" href="fonts/fonts.css">');
const fonts = [
  ["Young Serif", 400, "young-serif", "young-serif-latin-400-normal.woff2"],
  ["Figtree", 400, "figtree", "figtree-latin-400-normal.woff2"],
  ["Figtree", 500, "figtree", "figtree-latin-500-normal.woff2"],
  ["Figtree", 600, "figtree", "figtree-latin-600-normal.woff2"],
  ["Figtree", 700, "figtree", "figtree-latin-700-normal.woff2"],
  ["JetBrains Mono", 500, "jetbrains-mono", "jetbrains-mono-latin-500-normal.woff2"]
];
fs.rmSync(WWW, { recursive: true, force: true });
fs.mkdirSync(path.join(WWW, "fonts"), { recursive: true });
let css = "";
for (const [family, weight, pkg, file] of fonts) {
  fs.copyFileSync(path.join(ROOT, "node_modules", "@fontsource", pkg, "files", file), path.join(WWW, "fonts", file));
  css += "@font-face { font-family: \"" + family + "\"; font-style: normal; font-weight: " + weight + "; font-display: swap; src: url(\"" + file + "\") format(\"woff2\"); }\n";
}
fs.writeFileSync(path.join(WWW, "fonts", "fonts.css"), css);

// 2. Feel like an app: no pinch zoom, no text selection pop-ups, room for the notch
rep('<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">',
    '<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover">');
rep('</style>', `
  /* iPhone app */
  html, body { -webkit-user-select: none; user-select: none; -webkit-touch-callout: none; -webkit-tap-highlight-color: transparent; overscroll-behavior: none; }
  input, textarea { -webkit-user-select: text; user-select: text; }
  body { padding-top: env(safe-area-inset-top); }
  .lesson { padding-top: env(safe-area-inset-top); }
  .tailwrap .note { display: none; }
</style>`);

// 3. No service worker or install prompts inside the app
rep(`<script>
if ("serviceWorker" in navigator && (location.protocol === "https:" || location.hostname === "localhost")) {
  window.addEventListener("load", function () { navigator.serviceWorker.register("sw.js").catch(function () {}); });
}
</script>
`, "");
rep("  function installHtml() {", "  function installHtml() {\n    if (window.Capacitor) return \"\";");
rep("  function installBannerHtml() {", "  function installBannerHtml() {\n    if (window.Capacitor) return \"\";");
rep("Progress is saved in this browser.", "Progress is saved on this iPhone.");
rep("Your progress is saved in this browser on this device.", "Your progress is saved on this iPhone.");

// 4. The iPhone's own Spanish voice (plays even when the silent switch is on)
rep('  var canSpeak = typeof window.speechSynthesis !== "undefined";', `  var NATIVE_TTS = null;
  try {
    var Cap = window.Capacitor;
    if (Cap && Cap.isNativePlatform && Cap.isNativePlatform()) NATIVE_TTS = (Cap.Plugins && Cap.Plugins.TextToSpeech) || (Cap.registerPlugin && Cap.registerPlugin("TextToSpeech"));
  } catch (e) {}
  var canSpeak = !!NATIVE_TTS || typeof window.speechSynthesis !== "undefined";`);
rep("  function speak(text, rate) {\n    if (!canSpeak || !text) return;", `  function speak(text, rate) {
    if (!canSpeak || !text) return;
    if (NATIVE_TTS) {
      var said = String(text).replace(/\\.\\.\\./g, "").replace(/___/g, "");
      Promise.resolve(NATIVE_TTS.stop()).catch(function () {}).then(function () {
        return NATIVE_TTS.speak({ text: said, lang: "es-MX", rate: (rate || 0.9) * 0.95, pitch: 1.0, volume: 1.0, category: "playback" });
      }).catch(function () {
        return NATIVE_TTS.speak({ text: said, lang: "es-ES", rate: rate || 0.9, category: "playback" }).catch(function () { soundTrouble("error"); });
      });
      return;
    }`);
rep("  function applyTheme() {", `  function applyTheme() {
    try { var SB = window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.StatusBar; if (SB) SB.setStyle({ style: (state.theme === "dark" || (state.theme === "system" && window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches)) ? "DARK" : "LIGHT" }); } catch (e) {}`);
rep("  function soundStatus() {", `  function soundStatus() {
    if (NATIVE_TTS) return { ok: true, msg: "Using your iPhone's Spanish voice (Latin American)." };`);

fs.writeFileSync(path.join(WWW, "index.html"), html);
fs.cpSync(path.join(ROOT, "web", "icons"), path.join(WWW, "icons"), { recursive: true });
console.log("www built:", (html.length / 1024).toFixed(0) + " KB");
