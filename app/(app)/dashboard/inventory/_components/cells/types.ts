export type EditResultCodes = {
  code: string;
  qrPayload: string;
  barcodePayload: string;
  qrImage: string;
  barcodeImage: string;
};

export type EditResult = {
  ok: boolean;
  message?: string;
  codes?: EditResultCodes;
};


