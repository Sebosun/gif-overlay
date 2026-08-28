import { ensureUploadFoldersExist } from "@/lib/files/ensureFoldersExist";
import { parseArgs } from "util";
import { startDiscordServer } from "./server";
import { launchCLI } from "./cli/ink";

async function main() {
  await ensureUploadFoldersExist()

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
      launchCLI();
      break
    default:
      console.log("Arguments not passed. Cannot start");
      break;
  }
}

main();
