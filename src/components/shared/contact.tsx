/** biome-ignore-all lint/a11y/useSemanticElements: <explanation> */
/** biome-ignore-all lint/a11y/useKeyWithClickEvents: <explanation> */
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import type { ElementType } from "react";
import React from "react";
import { useForm } from "react-hook-form";
import { AlarmClock, AtSign, User2 } from "reicon-react";
import { sendContactMessage } from "@/actions/contact.action";
import { useSoundFx } from "@/components/provider/sound-fx";
import { Button } from "@/components/reusable/shadcn/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/reusable/shadcn/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
  InputGroupTextarea,
} from "@/components/reusable/shadcn/input-group";
import { Container } from "@/components/shared/container";
import { FadeLine } from "@/components/shared/fade-line";
import { siteConfig } from "@/config/site.config";
import {
  itemVariants,
  parentVariants,
  slideVariants,
} from "@/constants/variants";
import { useLocationTime } from "@/hooks/use-location-time";
import { resolveIcon } from "@/lib/icons";
import { cn, decodeString } from "@/lib/utils";
import {
  CONTACT_LIMITS,
  type ContactField,
  type ContactFormValues,
  contactSchema,
} from "@/lib/validations/contact";

type StepId = ContactField;
type Status = "idle" | "active" | "sending" | "sent";

const STEPS = [
  {
    id: "name",
    label: "What's your name?",
    placeholder: "John Doe",
  },
  {
    id: "email",
    label: "Where can I reach you?",
    placeholder: "name@example.com",
  },
  {
    id: "message",
    label: "What's on your mind?",
    placeholder: "Tell me a little about your project..",
  },
] as const satisfies readonly {
  id: StepId;
  label: string;
  placeholder: string;
}[];

const shouldInclude = ["twitter", "linkedin", "telegram", "youtube"];

type ContactRowProps = {
  id: string;
  label: string;
  href?: string;
  external?: boolean;
  icon?: ElementType;
};

const rowClass =
  "flex w-max items-center gap-2 font-extralight text-[15px] tracking-[0.03em]";

const ContactRow = ({ label, href, external, icon: Icon }: ContactRowProps) => {
  const content = (
    <>
      {Icon && <Icon className="size-4 motion-safe:animate-bell-ring" />}

      <span className={external ? "capitalize" : undefined}>{label}</span>
    </>
  );

  return href ? (
    <motion.a
      variants={itemVariants}
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className={`${rowClass} hover:text-primary`}
    >
      {content}
    </motion.a>
  ) : (
    <motion.p variants={itemVariants} className={rowClass}>
      {content}
    </motion.p>
  );
};

export const ContactComp: React.FC<{ from?: string }> = (props) => {
  const email = decodeString(siteConfig.author.email);

  const { time, locationWithFlag } = useLocationTime({
    country: "Nigeria",
    state: "FCT Abuja",
  });

  const links: ContactRowProps[] = [
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
  ];

  const details: ContactRowProps[] = [
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
        {/* Left column — socials + email */}
        <motion.div
          variants={parentVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="flex flex-col gap-2"
        >
          {links.map((item) => (
            <ContactRow key={item.id} {...item} />
          ))}
        </motion.div>

        {/* Right column — location + time, plus room for your new component */}

        <motion.div
          variants={parentVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="flex flex-col gap-2"
        >
          {details.map((item) => (
            <ContactRow key={item.id} {...item} />
          ))}

          <FadeLine className="relative mx-auto my-4 w-[80%]" />

          <motion.div variants={itemVariants}>
            <ContactForm from={props.from} />
          </motion.div>
        </motion.div>
      </Container>
    </section>
  );
};

const ContactForm: React.FC<{ from?: string }> = (props) => {
  const { play } = useSoundFx();
  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      message: "",
      website: "", // honeypot
      from: props.from ? `the ${props.from} page` : undefined,
    },
  });

  const [step, setStep] = React.useState<number>(0);
  const [direction, setDirection] = React.useState<1 | -1>(1);
  const [status, setStatus] = React.useState<Status>("idle");
  const [isInView, setIsInView] = React.useState<boolean>(false);
  const [serverError, setServerError] = React.useState<string | null>(null);

  const [formEl, setFormEl] = React.useState<HTMLFormElement | null>(null);

  React.useEffect(() => {
    if (status !== "active" || !isInView) return;

    let cancelled = false;
    let frame = 0;
    const startedAt = performance.now();
    const MAX_WAIT = 1000;

    const tryFocus = () => {
      if (cancelled) return;

      const el = document.getElementById(STEPS[step].id) as
        | HTMLInputElement
        | HTMLTextAreaElement
        | null;

      if (el) {
        el.focus({ preventScroll: true });
        return;
      }

      if (performance.now() - startedAt < MAX_WAIT) {
        frame = requestAnimationFrame(tryFocus);
      }
    };

    frame = requestAnimationFrame(tryFocus);
    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
    };
  }, [step, status, isInView]);

  React.useEffect(() => {
    if (!formEl) {
      setIsInView(false);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => setIsInView(entry.isIntersecting),
      { threshold: 0.3 },
    );

    observer.observe(formEl);
    return () => observer.disconnect();
  }, [formEl]);

  React.useEffect(() => {
    if (status !== "sent") return;

    const timer = setTimeout(() => {
      form.reset();
      setStep(0);
      setStatus("idle");
    }, 5000);

    return () => clearTimeout(timer);
  }, [status, form]);

  const maxLength = CONTACT_LIMITS.message.max;
  const current = STEPS[step];
  const isSending = status === "sending";

  const watchedValues = form.watch();
  const currentVal = watchedValues[current.id] || "";
  const currentError = form.formState.errors[current.id]?.message;

  const handleStart = () => {
    setStatus("active");
    play("double-click");
  };

  const goNext = async () => {
    const isValid = await form.trigger(current.id);
    if (!isValid) return;

    setDirection(1);
    setStep((prev) => Math.min(prev + 1, STEPS.length - 1));
    play("skip-next");
  };

  const goBack = () => {
    setServerError(null);
    setDirection(-1);
    setStep((prev) => Math.max(prev - 1, 0));
    play("skip-previous");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      goNext();
    }
  };

  async function onSubmit(data: ContactFormValues) {
    setServerError(null);

    const task = play("processing");
    setStatus("sending");

    try {
      const result = await sendContactMessage(data);
      task?.stop();

      if (result.ok) {
        setStatus("sent");
        play("success");
        return;
      }

      setStatus("active");

      if (result.error === "invalid") {
        // Surface the server's field errors and jump to the first bad step
        let firstBadStep = -1;

        STEPS.forEach((item, index) => {
          const message = result.fieldErrors[item.id];
          if (!message) return;

          form.setError(item.id, { type: "server", message });
          if (firstBadStep === -1) firstBadStep = index;
        });

        if (firstBadStep !== -1 && firstBadStep !== step) {
          setDirection(firstBadStep < step ? -1 : 1);
          setStep(firstBadStep);
        }
      }

      setServerError(result.message);
    } catch {
      task?.stop();
      setStatus("active");
      setServerError("Something went wrong. Please try again.");
    }
  }

  return (
    <form
      ref={setFormEl}
      onSubmit={form.handleSubmit(onSubmit)}
      className="w-full sm:max-w-xs"
      noValidate
    >
      {/* Honeypot: invisible to people, tempting to bots */}
      <input
        type="text"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute -left-[9999px] h-0 w-0 opacity-0"
        {...form.register("website")}
      />

      <AnimatePresence mode="popLayout">
        {status === "idle" ? (
          <motion.div
            key="idle"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <div
              role="button"
              tabIndex={0}
              onClick={handleStart}
              className="group flex cursor-pointer flex-col gap-3 rounded-lg border bg-background px-4 py-3.5 transition-colors hover:text-primary"
            >
              <div className="flex items-center justify-between">
                <p className="flex flex-col font-light text-sm">
                  <span>Have something on your mind?</span>
                  <span>Leave a message</span>
                </p>

                <ChevronRightIcon className="size-4 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          </motion.div>
        ) : status === "sent" ? (
          <motion.div
            key="sent"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <div className="group flex flex-col gap-3 rounded-lg border border-green-500 bg-green-500/5 px-4 py-3.5 text-green-600 transition-colors dark:bg-green-500/10">
              <div className="flex items-center justify-between">
                <p className="font-light text-sm">
                  Thanks{" "}
                  <strong>
                    {watchedValues.name
                      ? `, ${watchedValues.name.trim().split(" ")[0]}`
                      : ""}
                  </strong>{" "}
                  — your message is on its way. I&apos;ll reply to your email
                  soon.
                </p>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="active"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <FieldSet>
              <FieldGroup>
                <Field>
                  <FieldLabel className="flex items-center justify-between px-2 font-normal text-[13px]">
                    <span>{current.label}</span>
                    <span>
                      Steps {step + 1} / {STEPS.length}
                    </span>
                  </FieldLabel>

                  <AnimatePresence
                    mode="wait"
                    custom={direction}
                    initial={false}
                  >
                    <motion.div
                      key={current.id}
                      custom={direction}
                      variants={slideVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      className="flex flex-col gap-2"
                    >
                      {current.id === "message" ? (
                        <InputGroup
                          aria-disabled={isSending}
                          className="border-border bg-background"
                        >
                          <InputGroupTextarea
                            id={current.id}
                            {...form.register(current.id)}
                            disabled={isSending}
                            placeholder={current.placeholder}
                            maxLength={maxLength}
                            aria-invalid={!!currentError}
                            className="min-h-16"
                          />
                          <InputGroupAddon
                            align="block-end"
                            aria-disabled={isSending}
                          >
                            <InputGroupText className="text-muted-foreground text-xs">
                              {currentVal.length}/{maxLength} characters
                            </InputGroupText>
                            <InputGroupButton
                              type="submit"
                              variant="secondary"
                              className="ml-auto"
                              isLoading={isSending}
                            >
                              <span className="font-medium text-xs">
                                Submit
                              </span>
                            </InputGroupButton>
                          </InputGroupAddon>
                        </InputGroup>
                      ) : (
                        <InputGroup className="border-border bg-background">
                          <InputGroupAddon
                            className="pl-2.5"
                            aria-disabled={isSending}
                          >
                            {current.id === "name" ? <User2 /> : <AtSign />}
                          </InputGroupAddon>
                          <InputGroupInput
                            id={current.id}
                            {...form.register(current.id)}
                            type={current.id === "email" ? "email" : "text"}
                            autoComplete="off"
                            disabled={isSending}
                            placeholder={current.placeholder}
                            aria-invalid={!!currentError}
                            onKeyDown={handleKeyDown}
                          />

                          <InputGroupAddon
                            align="inline-end"
                            aria-disabled={isSending}
                          >
                            <InputGroupButton
                              type="button"
                              variant="secondary"
                              disabled={isSending}
                              onClick={goNext}
                            >
                              <span className="font-medium text-xs">Next</span>
                            </InputGroupButton>
                          </InputGroupAddon>
                        </InputGroup>
                      )}
                    </motion.div>
                  </AnimatePresence>

                  <div className="px-2">
                    <FieldError className="font-normal text-[13px]">
                      <span>{currentError ?? serverError}</span>
                    </FieldError>

                    <FieldDescription className="flex h-7 items-center gap-1">
                      {STEPS.map((item, index) => (
                        <span
                          key={item.id}
                          className={cn(
                            "h-1 rounded-full transition-all duration-300",
                            index === step && "w-6 bg-primary",
                            index < step && "w-3 bg-primary/40",
                            index > step && "w-3 bg-border",
                          )}
                        />
                      ))}

                      {step > 0 && (
                        <Button
                          type="button"
                          variant="link"
                          size="xs"
                          onClick={goBack}
                          disabled={isSending}
                          className="ml-auto py-0 text-foreground hover:no-underline"
                        >
                          <ChevronLeftIcon className="size-3.5" />
                          <span>Go Back</span>
                        </Button>
                      )}
                    </FieldDescription>
                  </div>
                </Field>
              </FieldGroup>
            </FieldSet>
          </motion.div>
        )}
      </AnimatePresence>
    </form>
  );
};
