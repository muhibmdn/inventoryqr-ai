import { ImageResponse } from "next/og";

import { appConfig } from "@/src/app-config";

export const runtime = "edge";
export const size = {
  width: 800,
  height: 418,
};
export const contentType = "image/png";

export default function TwitterImage() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          background: "radial-gradient(circle at top right, #36AF30 0%, #216B5B 48%, #0F241C 100%)",
          color: "white",
          padding: "48px",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", maxWidth: "560px" }}>
          <span style={{ fontSize: 24, fontWeight: 600, opacity: 0.8 }}>{appConfig.organization.industry}</span>
          <h1 style={{ fontSize: 52, lineHeight: 1.05, fontWeight: 700 }}>{appConfig.tagline}</h1>
          <p style={{ fontSize: 24, lineHeight: 1.35, opacity: 0.85 }}>{appConfig.seo.focusKeywords.slice(0, 3).join(" • ")}</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
          <span style={{ fontSize: 22, fontWeight: 600 }}>{appConfig.name}</span>
          <span style={{ fontSize: 20, opacity: 0.75 }}>{new URL(appConfig.urls.base).host}</span>
        </div>
      </div>
    ),
    size
  );
}