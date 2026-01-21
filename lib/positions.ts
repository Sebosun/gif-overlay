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

  if (placement === "center") {
    const x = (base.width / 2) - (overlay.width / 2)
    const y = (base.height / 2) - (overlay.height / 2)
    return {
      x: x,
      y: y,
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

export function getPositionsRandomized(
  options: PositionOptions,
  overflowPercent: number = 0.3 // Allow 30% overflow by default
): Positions {
  const { base, overlay, placement } = options;

  const middleX = base.width / 2;
  const middleY = base.height / 2;

  // Calculate how much the overlay can overflow into adjacent quadrants
  const overflowX = overlay.width * overflowPercent;
  const overflowY = overlay.height * overflowPercent;

  if (placement === "top-left") {
    const randomTopLeftX = randomNumberInterval(0, middleX + overflowX);
    const randomTopLeftY = randomNumberInterval(0, middleY + overflowY);

    return {
      x: randomTopLeftX,
      y: randomTopLeftY,
    };
  }

  if (placement === "top-right") {
    const randomTopRightX = randomNumberInterval(middleX - overlay.width - overflowX, base.width - overlay.width);
    const randomTopRightY = randomNumberInterval(0, middleY + overflowY);
    return {
      x: randomTopRightX,
      y: randomTopRightY,
    };
  }

  if (placement === "bottom-right") {
    const randomBottomRightX = randomNumberInterval(middleX - overlay.width - overflowX, base.width - overlay.width);
    const randomBottomRightY = randomNumberInterval(middleY - overlay.height - overflowY, base.height - overlay.height);

    return {
      x: randomBottomRightX,
      y: randomBottomRightY,
    };
  }

  if (placement === "bottom-left") {
    const randomBottomLeftX = randomNumberInterval(0, middleX + overflowX);
    const randomBottomLeftY = randomNumberInterval(middleY - overlay.height - overflowY, base.height - overlay.height);

    return {
      x: randomBottomLeftX,
      y: randomBottomLeftY,
    };
  }

  return {
    x: randomNumberInterval(0, base.width - overlay.width),
    y: randomNumberInterval(0, base.height - overlay.height),
  };
}
