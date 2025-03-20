import crypto from "crypto";

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
