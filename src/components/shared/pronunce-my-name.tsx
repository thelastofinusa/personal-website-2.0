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
  const [play] = useSound(namePronunciationUrl);

  const volumeIconRef = useRef<VolumeIconHandle>(null);

  const handlePlayClick = () => {
    volumeIconRef.current?.startAnimation();
    play();
  };

  useHotkeys("p", handlePlayClick);

  return (
    <button
      onClick={handlePlayClick}
      aria-label="Pronounce my name"
      className={cn(className)}
    >
      <span className="absolute size-12 pointer-fine:hidden" aria-hidden />
      <VolumeIcon
        ref={volumeIconRef}
        className="size-5.5 -mb-1.5!"
        aria-hidden
      />
    </button>
  );
}
