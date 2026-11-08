"use client";

import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { sendTestEmail } from "@/actions/email-test.action";
import { Button } from "@/components/reusable/shadcn/button";
import { Container } from "@/components/shared/container";
import { CurveThingy } from "@/components/shared/curve-thingy";
import { QuickHero } from "@/components/shared/quick-hero";
import {
  EMAIL_GROUPS,
  EMAIL_TEMPLATES,
  type EmailTemplate,
  type EmailTemplateId,
} from "@/emails/registry";
import { cn } from "@/lib/utils";

type Device = "mobile" | "desktop";
type Mode = "light" | "dark";

const WIDTH = { mobile: 375, desktop: 640 } as const;
// Mail apps add their own padding around the email. Simulated here.
const CLIENT_PADDING = { mobile: 16, desktop: 32 } as const;
const CLIENT_BG = { light: "#ffffff", dark: "#121212" } as const;

function buildDocument(template: EmailTemplate, device: Device, mode: Mode) {
  // Force the dark stylesheet on (or off) so you can preview both modes
  // regardless of your OS setting. parent.tsx has exactly one such query.
  const html = renderToStaticMarkup(template.render()).replace(
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

function TemplateList(props: {
  value: EmailTemplateId;
  onChange: (id: EmailTemplateId) => void;
}) {
  return (
    <nav aria-label="Email templates" className="flex flex-col gap-5">
      {EMAIL_GROUPS.map((group) => (
        <div key={group.id} className="flex flex-col gap-1.5">
          <h2 className="text-muted-foreground px-2 text-[11px] font-medium tracking-wider uppercase">
            {group.label}
          </h2>

          <ul className="flex flex-col gap-0.5">
            {EMAIL_TEMPLATES.filter((item) => item.group === group.id).map(
              (item) => {
                const active = item.id === props.value;

                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      aria-current={active ? "true" : undefined}
                      onClick={() => props.onChange(item.id)}
                      className={cn(
                        "flex w-full flex-col items-start rounded-md border px-2.5 py-2 text-left transition-colors",
                        active
                          ? "bg-muted border-border"
                          : "hover:bg-muted/50 border-transparent",
                      )}
                    >
                      <span className="text-sm leading-5 font-medium">
                        {item.label}
                      </span>
                      <span className="text-muted-foreground text-xs leading-4">
                        {item.description}
                      </span>
                    </button>
                  </li>
                );
              },
            )}
          </ul>
        </div>
      ))}
    </nav>
  );
}

export const EmailPreview = () => {
  const [templateId, setTemplateId] =
    React.useState<EmailTemplateId>("contact-urgent");
  const [device, setDevice] = React.useState<Device>("mobile");
  const [mode, setMode] = React.useState<Mode>("light");
  const [height, setHeight] = React.useState(420);
  const [sending, setSending] = React.useState(false);
  const [result, setResult] = React.useState<{
    ok: boolean;
    message: string;
  } | null>(null);

  const iframeRef = React.useRef<HTMLIFrameElement>(null);

  const template = React.useMemo(
    () => EMAIL_TEMPLATES.find((item) => item.id === templateId),
    [templateId],
  ) as EmailTemplate;

  const srcDoc = React.useMemo(
    () => buildDocument(template, device, mode),
    [template, device, mode],
  );

  const fitHeight = () => {
    const doc = iframeRef.current?.contentDocument;
    if (doc) setHeight(doc.documentElement.scrollHeight);
  };

  const selectTemplate = (id: EmailTemplateId) => {
    setTemplateId(id);
    setResult(null);
  };

  const handleSend = async () => {
    setSending(true);
    setResult(null);

    try {
      setResult(await sendTestEmail(templateId));
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
    <div className="flex-1 overflow-x-clip">
      <QuickHero
        title="Email Preview"
        description={`Development only. ${EMAIL_TEMPLATES.length} emails. Mail apps add their
          own padding and background, so the frame simulates them.`}
      />

      <CurveThingy tCurve>
        <div id="everything" className="pt-20 sm:pt-30 md:pt-36">
          <Container size="md">
            <div className="grid gap-8 lg:grid-cols-[240px_minmax(0,1fr)]">
              <aside className="lg:sticky lg:top-8 lg:self-start">
                <TemplateList value={templateId} onChange={selectTemplate} />
              </aside>

              <section className="flex min-w-0 flex-col gap-4">
                <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
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

                <div className="bg-card overflow-hidden rounded-xl border">
                  <div className="flex flex-col gap-3 border-b px-5 py-4">
                    <h2 className="text-base leading-6 font-medium">
                      {template.subject}
                    </h2>

                    <div className="flex items-center gap-3">
                      <span
                        aria-hidden="true"
                        className="bg-muted text-muted-foreground flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-medium"
                      >
                        {template.from.charAt(0)}
                      </span>
                      <div className="flex min-w-0 flex-col text-sm leading-5">
                        <span className="truncate font-medium">
                          {template.from}
                        </span>
                        <span className="text-muted-foreground truncate text-xs">
                          to {template.to}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div
                    className="overflow-x-auto"
                    style={{ backgroundColor: CLIENT_BG[mode] }}
                  >
                    <iframe
                      ref={iframeRef}
                      title="Email preview"
                      srcDoc={srcDoc}
                      sandbox="allow-same-origin"
                      onLoad={fitHeight}
                      className="mx-auto block max-w-full"
                      style={{ width: WIDTH[device], height }}
                    />
                  </div>
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
                        result.ok
                          ? "text-sm text-green-600"
                          : "text-destructive text-sm"
                      }
                    >
                      {result.message}
                    </p>
                  )}
                </div>
              </section>
            </div>
          </Container>
        </div>
      </CurveThingy>
    </div>
  );
};
