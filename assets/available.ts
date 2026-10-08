import available from "./available.generated.json";

/**
 * Lista de GLBs que realmente existen en /public/models.
 * La genera `npm run assets:check` (se corre sola antes de dev y build).
 */
const files = new Set<string>(available as string[]);

export function hasModel(file: string): boolean {
  return files.has(file);
}
