/** biome-ignore-all lint/suspicious/noArrayIndexKey: <explanation> */
import { type HTMLMotionProps, motion, type Variants } from "motion/react";
import { useTheme } from "@/components/provider/theme";
import { cn } from "@/lib/utils";

interface ShimmeringTextProps extends HTMLMotionProps<"span"> {
  text: string;
  duration?: number;
  isStopped?: boolean;
}

export function ShimmeringText({
  text,
  duration = 1,
  isStopped = false,
  className,
  ...props
}: ShimmeringTextProps) {
  const { resolvedTheme } = useTheme();

  const createCharVariants = (charIndex: number): Variants => ({
    running: {
      color: [
        "var(--muted-foreground)",
        "var(--foreground)",
        "var(--muted-foreground)",
      ],
      transition: {
        duration,
        repeat: Infinity,
        repeatType: "loop",
        repeatDelay: text.length * 0.05,
        delay: (charIndex * duration) / text.length,
        ease: "easeInOut",
      },
    },
    stopped: {
      color: "var(--muted-foreground)",
      transition: {
        duration: duration * 0.5,
        ease: "easeOut",
      },
    },
  });

  return (
    <motion.span
      key={resolvedTheme}
      className={cn("inline-block select-none", className)}
      {...props}
    >
      {text.split("").map((char, i) => (
        <motion.span
          key={i}
          className="inline-block whitespace-pre"
          initial="stopped"
          animate={isStopped ? "stopped" : "running"}
          variants={createCharVariants(i)}
          aria-hidden
        >
          {char}
        </motion.span>
      ))}

      <span className="sr-only">{text}</span>
    </motion.span>
  );
}
