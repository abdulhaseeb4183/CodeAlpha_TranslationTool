// D:\code_task1\script.js

// Language support configuration
const languages = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'zh', name: 'Chinese (Simplified)' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'it', name: 'Italian' },
  { code: 'ru', name: 'Russian' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'hi', name: 'Hindi' },
  { code: 'ar', name: 'Arabic' },
  { code: 'tr', name: 'Turkish' },
  { code: 'nl', name: 'Dutch' },
  { code: 'pl', name: 'Polish' },
  { code: 'sv', name: 'Swedish' },
  { code: 'vi', name: 'Vietnamese' },
  { code: 'th', name: 'Thai' },
  { code: 'id', name: 'Indonesian' },
  { code: 'el', name: 'Greek' },
  { code: 'he', name: 'Hebrew' },
  { code: 'uk', name: 'Ukrainian' },
  { code: 'ro', name: 'Romanian' },
  { code: 'cs', name: 'Czech' },
  { code: 'da', name: 'Danish' },
  { code: 'fi', name: 'Finnish' },
  { code: 'hu', name: 'Hungarian' },
  { code: 'no', name: 'Norwegian' }
];

// DOM Element references
const sourceSelect = document.getElementById('source-language');
const targetSelect = document.getElementById('target-language');
const sourceText = document.getElementById('source-text');
const translatedText = document.getElementById('translated-text');
const translateButton = document.getElementById('translate-button');
const clearAllButton = document.getElementById('clear-all-button');
const clearSourceButton = document.getElementById('clear-source-button');
const copyButton = document.getElementById('copy-button');
const speakButton = document.getElementById('speak-button');
const dictateButton = document.getElementById('dictate-button');
const swapButton = document.getElementById('swap-button');
const statusMessage = document.getElementById('status-message');
const sourceCharCount = document.getElementById('source-char-count');
const targetCharCount = document.getElementById('target-char-count');
const historyList = document.getElementById('history-list');
const clearHistoryButton = document.getElementById('clear-history-button');

// Global speech recognition variable
let recognition = null;
let isRecording = false;
let debounceTimer = null;

// Initialize language dropdowns
const initializeLanguages = () => {
  // Clear existing items
  sourceSelect.innerHTML = '';
  targetSelect.innerHTML = '';

  // Add Auto Detect option to Source dropdown
  const autoOption = document.createElement('option');
  autoOption.value = 'auto';
  autoOption.textContent = '✨ Auto Detect';
  sourceSelect.appendChild(autoOption);

  // Populate translation languages
  languages.forEach(lang => {
    const optSource = document.createElement('option');
    optSource.value = lang.code;
    optSource.textContent = lang.name;
    sourceSelect.appendChild(optSource);

    const optTarget = document.createElement('option');
    optTarget.value = lang.code;
    optTarget.textContent = lang.name;
    targetSelect.appendChild(optTarget);
  });

  // Default selections
  sourceSelect.value = 'auto';
  targetSelect.value = 'es';
};

// Custom Status Notification Manager
const setStatus = (message, type = 'info', persist = false) => {
  statusMessage.textContent = '';
  statusMessage.className = 'status-message';
  
  if (!message) {
    statusMessage.classList.remove('show');
    return;
  }

  // Create status text element
  const textSpan = document.createElement('span');
  textSpan.textContent = message;

  // Add loading spinner if type is 'translating'
  if (type === 'translating') {
    const spinner = document.createElement('span');
    spinner.className = 'status-message-spinner';
    statusMessage.appendChild(spinner);
    statusMessage.classList.add('status-info');
  } else if (type === 'success') {
    statusMessage.classList.add('status-success');
  } else if (type === 'error') {
    statusMessage.classList.add('status-error');
  } else {
    statusMessage.classList.add('status-info');
  }

  statusMessage.appendChild(textSpan);
  statusMessage.classList.add('show');

  // Automatically dismiss after 4 seconds unless flagged to persist
  if (!persist && type !== 'translating') {
    setTimeout(() => {
      if (statusMessage.textContent.includes(message)) {
        statusMessage.classList.remove('show');
      }
    }, 4000);
  }
};

// Swapping logic with 'auto' safety guard
const swapLanguages = () => {
  const sourceVal = sourceSelect.value;
  const targetVal = targetSelect.value;

  if (sourceVal === 'auto') {
    // If it's auto-detect, set source to target and target to 'en' (or 'es' if target was 'en')
    sourceSelect.value = targetVal;
    targetSelect.value = targetVal === 'en' ? 'es' : 'en';
  } else {
    sourceSelect.value = targetVal;
    targetSelect.value = sourceVal;
  }

  // Also swap text box contents if there is translation
  const srcText = sourceText.value;
  const trText = translatedText.value;

  if (srcText && trText) {
    sourceText.value = trText;
    translatedText.value = srcText;
    sourceCharCount.textContent = trText.length;
    targetCharCount.textContent = srcText.length;
  }

  // Trigger translation if source text has content
  if (sourceText.value.trim()) {
    translateText();
  }
};

// Core Translation Logic (Google API with MyMemory fallback)
const translateText = async () => {
  const text = sourceText.value.trim();
  const source = sourceSelect.value;
  const target = targetSelect.value;

  if (!text) {
    translatedText.value = '';
    targetCharCount.textContent = '0';
    setStatus('');
    return;
  }

  if (source === target) {
    setStatus('Source and target languages must be different.', 'error');
    return;
  }

  setStatus('Translating language...', 'translating');
  translateButton.disabled = true;

  try {
    // 1. Try Google Translate Free Web API (client=gtx)
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${source}&tl=${target}&dt=t&q=${encodeURIComponent(text)}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error('Google Translate request failed');
    }

    const data = await response.json();
    
    // Safely piece together translation output (Google chunk responses)
    if (!data || !data[0]) {
      throw new Error('Invalid translation format received');
    }
    
    const translated = data[0].map(chunk => chunk[0]).join('');
    translatedText.value = translated;
    targetCharCount.textContent = translated.length;

    // Handle auto-detection feedback
    if (source === 'auto' && data[2]) {
      const detectedCode = data[2];
      const matchLang = languages.find(l => l.code === detectedCode);
      const name = matchLang ? matchLang.name : detectedCode.toUpperCase();
      setStatus(`Translation complete. (Auto-detected: ${name})`, 'success');
    } else {
      setStatus('Translation complete.', 'success');
    }

    // Add translation to logs
    addToHistory(text, translated, source === 'auto' ? (data[2] || 'auto') : source, target);

  } catch (error) {
    console.warn('Primary translation API failed. Trying fallback API...', error);
    
    // 2. Fallback to MyMemory translation API
    try {
      const pair = `${source === 'auto' ? 'autodetect' : source}|${target}`;
      const fallbackUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${pair}`;
      const response = await fetch(fallbackUrl);

      if (!response.ok) {
        throw new Error('Fallback translation request failed');
      }

      const data = await response.json();
      
      if (data.responseStatus !== 200) {
        throw new Error(data.responseDetails || 'Fallback API error');
      }

      const translated = data.responseData.translatedText;
      translatedText.value = translated;
      targetCharCount.textContent = translated.length;
      setStatus('Translation complete (via backup engine).', 'success');

      // Add translation to logs
      addToHistory(text, translated, source, target);

    } catch (fallbackError) {
      console.error('All translation APIs failed:', fallbackError);
      setStatus('Error: Could not connect to translation servers. Please check your internet connection.', 'error', true);
    }
  } finally {
    translateButton.disabled = false;
  }
};

// Clipboard copy mechanism
const copyToClipboard = async () => {
  const text = translatedText.value.trim();
  if (!text) {
    setStatus('There is no translated text to copy.', 'error');
    return;
  }

  try {
    await navigator.clipboard.writeText(text);
    
    // Toggle tooltip visual indicator
    copyButton.setAttribute('data-tooltip', 'Copied!');
    copyButton.classList.add('tooltip-active');
    
    setTimeout(() => {
      copyButton.setAttribute('data-tooltip', 'Copy to Clipboard');
      copyButton.classList.remove('tooltip-active');
    }, 2000);

    setStatus('Translation copied to clipboard.', 'success');
  } catch (error) {
    setStatus('Failed to copy text: ' + error.message, 'error');
  }
};

// Text to Speech playback
const playTextToSpeech = () => {
  const text = translatedText.value.trim();
  const langCode = targetSelect.value;

  if (!text) {
    setStatus('There is no translation text to play.', 'error');
    return;
  }

  // Toggle synthesis if active
  if (window.speechSynthesis.speaking) {
    window.speechSynthesis.cancel();
    setStatus('Playback stopped.');
    return;
  }

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = langCode;

  // Search local browser voices for suitable target accent matches
  const voices = window.speechSynthesis.getVoices();
  const matchedVoice = voices.find(voice => 
    voice.lang.toLowerCase() === langCode.toLowerCase() ||
    voice.lang.toLowerCase().startsWith(langCode.toLowerCase() + '-')
  );

  if (matchedVoice) {
    utterance.voice = matchedVoice;
  }

  utterance.onend = () => {
    setStatus('Playback finished.');
  };

  utterance.onerror = (e) => {
    console.error('Speech synthesis error:', e);
    setStatus('Playback failed or interrupted.', 'error');
  };

  window.speechSynthesis.speak(utterance);
  setStatus('Playing audio output...', 'info');
};

// Speech recognition dictation logic
const toggleDictation = () => {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    setStatus('Voice recognition is not supported in this browser. Try Google Chrome or Microsoft Edge.', 'error');
    return;
  }

  if (isRecording) {
    recognition.stop();
    return;
  }

  recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = false;

  // Set recording language if explicit
  const sourceLang = sourceSelect.value;
  if (sourceLang !== 'auto') {
    recognition.lang = sourceLang;
  }

  recognition.onstart = () => {
    isRecording = true;
    dictateButton.classList.add('active-mic');
    dictateButton.setAttribute('data-tooltip', 'Stop Recording');
    setStatus('Listening... Speak into your microphone.', 'info', true);
  };

  recognition.onresult = (event) => {
    const speechResult = event.results[0][0].transcript;
    
    // Append or write text
    if (sourceText.value.trim() !== '') {
      sourceText.value += ' ' + speechResult;
    } else {
      sourceText.value = speechResult;
    }
    
    sourceCharCount.textContent = sourceText.value.length;
    setStatus('Voice captured.', 'success');
    
    // Trigger translation
    translateText();
  };

  recognition.onerror = (event) => {
    console.error('Speech recognition error:', event.error);
    if (event.error === 'not-allowed') {
      setStatus('Microphone access denied. Please enable microphone permissions in your browser settings.', 'error', true);
    } else if (event.error === 'no-speech') {
      setStatus('No speech detected. Please try again.', 'error');
    } else {
      setStatus(`Dictation error: ${event.error}`, 'error');
    }
    stopDictationState();
  };

  recognition.onend = () => {
    stopDictationState();
  };

  recognition.start();
};

const stopDictationState = () => {
  isRecording = false;
  dictateButton.classList.remove('active-mic');
  dictateButton.setAttribute('data-tooltip', 'Voice Dictation');
  if (statusMessage.textContent === 'Listening... Speak into your microphone.') {
    setStatus('');
  }
};

// Clear controls
const clearSourceInput = () => {
  sourceText.value = '';
  translatedText.value = '';
  sourceCharCount.textContent = '0';
  targetCharCount.textContent = '0';
  setStatus('');
  sourceText.focus();
};

const clearAll = () => {
  sourceText.value = '';
  translatedText.value = '';
  sourceCharCount.textContent = '0';
  targetCharCount.textContent = '0';
  sourceSelect.value = 'auto';
  targetSelect.value = 'es';
  setStatus('');
  if (window.speechSynthesis.speaking) {
    window.speechSynthesis.cancel();
  }
  sourceText.focus();
};

// Translation History Management (localStorage)
const getHistory = () => {
  const logs = localStorage.getItem('aura_translate_history');
  return logs ? JSON.parse(logs) : [];
};

const addToHistory = (srcText, tgtText, sl, tl) => {
  if (!srcText.trim() || !tgtText.trim()) return;

  let logs = getHistory();
  
  // Prevent duplicate additions in immediate history
  const isDuplicate = logs.some(item => 
    item.sourceText.toLowerCase() === srcText.toLowerCase() && 
    item.sourceLang === sl && 
    item.targetLang === tl
  );

  if (isDuplicate) return;

  const newItem = {
    id: Date.now(),
    sourceText: srcText,
    translatedText: tgtText,
    sourceLang: sl,
    targetLang: tl,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };

  // Add to head of array and cap at 5 items
  logs.unshift(newItem);
  if (logs.length > 5) {
    logs.pop();
  }

  localStorage.setItem('aura_translate_history', JSON.stringify(logs));
  renderHistory();
};

const deleteHistory = () => {
  localStorage.removeItem('aura_translate_history');
  renderHistory();
  setStatus('Translation history cleared.', 'success');
};

const loadHistoryItem = (item) => {
  sourceSelect.value = item.sourceLang;
  targetSelect.value = item.targetLang;
  sourceText.value = item.sourceText;
  translatedText.value = item.translatedText;
  sourceCharCount.textContent = item.sourceText.length;
  targetCharCount.textContent = item.translatedText.length;
  setStatus('Restored translation from history.', 'success');
  
  // Scroll page to card
  document.querySelector('.translator-card').scrollIntoView({ behavior: 'smooth' });
};

const renderHistory = () => {
  const logs = getHistory();
  historyList.innerHTML = '';

  if (logs.length === 0) {
    const emptyDiv = document.createElement('div');
    emptyDiv.className = 'empty-history';
    emptyDiv.textContent = 'Your translation logs will appear here as you translate.';
    historyList.appendChild(emptyDiv);
    return;
  }

  logs.forEach(item => {
    const sourceLangName = languages.find(l => l.code === item.sourceLang)?.name || item.sourceLang.toUpperCase();
    const targetLangName = languages.find(l => l.code === item.targetLang)?.name || item.targetLang.toUpperCase();

    const itemDiv = document.createElement('div');
    itemDiv.className = 'history-item';
    itemDiv.setAttribute('role', 'button');
    itemDiv.setAttribute('aria-label', `Restore translation from ${sourceLangName} to ${targetLangName}`);
    
    itemDiv.innerHTML = `
      <div class="history-meta">
        <div class="history-languages">
          <span>${sourceLangName}</span>
          <span class="history-arrow">→</span>
          <span>${targetLangName}</span>
        </div>
        <span>${item.timestamp}</span>
      </div>
      <div class="history-content">
        <div class="history-text history-source" title="${item.sourceText.replace(/"/g, '&quot;')}">${item.sourceText}</div>
        <div class="history-text history-target" title="${item.translatedText.replace(/"/g, '&quot;')}">${item.translatedText}</div>
      </div>
    `;

    itemDiv.addEventListener('click', () => loadHistoryItem(item));
    historyList.appendChild(itemDiv);
  });
};

// Event Listeners & Input Handlers
const bindEvents = () => {
  // Manual translate trigger
  translateButton.addEventListener('click', translateText);

  // Layout control bindings
  swapButton.addEventListener('click', swapLanguages);
  clearAllButton.addEventListener('click', clearAll);
  clearSourceButton.addEventListener('click', clearSourceInput);
  copyButton.addEventListener('click', copyToClipboard);
  speakButton.addEventListener('click', playTextToSpeech);
  dictateButton.addEventListener('click', toggleDictation);
  clearHistoryButton.addEventListener('click', deleteHistory);

  // Debounced translation as user types
  sourceText.addEventListener('input', () => {
    const len = sourceText.value.length;
    sourceCharCount.textContent = len;

    clearTimeout(debounceTimer);
    
    if (sourceText.value.trim() === '') {
      translatedText.value = '';
      targetCharCount.textContent = '0';
      setStatus('');
      return;
    }

    debounceTimer = setTimeout(() => {
      translateText();
    }, 850); // 850ms debounce time
  });

  // Handle Ctrl+Enter shortcut in source text area to instantly translate
  sourceText.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      clearTimeout(debounceTimer);
      translateText();
    }
  });

  // Ensure voices are loaded for Speech Synthesis (required for some browsers like Chrome)
  if (typeof speechSynthesis !== 'undefined' && speechSynthesis.onvoiceschanged !== undefined) {
    speechSynthesis.onvoiceschanged = () => {
      // Warm up voice loading
    };
  }
};

// App Initialization
const init = () => {
  initializeLanguages();
  bindEvents();
  renderHistory();
  setStatus('');
};

document.addEventListener('DOMContentLoaded', init);

// If DOMContentLoaded already fired (e.g. file dynamically loaded)
if (document.readyState === 'interactive' || document.readyState === 'complete') {
  init();
}
