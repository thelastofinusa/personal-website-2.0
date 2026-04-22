export const CONST_SITE_URL =
  process.env.NODE_ENV === "development"
    ? "http://localhost:3000"
    : "https://thelastofinusa.vercel.app"

export const CONST_META_THEME_COLORS = {
  light: "#ffffff",
  dark: "#0d1117",
}

export const CONST_STORAGE_KEY = "work-list-tab"
