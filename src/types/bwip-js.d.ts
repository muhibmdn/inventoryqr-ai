/// <reference types="node" />
declare module "bwip-js" {
  export type BwipJsOptions = Record<string, unknown>;
  const bwipjs: {
    toCanvas: (
      canvas: string | HTMLCanvasElement,
      options: BwipJsOptions
    ) => void;
    toBuffer: (options: BwipJsOptions) => Promise<Buffer>;
  };
  export default bwipjs;
}