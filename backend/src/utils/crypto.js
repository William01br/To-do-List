/*
 * File with the purpose of encrypt data such as tokens for be transferred by cookies.
 * Will be used the RSA algorithm wich is a public-key encryption method that uses a private and public key pair to encrypt and decrypt data
 */
import crypto from "crypto";

const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
  modulusLength: 2048,
});

export const encrypt = (value) => {
  const encrypted = crypto.publicEncrypt(publicKey, Buffer.from(value));
  return encrypted.toString("base64");
};
export const decrypt = (encryptedValue) => {
  const encryptedBuffer = Buffer.from(encryptedValue, "base64");
  const decrypted = crypto.privateDecrypt(privateKey, encryptedBuffer);
  return decrypted.toString();
};
