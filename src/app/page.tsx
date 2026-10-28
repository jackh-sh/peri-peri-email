"use client";

import { useCompletion } from "@ai-sdk/react";
import { useRef, useState } from "react";

import { ChilliSlider } from "@/components/chilli-slider";
import { REWRITE_ENDPOINT } from "@/lib/api";
import { DEFAULT_FLAVOUR, getFlavour, type FlavourId } from "@/lib/flavours";

const SAMPLE_EMAIL = `Subject: Quarterly report

Hi Sam,

Just checking whether you've had a chance to look at the quarterly report I sent over on Monday. I need your sign-off by Friday so it can go to the board.

Thanks,
Alex`;

export default function Home() {
  const [flavourId, setFlavourId] = useState<FlavourId>(DEFAULT_FLAVOUR);
  const [outputFlavourId, setOutputFlavourId] = useState<FlavourId>(DEFAULT_FLAVOUR);
  const [notice, setNotice] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const stoppedRef = useRef(false);

  const { completion, input, setInput, complete, isLoading, error, stop } = useCompletion({
    api: REWRITE_ENDPOINT,
    throttle: 30,
    onFinish: (_prompt, text) => {
      if (!text.trim() && !stoppedRef.current) {
        setNotice("Claude declined to rewrite that one. Try a different email or heat.");
      }
    },
  });

  const flavour = getFlavour(flavourId);
  const outputFlavour = getFlavour(outputFlavourId);
  const canSubmit = Boolean(input.trim()) && !isLoading;

  function rewrite() {
    if (!canSubmit) return;
    stoppedRef.current = false;
    setNotice(null);
    setCopied(false);
    setOutputFlavourId(flavourId);
    void complete(input, {
      body: { flavour: flavourId },
    });
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(completion);
      setCopied(true);
    } catch {
      setNotice("Couldn't copy to the clipboard. Select the text and copy it manually.");
    }
  }

  const showOutput = Boolean(completion || isLoading || error || notice);

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 md:px-8 md:py-12">
      <header className="mb-8">
        <h1 className="font-display text-4xl font-extrabold tracking-tight md:text-5xl">
          PERi-PERi <span className="text-[var(--accent)]">Email</span>
        </h1>
        <p className="mt-2 text-[var(--muted)]">
          Paste an email. Pick your heat. Send at your own risk.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-6 [grid-template-areas:'email''heat''output'] md:grid-cols-[minmax(0,1fr)_auto] md:grid-rows-[auto_1fr] md:gap-x-10 md:[grid-template-areas:'email_heat''output_heat']">
        <div className="[grid-area:email]">
          <div className="mb-2 flex items-baseline justify-between gap-4">
            <label htmlFor="email" className="text-sm font-semibold">
              Your email
            </label>
            {!input && (
              <button
                type="button"
                onClick={() => setInput(SAMPLE_EMAIL)}
                className="text-sm text-[var(--accent)] underline-offset-2 hover:underline"
              >
                Use an example
              </button>
            )}
          </div>
          <textarea
            id="email"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
                event.preventDefault();
                rewrite();
              }
            }}
            placeholder="Paste the email you want to reword..."
            rows={12}
            className="w-full resize-y rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4 leading-relaxed outline-none focus:border-[var(--accent)]"
          />
        </div>

        <aside className="flex flex-col items-center gap-4 [grid-area:heat] md:sticky md:top-8 md:self-start">
          <h2 className="font-display text-xl font-bold">Pick your heat</h2>
          <ChilliSlider value={flavourId} onChange={setFlavourId} />
          <p className="text-center text-sm text-[var(--muted)]" aria-live="polite">
            <span className="font-semibold text-[var(--ink)]">{flavour.name}:</span>{" "}
            {flavour.tagline}
          </p>
          {isLoading ? (
            <button
              type="button"
              onClick={() => {
                stoppedRef.current = true;
                stop();
              }}
              className="w-full rounded-full border-2 border-[var(--ink)] px-6 py-3 font-display text-lg font-bold"
            >
              Stop
            </button>
          ) : (
            <button
              type="button"
              onClick={rewrite}
              disabled={!canSubmit}
              className="w-full rounded-full border-2 border-[var(--ink)] px-6 py-3 font-display text-lg font-bold shadow-md transition-[transform,background-color] enabled:hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40"
              style={{
                backgroundColor: flavour.colour,
                color: flavour.heat >= 3 ? "#fff" : "#23140f",
              }}
            >
              Rewrite it {flavour.name}
            </button>
          )}
        </aside>

        {showOutput && (
          <section className="[grid-area:output]" aria-live="polite">
            <div className="mb-2 flex items-center justify-between gap-4">
              <h2 className="text-sm font-semibold">
                Rewritten at{" "}
                <span
                  className="rounded-full px-2 py-0.5 text-[var(--ink)]"
                  style={{ backgroundColor: `${outputFlavour.colour}55` }}
                >
                  {outputFlavour.name}
                </span>
              </h2>
              {completion && !isLoading && (
                <button
                  type="button"
                  onClick={copy}
                  className="rounded-lg border border-[var(--line)] px-3 py-1 text-sm hover:bg-[var(--surface)]"
                >
                  {copied ? "Copied" : "Copy"}
                </button>
              )}
            </div>
            <div
              className="min-h-32 whitespace-pre-wrap rounded-2xl border-2 bg-[var(--surface)] p-4 leading-relaxed"
              style={{ borderColor: outputFlavour.colour }}
            >
              {completion ||
                (isLoading && (
                  <span className="animate-pulse text-[var(--muted)]">Firing up the grill...</span>
                ))}
            </div>
            {error && (
              <p role="alert" className="mt-3 text-sm text-[var(--accent)]">
                {error.message}
              </p>
            )}
            {notice && <p className="mt-3 text-sm text-[var(--muted)]">{notice}</p>}
          </section>
        )}
      </div>
    </main>
  );
}
