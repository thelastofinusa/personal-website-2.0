"use client";

import React from "react";

type ToggleId = "menu" | "soundfx";

type ToggleContextValue = {
  activeToggle: ToggleId | null;
  open: (id: ToggleId) => void;
  close: (id: ToggleId) => void;
  toggle: (id: ToggleId) => void;
};

const ToggleContext = React.createContext<ToggleContextValue | null>(null);

export function ToggleProvider({ children }: React.PropsWithChildren) {
  const [activeToggle, setActiveToggle] = React.useState<ToggleId | null>(null);

  const open = React.useCallback((id: ToggleId) => {
    setActiveToggle(id);
  }, []);

  const close = React.useCallback((id: ToggleId) => {
    setActiveToggle((current) => (current === id ? null : current));
  }, []);

  const toggle = React.useCallback((id: ToggleId) => {
    setActiveToggle((current) => (current === id ? null : id));
  }, []);

  const value = React.useMemo(
    () => ({ activeToggle, open, close, toggle }),
    [activeToggle, open, close, toggle],
  );

  return (
    <ToggleContext.Provider value={value}>{children}</ToggleContext.Provider>
  );
}

export function useToggle(id: ToggleId) {
  const context = React.useContext(ToggleContext);

  if (!context) {
    throw new Error("useToggle must be used within a ToggleProvider");
  }

  return {
    isOpen: context.activeToggle === id,
    open: () => context.open(id),
    close: () => context.close(id),
    toggle: () => context.toggle(id),
  };
}
