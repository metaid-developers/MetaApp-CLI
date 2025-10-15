
export type UTXO = {
    txid: string;
    outIndex: number;
    value: number;
    address: string;
};

export const IsEncrypt = {
  Yes: 1,
  No: 0,
} as const;
export type IsEncrypt = typeof IsEncrypt[keyof typeof IsEncrypt];


export interface AttachmentItem {
  fileName: string
  fileType: string
  data:string
  encrypt: IsEncrypt
  sha256: string
  size: number
  url: string
}