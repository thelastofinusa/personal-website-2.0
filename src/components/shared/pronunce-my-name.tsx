/** biome-ignore-all lint/a11y/useButtonType: <explanation> */
"use client";

import { cn } from "cn";
import { useRef } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { useSound } from "@/hooks/use-sound";
import {
  VolumeIcon,
  type VolumeIconHandle,
} from "../reusable/chanhdai/volume-icon";

export function PronounceMyName({
  className,
  namePronunciationUrl,
}: {
  className?: string;
  namePronunciationUrl: string;
}) {
  const [play, { isPlaying }] = useSound(namePronunciationUrl);

  const volumeIconRef = useRef<VolumeIconHandle>(null);

  const handlePlayClick = () => {
    if (isPlaying) return;

    volumeIconRef.current?.startAnimation();
    play();
  };

  useHotkeys("p", handlePlayClick);

  return (
    <button
      onClick={handlePlayClick}
      disabled={isPlaying}
      aria-label="Pronounce my name"
      className={cn(className)}
    >
      <span className="absolute size-12 pointer-fine:hidden" aria-hidden />
      <VolumeIcon
        ref={volumeIconRef}
        className="size-5 -mb-1.25!"
        aria-hidden
      />
    </button>
  );
}