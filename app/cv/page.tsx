import type { Metadata } from "next";
import CVContent from "../../components/CVContent";
import { cv } from "../../data/cv";

export const metadata: Metadata = {
  title: `${cv.profile.name} · CV`,
  description: cv.profile.summary,
};

export default function CVPage() {
  return (
    <main className="cvpage">
      <CVContent />
    </main>
  );
}
