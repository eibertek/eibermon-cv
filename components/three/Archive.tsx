import { ui } from "../../data/i18n";
import { useGame } from "../../game/store";
import { world } from "../../world/layout";
import { Asset } from "./Asset";
import Label from "./Label";

/** Panel con la trayectoria anterior a los 5 trabajos recientes (sin edificio propio). */
export default function Archive() {
  const { pos, interactId } = world.archive;
  const near = useGame((s) => s.nearbyId === interactId);
  const locale = useGame((s) => s.locale);

  return (
    // Desplazado a +Z del camino (ver archiveZ en world/layout.ts): rota 180° para que el
    // frente (generado mirando a +Z, igual que los edificios) quede mirando hacia el camino.
    <group position={[pos[0], 0, pos[1]]} rotation={[0, Math.PI, 0]}>
      <Asset id="archive" />
      {near && <Label position={[0, 2.6, 0]}>{ui("archiveLabel", locale)}</Label>}
    </group>
  );
}
