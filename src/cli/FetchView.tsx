import { Box, Text, useInput } from "ink";
import { GOOD_TAGS, runGifsFetch } from "scripts/fetchGifs";
import { useListNavigation } from "./useListNavigation";
import { useState } from "react";
import { Title } from "./Title";
import { getAssetDir, getStorageLocation } from "@/lib/files/useLocation";

interface Props {
  onBack: () => void;
}

interface ProgressProps {
  isRunning: boolean;
  amountDownloaded: number;
}

function Progress({ isRunning, amountDownloaded }: ProgressProps) {
  if (!isRunning) {
    return null;
  }

  return <Text>{amountDownloaded}</Text>;
}

export function FetchView({ onBack }: Props) {
  const [isRunning, setIsRunning] = useState(false);
  const [amountDownloaded, setAmountDownloaded] = useState(0);
  const [range, _] = useState({ start: 10, end: 50 });
  const [message, setMessage] = useState<string | null>("Select an action to continue");

  const { selectedIndex } = useListNavigation({
    items: GOOD_TAGS,
    onSelect: async (tag) => {
      setIsRunning(true);
      await runGifsFetch({
        saveDir: getAssetDir(tag),
        start: range.start, // todo user input
        end: range.end, // todo user input
        tag: tag.tagAPIName,
        onProgress: (amount) => {
          setAmountDownloaded(amount);
        },
        onEnd: () => {
          setMessage(`Finished downloading ${tag.name}...`);
          setIsRunning(false);
        },
      });
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
          {selectedIndex === index ? ">" : " "} {tag.name}
        </Text>
      ))}

      <Text> </Text>

      <Progress isRunning={isRunning} amountDownloaded={amountDownloaded} />

      <Text dimColor>{message}</Text>
      <Text dimColor>Use up(j)/down(k) to move, right(l) to select. Enter to run, q to quit.</Text>
    </Box>
  );
}
