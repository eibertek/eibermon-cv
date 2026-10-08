import { ui } from "../../data/i18n";
import { useGame } from "../../game/store";
import { world } from "../../world/layout";
import { Asset } from "./Asset";
import Label from "./Label";

/** Buzón del final del recorrido: abre los links de contacto. */
export default function Contact() {
  const { pos, interactId } = world.contact;
  const near = useGame((s) => s.nearbyId === interactId);
  const locale = useGame((s) => s.locale);

  return (
    <group position={[pos[0], 0, pos[1]]}>
      <Asset id="mailbox" />
      <mesh position={[0, 0.04, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.4, 0.05, 8, 40]} />
        <meshBasicMaterial color="#ffd166" />
      </mesh>
      {near && <Label position={[0, 2.4, 0]}>{ui("mailboxLabel", locale)}</Label>}
    </group>
  );
}
