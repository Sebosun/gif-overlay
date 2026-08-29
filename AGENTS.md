# gif-overlay

## Commands

- Use Bun: `bun install`, `bun dev`, `bun run build`, `bun run lint`, and `bun run typecheck`.
- Run the full Vitest suite with `bun test`; run the focused location test with `bun test tests/useLocation.test.ts`.
- `tests/useLocation.test.ts` checks real directories, including `~/.local/share/gif-overlay/transformed` and the tracked asset directories. Create storage folders first via the application startup path if they do not exist.
- Register Discord slash commands separately with `bun run deploy-commands` after changing `src/commands/`.

## Structure And Runtime

- Image/GIF composition lives in `src/lib/combiner/`; filesystem locations and persisted data paths are centralized in `src/lib/files/`.
- `src/index.ts` is the bot entrypoint: it creates the Discord client, ensures storage folders, and wires raw message commands, interactions, and Markov collection.
- `src/commandsRaw/` handles `.`-prefixed text commands; `src/commands/` defines and dispatches Discord slash commands.
- Markov channel messages and generated chains are persisted under `messages/` and `markov/`; these JSON artifacts are ignored. In production only, `watchChannelsManager.initObserver()` reloads watched channels and regenerates chains hourly.
- Change tunable limits, image ratios, encoding settings, and intervals in `src/config.ts`, not at individual call sites.

## Operational Constraints

- Local execution requires `TOKEN` and `CLIENT_ID` in `.env`; `NODE_ENV=production` enables background Markov updates.
- PM2 must start `src/server-wrapper.js` through Bun as configured in `ecosystem.config.js`; starting `src/index.ts` directly under PM2 bypasses the async-import workaround.
- `deploy.sh` has machine-specific Raspberry Pi user, host, and paths. Do not treat it as portable deployment configuration without updating those variables.
- TypeScript uses strict settings, `noUncheckedIndexedAccess`, and the `@/*` alias for `src/*`. ESLint forbids `Array#forEach`, `Array#reduce`, and awaiting promise members.
