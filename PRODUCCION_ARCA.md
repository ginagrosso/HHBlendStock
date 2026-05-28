# Checklist: Pasaje a Producción ARCA

> Este documento cubre los pasos para migrar el módulo de facturación del entorno de
> testing (cuenta propia) al entorno de producción en la cuenta del cliente, sin
> necesitar su clave fiscal.

---

## Fase 1 — Gestiones que hace EL CLIENTE (o su contadora)

El cliente debe hacer estos tres pasos desde su propio panel de ARCA:

1. **Delegar servicios a tu CUIT** (`Administrador de Relaciones → Adherir Servicio`):
   - **wsfe** — Facturación Electrónica
   - **Administración de Certificados Digitales** — para que vos puedas gestionar certs sin su clave

2. **Crear Punto de Venta** bajo la modalidad `"RECE para Aplicativo y Web Services"`:
   - El número de PV (ej. `00002`) debe quedar anotado; va en `ARCA_PUNTO_VENTA` de producción.

3. **Darte de alta como representante** — el sistema queda en estado "pendiente" hasta que vos aceptes.

---

## Fase 2 — Gestiones que hacés VOS (en representación del cliente)

Una vez aceptada la delegación:

1. **Aceptar la relación**: entrá a tu ARCA → `Administrador de Relaciones → Relaciones Pendientes` → Aceptar.

2. **Generar un nuevo CSR y clave privada de producción** (con los datos del CLIENTE, no los tuyos):
   ```bash
   openssl genrsa -out privada_produccion.key 2048
   openssl req -new -key privada_produccion.key \
     -subj "/C=AR/O=NombreCliente/CN=HHBlendStock/serialNumber=CUIT <CUIT_CLIENTE_SIN_GUIONES>" \
     -out pedido_produccion.csr
   ```

3. **Subir el CSR en ARCA actuando en representación del cliente**:
   - Entrá a tu ARCA → `Administración de Certificados Digitales`
   - El sistema te pregunta para quién operás → seleccioná el CUIT del cliente
   - `Agregar Alias` → subí `pedido_produccion.csr`
   - Descargá el `.crt` resultante (guardarlo como `certificado_produccion.pem`)

---

## Fase 3 — Vincular el certificado al servicio wsfe (en representación del cliente)

1. Desde tu ARCA, `Administrador de Relaciones` → Operás en representación del cliente.
2. `Nueva Relación → WebServices → Facturación Electrónica`.
3. En "Representante" seleccioná el Alias del certificado que acabás de crear.
4. Confirmar → ARCA ahora sabe que ese cert puede facturar por el cliente.

---

## Fase 4 — Cambios técnicos en el código

### Endpoints (archivo `functions/src/arca/config.ts`)

| Variable | Testing | Producción |
|---|---|---|
| WSAA URL | `https://wsaahomo.afip.gov.ar/ws/services/LoginCms` | `https://wsaa.afip.gov.ar/ws/services/LoginCms` |
| WSFE URL | `https://wswhomo.afip.gov.ar/wsfev1/service.asmx` | `https://servicios1.afip.gov.ar/wsfev1/service.asmx` |

### Secrets (Firebase Secret Manager — NO subir al repo)

```bash
# Ingresar el contenido del archivo (multiline)
firebase functions:secrets:set ARCA_PRIVATE_KEY
firebase functions:secrets:set ARCA_CERTIFICATE
```

### Variables de entorno

```bash
# En .env de functions (o firebase functions:config)
ARCA_CUIT=<CUIT_CLIENTE_SIN_GUIONES>
ARCA_PUNTO_VENTA=<NUMERO_PV_PRODUCCION>
ARCA_ENVIRONMENT=production
```

### Verificación pre-launch

Antes de emitir la primera factura real, ejecutar manualmente:
```
FECompUltimoAutorizado(ptoVta, cbteTipo)
```
Si responde correctamente (incluso con `nroComprobante = 0`), la conexión y delegación están OK.
Si falla con error de "representación no habilitada", la Fase 3 no se completó correctamente.

---

## Notas importantes

- **Certificados de producción tienen validez legal** — custodiar `privada_produccion.key` con Firebase Secret Manager.
- **El ticket de acceso (TA) dura 12 horas** tanto en testing como en producción — la lógica de caché en Firestore aplica en ambos entornos.
- **No subir ningún `.key` ni `.pem` al repositorio** — están en `.gitignore`.
- **El PV de producción ≠ PV de testing** — son entidades separadas en ARCA; verificar que sea el correcto antes de emitir.
