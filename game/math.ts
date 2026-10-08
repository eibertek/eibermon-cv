/** Interpola un ángulo hacia otro por el camino más corto, con suavizado exponencial. */
export function dampAngle(current: number, target: number, lambda: number, dt: number): number {
  const twoPi = Math.PI * 2;
  const diff = ((((target - current + Math.PI) % twoPi) + twoPi) % twoPi) - Math.PI;
  return current + diff * (1 - Math.exp(-lambda * dt));
}
