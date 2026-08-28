import { parseArgs } from "util";
import { startDiscordServer } from "./server";

function main() {
  const { positionals } = parseArgs({
    args: Bun.argv,
    strict: true,
    allowPositionals: true,
  });

  const val = positionals.pop();

  switch (val) {
    case "server":
      startDiscordServer();
      break;
    case "cli":
      break;
    default:
      console.log("Arguments not passed. Cannot start");
      break;
  }
}

main();
