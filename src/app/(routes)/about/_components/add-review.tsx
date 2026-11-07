"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "motion/react";
import React from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { VscStarEmpty, VscStarFull, VscStarHalf } from "react-icons/vsc";
import { Add, CircleInfo, Send4 } from "reicon-react";
import type { z } from "zod";
import { submitTestimonial } from "@/actions/testimonial.action";
import { useSoundFx } from "@/components/provider/sound-fx";
import { useToggle } from "@/components/provider/toggle";
import { Frame, FramePanel } from "@/components/reusable/reui/frame";
import { Button } from "@/components/reusable/shadcn/button";
import { Checkbox } from "@/components/reusable/shadcn/checkbox";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerTrigger,
} from "@/components/reusable/shadcn/drawer";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/reusable/shadcn/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
  InputGroupTextarea,
} from "@/components/reusable/shadcn/input-group";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/reusable/shadcn/popover";
import { Container } from "@/components/shared/container";
import { itemVariants } from "@/constants/variants";
import { cn } from "@/lib/utils";
import {
  TESTIMONIAL_LIMITS,
  type TestimonialFormValues,
  testimonialSchema,
} from "@/lib/validations/testimonial";
import { Testimonial } from "./testimonial";

type Status = "idle" | "active" | "sent";

const renderBtn = (
  <motion.div
    initial="hidden"
    whileInView="visible"
    exit="exit"
    layout
    variants={itemVariants}
  >
    <div className="group inline-block w-full cursor-pointer break-inside-avoid rounded-[20px]! shadow-2xs">
      <Frame
        variant="inverse"
        className="bg-background dark:bg-card flex flex-col justify-between overflow-hidden rounded-[20px]"
      >
        <FramePanel className="bg-background flex flex-col gap-6 overflow-y-auto rounded-2xl border-dashed px-5 py-4">
          <div className="flex aspect-video flex-col items-center justify-center md:aspect-[1.5]">
            <Add className="text-muted-foreground size-12 opacity-50" />

            <div className="space-y-1 py-3 text-center">
              <p className="text-foreground text-sm font-medium">
                Share Your Experience
              </p>
              <p className="text-muted-foreground text-xs font-light">
                Worked with me? Leave a quick review.
              </p>
            </div>
          </div>
        </FramePanel>
      </Frame>
    </div>
  </motion.div>
);

// Isolated preview wrapper so typing doesn't re-render the parent form
const LiveTestimonialPreview = React.memo(({ control }: { control: any }) => {
  const company = useWatch({ control, name: "company" });
  const content = useWatch({ control, name: "content" });
  const name = useWatch({ control, name: "name" });
  const rating = useWatch({ control, name: "rating" });
  const role = useWatch({ control, name: "role" });
  const url = useWatch({ control, name: "url" });

  return (
    <Testimonial
      preview
      testimonial={{
        _id: "preview-id",
        approve: true,
        company: company || "Organization or School",
        content: content || "Your testimonial goes here",
        name: name || "Your name",
        rating: rating || 5,
        role: role || "Your role",
        url: url || null,
      }}
    />
  );
});
LiveTestimonialPreview.displayName = "LiveTestimonialPreview";

export const AddReview = () => {
  const { play } = useSoundFx();

  const { isOpen: open, toggle: setOpen, close } = useToggle("testimonial");
  const [status, setStatus] = React.useState<Status>("idle");
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [isSending, startTransition] = React.useTransition();

  const form = useForm<
    z.input<typeof testimonialSchema>,
    any,
    z.output<typeof testimonialSchema>
  >({
    resolver: zodResolver(testimonialSchema),
    defaultValues: {
      name: "",
      email: "",
      company: "",
      role: "",
      url: "",
      rating: 4.5,
      content: "",
      consentToDisplay: false,
    },
  });

  const {
    handleSubmit,
    control,
    setError,
    reset,
    formState: { errors },
  } = form;

  React.useEffect(() => {
    if (status !== "sent") return;

    const timer = setTimeout(() => {
      reset();
      setStatus("idle");
      close();
    }, 5000);

    return () => clearTimeout(timer);
  }, [status, reset, close]);

  function onSubmit(values: TestimonialFormValues) {
    setServerError(null);
    const task = play("processing");

    startTransition(async () => {
      try {
        const result = await submitTestimonial(values);
        task?.stop();

        if (result.ok) {
          setStatus("sent");
          play("success");
          return;
        }

        setStatus("active");

        if (result.error === "invalid" && result.fieldErrors) {
          Object.entries(result.fieldErrors).forEach(([field, message]) => {
            if (message) {
              setError(field as keyof TestimonialFormValues, {
                type: "server",
                message,
              });
            }
          });
        }

        setServerError(result.message);
      } catch {
        task?.stop();
        setStatus("active");
        setServerError("Something went wrong. Please try again.");
      }
    });
  }

  return (
    <Drawer showSwipeHandle open={open} onOpenChange={setOpen}>
      <DrawerTrigger nativeButton={false} render={renderBtn} />
      <DrawerContent>
        <Container
          size="md"
          className="flex-1 overflow-y-auto pt-10 pb-20 md:pt-16 md:pb-20"
        >
          <div className="grid grid-cols-1 gap-6 md:grid-cols-5 lg:gap-8 xl:grid-cols-8">
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="md:col-span-3 xl:col-span-5"
            >
              <Frame
                className={cn(
                  "bg-background dark:bg-card rounded-[20px]!",
                  "shadow-[0_5px_20px_rgba(0,0,0,0.05)] dark:shadow-[0_5px_20px_rgba(0,0,0,0.8)]",
                )}
              >
                <div className="flex flex-col gap-0.5 px-4 py-3">
                  <h1 className="font-serif text-lg lowercase md:text-xl">
                    Share your thoughts
                  </h1>
                  <p className="text-muted-foreground text-sm">
                    I appreciate your feedback and insights.
                  </p>
                </div>

                <FramePanel className="bg-background rounded-2xl">
                  {status === "sent" ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                      className="relative flex min-h-75 flex-col items-center justify-center gap-3 overflow-hidden p-6 text-center"
                    >
                      <div className="from-primary/10 pointer-events-none absolute inset-0 bg-radial via-transparent to-transparent opacity-70" />

                      <motion.div
                        initial={{ scale: 0, rotate: -45 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{
                          type: "spring",
                          stiffness: 300,
                          damping: 20,
                          delay: 0.1,
                        }}
                        className="bg-primary/10 text-primary flex size-12 items-center justify-center rounded-full shadow-inner"
                      >
                        <svg
                          className="size-6"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2.5}
                        >
                          <title>Check</title>
                          <motion.path
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 0.4, delay: 0.25 }}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </motion.div>

                      <div className="z-10 space-y-1">
                        <h3 className="text-foreground text-base font-medium tracking-tight md:text-lg">
                          Testimonial Received!
                        </h3>
                        <p className="text-muted-foreground max-w-sm text-xs leading-relaxed md:text-sm">
                          Thank you for your feedback. It’s pending quick review
                          and will show up on the site soon.
                        </p>
                      </div>
                    </motion.div>
                  ) : (
                    <FieldContent>
                      <FieldGroup className="gap-3">
                        {serverError && (
                          <div className="bg-destructive/10 text-destructive rounded-lg p-3 text-xs font-medium">
                            {serverError}
                          </div>
                        )}

                        <div className="grid grid-cols-6 gap-3 sm:grid-cols-6">
                          <Controller
                            name="name"
                            control={control}
                            render={({ field }) => (
                              <Field
                                className="col-span-3 gap-1.5"
                                data-invalid={!!errors.name}
                              >
                                <FieldLabel className="px-1.5" required>
                                  Full Name
                                </FieldLabel>
                                <InputGroup className="bg-card">
                                  <InputGroupInput
                                    type="text"
                                    {...field}
                                    disabled={isSending}
                                    placeholder="Sarah Jenkins"
                                    aria-invalid={!!errors.name}
                                  />
                                </InputGroup>
                                <FieldError className="px-1.5">
                                  {errors.name?.message}
                                </FieldError>
                              </Field>
                            )}
                          />
                          <Controller
                            name="email"
                            control={control}
                            render={({ field }) => (
                              <Field
                                className="col-span-3 gap-1.5"
                                data-invalid={!!errors.email}
                              >
                                <FieldLabel className="px-1.5" required>
                                  Email Address
                                </FieldLabel>
                                <InputGroup className="bg-card">
                                  <InputGroupInput
                                    type="email"
                                    {...field}
                                    disabled={isSending}
                                    aria-invalid={!!errors.email}
                                    placeholder="sarah@example.com"
                                  />
                                </InputGroup>
                                <FieldError className="px-1.5">
                                  {errors.email?.message}
                                </FieldError>
                              </Field>
                            )}
                          />
                        </div>
                        <div className="grid grid-cols-6 gap-3 sm:grid-cols-6">
                          <Controller
                            name="role"
                            control={control}
                            render={({ field }) => (
                              <Field
                                className="col-span-3 gap-1.5"
                                data-invalid={!!errors.role}
                              >
                                <FieldLabel className="px-1.5" required>
                                  Role or Title
                                </FieldLabel>
                                <InputGroup className="bg-card">
                                  <InputGroupInput
                                    type="text"
                                    {...field}
                                    disabled={isSending}
                                    aria-invalid={!!errors.role}
                                    placeholder="Product Manager or Student"
                                  />
                                </InputGroup>
                                <FieldError className="px-1.5">
                                  {errors.role?.message}
                                </FieldError>
                              </Field>
                            )}
                          />
                          <Controller
                            name="company"
                            control={control}
                            render={({ field }) => (
                              <Field
                                className="col-span-3 gap-1.5"
                                data-invalid={!!errors.company}
                              >
                                <FieldLabel className="px-1.5">
                                  Organization or School
                                </FieldLabel>
                                <InputGroup className="bg-card">
                                  <InputGroupInput
                                    type="text"
                                    {...field}
                                    disabled={isSending}
                                    aria-invalid={!!errors.company}
                                    placeholder="Vercel or Excel Academy"
                                  />
                                </InputGroup>
                                <FieldError className="px-1.5">
                                  {errors.company?.message}
                                </FieldError>
                              </Field>
                            )}
                          />
                        </div>
                        <div className="grid grid-cols-6 gap-3 sm:grid-cols-6">
                          <Controller
                            name="rating"
                            control={control}
                            render={({ field }) => {
                              const val =
                                typeof field.value === "number"
                                  ? field.value
                                  : Number(field.value);
                              const isEmpty =
                                field.value === undefined ||
                                field.value === null ||
                                Number.isNaN(val);
                              const isDecimal = !isEmpty && val % 1 !== 0;

                              return (
                                <Field
                                  className="col-span-3 gap-1.5 sm:col-span-2"
                                  data-invalid={!!errors.rating}
                                >
                                  <FieldLabel className="px-1.5" required>
                                    Rating
                                  </FieldLabel>
                                  <InputGroup className="bg-card">
                                    <InputGroupAddon className="transition-colors">
                                      {isEmpty ? (
                                        <VscStarEmpty className="text-muted-foreground/50 size-4" />
                                      ) : isDecimal ? (
                                        <VscStarHalf className="text-muted-foreground/50 size-4" />
                                      ) : (
                                        <VscStarFull className="text-muted-foreground/50 size-4" />
                                      )}
                                    </InputGroupAddon>

                                    <InputGroupInput
                                      type="number"
                                      {...field}
                                      disabled={isSending}
                                      onChange={(e) =>
                                        field.onChange(
                                          e.target.value === ""
                                            ? ""
                                            : Number(e.target.value),
                                        )
                                      }
                                      placeholder="4.5"
                                      aria-invalid={!!errors.rating}
                                      // min={0.5}
                                      // max={5}
                                      step={0.5}
                                    />
                                    <InputGroupAddon align="inline-end">
                                      <InputGroupText>Rating</InputGroupText>
                                    </InputGroupAddon>
                                  </InputGroup>
                                  <FieldError className="px-1.5">
                                    {errors.rating?.message}
                                  </FieldError>
                                </Field>
                              );
                            }}
                          />

                          <Controller
                            name="url"
                            control={control}
                            render={({ field }) => (
                              <Field
                                className="col-span-3 gap-1.5 sm:col-span-4"
                                data-invalid={!!errors.url}
                              >
                                <FieldLabel className="px-1.5">
                                  Website or Handle
                                </FieldLabel>
                                <InputGroup className="bg-card">
                                  <InputGroupInput
                                    type="text"
                                    {...field}
                                    disabled={isSending}
                                    aria-invalid={!!errors.url}
                                    placeholder="https://example.com"
                                  />
                                  <InputGroupAddon
                                    align="inline-end"
                                    className="-mr-1.5"
                                  >
                                    <Popover>
                                      <PopoverTrigger
                                        render={
                                          <InputGroupButton size="icon-xs" />
                                        }
                                      >
                                        <CircleInfo />
                                      </PopoverTrigger>
                                      <PopoverContent align="end">
                                        <div className="text-[13px] leading-relaxed">
                                          Adding your website or social handle
                                          lets visitors confirm authentic
                                          feedback or reach out to collaborate
                                          with you.
                                        </div>
                                      </PopoverContent>
                                    </Popover>
                                  </InputGroupAddon>
                                </InputGroup>
                                <FieldError className="px-1.5">
                                  {errors.url?.message}
                                </FieldError>
                              </Field>
                            )}
                          />
                        </div>
                        <div className="grid grid-cols-4 gap-3 md:grid-cols-1 lg:grid-cols-4">
                          <Controller
                            name="content"
                            control={control}
                            render={({ field }) => (
                              <Field
                                className="col-span-4 gap-1.5"
                                data-invalid={!!errors.content}
                              >
                                <FieldLabel className="px-1.5" required>
                                  Your Testimonial
                                </FieldLabel>
                                <InputGroup className="bg-card">
                                  <InputGroupTextarea
                                    {...field}
                                    disabled={isSending}
                                    aria-invalid={!!errors.content}
                                    maxLength={TESTIMONIAL_LIMITS.content.max}
                                    placeholder="Share your experience working or learning together.."
                                    className="min-h-16 pb-16"
                                  />
                                  <InputGroupAddon align="block-end">
                                    <InputGroupText className="text-muted-foreground text-xs">
                                      {field.value?.length || 0} of{" "}
                                      {TESTIMONIAL_LIMITS.content.max}{" "}
                                      characters
                                    </InputGroupText>
                                  </InputGroupAddon>
                                </InputGroup>
                                <FieldError className="px-1.5">
                                  {errors.content?.message}
                                </FieldError>
                              </Field>
                            )}
                          />

                          {/* ========================================== */}
                          {/* Consent Checkbox Added Below The Textarea  */}
                          {/* ========================================== */}
                          <Controller
                            name="consentToDisplay"
                            control={control}
                            render={({ field }) => (
                              <FieldLabel className="col-span-4 max-w-sm">
                                <Field
                                  orientation="horizontal"
                                  data-invalid={!!errors.consentToDisplay}
                                >
                                  <Checkbox
                                    disabled={isSending}
                                    checked={!!field.value}
                                    onCheckedChange={field.onChange}
                                    aria-invalid={!!errors.consentToDisplay}
                                  />
                                  <FieldContent>
                                    <FieldLabel required>
                                      You may show this on the site.
                                    </FieldLabel>
                                    {errors.consentToDisplay?.message ? (
                                      <FieldError>
                                        {errors.consentToDisplay.message}
                                      </FieldError>
                                    ) : (
                                      <FieldDescription>
                                        With the name and role above, next to
                                        the quote.
                                      </FieldDescription>
                                    )}
                                  </FieldContent>
                                </Field>
                              </FieldLabel>
                            )}
                          />
                        </div>
                      </FieldGroup>
                    </FieldContent>
                  )}
                </FramePanel>

                {status !== "sent" && (
                  <DrawerFooter className="px-4 py-3">
                    <div className="wrapper mx-auto flex flex-1 items-center gap-1.5 sm:ml-0">
                      <Button
                        size="default"
                        variant="inverse"
                        type="submit"
                        isLoading={isSending}
                        disabled={isSending}
                        loadingTxt="Please wait.."
                        className="flex-1"
                      >
                        <Send4 />
                        <span>Submit Testimonial</span>
                      </Button>

                      <DrawerClose
                        render={
                          <Button
                            variant="inverse"
                            type="button"
                            disabled={isSending}
                            onClick={() => form.reset()}
                          >
                            Cancel
                          </Button>
                        }
                      />
                    </div>
                  </DrawerFooter>
                )}
              </Frame>
            </form>

            <div className="hidden md:col-span-2 md:block xl:col-span-3">
              <LiveTestimonialPreview control={control} />
            </div>
          </div>
        </Container>
      </DrawerContent>
    </Drawer>
  );
};
