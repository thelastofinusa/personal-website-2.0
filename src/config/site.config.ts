export const siteConfig = {
  title: "Osilama",
  slogan: "Your friendly neighborhood developer",
  description:
    "A friendly corner of the internet where I build things, chase ideas and see where curiosity takes me.",
  author: {
    name: "Abdullahi Salihu",
    username: "thelastofinusa",
    nickname: "Osilama",
    nicknameShorten: "Osi",
    namePronunciationUrl:
      "https://cdn.sanity.io/files/l1eyjyqo/production/9c1a2500da26f507d6b221f761095446516de14a.mp3",
    position: "Web3 Frontend Developer",
    email: "dGhlbGFzdG9maW51c2FAZ21haWwuY29t",
    phone: "KzIzNDgxMjgxNTc1MTA=",
    avatar:
      "https://cdn.sanity.io/images/l1eyjyqo/production/1b7767f65d9320681c88c0a030552d5a3c9b80a9-611x612.jpg",
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
