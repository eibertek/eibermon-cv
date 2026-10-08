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
    <group position={[pos[0], 0, pos[1]]}>
      <Asset id="archive" />
      {near && <Label position={[0, 2.6, 0]}>{ui("archiveLabel", locale)}</Label>}
    </group>
  );
}
