import { Box, Newline, Text, useInput } from "ink";
import { GOOD_TAGS } from "scripts/fetchGifs";
import { useListNavigation } from "./useListNavigation";
import { useState } from "react";
import { Title } from "./Title";

interface Props {
  onBack: () => void;
}

export function FetchView({ onBack }: Props) {
  const [message, setMessage] = useState<string | null>("Select an action to continue");

  const { selectedIndex } = useListNavigation({
    items: GOOD_TAGS,
    onSelect: (action) => {
      setMessage(`"${action.name}" is not implemented yet.`);
    },
  });

  useInput((input, key) => {
    if (input === "h" || key.escape || input === "q") {
      onBack();
    }
  });

  return (
    <Box flexDirection="column" backgroundColor={"#000"} paddingX={1} paddingY={1}>
      <Title />

      {GOOD_TAGS.map((tag, index) => (
        <Text key={tag.name} color={selectedIndex === index ? "green" : undefined}>
          {selectedIndex === index ? ">" : " "}  {tag.name} 
        </Text>
      ))}

      <Text> </Text>


      <Text dimColor>{message}</Text>
      <Text dimColor>Use up(j)/down(k) to move, right(l) to select. Enter to run, q to quit.</Text>
    </Box>
  );
}
