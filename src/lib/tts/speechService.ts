// ============================================
// TEXT-TO-SPEECH SERVICE
// Uses Web Speech API with proper error handling
// ============================================

export interface TTSState {
  isSupported: boolean;
  isSpeaking: boolean;
  isPaused: boolean;
  currentBlockId: string | null;
  error: string | null;
}

export interface TTSOptions {
  rate?: number;
  pitch?: number;
  volume?: number;
  voice?: SpeechSynthesisVoice | null;
}

class SpeechService {
  private synth: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private listeners: Set<(state: TTSState) => void> = new Set();
  private state: TTSState = {
    isSupported: false,
    isSpeaking: false,
    isPaused: false,
    currentBlockId: null,
    error: null,
  };

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      this.state.isSupported = true;
    }
  }

  // Subscribe to state changes
  subscribe(callback: (state: TTSState) => void): () => void {
    this.listeners.add(callback);
    callback(this.state);
    return () => this.listeners.delete(callback);
  }

  private updateState(updates: Partial<TTSState>) {
    this.state = { ...this.state, ...updates };
    this.listeners.forEach((cb) => cb(this.state));
  }

  // Check if TTS is available
  isAvailable(): boolean {
    return this.state.isSupported && this.synth !== null;
  }

  // Get available voices
  getVoices(): SpeechSynthesisVoice[] {
    if (!this.synth) return [];
    return this.synth.getVoices();
  }

  // Speak text with optional block ID for tracking
  speak(text: string, blockId?: string, options: TTSOptions = {}): boolean {
    if (!this.synth) {
      this.updateState({ 
        error: 'Text-to-speech is not supported in your browser. Please use a modern browser like Chrome, Firefox, or Edge.' 
      });
      return false;
    }

    // Cancel any ongoing speech
    this.stop();

    try {
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Apply options
      utterance.rate = options.rate ?? 1.0;
      utterance.pitch = options.pitch ?? 1.0;
      utterance.volume = options.volume ?? 1.0;
      
      if (options.voice) {
        utterance.voice = options.voice;
      }

      // Event handlers
      utterance.onstart = () => {
        this.updateState({
          isSpeaking: true,
          isPaused: false,
          currentBlockId: blockId || null,
          error: null,
        });
      };

      utterance.onend = () => {
        this.updateState({
          isSpeaking: false,
          isPaused: false,
          currentBlockId: null,
        });
        this.currentUtterance = null;
      };

      utterance.onerror = (event) => {
        // Don't treat 'interrupted' as an error (happens on stop/cancel)
        if (event.error !== 'interrupted' && event.error !== 'canceled') {
          this.updateState({
            isSpeaking: false,
            isPaused: false,
            currentBlockId: null,
            error: `Speech synthesis error: ${event.error}`,
          });
        } else {
          this.updateState({
            isSpeaking: false,
            isPaused: false,
            currentBlockId: null,
          });
        }
        this.currentUtterance = null;
      };

      utterance.onpause = () => {
        this.updateState({ isPaused: true });
      };

      utterance.onresume = () => {
        this.updateState({ isPaused: false });
      };

      this.currentUtterance = utterance;
      this.synth.speak(utterance);
      
      return true;
    } catch (e) {
      this.updateState({
        error: e instanceof Error ? e.message : 'Failed to start speech synthesis',
      });
      return false;
    }
  }

  // Speak multiple blocks sequentially
  async speakSequence(
    blocks: Array<{ id: string; text: string }>,
    options: TTSOptions = {}
  ): Promise<void> {
    if (!this.synth) {
      this.updateState({ 
        error: 'Text-to-speech is not supported in your browser.' 
      });
      return;
    }

    for (const block of blocks) {
      if (!this.state.isSpeaking || this.state.currentBlockId !== block.id) {
        // If stopped externally, exit
        await new Promise<void>((resolve, reject) => {
          const utterance = new SpeechSynthesisUtterance(block.text);
          utterance.rate = options.rate ?? 1.0;
          utterance.pitch = options.pitch ?? 1.0;
          utterance.volume = options.volume ?? 1.0;
          
          if (options.voice) {
            utterance.voice = options.voice;
          }

          utterance.onstart = () => {
            this.updateState({
              isSpeaking: true,
              isPaused: false,
              currentBlockId: block.id,
              error: null,
            });
          };

          utterance.onend = () => resolve();
          utterance.onerror = (event) => {
            if (event.error === 'interrupted' || event.error === 'canceled') {
              reject(new Error('cancelled'));
            } else {
              reject(new Error(event.error));
            }
          };

          this.currentUtterance = utterance;
          this.synth!.speak(utterance);
        }).catch((e) => {
          if (e.message === 'cancelled') return;
          throw e;
        });
      }
    }

    this.updateState({
      isSpeaking: false,
      currentBlockId: null,
    });
  }

  // Pause speech
  pause(): void {
    if (this.synth && this.state.isSpeaking) {
      this.synth.pause();
    }
  }

  // Resume speech
  resume(): void {
    if (this.synth && this.state.isPaused) {
      this.synth.resume();
    }
  }

  // Stop speech
  stop(): void {
    if (this.synth) {
      this.synth.cancel();
      this.currentUtterance = null;
      this.updateState({
        isSpeaking: false,
        isPaused: false,
        currentBlockId: null,
      });
    }
  }

  // Clear error
  clearError(): void {
    this.updateState({ error: null });
  }

  // Get current state
  getState(): TTSState {
    return { ...this.state };
  }
}

// Singleton instance
export const speechService = new SpeechService();
