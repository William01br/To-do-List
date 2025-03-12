/*
 * File with the purpose of encrypt data such as tokens for be transferred by cookies.
 * Will be used the RSA algorithm wich is a public-key encryption method that uses a private and public key pair to encrypt and decrypt data
 */
import crypto from "crypto";

function generateKeysAsync() {
  return new Promise((resolve, reject) => {
    crypto.generateKeyPair(
      "rsa",
      {
        modulusLength: 2048,
        publicKeyEncoding: { type: "spki", format: "pem" },
        privateKeyEncoding: { type: "pkcs8", format: "pem" },
      },
      (err, publicKey, privateKey) => {
        if (err) {
          return reject(err);
        }
        resolve({ publicKey, privateKey });
      }
    );
  });
}

let keys;

async function Initkeys() {
  try {
    keys = await generateKeysAsync();
  } catch (err) {
    console.error("Failed to generate keys:", err);
  }
}
Initkeys();

export const encrypt = (value) => {
  if (!keys) {
    throw new Error("The keys have not yet been initialized.");
  }
  const encrypted = crypto.publicEncrypt(keys.publicKey, Buffer.from(value));
  return encrypted.toString("base64");
};
export const decrypt = (encryptedValue) => {
  if (!keys) {
    throw new Error("The keys have not yet been initialized.");
  }
  const encryptedBuffer = Buffer.from(encryptedValue, "base64");
  const decrypted = crypto.privateDecrypt(keys.privateKey, encryptedBuffer);
  return decrypted.toString();
};

export function createTokenReset() {
  return new Promise((resolve, rejects) => {
    crypto.randomBytes(20, (err, buf) => {
      if (err) {
        rejects(err);
      }
      resolve(buf.toString("hex"));
    });
  });
}
