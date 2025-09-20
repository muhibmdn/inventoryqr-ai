import bwipjs from "bwip-js";
import QRCode from "qrcode";

type CodeSource = {
  id: string;
  code: string | null;
  name: string;
  category: string | null;
  location: string | null;
};

export type GeneratedCodes = {
  code: string;
  qrPayload: string;
  barcodePayload: string;
  qrImage: string;
  barcodeImage: string;
};

const buildFallbackCode = (id: string) => {
  const compact = id.replace(/[^a-zA-Z0-9]/g, "");
  const prefix = compact.slice(0, 6).toUpperCase();
  const suffix = Date.now().toString(36).toUpperCase().slice(-4);
  return `INV-${prefix || "ITEM"}-${suffix}`;
};

export async function generateItemCodes(source: CodeSource): Promise<GeneratedCodes> {
  const baseCode = source.code?.trim() || buildFallbackCode(source.id);
  const qrPayloadObject = {
    code: baseCode,
    name: source.name,
    category: source.category,
    location: source.location,
    updatedAt: new Date().toISOString(),
  } as const;
  const qrPayload = JSON.stringify(qrPayloadObject);

  let qrImage: string;
  try {
    qrImage = await QRCode.toDataURL(qrPayload, {
      color: { dark: "#216B5B", light: "#EAF6EE" },
      margin: 2,
      scale: 8,
    });
  } catch (error) {
    throw new Error(
      error instanceof Error
        ? error.message
        : "Gagal membuat QR code untuk data terbaru."
    );
  }

  try {
    const barcodeBuffer = await bwipjs.toBuffer({
      bcid: "code128",
      text: baseCode,
      scale: 3,
      height: 10,
      includetext: true,
      textxalign: "center",
      backgroundcolor: "FFFFFF",
      barcolor: "2E6431",
    });
    const barcodeImage = `data:image/png;base64,${barcodeBuffer.toString("base64")}`;

    return {
      code: baseCode,
      qrPayload,
      barcodePayload: baseCode,
      qrImage,
      barcodeImage,
    };
  } catch (error) {
    throw new Error(
      error instanceof Error
        ? error.message
        : "Gagal membuat barcode untuk data terbaru."
    );
  }
}
