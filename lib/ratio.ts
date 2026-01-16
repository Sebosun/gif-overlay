interface RatioDuck {
  height: number;
  width: number;
}

export const getRatio = (
  biggerElement: RatioDuck,
  smallerElement: RatioDuck,
): number => {
  const DESIRED_MAX_RATIO = 0.12;

  const biggerSize = biggerElement.height * biggerElement.width;
  const smallerSize = smallerElement.height * smallerElement.width;
  const desiredSize = biggerSize * DESIRED_MAX_RATIO;
  const ratio = desiredSize / smallerSize;

  //   console.log(`
  // bigger: ${biggerSize}
  // smallerSize: ${smallerSize}
  // desiredSize: ${desiredSize}
  // ratio: ${ratio}
  // result: ${ratio * smallerSize}`);

  return ratio;
};
