import { Box, Text } from "ink";
import { Title } from "../Title";
import { FetchDownloadCount } from "./FetchDownloadCount";
import type { FetchProgress } from "@/types/RunnerTypes";
import type { GOOD_TAGS } from "scripts/fetchGifs";

interface Props {
  progress: FetchProgress;
  total: number;
  selectedTag: typeof GOOD_TAGS[number]
}

export function FetchRunning({ progress, total, selectedTag}: Props) {
  return (
    <Box flexDirection="column" backgroundColor={"#000"} paddingX={1} paddingY={1}>
      <Title />
      <Text bold color="redBright">Downloading {selectedTag.name} ... </Text>
      <Text>
        Downloaded: {progress.downloaded} | Already exists: {progress.alreadyExists} | Errors: {progress.errors}
      </Text>
      <FetchDownloadCount progress={progress} total={total} />
      <Text dimColor>Press q or Escape to stop fetching and return.</Text>
    </Box>
  );
}
