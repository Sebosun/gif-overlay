import { Text } from "ink";
import type { FetchProgress } from "@/types/RunnerTypes";

interface Props {
  progress: FetchProgress;
  total: number;
}

const BAR_WIDTH = 20;

export function FetchDownloadCount({ progress, total }: Props) {
  const processed = progress.downloaded + progress.alreadyExists + progress.errors;
  const completed = Math.min(total, processed);
  const percentage = total === 0 ? 100 : Math.floor((completed / total) * 100);
  const filled = Math.round((percentage / 100) * BAR_WIDTH);
  const bar = `${"#".repeat(filled)}${"-".repeat(BAR_WIDTH - filled)}`;

  return <Text>Total processed: [{bar}] {processed}/{total} ({percentage}%)</Text>;
}
