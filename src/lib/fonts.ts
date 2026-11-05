import { cn } from "cn";
import localFont from "next/font/local";

const fontHeading = localFont({
  src: "../../public/fonts/BricolageGrotesque/VariableFont_opsz,wdth,wght.ttf",
  variable: "--font-heading",
  display: "swap",
  style: "normal",
});

const fontSans = localFont({
  src: "../../public/fonts/HankenGrotesk/HankenGrotesk-VariableFont_wght.ttf",
  variable: "--font-sans",
  display: "swap",
  style: "normal",
});

const fontSerif = localFont({
  src: "../../public/fonts/Cinzel/Cinzel-VariableFont_wght.ttf",
  variable: "--font-serif",
  display: "swap",
  style: "normal",
});

const fontMono = localFont({
  src: "../../public/fonts/GeistMono/VariableFont_wght.ttf",
  variable: "--font-mono",
  display: "swap",
  style: "normal",
});

export const fontVariables = (className?: string) =>
  cn(
    fontSans.variable,
    fontSerif.variable,
    fontMono.variable,
    fontHeading.variable,
    className,
  );
