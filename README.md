# Aura Translate 🌌

Aura Translate is a premium, high-fidelity neural AI translation web application featuring a beautiful glassmorphic dark-mode interface, real-time debounced translation, and integrated speech tools.

![Aura Translate Workspace Mockup](https://raw.githubusercontent.com/abdulhaseeb4183/CodeAlpha_TranslationTool/main/screenshot_placeholder.png) <!-- Note: Replace with actual screenshot path once pushed -->

## ✨ Features

- 💎 **Premium Glassmorphic UI**: Beautiful dark-mode dashboard with custom ambient neon glows, thin frosted borders, custom scrollbars, and high-end typography (Outfit + Plus Jakarta Sans).
- 🔄 **Double-Engine Fallback Pipeline**:
  - **Primary**: Google Translate Free Web API (client=gtx) for fast, robust, and zero-auth translation.
  - **Fallback**: MyMemory Translation API for secondary validation and failover safety.
- ⚡ **Debounced Real-Time Translation**: Automatically processes translations 850ms after you finish typing, or manually via the "Translate" button or `Ctrl + Enter` key shortcut.
- 🔍 **Auto-Language Detection**: Automatic source language identification with immediate user-facing status feedback.
- 🎙️ **Voice Dictation (Speech-to-Text)**: Speech recognition via the HTML5 Web Speech API featuring an active recording visual status pulse.
- 🔊 **Voice Playback (Text-to-Speech)**: Native text-to-speech synthesis utilizing language-specific accents matched to target output codes.
- 💾 **Translation History Log**: Cached list (up to 5 entries) stored in `localStorage` with one-click load recovery.
- 📋 **Micro-Interactions**: One-click clear inputs, copy-to-clipboard actions with visual status tooltip confirmations, and text character counters.

---

## 🛠️ Technology Stack

- **Frontend**: Pure HTML5 (Semantic Structure, Inline SVGs)
- **Styling**: Modern CSS3 (CSS Variables, Flexbox/Grid layouts, Backdrop filters, Animations)
- **Engine Logic**: Vanilla JavaScript (Async/Await Fetch APIs, Web Speech Recognition/Synthesis APIs, LocalStorage API)

---

## 🚀 Running the Project Locally

No subscription key, setup, or npm install is required! You can open the project directly or serve it locally.

### Method 1: Double-Click
Simply double-click the `index.html` file in your file explorer to open it in your browser.

### Method 2: Local HTTP Server (Recommended)
To prevent potential browser origin sandbox issues with microphone dictation or fetch requests:

#### Using Python
Run the following command in the project directory:
```bash
python -m http.server 8000
```
Then navigate to `http://localhost:8000` in your web browser.

#### Using Node.js (npx)
Run the following command:
```bash
npx http-server -p 8000
```
Then open `http://localhost:8000` in your browser.

---

## 📂 Project Structure

```
├── index.html     # Upgraded responsive HTML structure and inline SVGs
├── styles.css     # Premium styling system, ambient glows, and animations
├── script.js     # Translation API pipelines, speech APIs, and history logic
└── README.md      # Project documentation
```

---

