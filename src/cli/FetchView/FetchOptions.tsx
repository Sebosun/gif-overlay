import { Box, Text } from "ink";
import { GOOD_TAGS } from "scripts/fetchGifs";
import { useEffect, useState } from "react";
import { Title } from "../Title";
import fs from "fs/promises";
import { getAssetTagDir } from "@/lib/files/useLocation";

interface Props {
  selectedIndex: number;
  message: string | null;
}

export function FetchOptions({ selectedIndex, message }: Props) {
  const [counts, setCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    let cancelled = false;

    async function loadCounts() {
      const entries = await Promise.all(
        GOOD_TAGS.map(async (tag) => {
          try {
            const files = await fs.readdir(getAssetTagDir(tag), { recursive: true });
            return [tag.folderName, files.length] as const;
          } catch {
            return [tag.folderName, 0] as const;
          }
        }),
      );

      if (!cancelled) {
        setCounts(Object.fromEntries(entries));
      }
    }

    void loadCounts();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <Box flexDirection="column" backgroundColor={"#000"} paddingX={1} paddingY={1}>
      <Title />

      {GOOD_TAGS.map((tag, index) => (
        <Text key={tag.name} color={selectedIndex === index ? "green" : undefined}>
          {selectedIndex === index ? ">" : " "} {tag.name} ({counts[tag.folderName] ?? 0})
        </Text>
      ))}

      <Text> </Text>
      <Text dimColor>{message}</Text>
      <Text dimColor>Use up(j)/down(k) to move, right(l) to select. Enter to run, q to quit.</Text>
    </Box>
  );
}
