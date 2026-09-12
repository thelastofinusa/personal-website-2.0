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

  const contactItems = [
    ...siteConfig.socials
      .filter((item) => shouldInclude.includes(item.platform.toLowerCase()))
      .map((item) => ({
        id: item.platform.toLowerCase(),
        label: item.platform,
        href: item.url,
        external: true,
        icon: resolveIcon(item.platform),
      })),

    {
      id: "email",
      label: email,
      href: `mailto:${email}`,
      external: false,
    },

    {
      id: "location",
      label: locationWithFlag,
    },

    {
      id: "time",
      label: time ? `It's currently ${time} here` : "...",
      icon: AlarmClock,
    },
  ];

  return (
    <section id="contact">
      <Container
        size="xs"
        className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-6"
      >
        {["links", "details"].map((group, _index) => (
          <motion.div
            key={group}
            variants={parentVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            className="flex flex-col gap-3"
          >
            {contactItems
              .filter((item) =>
                group === "links" ? "href" in item : !("href" in item),
              )
              .map((item) => {
                const Icon = item.icon;

                const content = (
                  <>
                    {Icon && (
                      <Icon
                        className={`size-4 ${
                          item.id === "time"
                            ? "mb-px motion-safe:animate-bell-ring"
                            : ""
                        }`}
                      />
                    )}

                    <span className={item.external ? "capitalize" : undefined}>
                      {item.label}
                    </span>
                  </>
                );

                return "href" in item ? (
                  <motion.a
                    key={item.id}
                    variants={itemVariants}
                    href={item.href}
                    target={item.external ? "_blank" : undefined}
                    rel={item.external ? "noopener noreferrer" : undefined}
                    className="flex w-max items-center gap-2 text-[15px] font-extralight tracking-[0.03em] hover:text-primary"
                  >
                    {content}
                  </motion.a>
                ) : (
                  <motion.p
                    key={item.id}
                    variants={itemVariants}
                    className="flex w-max items-center gap-2 text-[15px] font-extralight tracking-[0.03em]"
                  >
                    {content}
                  </motion.p>
                );
              })}
          </motion.div>
        ))}
      </Container>
    </section>
  );
};
