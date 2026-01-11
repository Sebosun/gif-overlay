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
