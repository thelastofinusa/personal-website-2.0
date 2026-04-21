import { siteConfig } from "@/config/site.config"
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

export function absoluteUrl(path: string): string {
  return `${siteConfig.url}${path}`
}

export function stripMarkdown(text: string): string {
  return text
    .replace(/!\[.*?\]\(.*?\)/g, "") // images
    .replace(/\[(.*?)\]\(.*?\)/g, "$1") // links
    .replace(/`{1,3}([^`]*)`{1,3}/g, "$1") // code
    .replace(/\*\*(.*?)\*\*/g, "$1") // bold
    .replace(/\*(.*?)\*/g, "$1") // italic
    .replace(/~~(.*?)~~/g, "$1") // strikethrough
}
