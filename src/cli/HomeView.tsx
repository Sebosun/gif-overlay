import { Box, Text, useApp, useInput } from "ink";
import { Status } from "./Status";
import { useListNavigation } from "./useListNavigation";
import { useEffect, useState } from "react";
import type { Views } from "./ink";
import { Title } from "./Title";
import {
  cleanAssets,
  cleanTransformedImages,
  clearSavedMarkovData,
  createTomatoGif,
  tomatoGifExists,
} from "./actions/files";

type ActionNames = "Fetch GIFs" | "Create tomato GIF" | "Clean transformed images" | "Clean assets" | "Clear saved messages and Markov chains";

interface Action {
  name: ActionNames;
}

interface Props {
  onNavigate: (view: Views) => void;
}

export function HomeView({ onNavigate }: Props) {
  const { exit } = useApp();
  const [message, setMessage] = useState("Select an action to continue.");
  const [statusRefreshVersion, setStatusRefreshVersion] = useState(0);
  const [tomatoExists, setTomatoExists] = useState(false);

  useEffect(() => {
    void tomatoGifExists().then(setTomatoExists);
  }, [statusRefreshVersion]);

  const actions: Action[] = [
    {
      name: "Fetch GIFs",
    },
    {
      name: "Create tomato GIF",
    },
    {
      name: "Clean transformed images",
    },
    {
      name: "Clean assets",
    },
    {
      name: "Clear saved messages and Markov chains",
    },
  ] as const;

  const { selectedIndex: selectedAction } = useListNavigation({
    items: actions,
    onSelect: async (action) => {
      switch (action.name) {
        case "Fetch GIFs":
          onNavigate("fetch");
          break;
        case "Create tomato GIF":
          setMessage("Creating tomato GIF...");
          const [tomatoError] = await createTomatoGif();
          if (tomatoError) {
            setMessage(`Something went wrong trying to create the tomato GIF ${tomatoError.message}`);
          } else {
            setTomatoExists(true);
            setStatusRefreshVersion((version) => version + 1);
            setMessage("Created tomato GIF");
          }
          break;
        case "Clean transformed images":
          setMessage("Deleting transformed images...");
          const [error] = await cleanTransformedImages();
          if (error) {
            setMessage(`Something went wrong trying to delete files ${error.message}`);
          } else {
            setStatusRefreshVersion((version) => version + 1);
            setMessage("Cleared images transforms");
          }
          break;
        case "Clean assets":
          setMessage("Deleting assets...");
          const [assetsError] = await cleanAssets();
          if (assetsError) {
            setMessage(`Something went wrong trying to delete files ${assetsError.message}`);
          } else {
            setTomatoExists(false);
            setStatusRefreshVersion((version) => version + 1);
            setMessage("Cleared assets");
          }
          break;
        case "Clear saved messages and Markov chains":
          setMessage("Deleting saved messages and Markov chains...");
          const [markovError] = await clearSavedMarkovData();
          if (markovError) {
            setMessage(`Something went wrong trying to delete files ${markovError.message}`);
          } else {
            setStatusRefreshVersion((version) => version + 1);
            setMessage("Cleared saved messages and Markov chains");
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

      {actions.map((action, index) => {
        const isTomatoAction = action.name === "Create tomato GIF";
        const tomatoStatus = tomatoExists ? "installed" : "missing";
        let color: "green" | "yellow" | undefined;

        if (isTomatoAction) {
          color = tomatoExists ? "green" : "yellow";
        } else if (selectedAction === index) {
          color = "green";
        }

        return (
          <Text key={action.name} color={color}>
            {selectedAction === index ? ">" : " "} {action.name}{isTomatoAction ? ` (${tomatoStatus})` : ""}
          </Text>
        );
      })}

      <Text> </Text>

      <Text dimColor>{message}</Text>
      <Text dimColor>Use up(j)/down(k) to move, right(l) to select. Enter to run, q to quit.</Text>
    </Box>
  );
}
