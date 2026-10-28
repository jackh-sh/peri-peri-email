# PERi-PERi Email

Paste an email, pick a heat on the chilli, and Claude rewrites it at that level of anger, from **Plain...ish** (calm and gracious) through Lemon & Herb, Mango & Lime, Medium and Hot, up to **Extra Hot** (comically unhinged).

Built with Next.js, the [AI SDK](https://ai-sdk.dev) and `@ai-sdk/anthropic`, using `claude-opus-5-5`.

## Running it

```bash
pnpm install
pnpm dev
```

Put your Anthropic API key in `.env` (gitignored), then open http://localhost:3000:

```bash
ANTHROPIC_API_KEY=sk-ant-...
```

The key stays on the server; the `/api/rewrite` route reads it from the environment.

## Scripts

| Script              | What it does                       |
| ------------------- | ---------------------------------- |
| `pnpm lint`         | ESLint                             |
| `pnpm format`       | Prettier (write)                   |
| `pnpm format:check` | Prettier (check)                   |
| `pnpm typecheck`    | Generate Next route types, run tsc |
| `pnpm test`         | Vitest unit tests                  |
| `pnpm build`        | Production build                   |

## Where things live

- `src/lib/flavours.ts`: the heat scale and the prompts built from it
- `src/app/api/rewrite/route.ts`: streams the rewrite from Claude
- `src/components/chilli-slider.tsx`: the chilli heat picker (click, drag, or arrow keys)
