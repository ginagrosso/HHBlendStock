import * as fs from "fs";
import * as forge from "node-forge";
import {arcaConfig} from "./config";

/**
 * Carga el contenido PEM desde variable de entorno (base64) o desde archivo.
 * Para deploy en Firebase Functions usar la var de entorno con el contenido en base64.
 * Para desarrollo local con emulator, se usa la ruta del archivo.
 */
function loadPem(b64EnvVar: string, filePath: string): string {
  const b64 = process.env[b64EnvVar];
  if (b64) {
    return Buffer.from(b64, "base64").toString("utf8");
  }
  if (!fs.existsSync(filePath)) {
    throw new Error(
      `Certificado ARCA no encontrado: "${filePath}". ` +
        `Configurar ${b64EnvVar} (base64) o ${b64EnvVar.replace("_B64", "_PATH")}.`
    );
  }
  return fs.readFileSync(filePath, "utf8");
}

export function getPrivateKey(): forge.pki.rsa.PrivateKey {
  const pem = loadPem("ARCA_PRIVATE_KEY_B64", arcaConfig.cert.keyPath);
  return forge.pki.privateKeyFromPem(pem);
}

export function getCertificate(): forge.pki.Certificate {
  const pem = loadPem("ARCA_CERTIFICATE_B64", arcaConfig.cert.certPath);
  return forge.pki.certificateFromPem(pem);
}
