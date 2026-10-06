/**
 * Voice AI Service Abstraction
 * Handles Speech-to-Text (STT) and Text-to-Speech (TTS) interfaces.
 */

class VoiceService {
  constructor() {
    this.isListening = false;
    this.isSpeaking = false;
    this.recognition = null;
    this.synthesis = typeof window !== "undefined" && window.speechSynthesis ? window.speechSynthesis : null;
  }

  startListening(onResult, onError) {
    this.isListening = true;
    
    // Simulate browser speech recognition fallback
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = false;

      this.recognition.onresult = (event) => {
        const text = event.results[0][0].transcript;
        this.isListening = false;
        if (onResult) onResult(text);
      };

      this.recognition.onerror = (err) => {
        this.isListening = false;
        if (onError) onError(err);
      };

      this.recognition.start();
    } else {
      // Mock voice input after 2 seconds if Web Speech API is not supported in environment
      setTimeout(() => {
        this.isListening = false;
        if (onResult) onResult("Analyze recent ransomware alerts on HIS server");
      }, 2500);
    }
  }

  stopListening() {
    this.isListening = false;
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (e) {
        // ignore
      }
    }
  }

  speak(text, onEnd) {
    if (!text) return;
    this.stopSpeaking();
    this.isSpeaking = true;

    if (this.synthesis) {
      const utterance = new SpeechSynthesisUtterance(text.replace(/[#*`]/g, ""));
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.onend = () => {
        this.isSpeaking = false;
        if (onEnd) onEnd();
      };
      utterance.onerror = () => {
        this.isSpeaking = false;
        if (onEnd) onEnd();
      };
      this.synthesis.speak(utterance);
    } else {
      setTimeout(() => {
        this.isSpeaking = false;
        if (onEnd) onEnd();
      }, 3000);
    }
  }

  stopSpeaking() {
    this.isSpeaking = false;
    if (this.synthesis) {
      this.synthesis.cancel();
    }
  }
}

export const voiceService = new VoiceService();
