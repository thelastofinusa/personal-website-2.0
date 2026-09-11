"use client";

import { AnimatePresence, motion } from "motion/react";
import { Fragment, useImperativeHandle, useState } from "react";

export type VolumeIconHandle = {
  startAnimation: () => void;
  stopAnimation: () => void;
};

export type VolumeIconProps = React.ComponentPropsWithoutRef<"svg"> & {
  ref?: React.Ref<VolumeIconHandle>;
};

export function VolumeIcon({ ref, ...props }: VolumeIconProps) {
  const [isHovered, setIsHovered] = useState(false);

  useImperativeHandle(ref, () => ({
    startAnimation: () => setIsHovered(true),
    stopAnimation: () => setIsHovered(false),
  }));

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="24"
      height="24"
      fill="none"
      {...props}
    >
      <title>Volume icon</title>

      <path
        d="M2 10V14C2 16 3 17 5 17H6.43C6.8 17 7.17 17.11 7.49 17.3L10.41 19.13C12.93 20.71 15 19.56 15 16.59V7.41003C15 4.43003 12.93 3.29003 10.41 4.87003L7.49 6.70003C7.17 6.89003 6.8 7.00003 6.43 7.00003H5C3 7.00003 2 8.00003 2 10Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />

      <AnimatePresence initial={false} mode="wait">
        {isHovered ? (
          <Fragment key="volume-icon-active">
            <motion.path
              d="M18 8C19.78 10.37 19.78 13.63 18 16"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ opacity: 0 }}
              animate={{
                opacity: 1,
                transition: { delay: 0.1 },
              }}
            />

            <motion.path
              d="M19.83 5.5C22.72 9.35 22.72 14.65 19.83 18.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ opacity: 0 }}
              animate={{
                opacity: 1,
                transition: { delay: 0.2 },
              }}
              onAnimationComplete={() => setIsHovered(false)}
            />
          </Fragment>
        ) : (
          <Fragment key="volume-icon-inactive">
            <path
              d="M18 8C19.78 10.37 19.78 13.63 18 16"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            <path
              d="M19.83 5.5C22.72 9.35 22.72 14.65 19.83 18.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Fragment>
        )}
      </AnimatePresence>
    </svg>
  );
}
