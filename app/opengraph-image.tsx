import { ImageResponse } from "next/og";
import { OG_SIZE, ogImageElement } from "./og-image-content";

export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(ogImageElement(), { ...size });
}
