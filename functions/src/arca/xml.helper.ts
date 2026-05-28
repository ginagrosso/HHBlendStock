/**
 * Construye el XML del TRA (Ticket de Requerimiento de Acceso) para WSAA.
 * generationTime se retrasa 1 minuto para tolerar diferencias de reloj con los servers de ARCA.
 * expirationTime es 10 minutos en el futuro (ARCA permite hasta 24hs, pero con menos es suficiente).
 */
export function buildTRA(service: string): string {
  const now = new Date();
  const genTime = new Date(now.getTime() - 60_000);
  const expTime = new Date(now.getTime() + 10 * 60_000);

  // Convierte a hora de Argentina (UTC-3) antes de formatear.
  // toISOString() devuelve UTC; si pegáramos "-03:00" sin convertir,
  // ARCA leería la hora 3 horas adelante y rechazaría el TRA.
  const fmt = (d: Date): string => {
    const argDate = new Date(d.getTime() - 3 * 60 * 60 * 1000);
    return argDate.toISOString().slice(0, 19) + "-03:00";
  };

  const uniqueId = Math.floor(now.getTime() / 1000);

  return `<?xml version="1.0" encoding="UTF-8"?>
<loginTicketRequest version="1.0">
  <header>
    <uniqueId>${uniqueId}</uniqueId>
    <generationTime>${fmt(genTime)}</generationTime>
    <expirationTime>${fmt(expTime)}</expirationTime>
  </header>
  <service>${service}</service>
</loginTicketRequest>`;
}

/**
 * Envuelve el innerXml en un envelope SOAP 1.1 con el namespace indicado.
 * El caller debe usar el prefijo "ns:" en los elementos de innerXml.
 */
export function buildSoapEnvelope(params: {
  namespace: string;
  method: string;
  innerXml: string;
}): string {
  return `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope
  xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"
  xmlns:ns="${params.namespace}">
  <soap:Header/>
  <soap:Body>
    <ns:${params.method}>${params.innerXml}
    </ns:${params.method}>
  </soap:Body>
</soap:Envelope>`;
}
