import { ImageResponse } from "next/og";

import { appConfig } from "@/src/app-config";

export const runtime = "edge";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          background: "linear-gradient(135deg, #0F241C 0%, #216B5B 55%, #36AF30 100%)",
          color: "white",
          padding: "72px",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "16px", maxWidth: "760px" }}>
          <span style={{ fontSize: 32, fontWeight: 600, opacity: 0.8 }}>{appConfig.organization.industry}</span>
          <h1 style={{ fontSize: 72, lineHeight: 1, fontWeight: 700 }}>{appConfig.tagline}</h1>
          <p style={{ fontSize: 30, lineHeight: 1.3, opacity: 0.9 }}>{appConfig.description}</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <span style={{ fontSize: 28, fontWeight: 600 }}>{appConfig.name}</span>
            <span style={{ fontSize: 24, opacity: 0.8 }}>{new URL(appConfig.urls.base).host}</span>
          </div>
          <div
            style={{
              display: "flex",
              height: 96,
              width: 96,
              borderRadius: 9999,
              background: "rgba(255, 255, 255, 0.18)",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 42,
              fontWeight: 700,
            }}
          >
            IQ
          </div>
        </div>
      </div>
    ),
    size
  );
}