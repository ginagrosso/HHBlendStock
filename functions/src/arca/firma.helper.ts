import * as forge from "node-forge";

/**
 * Firma el TRA XML con PKCS#7 usando la clave privada y el certificado X.509.
 * ARCA requiere la firma codificada en Base64 (formato DER).
 * Algoritmo: SHA-256 con RSA.
 */
export function firmarTRA(
  traXml: string,
  privateKey: forge.pki.rsa.PrivateKey,
  certificate: forge.pki.Certificate
): string {
  const p7 = forge.pkcs7.createSignedData();
  p7.content = forge.util.createBuffer(traXml, "utf8");
  p7.addCertificate(certificate);
  p7.addSigner({
    key: privateKey,
    certificate,
    digestAlgorithm: forge.pki.oids.sha256,
    authenticatedAttributes: [
      {type: forge.pki.oids.contentType, value: forge.pki.oids.data},
      {type: forge.pki.oids.messageDigest},
    ],
  });
  p7.sign();

  const der = forge.asn1.toDer(p7.toAsn1()).getBytes();
  return forge.util.encode64(der);
}
