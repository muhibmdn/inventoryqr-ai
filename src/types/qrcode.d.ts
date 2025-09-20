declare module "qrcode" {
  export type QRCodeRenderOptions = Record<string, unknown>;

  export function toCanvas(
    canvas: string | HTMLCanvasElement,
    text: string,
    options?: QRCodeRenderOptions
  ): Promise<void>;

  export function toDataURL(
    text: string,
    options?: QRCodeRenderOptions
  ): Promise<string>;

  const QRCode: {
    toCanvas: typeof toCanvas;
    toDataURL: typeof toDataURL;
  };

  export default QRCode;
}