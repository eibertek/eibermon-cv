import IsoCamera from "./IsoCamera";
import OcclusionFade from "./OcclusionFade";
import Player from "./Player";
import Sun from "./Sun";
import WorldScene from "./WorldScene";

export default function Scene() {
  return (
    <>
      <IsoCamera />
      <Sun />
      <WorldScene />
      <Player />
      <OcclusionFade />
    </>
  );
}
