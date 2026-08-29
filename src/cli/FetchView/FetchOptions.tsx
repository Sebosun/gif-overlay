import { Box, Text } from "ink";
import { GOOD_TAGS } from "scripts/fetchGifs";
import { Title } from "../Title";

interface Props {
  selectedIndex: number;
  message: string | null;
}

export function FetchOptions({ selectedIndex, message }: Props) {
  return (
    <Box flexDirection="column" backgroundColor={"#000"} paddingX={1} paddingY={1}>
      <Title />

      {GOOD_TAGS.map((tag, index) => (
        <Text key={tag.name} color={selectedIndex === index ? "green" : undefined}>
          {selectedIndex === index ? ">" : " "} {tag.name}
        </Text>
      ))}

      <Text> </Text>
      <Text dimColor>{message}</Text>
      <Text dimColor>Use up(j)/down(k) to move, right(l) to select. Enter to run, q to quit.</Text>
    </Box>
  );
}
