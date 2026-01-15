interface RatioDuck {
  height: number;
  width: number;
}

export const getRatio = (
  biggerElement: RatioDuck,
  smallerElement: RatioDuck,
): number => {
  const DESIRED_MAX_RATIO = 0.6;

  const biggerSize = biggerElement.height * biggerElement.width;
  const smallerSize = smallerElement.height * smallerElement.width;

  let ratio: number;
  ratio = smallerSize / biggerSize;

  // we need to find what ratio will be 0.2 of aggregateSize

  const desiredSize = biggerSize * DESIRED_MAX_RATIO;
  ratio = smallerSize / desiredSize;

  return ratio;
};
