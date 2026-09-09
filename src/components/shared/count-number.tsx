"use client";

import { type SpringOptions, useMotionValue, useSpring } from "motion/react";
import * as React from "react";

type CountingNumberProps = Omit<React.ComponentProps<"span">, "children"> & {
  number: number;
  fromNumber?: number;
  decimalPlaces?: number;
  decimalSeparator?: string;
  padStart?: boolean;
  transition?: SpringOptions;
  delay?: number;
};

const formatNumber = (
  value: number,
  decimalPlaces: number,
  decimalSeparator: string,
  padStart: boolean,
  integerLength: number,
) => {
  let formatted =
    decimalPlaces > 0
      ? value.toFixed(decimalPlaces)
      : Math.round(value).toString();

  if (decimalPlaces > 0) {
    formatted = formatted.replace(".", decimalSeparator);
  }

  if (padStart) {
    const [integer, decimal] = formatted.split(decimalSeparator);
    const padded = (integer ?? "").padStart(integerLength, "0");

    formatted = decimal ? `${padded}${decimalSeparator}${decimal}` : padded;
  }

  return formatted;
};

function CountingNumber({
  ref,
  number,
  fromNumber = 0,
  decimalPlaces = 0,
  decimalSeparator = ".",
  padStart = false,
  transition = {
    stiffness: 120,
    damping: 25,
  },
  delay = 0,
  ...props
}: CountingNumberProps) {
  const localRef = React.useRef<HTMLSpanElement>(null);

  const setRefs = React.useCallback(
    (node: HTMLSpanElement | null) => {
      localRef.current = node;

      if (!ref) return;

      if (typeof ref === "function") {
        ref(node);
      } else {
        ref.current = node;
      }
    },
    [ref],
  );

  const motionValue = useMotionValue(fromNumber);
  const springValue = useSpring(motionValue, transition);

  const integerLength = Math.floor(Math.abs(number)).toString().length;

  React.useEffect(() => {
    const timeout = window.setTimeout(() => {
      motionValue.set(number);
    }, delay);

    return () => window.clearTimeout(timeout);
  }, [number, delay, motionValue]);

  React.useEffect(() => {
    const unsubscribe = springValue.on("change", (value) => {
      if (!localRef.current) return;

      localRef.current.textContent = formatNumber(
        value,
        decimalPlaces,
        decimalSeparator,
        padStart,
        integerLength,
      );
    });

    return unsubscribe;
  }, [
    springValue,
    decimalPlaces,
    decimalSeparator,
    padStart,
    integerLength,
  ]);

  const initialText = formatNumber(
    fromNumber,
    decimalPlaces,
    decimalSeparator,
    padStart,
    integerLength,
  );

  return (
    <span ref={setRefs} data-slot="counting-number" {...props}>
      {initialText}
    </span>
  );
}

export { CountingNumber, type CountingNumberProps };