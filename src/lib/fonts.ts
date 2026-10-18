import { cn } from "cn";
import { Cormorant_Garamond as FontSerif } from "next/font/google";
import localFont from "next/font/local";

const fontSans = localFont({
  src: "../../public/fonts/BricolageGrotesque/VariableFont_opsz,wdth,wght.ttf",
  variable: "--font-sans",
  display: "swap",
  style: "normal",
});

const fontSerif = FontSerif({
  variable: "--font-serif",
  display: "swap",
});

const fontMono = localFont({
  src: "../../public/fonts/GeistMono/VariableFont_wght.ttf",
  variable: "--font-mono",
  display: "swap",
  style: "normal",
});

export const fontVariables = (className?: string) =>
  cn(fontSans.variable, fontSerif.variable, fontMono.variable, className);
