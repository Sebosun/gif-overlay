interface RatioDuck {
  height: number;
  width: number;
}

interface RatioOptions {
  baseElem: RatioDuck;
  overlayElem: RatioDuck;
  ratio?: number
}

export const getRatio = (options: RatioOptions): number => {
  const { baseElem, overlayElem, ratio } = options;

  let maxRatio = 0.25;

  if (ratio) {
    maxRatio = ratio
  }

  const base = baseElem.height * baseElem.width;
  const overlay = overlayElem.height * overlayElem.width;

  const desiredSize = base * maxRatio;
  const sizeByOverlay = desiredSize / overlay;
  const linearRatio = Math.sqrt(sizeByOverlay);

  return linearRatio;
};
