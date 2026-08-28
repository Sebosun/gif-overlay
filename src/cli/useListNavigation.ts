import { useInput } from "ink";
import { useEffect, useState } from "react";

interface UseListNavigationOptions<T> {
  items: readonly T[];
  onSelect: (item: T) => void;
}

export function useListNavigation<T>({ items, onSelect }: UseListNavigationOptions<T>) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    setSelectedIndex((current) => Math.min(current, Math.max(0, items.length - 1)));
  }, [items.length]);

  useInput((input, key) => {
    if (items.length === 0) return;

    if (key.upArrow || input === "k") {
      setSelectedIndex((current) => Math.max(0, current - 1));
      return;
    }

    if (key.downArrow || input === "j") {
      setSelectedIndex((current) => Math.min(items.length - 1, current + 1));
      return;
    }

    if (key.return || input === "l") {
      const selectedItem = items[selectedIndex];
      if (selectedItem) onSelect(selectedItem);
    }
  });

  return { selectedIndex };
}
