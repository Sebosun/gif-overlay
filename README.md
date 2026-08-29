# gif-overlay

Discord bot that overlays GIFs onto images, generates markov chain text, and throws tomatoes.

## Setup

Copy `.env.example` to `.env` and fill in the values:

| Key | Description |
|-----|-------------|
| `TOKEN` | Discord bot token |
| `CLIENT_ID` | Discord application client ID |
| `LOG_LEVEL` | Pino log level (`debug`, `info`, `warn`, `error`). Defaults to `info` |
| `NODE_ENV` | Set to `production` to enable markov background updates, `development` for pretty-printed logs |

## Running

```sh
bun install          # install dependencies
bun dev              # start the bot locally
bun run build        # build for production (node target)
bun run typecheck    # run tsc --noEmit
bun run deploy-commands  # register slash commands with Discord
```

The entrypoint is `src/index.ts` -- it creates a Discord client, ensures storage folders exist, registers event handlers for messages and interactions, and calls `client.login()`.

## Deploying

`deploy.sh` rsyncs the project (excluding `node_modules`) to a Raspberry Pi over SSH. Edit `PI_USER`, `PI_HOST`, `LOCAL_DIR`, and `REMOTE_DIR` at the top of the script to match your setup.

## Commands

All text commands use the `.` prefix (e.g. `.boomer`).

| Command | Triggers | Description |
|---------|----------|-------------|
| boomerify | `boomer`, `bomer`, `boomerr` | Overlay random GIFs onto an image. `boomerr`/`bomerr` randomizes placement |
| effect | `cute`, `effect` | Apply a random "cute" overlay effect |
| tomato | `tomato`, `tomato [amount]` | Throw tomato(es) at an image (max 50) |
| markov | `markov`, `random` | Generate a random sentence from channel history |
| pomusz | `pomusz`, `taskete` | Display help information |

## Markov Chain System

The markov system works in two stages:

**Collection**: When `.markov` is used in a channel for the first time, the bot fetches message history and saves it. After that, new messages in watched channels are queued in memory (`handleMessagesQueue.ts`) and flushed to disk after a configurable threshold.

**Background updates**: In production (`NODE_ENV=production`), `watchChannels.ts` restores watched channel IDs from saved messages, then runs an hourly interval that re-reads their messages and regenerates Markov chain data. Saved channels are not restored outside production. Chains are built at multiple n-gram sizes (1, 2, 3) and stored as JSON files in `markov/`.

## Configuration

All tunable constants (timeouts, limits, ratios, processing params) live in `src/config.ts`.
