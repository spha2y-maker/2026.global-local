/**
 * Browser Web Speech Synthesis Helper for English and Chinese
 */
export function playVoice(text: string, lang: 'en-US' | 'zh-CN' = 'en-US', rate: number = 0.9) {
  if (!('speechSynthesis' in window)) {
    console.warn('Speech synthesis not supported');
    return false;
  }

  window.speechSynthesis.cancel(); // stop previous speech

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  utterance.rate = rate;
  utterance.pitch = 1.0;

  // Try to find native voice
  const voices = window.speechSynthesis.getVoices();
  if (voices.length > 0) {
    const targetLang = lang.toLowerCase();
    const matchedVoice = voices.find(v => v.lang.toLowerCase().startsWith(targetLang.slice(0, 2)));
    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }
  }

  window.speechSynthesis.speak(utterance);
  return true;
}

export function stopVoice() {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}
