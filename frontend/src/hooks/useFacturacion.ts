import {useState, useCallback} from "react";
import {facturacionService} from "../services/facturacion.service";
import type {Factura, ArcaConfig} from "../types/facturacion.types";

export function useFacturacion() {
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [facturas, setFacturas] = useState<Factura[]>([]);

  const [config, setConfig] = useState<ArcaConfig | null>(null);
  const [cargandoConfig, setCargandoConfig] = useState(false);
  const [errorConfig, setErrorConfig] = useState<string | null>(null);
  const [guardandoConfig, setGuardandoConfig] = useState(false);

  const cargarRecientes = useCallback(async (limite?: number): Promise<void> => {
    setCargando(true);
    setError(null);
    try {
      const result = await facturacionService.listarRecientes(limite);
      setFacturas(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar facturas");
    } finally {
      setCargando(false);
    }
  }, []);

  const cargarConfig = useCallback(async (): Promise<void> => {
    setCargandoConfig(true);
    setErrorConfig(null);
    try {
      const result = await facturacionService.getConfig();
      setConfig(result);
    } catch (err) {
      setErrorConfig(err instanceof Error ? err.message : "Error al cargar configuración");
    } finally {
      setCargandoConfig(false);
    }
  }, []);

  const guardarConfig = useCallback(async (nuevoConfig: ArcaConfig): Promise<void> => {
    setGuardandoConfig(true);
    setErrorConfig(null);
    try {
      const result = await facturacionService.updateConfig(nuevoConfig);
      setConfig(result);
    } catch (err) {
      setErrorConfig(err instanceof Error ? err.message : "Error al guardar configuración");
      throw err;
    } finally {
      setGuardandoConfig(false);
    }
  }, []);

  return {
    facturas, cargando, error, cargarRecientes,
    config, cargandoConfig, errorConfig, guardandoConfig, cargarConfig, guardarConfig,
  };
}
