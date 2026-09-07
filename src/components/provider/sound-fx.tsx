"use client";

import React from "react";
import { createUISFX, packNames, type UISFXPlayer } from "uisfx";

export type SoundPackName = (typeof packNames)[number];

const STORAGE_KEY_ENABLED = "uisfx_enabled";
const STORAGE_KEY_PACK = "uisfx_pack";

type SoundFxContextValue = {
  enabled: boolean;
  pack: string;
  toggle: () => void;
  setEnabled: (enabled: boolean) => void;
  setPack: (pack: SoundPackName) => void;
  play: (cue: Parameters<UISFXPlayer["play"]>[0]) => void;
};

const SoundFxContext = React.createContext<SoundFxContextValue | null>(null);

export function SoundFxProvider({ children }: { children: React.ReactNode }) {
  const [enabled, setEnabledState] = React.useState(true);
  const [pack, setPackState] = React.useState<SoundPackName>(packNames[0]);

  const soundFxRef = React.useRef<UISFXPlayer | null>(null);
  const disableTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  if (!soundFxRef.current && typeof window !== "undefined") {
    soundFxRef.current = createUISFX({
      pack: packNames[0],
      volume: 1,
      enabled: true,
    });
  }

  // Hydrate state from localStorage after mount
  React.useEffect(() => {
    try {
      const storedEnabled = localStorage.getItem(STORAGE_KEY_ENABLED);
      if (storedEnabled !== null) {
        const parsedEnabled: boolean = JSON.parse(storedEnabled);
        setEnabledState(parsedEnabled);
        soundFxRef.current?.setEnabled(parsedEnabled);
      }

      const storedPack = localStorage.getItem(
        STORAGE_KEY_PACK,
      ) as SoundPackName;
      if (storedPack && packNames.includes(storedPack)) {
        setPackState(storedPack);
        soundFxRef.current?.setPack(storedPack);
      }
    } catch (error) {
      console.error(
        "Failed to read SoundFX settings from localStorage:",
        error,
      );
    }
  }, []);

  const setEnabled = React.useCallback((value: boolean) => {
    // Clear any pending timeout to prevent race conditions when rapidly toggling
    if (disableTimeoutRef.current) {
      clearTimeout(disableTimeoutRef.current);
      disableTimeoutRef.current = null;
    }

    if (value) {
      soundFxRef.current?.setEnabled(true);
      setEnabledState(true);
    } else {
      // Play the turn-off sound while the player is still enabled
      soundFxRef.current?.play("sleep");
      setEnabledState(false);

      // Delay disabling the engine so the audio clip finishes playing
      disableTimeoutRef.current = setTimeout(() => {
        soundFxRef.current?.setEnabled(false);
      }, 350);
    }

    try {
      localStorage.setItem(STORAGE_KEY_ENABLED, JSON.stringify(value));
    } catch (error) {
      console.error("Failed to save enabled state to localStorage:", error);
    }
  }, []);

  const setPack = React.useCallback((nextPack: SoundPackName) => {
    setPackState(nextPack);
    soundFxRef.current?.setPack(nextPack);
    try {
      localStorage.setItem(STORAGE_KEY_PACK, nextPack);
    } catch (error) {
      console.error("Failed to save pack to localStorage:", error);
    }
  }, []);

  const toggle = React.useCallback(() => {
    const nextEnabled = !enabled;
    setEnabled(nextEnabled);

    if (nextEnabled) {
      soundFxRef.current?.play("achievement");
    }
  }, [enabled, setEnabled]);

  const play = React.useCallback((cue: Parameters<UISFXPlayer["play"]>[0]) => {
    soundFxRef.current?.play(cue);
  }, []);

  const value = React.useMemo(
    () => ({
      enabled,
      pack,
      toggle,
      setEnabled,
      setPack,
      play,
    }),
    [enabled, pack, toggle, setEnabled, setPack, play],
  );

  return (
    <SoundFxContext.Provider value={value}>{children}</SoundFxContext.Provider>
  );
}

export function useSoundFx() {
  const context = React.useContext(SoundFxContext);

  if (!context) {
    throw new Error("useSoundFx must be used within a SoundFxProvider");
  }

  return context;
}
