import { ES256KSigner, createJWT, verifyJWT, JWTVerified } from "did-jwt";
import { Resolver, DIDDocument } from "did-resolver";
import { BIP32Interface } from "bip32";
import { createDidDoc, getResolver } from "./resolver";

export async function verifyDid(
  jwt: string,
  audience: string
): Promise<JWTVerified | null> {
  try {
    const resolver = new Resolver(getResolver());
    const verified: JWTVerified = await verifyJWT(jwt, {
      resolver,
      audience,
    });
    return verified;
  } catch (error) {
    return null;
  }
}

export async function createDid(node: BIP32Interface): Promise<string> {
  if (node.privateKey) {
    const signer = ES256KSigner(node.privateKey.toString("hex"));
    const didDocument: DIDDocument = createDidDoc(
      Buffer.from(node.publicKey).toString("base64")
    );
    const issuer = didDocument.id;
    const jwt = await createJWT(
      { ...didDocument },
      { issuer, signer },
      { alg: "ES256K" }
    );
    return jwt;
  }
  return "";
}
