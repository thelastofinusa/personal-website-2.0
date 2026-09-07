"use client";

import { motion } from "motion/react";
import { AlarmClock } from "reicon-react";

import { Container } from "@/components/shared/container";
import { siteConfig } from "@/config/site.config";
import { itemVariants, parentVariants } from "@/constants/variants";
import { useLocationTime } from "@/hooks/use-location-time";
import { resolveIcon } from "@/lib/icons";
import { decodeString } from "@/lib/utils";

const shouldInclude = ["twitter", "linkedin", "telegram"];

export const ContactComp = () => {
  const email = decodeString(siteConfig.author.email);

  const { time, locationWithFlag } = useLocationTime({
    country: "Nigeria",
    state: "FCT Abuja",
  });

  const contactLinks = [
    ...siteConfig.socials
      .filter((item) => shouldInclude.includes(item.platform.toLowerCase()))
      .map((item) => ({
        id: item.platform.toLowerCase(),
        label: item.platform,
        href: item.url,
        external: true,
      })),
    {
      id: "email",
      label: email,
      href: `mailto:${email}`,
      external: false,
    },
  ];

  const contactDetails = [
    {
      id: "location",
      content: locationWithFlag,
    },
    {
      id: "time",
      content: time ? `${time} local time` : "Loading...",
    },
  ];

  return (
    <section id="contact">
      <Container
        size="xs"
        className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-6"
      >
        <motion.div
          variants={parentVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="flex flex-col gap-3"
        >
          {contactLinks.map((item) => {
            const Icon = item.id !== "email" && resolveIcon(item.label);

            return (
              <motion.a
                key={item.id}
                variants={itemVariants}
                href={item.href}
                target={item.external ? "_blank" : undefined}
                rel={item.external ? "noopener noreferrer" : undefined}
                className="flex w-max items-center gap-2 text-base font-extralight tracking-[0.03em] hover:text-primary"
              >
                {Icon && <Icon className="sie-4" />}

                <span className={item.external ? "capitalize" : undefined}>
                  {item.label}
                </span>
              </motion.a>
            );
          })}
        </motion.div>

        <motion.div
          variants={parentVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="flex flex-col gap-3"
        >
          {contactDetails.map((item) => (
            <motion.p
              key={item.id}
              variants={itemVariants}
              className="text-base font-extralight tracking-[0.03em]"
            >
              {item.id === "time" ? (
                <span className="flex w-max items-center gap-2 text-muted-foreground hover:text-foreground">
                  <AlarmClock className="mb-px size-4 motion-safe:animate-bell-ring" />
                  <span>{item.content}</span>
                </span>
              ) : (
                item.content
              )}
            </motion.p>
          ))}
        </motion.div>
      </Container>
    </section>
  );
};
