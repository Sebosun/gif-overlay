interface RatioDuck {
  height: number;
  width: number;
}

interface RatioOptions {
  baseElem: RatioDuck;
  overlayElem: RatioDuck;
  penalize?: boolean;
}

export const getRatio = (options: RatioOptions): number => {
  const { baseElem, overlayElem, penalize } = options;

  let maxRatio = 0.25;

  if (penalize) {
    maxRatio = 0.15;
  }

  const base = baseElem.height * baseElem.width;
  const overlay = overlayElem.height * overlayElem.width;

  const desiredSize = base * maxRatio;
  const ratio = desiredSize / overlay;
  const linearRatio = Math.sqrt(ratio);

  //   console.log(`
  // bigger: ${biggerSize}
  // smallerSize: ${smallerSize}
  // desiredSize: ${desiredSize}
  // ratio: ${ratio}
  // result: ${ratio * smallerSize}`);

  return linearRatio;
};
