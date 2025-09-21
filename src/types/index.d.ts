/// <reference types="node" />
declare global {
  type JsonLd<TType extends string = string> = {
    "@context": "https://schema.org";
    "@type": TType;
    [key: string]: unknown;
  };

  interface WindowEventMap {
    "auth-modal:open": CustomEvent<{ mode: "login" | "register" }>;
  }
}

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

export {};