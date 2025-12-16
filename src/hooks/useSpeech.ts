import { useState, useEffect, useCallback } from 'react';
import { speechService, TTSState, TTSOptions } from '@/lib/tts/speechService';

export function useSpeech() {
  const [state, setState] = useState<TTSState>(speechService.getState());

  useEffect(() => {
    const unsubscribe = speechService.subscribe(setState);
    return unsubscribe;
  }, []);

  const speak = useCallback((text: string, blockId?: string, options?: TTSOptions) => {
    return speechService.speak(text, blockId, options);
  }, []);

  const speakSequence = useCallback(
    (blocks: Array<{ id: string; text: string }>, options?: TTSOptions) => {
      return speechService.speakSequence(blocks, options);
    },
    []
  );

  const pause = useCallback(() => speechService.pause(), []);
  const resume = useCallback(() => speechService.resume(), []);
  const stop = useCallback(() => speechService.stop(), []);
  const clearError = useCallback(() => speechService.clearError(), []);
  const getVoices = useCallback(() => speechService.getVoices(), []);

  return {
    ...state,
    speak,
    speakSequence,
    pause,
    resume,
    stop,
    clearError,
    getVoices,
  };
}
