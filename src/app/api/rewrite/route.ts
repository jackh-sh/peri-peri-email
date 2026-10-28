import { anthropic, type AnthropicLanguageModelOptions } from "@ai-sdk/anthropic";
import { APICallError, createUIMessageStreamResponse, streamText, toUIMessageStream } from "ai";
import { z } from "zod";

import {
  FLAVOURS,
  buildSystemPrompt,
  buildUserPrompt,
  getFlavour,
  type FlavourId,
} from "@/lib/flavours";

export const maxDuration = 60;

const MAX_EMAIL_LENGTH = 20_000;

const requestSchema = z.object({
  prompt: z.string().trim().min(1, "Paste an email first.").max(MAX_EMAIL_LENGTH),
  flavour: z.enum(FLAVOURS.map((f) => f.id) as [FlavourId, ...FlavourId[]]),
});

export async function POST(req: Request) {
  // The default provider reads the key from ANTHROPIC_API_KEY.
  if (!process.env.ANTHROPIC_API_KEY) {
    return new Response("ANTHROPIC_API_KEY isn't set. Add it to .env and restart the server.", {
      status: 500,
    });
  }

  const parsed = requestSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return new Response(parsed.error.issues[0]?.message ?? "Bad request.", {
      status: 400,
    });
  }

  const { prompt, flavour } = parsed.data;

  const result = streamText({
    model: anthropic("claude-opus-5-5"),
    system: buildSystemPrompt(getFlavour(flavour)),
    prompt: buildUserPrompt(prompt),
    maxOutputTokens: 16_000,
    abortSignal: req.signal,
    providerOptions: {
      anthropic: {
        // Rewording an email is light work; low effort keeps it snappy.
        effort: "low",
        // If a safety classifier blocks the turn, retry server-side on Anthropic's recommended fallback model.
        fallbacks: "default",
      } satisfies AnthropicLanguageModelOptions,
    },
  });

  return createUIMessageStreamResponse({
    stream: toUIMessageStream({
      stream: result.stream,
      onError: (error) => {
        if (APICallError.isInstance(error)) {
          if (error.statusCode === 401) return "Anthropic rejected the ANTHROPIC_API_KEY in .env.";
          if (error.statusCode === 429)
            return "Rate limited by Anthropic. Give it a moment and try again.";
          return error.message;
        }
        return "Something went wrong rewriting that email.";
      },
    }),
  });
}
