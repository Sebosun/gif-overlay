import { useInput } from "ink";
import { GOOD_TAGS, runGifsFetch, STAMPS_PER_PAGE } from "scripts/fetchGifs";
import { useRef, useState } from "react";
import { FetchOptions } from "./FetchOptions";
import { FetchRunning } from "./FetchRunning";
import { useListNavigation } from "../useListNavigation";
import { getAssetTagDir } from "@/lib/files/useLocation";
import type { FetchProgress } from "@/types/RunnerTypes";

interface Props {
  onBack: () => void;
}

export function FetchView({ onBack }: Props) {
  const [isRunning, setIsRunning] = useState(false);
  const shouldStopRef = useRef(false);
  const [progress, setProgress] = useState<FetchProgress>({
    downloaded: 0,
    errors: 0,
    alreadyExists: 0,
  });
  const [range] = useState({ start: 1, end: 50 });
  const [message, setMessage] = useState<string | null>("Select an action to continue");
  const totalStamps = (range.end - range.start) * STAMPS_PER_PAGE;

  const { selectedIndex } = useListNavigation({
    items: GOOD_TAGS,
    onSelect: async (tag) => {
      if (isRunning) {
        return;
      }

      shouldStopRef.current = false;
      setIsRunning(true);
      setProgress({ downloaded: 0, errors: 0, alreadyExists: 0 });

      try {
        await runGifsFetch({
          saveDir: getAssetTagDir(tag),
          start: range.start, // todo user input
          end: range.end, // todo user input
          tag: tag.tagAPIName,
          onProgress: setProgress,
          shouldStop: () => shouldStopRef.current,
        });
        setMessage(`Finished downloading ${tag.name}...`);
      } catch {
        setMessage(`Unable to fetch ${tag.name}.`);
      } finally {
        setIsRunning(false);
      }
    },
  });

  useInput((input, key) => {
    if (input === "h" || key.escape || input === "q") {
      shouldStopRef.current = true;
      onBack();
    }
  });

  const selectedTag = GOOD_TAGS[selectedIndex];
  if (isRunning && selectedTag) {
    return <FetchRunning selectedTag={selectedTag} progress={progress} total={totalStamps} />;
  }

  return <FetchOptions selectedIndex={selectedIndex} message={message} />;
}
