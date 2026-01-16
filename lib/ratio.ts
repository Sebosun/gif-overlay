interface RatioDuck {
  height: number;
  width: number;
}

export const getRatio = (
  baseElem: RatioDuck,
  overlayElem: RatioDuck,
): number => {
  const DESIRED_MAX_RATIO = 0.25;

  const base = baseElem.height * baseElem.width;
  const overlay = overlayElem.height * overlayElem.width;

  const desiredSize = base * DESIRED_MAX_RATIO;
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
