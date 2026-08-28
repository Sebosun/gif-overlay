import { Box, Newline, Text, useApp, useInput } from "ink";
import { Status } from "./Status";
import { useListNavigation } from "./useListNavigation";
import { useState } from "react";
import type { Views } from "./ink";
import { Title } from "./Title";

type ActionNames = "Fetch GIFs" | "Clean transformed images";

interface Action {
  name: ActionNames;
}

interface Props {
  onNavigate: (view: Views) => void;
}

export function HomeView({ onNavigate }: Props) {
  const { exit } = useApp();
  const [message, setMessage] = useState("Loading asset information...");

  const actions: Action[] = [
    {
      name: "Fetch GIFs",
    },
    {
      name: "Clean transformed images",
    },
  ] as const;

  const { selectedIndex: selectedAction } = useListNavigation({
    items: actions,
    onSelect: (action) => {
      switch (action.name) {
        case "Fetch GIFs":
          onNavigate("fetch");
          break;
        case "Clean transformed images":
          setMessage("Not yet implemented");
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

      <Status issueMessage={(value: string) => setMessage(value)} />

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
