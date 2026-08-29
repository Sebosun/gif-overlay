import { Box, Text, useApp, useInput } from "ink";
import { Status } from "./Status";
import { useListNavigation } from "./useListNavigation";
import { useState } from "react";
import type { Views } from "./ink";
import { Title } from "./Title";
import { getAssetsDir, getTransformedLocation } from "@/lib/files/useLocation";
import fs from "fs/promises";
import { cleanupFiles } from "@/lib/files/cleanupFiles";
import path from "path";
import type { FlatPromise } from "@/types/Common";
import { ensureUploadFoldersExist } from "@/lib/files/ensureFoldersExist";

type ActionNames = "Fetch GIFs" | "Clean transformed images" | "Clean assets";

interface Action {
  name: ActionNames;
}

interface Props {
  onNavigate: (view: Views) => void;
}

async function clearFolderContents(dir: string, fallbackError: string): FlatPromise {
  try {
    const ls = await fs.readdir(dir);
    for (const element of ls) {
      const folderPath = path.join(dir, element);
      await cleanupFiles(folderPath);
    }

    return [undefined, undefined];
  } catch (e) {
    if (e instanceof Error) {
      return [e, undefined];
    }
    return [new Error(fallbackError), undefined];
  }
}

async function onClearAssets(): FlatPromise {
  const [error] = await clearFolderContents(getAssetsDir(), "Couldn't remove assets");
  if (error) {
    return [error, undefined];
  }

  try {
    await ensureUploadFoldersExist();
    return [undefined, undefined];
  } catch (e) {
    if (e instanceof Error) {
      return [e, undefined];
    }
    return [new Error("Couldn't recreate asset folders"), undefined];
  }
}

export function HomeView({ onNavigate }: Props) {
  const { exit } = useApp();
  const [message, setMessage] = useState("Select an action to continue.");
  const [statusRefreshVersion, setStatusRefreshVersion] = useState(0);

  const actions: Action[] = [
    {
      name: "Fetch GIFs",
    },
    {
      name: "Clean transformed images",
    },
    {
      name: "Clean assets",
    },
  ] as const;

  const { selectedIndex: selectedAction } = useListNavigation({
    items: actions,
    onSelect: async (action) => {
      switch (action.name) {
        case "Fetch GIFs":
          onNavigate("fetch");
          break;
        case "Clean transformed images":
          setMessage("Deleting transformed images...");
          const [error] = await clearFolderContents(getTransformedLocation(), "Couldn't remove transformed images");
          if (error) {
            setMessage(`Something went wrong trying to delete files ${error.message}`);
          } else {
            setStatusRefreshVersion((version) => version + 1);
            setMessage("Cleared images transforms");
          }
          break;
        case "Clean assets":
          setMessage("Deleting assets...");
          const [assetsError] = await onClearAssets();
          if (assetsError) {
            setMessage(`Something went wrong trying to delete files ${assetsError.message}`);
          } else {
            setStatusRefreshVersion((version) => version + 1);
            setMessage("Cleared assets");
          }
          break;
      }
    },
  });

  useInput((input, key) => {
    if (input === "q" || key.escape) {
      exit();
    }
  });

  return (
    <Box flexDirection="column" backgroundColor={"#000"} paddingX={1} paddingY={1}>
      <Title />
      <Text> </Text>

      <Status refreshVersion={statusRefreshVersion} />

      <Text> </Text>
      <Text bold>Actions</Text>

      {actions.map((action, index) => (
        <Text key={action.name} color={selectedAction === index ? "green" : undefined}>
          {selectedAction === index ? ">" : " "} {action.name}
        </Text>
      ))}

      <Text> </Text>

      <Text dimColor>{message}</Text>
      <Text dimColor>Use up(j)/down(k) to move, right(l) to select. Enter to run, q to quit.</Text>
    </Box>
  );
}
