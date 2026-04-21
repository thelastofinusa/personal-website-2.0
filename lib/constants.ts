export const CONST_SITE_URL =
  process.env.NODE_ENV === "development"
    ? "http://localhost:3000"
    : "https://thelastofinusa.vercel.app"

export const CONST_META_THEME_COLORS = {
  light: "#ffffff",
  dark: "#0d1117",
}

export const CONST_DEMO_PROJECTS = [
  {
    name: "Bitterms",
    slug: "bitterms",
    description:
      "BitTerms solves the problem of Bitcoin education being **too technical and confusing for everyday people**.",
    featured: true,
    url: "https://bitterms.com",
  },
  {
    name: "Trezo",
    slug: "trezo",
    description:
      "Trezo makes building modern dApps simpler by **unifying type-safe contract interactions, wallet integrations, and Web3 state into one modular, cross-chain toolkit**.",
    featured: true,
    url: "https://trezosite.vercel.app",
  },
  {
    name: "Bitcoin Design Adoption Network",
    slug: "bdan",
    description:
      "BDAN trains African designers to create sovereign, human-centred Bitcoin experiences for the next wave of users through open, decentralized design.",
    featured: true,
    url: "https://bdan.design",
  },
  {
    name: "Ekimedo Atelier",
    slug: "ekimedo",
    description:
      "Ekimedo Atelier is a premium ecommerce platform focused on **bespoke fashion**, allowing customers to **browse collections, customize orders, schedule consultations, and purchase high-end fashion items online**.",
    featured: true,
    url: "https://ekimedo.com",
  },
]
