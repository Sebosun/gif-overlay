import type { Placement } from "./placement";

interface Sizes {
  width: number;
  height: number;
}

export type Positions = {
  x: number;
  y: number;
};

interface PositionOptions {
  placement: Placement;
  base: Sizes;
  overlay: Sizes;
}

export function getPositionsPredictable(options: PositionOptions): Positions {
  const { placement, base, overlay } = options;

  if (placement === "top-left") {
    return {
      x: 0,
      y: 0,
    };
  }

  if (placement === "top-right") {
    return {
      x: base.width - overlay.width,
      y: 0,
    };
  }

  if (placement === "bottom-right") {
    const x = base.width - overlay.width;
    const y = base.height - overlay.height;

    return {
      x,
      y,
    };
  }

  if (placement === "bottom-left") {
    return {
      x: 0,
      y: base.height - overlay.height,
    };
  }

  return {
    x: 0,
    y: 0,
  };
}

function randomNumberInterval(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

export function getPositionsRandomized(options: PositionOptions): Positions {
  const { base, overlay, placement } = options;

  const middleX = base.width / 2;
  const middleY = base.height / 2;

  if (placement === "top-left") {
    const randomTopRightX = randomNumberInterval(0, middleX);
    const randomTopRightY = randomNumberInterval(0, middleY);

    return {
      x: randomTopRightX,
      y: randomTopRightY,
    };
  }

  if (placement === "top-right") {
    const randomTopRightX = randomNumberInterval(middleX, base.width - overlay.width);
    const randomTopRightY = randomNumberInterval(0, middleY);
    return {
      x: randomTopRightX,
      y: randomTopRightY,
    };
  }

  if (placement === "bottom-right") {
    const randomBottomRightX = randomNumberInterval(middleX, base.width - overlay.width);
    const randomBottomLeftY = randomNumberInterval(middleY, base.height - overlay.height);

    return {
      x: randomBottomRightX,
      y: randomBottomLeftY,
    };
  }

  if (placement === "bottom-left") {
    const randomBottomLeftX = randomNumberInterval(0, middleX);
    const randomBottomLeftY = randomNumberInterval(base.height - overlay.height, 0);

    return {
      x: randomBottomLeftX,
      y: randomBottomLeftY,
    };
  }

  return {
    x: randomNumberInterval(0, base.width),
    y: randomNumberInterval(0, base.height),
  };
}
