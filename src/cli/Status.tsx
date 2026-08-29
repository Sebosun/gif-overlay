import { Box, Text } from "ink";
import { useEffect, useState } from "react";
import fs from "fs/promises";
import {
  getAssetsDir,
  getEffectsDir,
  getTransformedLocation,
} from "@/lib/files/useLocation";

interface AssetCounts {
  effects: number;
  transformed: number;
  assets: number;
}

const emptyCounts: AssetCounts = {
  effects: 0,
  transformed: 0,
  assets: 0,
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
  refreshVersion: number;
}

export function Status({ refreshVersion }: Props) {
  const [counts, setCounts] = useState<AssetCounts>(emptyCounts);

  useEffect(() => {
    let cancelled = false;

    async function loadCounts() {
      const [effects, transformed, assets] = await Promise.all([
        countItems(getEffectsDir()),
        countItems(getTransformedLocation()),
        countItems(getAssetsDir()),
      ]);

      if (cancelled) return;
      setCounts({ effects, transformed, assets });
    }

    void loadCounts();
    return () => {
      cancelled = true;
    };
  }, [refreshVersion]);

  return (
    <Box flexDirection="column">
      <Text bold>Asset status</Text>
      <Text> Asset items: {counts.assets}</Text>
      <Text> Effect items: {counts.effects}</Text>
      <Text> Transformed items:{counts.transformed}</Text>
    </Box>
  );
}
