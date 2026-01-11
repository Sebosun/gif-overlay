interface JimpSizes {
  width: number;
  height: number;
}

export type Placement =
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right";

export type Positions = {
  x: number;
  y: number;
};

export function getPositions(
  placement: Placement,
  target: JimpSizes,
  source: JimpSizes,
): Positions {
  if (placement === "top-left") {
    return {
      x: 0,
      y: 0,
    };
  }

  if (placement === "top-right") {
    return {
      x: target.width - source.width,
      y: target.height - source.height,
    };
  }

  if (placement === "bottom-right") {
    const x = target.width - source.width;
    const y = target.height - source.height;

    return {
      x,
      y,
    };
  }

  if (placement === "bottom-left") {
    return {
      x: 0,
      y: target.height - source.height,
    };
  }

  return {
    x: 0,
    y: 0,
  };
}

export function getRandomPlacement(): Placement {
  const POSITIONS: Record<number, Placement> = {
    1: "top-right",
    2: "top-left",
    3: "bottom-left",
    4: "bottom-right",
  };

  const randNumber = Math.floor(Math.random() * 5);

  return POSITIONS[randNumber] ?? "top-right";
}

export class RandomPlacement {
  availablePlacements = [
    "top-right",
    "top-left",
    "bottom-left",
    "bottom-right",
  ] as Placement[];

  get() {
    if (this.availablePlacements.length === 0) {
      this.availablePlacements = [
        "top-right",
        "top-left",
        "bottom-left",
        "bottom-right",
      ];
    }
    const randNumber = Math.floor(Math.random() * 5);
    const deletedEl = this.availablePlacements[randNumber];
    this.availablePlacements.splice(randNumber, 1);

    return deletedEl ?? "top-left";
  }
}
