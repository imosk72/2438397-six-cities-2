export function generateRandomInt(min: number, max: number): number {
  return Number.parseInt((Math.random() * (max - min) + min).toFixed(0), 10);
}

export function getRandomItem<T>(items: T[]): T {
  return items[generateRandomInt(0, items.length - 1)];
}
