import { world, type District } from "../../world/layout";
import { Asset } from "./Asset";
import Contact from "./Contact";
import JobSite from "./JobSite";
import Label from "./Label";
import SkillItem from "./SkillItem";

function DistrictFloor({ district }: { district: District }) {
  const [cx, cz] = district.center;
  const [w, d] = district.size;

  return (
    <group>
      <mesh position={[cx, 0.03, cz]} receiveShadow>
        {district.shape === "circle" ? (
          <cylinderGeometry args={[w / 2, w / 2, 0.06, 48]} />
        ) : (
          <boxGeometry args={[w, 0.06, d]} />
        )}
        <meshStandardMaterial color={district.color} />
      </mesh>
      <Label position={[cx, 0.3, cz - d / 2 + 0.9]} className="label label--district">
        <strong>{district.name}</strong>
        <span>{district.tagline}</span>
      </Label>
    </group>
  );
}

export default function WorldScene() {
  const b = world.bounds;
  const groundW = b.maxX - b.minX + 80;
  const groundD = b.maxZ - b.minZ + 80;

  return (
    <group>
      {/* pasto */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[(b.minX + b.maxX) / 2, -0.03, (b.minZ + b.maxZ) / 2]} receiveShadow>
        <planeGeometry args={[groundW, groundD]} />
        <meshStandardMaterial color="#8cc17b" />
      </mesh>

      {world.districts.map((d) => (
        <DistrictFloor key={d.id} district={d} />
      ))}

      {world.paths.map((p, i) => (
        <mesh key={i} position={[p.x, 0.045, p.z]} receiveShadow>
          <boxGeometry args={[p.w, 0.09, p.d]} />
          <meshStandardMaterial color={p.color} />
        </mesh>
      ))}

      {world.skills.map((s) => (
        <SkillItem key={s.interactId} spot={s} />
      ))}

      {world.jobs.map((j) => (
        <JobSite key={j.interactId} spot={j} />
      ))}

      <Contact />

      {world.decor.map((item, i) => (
        <Asset
          key={`${item.id}-${i}`}
          id={item.id}
          position={[item.pos[0], 0, item.pos[1]]}
          rotation={[0, item.rotY, 0]}
          scale={item.scale}
        />
      ))}
    </group>
  );
}
