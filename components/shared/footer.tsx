import { TbBrandGithub } from "react-icons/tb"
import { RiTwitterXLine } from "react-icons/ri"
import { RxDiscordLogo } from "react-icons/rx"
import { IoLogoInstagram } from "react-icons/io5"
import { FaLinkedinIn } from "react-icons/fa6"
import { PiTelegramLogoFill } from "react-icons/pi"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { buttonVariants } from "@/components/ui/button"
import { siteConfig } from "@/config/site.config"

const socials = [
  {
    title: "GitHub",
    icon: TbBrandGithub,
    href: "https://github.com/" + siteConfig.username,
  },
  {
    title: "Twitter",
    icon: RiTwitterXLine,
    href: "https://x.com/" + siteConfig.username,
  },
  {
    title: "Telegram",
    icon: PiTelegramLogoFill,
    href: "https://t.me/" + siteConfig.username,
  },
  {
    title: "Discord",
    icon: RxDiscordLogo,
    href: "https://discord.com/" + siteConfig.username,
  },
]

export const Footer = () => {
  return (
    <footer className="ml-auto flex items-center gap-1">
      {socials.map((social, index) => {
        const isFirst = index === 0
        const isLast = index === socials.length - 1

        const align = isFirst ? "start" : isLast ? "end" : "center"
        // const side = index % 2 === 0 ? "top" : "bottom"

        return (
          <Tooltip key={social.title}>
            <TooltipTrigger className="-mb-2!">
              <a
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.title}
                title={social.title}
                href={social.href}
                className={buttonVariants({
                  size: "icon-sm",
                  variant: "ghost",
                })}
              >
                <social.icon />
                <span className="sr-only">{social.title}</span>
              </a>
            </TooltipTrigger>

            <TooltipContent align={align} sideOffset={8}>
              <p className="font-medium">{social.title}</p>
            </TooltipContent>
          </Tooltip>
        )
      })}
    </footer>
  )
}
