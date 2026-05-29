import {useEffect, useState} from "react";
import {FileText, RefreshCw, Loader2, Settings, Save, ChevronDown, ChevronRight} from "lucide-react";
import {useFacturacion} from "../../hooks/useFacturacion";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatearFechaCae(yyyymmdd: string): string {
  if (yyyymmdd.length !== 8) return yyyymmdd;
  return `${yyyymmdd.slice(6)}/${yyyymmdd.slice(4, 6)}/${yyyymmdd.slice(0, 4)}`;
}

function formatearFechaISO(iso: string): string {
  return new Date(iso).toLocaleString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatearImporte(n: number): string {
  return new Intl.NumberFormat("es-AR", {style: "currency", currency: "ARS", maximumFractionDigits: 0}).format(n);
}

function nroComprobante(ptoVta: number, nro: number): string {
  return `${String(ptoVta).padStart(4, "0")}-${String(nro).padStart(8, "0")}`;
}

// ─── Componente ───────────────────────────────────────────────────────────────

export function PaginaFacturacionAdmin() {
  const {facturas, cargando, error, cargarRecientes,
    config, cargandoConfig, errorConfig, guardandoConfig,
    cargarConfig, guardarConfig} = useFacturacion();

  const [montoInput, setMontoInput] = useState('');
  const [guardadoOk, setGuardadoOk] = useState(false);
  const [configAbierta, setConfigAbierta] = useState(false);

  useEffect(() => {
    cargarRecientes(50);
  }, [cargarRecientes]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (config) setMontoInput(String(config.montoMaximoAnonimo));
  }, [config]);

  const handleGuardarConfig = async () => {
    const valor = parseInt(montoInput, 10);
    if (isNaN(valor) || valor <= 0) return;
    try {
      await guardarConfig({montoMaximoAnonimo: valor});
      setGuardadoOk(true);
      setTimeout(() => setGuardadoOk(false), 3000);
    } catch { /* errorConfig ya lo muestra el hook */ }
  };

  return (
    <section className="flex flex-col gap-6">

      {/* Encabezado */}
      <header className="flex items-start justify-between shrink-0">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <FileText className="h-6 w-6 text-amber-500" />
            <h2 className="text-2xl font-semibold text-neutral-100">Facturación ARCA</h2>
          </div>
          <p className="text-neutral-400 text-sm">
            Historial de comprobantes emitidos. Las facturas se generan automáticamente con cada venta.
          </p>
        </div>
        <button
          type="button"
          onClick={() => cargarRecientes(50)}
          disabled={cargando}
          className="flex items-center gap-2 text-sm text-neutral-400 hover:text-neutral-100 disabled:opacity-50 transition-colors mt-1"
        >
          <RefreshCw className={`h-4 w-4 ${cargando ? "animate-spin" : ""}`} />
          Actualizar
        </button>
      </header>

      {/* Error historial */}
      {error && (
        <p className="text-sm text-red-400 bg-red-950/40 border border-red-800/60 rounded-lg px-4 py-3">
          {error}
        </p>
      )}

      {/* Panel de configuración ARCA (desplegable) */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
        <button
          type="button"
          onClick={() => { setConfigAbierta((v) => !v); if (!configAbierta) cargarConfig(); }}
          className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-neutral-800/40 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Settings className="h-4 w-4 text-neutral-400" />
            <span className="text-sm font-medium text-neutral-300">Límite de facturación anónima</span>
          </div>
          {configAbierta
            ? <ChevronDown className="h-4 w-4 text-neutral-500" />
            : <ChevronRight className="h-4 w-4 text-neutral-500" />}
        </button>

        {configAbierta && (
          <div className="px-5 pb-5 flex flex-col gap-4 border-t border-neutral-800">
            <p className="text-xs text-neutral-500 pt-3">
              Monto máximo para emitir factura a consumidor final sin pedir DNI/CUIT.
              Fuente: Anexo II RG 1415/03. Actualizar si ARCA publica un nuevo valor.
            </p>

            {cargandoConfig ? (
              <div className="flex items-center gap-2 text-neutral-500 text-sm">
                <Loader2 className="h-4 w-4 animate-spin" />
                Cargando...
              </div>
            ) : (
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-neutral-400">$</span>
                  <input
                    type="number"
                    value={montoInput}
                    onChange={(e) => setMontoInput(e.target.value)}
                    min={1}
                    className="bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-neutral-100 w-44 focus:outline-none focus:border-amber-500/60 transition-colors"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleGuardarConfig}
                  disabled={guardandoConfig}
                  className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black text-sm font-semibold rounded-lg transition-colors disabled:opacity-50"
                >
                  {guardandoConfig ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Guardar
                </button>
                {guardadoOk && <span className="text-xs text-emerald-400">Guardado</span>}
                {errorConfig && <span className="text-xs text-red-400">{errorConfig}</span>}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Tabla */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
        {cargando && facturas.length === 0 ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-neutral-500" />
          </div>
        ) : facturas.length === 0 ? (
          <p className="text-neutral-500 text-sm text-center py-16">
            No hay facturas emitidas todavía.
            <br />
            <span className="text-neutral-600 text-xs mt-1 block">
              Se emiten automáticamente con cada venta cuando ARCA_HABILITADA=true.
            </span>
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-800 text-neutral-500 text-xs uppercase tracking-wide">
                <th className="text-left px-5 py-3 font-medium">Comprobante</th>
                <th className="text-left px-4 py-3 font-medium hidden lg:table-cell">Venta</th>
                <th className="text-left px-4 py-3 font-medium">CAE</th>
                <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Vto. CAE</th>
                <th className="text-right px-5 py-3 font-medium">Total</th>
                <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Fecha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60">
              {facturas.map((f) => (
                <tr key={f.id} className="hover:bg-neutral-800/30 transition-colors">
                  <td className="px-5 py-3">
                    <p className="text-neutral-100 font-mono text-xs">
                      {nroComprobante(f.ptoVta, f.nroComprobante)}
                    </p>
                    <p className="text-neutral-600 text-[11px] mt-0.5">Factura C</p>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <span className="text-neutral-400 text-xs font-mono">{f.ventaId}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-amber-400 font-mono text-xs">{f.cae}</span>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className="text-neutral-400 text-xs">{formatearFechaCae(f.caeFchVto)}</span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <span className="text-neutral-100 font-semibold">{formatearImporte(f.total)}</span>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className="text-neutral-500 text-xs">{formatearFechaISO(f.fecha)}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

    </section>
  );
}
