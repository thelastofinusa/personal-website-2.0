export const siteConfig = {
  title: "Holiday",
  slogan: "Your friendly neighborhood developer",
  description:
    "Portfolio of Holiday — a Web3 frontend engineer building products, experiments, and open-source projects.",
  author: {
    name: "Abdullahi Salihu",
    username: "thelastofinusa",
    nickname: "Holiday",
    nicknameAcronym: "Humble Optimistic Learner Inspiring Dreams And Youth",
    email: "dGhlbGFzdG9maW51c2FAZ21haWwuY29t",
    phone: "KzIzNDgxMjgxNTc1MTA=",
    avatar: "/avatar.jpg",
  },
  url:
    process.env.NODE_ENV === "production"
      ? process.env.NEXT_PUBLIC_BASE_URL || "https://thelastofinusa.vercel.app"
      : "http://localhost:3000",
  socials: [
    { platform: "twitter", url: "https://twitter.com/thelastofinusa" },
    { platform: "github", url: "https://github.com/thelastofinusa" },
    { platform: "instagram", url: "https://www.instagram.com/thelastofinusa/" },
    {
      platform: "linkedin",
      url: "https://www.linkedin.com/in/thelastofinusa/",
    },
    { platform: "medium", url: "https://medium.com/@thelastofinusa" },
    {
      platform: "producthunt",
      url: "https://www.producthunt.com/@thelastofinusa",
    },
    { platform: "telegram", url: "https://t.me/thelastofinusa" },
  ],
};
