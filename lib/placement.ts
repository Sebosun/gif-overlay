export type Placement =
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right";

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
    const randNumber = Math.floor(
      Math.random() * this.availablePlacements.length,
    );
    const deletedEl = this.availablePlacements[randNumber];
    this.availablePlacements.splice(randNumber, 1);

    return deletedEl ?? "top-left";
  }
}
