import { Box, Text } from "ink";
import { useEffect, useState } from "react";
import fs from "fs/promises";
import {
  getEffectsDir,
  getRandomDir,
  getTomatoDir,
  getTransformedLocation,
} from "@/lib/files/useLocation";

interface AssetCounts {
  effects: number;
  randomizers: number;
  tomatoes: number;
  transformed: number;
}

const emptyCounts: AssetCounts = {
  effects: 0,
  randomizers: 0,
  tomatoes: 0,
  transformed: 0,
};

async function countItems(directory: string): Promise<number> {
  try {
    const entries = await fs.readdir(directory, { recursive: true });
    return entries.length;
  } catch {
    return 0;
  }
}

interface Props {
  issueMessage: (message: string) => void;
}

export function Status({ issueMessage: issueMessage }: Props) {
  const [counts, setCounts] = useState<AssetCounts>(emptyCounts);

  useEffect(() => {
    let cancelled = false;

    async function loadCounts() {
      const [effects, randomizers, tomatoes, transformed] = await Promise.all([
        countItems(getEffectsDir()),
        countItems(getRandomDir()),
        countItems(getTomatoDir()),
        countItems(getTransformedLocation()),
      ]);

      if (cancelled) return;
      setCounts({ effects, randomizers, tomatoes, transformed });
      issueMessage("Select an action to continue.");
    }

    void loadCounts();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <Box flexDirection="column">
      <Text bold>Asset status</Text>
      <Text> Randomizer items: {counts.randomizers}</Text>
      <Text> Effect items: {counts.effects}</Text>
      <Text> Tomato items: {counts.tomatoes}</Text>
      <Text> Transformed items:{counts.transformed}</Text>
    </Box>
  );
}
