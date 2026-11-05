"use client";

import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { sendTestEmail } from "@/actions/email-test.action";
import { Button } from "@/components/reusable/shadcn/button";
import AutoReplyEmail from "@/emails/auto-reply-email";
import ContactEmail from "@/emails/contact-email";
import TestimonialEmail from "@/emails/testimonial-email";

type TemplateId = "contact" | "auto-reply" | "testimonial";
type Device = "mobile" | "desktop";
type Mode = "light" | "dark";

const WIDTH = { mobile: 375, desktop: 640 } as const;
// Mail apps add their own padding around the email. Simulated here.
const CLIENT_PADDING = { mobile: 16, desktop: 32 } as const;
const CLIENT_BG = { light: "#ffffff", dark: "#121212" } as const;

function buildDocument(template: TemplateId, device: Device, mode: Mode) {
  const element =
    template === "contact" ? (
      <ContactEmail {...ContactEmail.PreviewProps} />
    ) : template === "auto-reply" ? (
      <AutoReplyEmail {...AutoReplyEmail.PreviewProps} />
    ) : (
      <TestimonialEmail {...TestimonialEmail.PreviewProps} />
    );

  // Force the dark stylesheet on (or off) so you can preview both modes
  // regardless of your OS setting.
  const html = renderToStaticMarkup(element).replace(
    "(prefers-color-scheme: dark)",
    mode === "dark" ? "all" : "not all",
  );

  const simulatedClient = `<style>html,body{background:${CLIENT_BG[mode]} !important}body{padding:${CLIENT_PADDING[device]}px !important;box-sizing:border-box}</style>`;

  return `<!DOCTYPE html>${html.replace("</head>", `${simulatedClient}</head>`)}`;
}

function Segmented<T extends string>(props: {
  label: string;
  value: T;
  options: readonly { id: T; label: string }[];
  onChange: (value: T) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-muted-foreground text-xs">{props.label}</span>
      <div className="flex gap-1">
        {props.options.map((option) => (
          <Button
            key={option.id}
            type="button"
            size="xs"
            variant={props.value === option.id ? "default" : "secondary"}
            aria-pressed={props.value === option.id}
            onClick={() => props.onChange(option.id)}
          >
            {option.label}
          </Button>
        ))}
      </div>
    </div>
  );
}

export const EmailPreview = () => {
  const [template, setTemplate] = React.useState<TemplateId>("contact");
  const [device, setDevice] = React.useState<Device>("mobile");
  const [mode, setMode] = React.useState<Mode>("light");
  const [height, setHeight] = React.useState(520);
  const [sending, setSending] = React.useState(false);
  const [result, setResult] = React.useState<{
    ok: boolean;
    message: string;
  } | null>(null);

  const iframeRef = React.useRef<HTMLIFrameElement>(null);

  const srcDoc = React.useMemo(
    () => buildDocument(template, device, mode),
    [template, device, mode],
  );

  const fitHeight = () => {
    const doc = iframeRef.current?.contentDocument;
    if (doc) setHeight(doc.documentElement.scrollHeight);
  };

  const handleSend = async () => {
    setSending(true);
    setResult(null);

    try {
      setResult(await sendTestEmail(template));
    } catch {
      setResult({
        ok: false,
        message: "The request failed. Is the dev server running?",
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-dvh max-w-3xl flex-col gap-6 px-4 py-10">
      <header className="flex flex-col gap-1">
        <h1 className="text-lg font-medium">Email preview</h1>
        <p className="text-muted-foreground text-sm">
          Development only. Mail apps add their own padding and background, so
          the frame simulates them.
        </p>
      </header>

      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        <Segmented
          label="Template"
          value={template}
          onChange={setTemplate}
          options={[
            { id: "contact", label: "Email to you" },
            { id: "auto-reply", label: "Visitor confirmation" },
            { id: "testimonial", label: "New testimonial" },
          ]}
        />
        <Segmented
          label="Width"
          value={device}
          onChange={setDevice}
          options={[
            { id: "mobile", label: "Mobile" },
            { id: "desktop", label: "Desktop" },
          ]}
        />
        <Segmented
          label="Mode"
          value={mode}
          onChange={setMode}
          options={[
            { id: "light", label: "Light" },
            { id: "dark", label: "Dark" },
          ]}
        />
      </div>

      <div className="bg-muted/30 overflow-x-auto rounded-lg border p-4">
        <iframe
          ref={iframeRef}
          title="Email preview"
          srcDoc={srcDoc}
          sandbox="allow-same-origin"
          onLoad={fitHeight}
          className="mx-auto block rounded-md border"
          style={{ width: WIDTH[device], height }}
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button
          type="button"
          size="sm"
          onClick={handleSend}
          isLoading={sending}
          loadingTxt="Please wait.."
        >
          Send this test to my inbox
        </Button>

        {result && (
          <p
            role="status"
            className={
              result.ok ? "text-sm text-green-600" : "text-destructive text-sm"
            }
          >
            {result.message}
          </p>
        )}
      </div>
    </main>
  );
};
