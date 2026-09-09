export const siteConfig = {
  title: "Osilahma",
  slogan: "Your friendly neighborhood developer",
  description:
    "A friendly corner of the internet where I build things, chase ideas and see where curiosity takes me.",
  author: {
    name: "Abdullahi Salihu",
    username: "thelastofinusa",
    nickname: "Osilahma",
    position: "Web3 Frontend Developer",
    email: "dGhlbGFzdG9maW51c2FAZ21haWwuY29t",
    phone: "KzIzNDgxMjgxNTc1MTA=",
    avatar:
      "https://cdn.sanity.io/images/l1eyjyqo/production/2b6e5fad87a17efa39abbe40fd2b1dad4da30cd2-848x1182.jpg",
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
