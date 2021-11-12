import { DIDDocument, DIDResolver } from "did-resolver";
export declare function createDidDoc(publicKeyBase64: string): DIDDocument;
export declare function getDidDoc(did: string): Promise<DIDDocument>;
export declare function getResolver(): Record<string, DIDResolver>;
