/** biome-ignore-all lint/a11y/useButtonType: <explanation> */
"use client";

import { useRef } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { useSound } from "@/hooks/use-sound";
import {
  VolumeIcon,
  type VolumeIconHandle,
} from "../reusable/chanhdai/volume-icon";

export function PronounceMyName({
  namePronunciationUrl,
}: {
  namePronunciationUrl: string;
}) {
  const [play] = useSound(namePronunciationUrl);

  const volumeIconRef = useRef<VolumeIconHandle>(null);

  const handlePlayClick = () => {
    volumeIconRef.current?.startAnimation();
    play();
  };

  useHotkeys("p", handlePlayClick);

  return (
    <button onClick={handlePlayClick} aria-label="Pronounce my name">
      <span className="absolute size-12 pointer-fine:hidden" aria-hidden />
      <VolumeIcon ref={volumeIconRef} className="size-5 -mb-1!" aria-hidden />
    </button>
  );
}
