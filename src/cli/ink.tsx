import { render } from "ink";
import { useState } from "react";
import { HomeView } from "./HomeView";
import { FetchView } from "./FetchView";

export type Views = "home" | "fetch";

function CliApp() {
  const [view, setView] = useState<Views>("home");

  const views = {
    home: <HomeView onNavigate={setView} />,
    fetch: <FetchView onBack={() => setView("home")} />,
  };

  return views[view];
}

export function launchCLI(): void {
  render(<CliApp />);
}
