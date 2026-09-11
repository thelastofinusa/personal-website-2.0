import * as React from "react";

export function usePronunciation(url?: string) {
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  const play = React.useCallback(() => {
    if (!url) return;

    if (!audioRef.current || audioRef.current.src !== url) {
      audioRef.current = new Audio(url);
    }

    audioRef.current.currentTime = 0;
    void audioRef.current.play();
  }, [url]);

  return { play };
}
