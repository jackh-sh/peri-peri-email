# PERi-PERi Email


I had a slightly wacky idea, partly because it made me laugh and partly because I wanted to see how far I could get with as little prompting as possible. 

PERi-PERi Email combines two of my favourite things: emails and heat. Paste in your email, pick a heat on the chilli, and Claude rewrites it to match.

- **Too mellow?** Turn it up to Hot or Extra Hot and let your inner middle manager out.
- **Fuming, and about to say something HR will want a word about?** Cool it down to Lemon & Herb.

Send at your own risk.

## The heat scale

| Heat         | Tone                                   | Best for                           |
| ------------ | -------------------------------------- | ---------------------------------- |
| Plain...ish  | Calm. Gracious. Unbothered.            | Emails your mum might be cc'd on   |
| Lemon & Herb | Friendly, but firm.                    | The first follow-up                |
| Mango & Lime | Sweet with a kick. Passive-aggressive. | "Per my last email"                |
| Medium       | Openly irritated.                      | The third follow-up                |
| Hot          | Properly angry.                        | CAPITALS, deadlines and ultimatums |
| Extra Hot    | Incandescent. Unhinged. On fire.       | Drafts you should never, ever send |

Even at Extra Hot it keeps every fact, name and date from your original, censors the swearing (#@%!), and won't go after anyone personally. The anger is aimed at the situation, not the person, which is more restraint than most of us manage at 4:55pm on a Friday.

Not affiliated with any restaurant chain, however much it might sound like one.
(I'm hoping I can get that Black Card in the post 😉)

## Running it (if you want)

Built with Next.js, the [AI SDK](https://ai-sdk.dev) and `@ai-sdk/anthropic`, using `claude-opus-5-5`.

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
