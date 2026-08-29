import { Box, render, Text, useWindowSize } from "ink";
import { useState } from "react";
import { HomeView } from "./HomeView";
import { FetchView } from "./FetchView";

export type Views = "home" | "fetch";

const MIN_COLUMNS = 100;
const MIN_ROWS = 30;

interface TerminalTooSmallProps {
  columns: number;
  rows: number;
}

function TerminalTooSmall({ columns, rows }: TerminalTooSmallProps) {
  return (
    <Box flexDirection="column" paddingX={1} paddingY={1}>
      <Text color="yellow">Terminal window is too small.</Text>
      <Text>Resize it to at least {MIN_COLUMNS} columns by {MIN_ROWS} rows.</Text>
      <Text dimColor>Current size: {columns} columns by {rows} rows.</Text>
    </Box>
  );
}

function CliApp() {
  const [view, setView] = useState<Views>("home");
  const { columns, rows } = useWindowSize();

  if (columns < MIN_COLUMNS || rows < MIN_ROWS) {
    return <TerminalTooSmall columns={columns} rows={rows} />;
  }

  const views = {
    home: <HomeView onNavigate={setView} />,
    fetch: <FetchView onBack={() => setView("home")} />,
  };

  return (
    <Box width="100%" height="100%" alignItems="center" justifyContent="center" backgroundColor={"#000"}>
      <Box minWidth={MIN_COLUMNS} minHeight={MIN_ROWS}>
        {views[view]}
      </Box>
    </Box>
  );
}

export function launchCLI(): void {
  render(<CliApp />);
}
