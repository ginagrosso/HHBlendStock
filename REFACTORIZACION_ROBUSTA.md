# 📋 Refactorización Robusta H&H Blend - Guía de Implementación

## ✅ ESTADO: REFACTORIZACIÓN COMPLETADA

Se ha realizado una refactorización **ROBUSTA Y SIN PARCHES** del sistema de inventario. A continuación, todos los cambios realizados y cómo proceder.

---

## 📦 CAMBIOS ESTRUCTURALES DEL MODELO

### Modelo Anterior (ELIMINADO ❌)
```typescript
interface Producto {
  id: string;
  nombre: string;
  precio: number;           // ❌ ÚNICO - ELIMINADO
  stock: number;
  categoria: string;
  stockMinimo: number;      // ❌ ELIMINADO (no aplica al nuevo flujo)
  imagenUrl?: string;
  variantes: Variante[];    // ❌ ARRAY ANIDADO - ELIMINADO
}

interface Variante {
  id: string;
  talla: string;
  colorNombre: string;      // ❌ ELIMINADO (no en Excel)
  colorHex: string;         // ❌ ELIMINADO (no en Excel)
  stock: number;
}
```

### Modelo Nuevo (IMPLEMENTADO ✅)
```typescript
interface Producto {
  id: string;               // Formato: ${marca}-${articulo}-${talle}
  nombre: string;
  marca: string;            // ✅ NUEVO
  articulo: string;         // ✅ NUEVO
  categoria: string;
  talle: string;            // ✅ Único por registro (ya no array)
  stock: number;            // Stock específico de este talle
  precioEfectivo: number;   // ✅ NUEVO (Precio al efectivo)
  precioTarjeta: number;    // ✅ NUEVO (Precio con tarjeta)
  imagenUrl: string | null;
}
```

**Ventajas:**
- ✅ Estructura **plana** (sin arrays anidados)
- ✅ Cada talle es un registro independiente (ideal para stock granular)
- ✅ Doble precio (efectivo/tarjeta)
- ✅ ID determinístico: `${marca}-${articulo}-${talle}` → Previene duplicados
- ✅ Compatible 1:1 con estructura Excel

---

## 🔧 ARCHIVOS MODIFICADOS

### 1. **useTiendaStore.ts**
**Cambios:**
- ❌ Eliminado: `Variante` interface
- ✅ Nuevo método: `importarProductosMasivo()` - Upsert masivo
- ✅ Nuevo método: `actualizarPrecioEfectivo()` y `actualizarPrecioTarjeta()`
- ✅ Actualizado: `agregarProducto()` - Ahora con lógica **Upsert**
- ✅ Actualizado: `ajustarPreciosMasivo()` - Parámetros separados para cada precio

**Lógica Upsert:**
```typescript
// Si ID existe: ACTUALIZA stock y precios
// Si ID NO existe: CREA nuevo registro
agregarProducto(producto): si existe ID → update; sino → create
```

### 2. **productos.ts** (Mock Data)
**Cambios:**
- ❌ Eliminado: arrays `variantes` anidados
- ✅ Nuevo: Cada talle = 1 registro independiente
- ✅ Ejemplo: "Jean Levis 501" tiene 3 registros:
  - `levis-501-36` (stock: 12, precioEfectivo: 85000, precioTarjeta: 95000)
  - `levis-501-38` (stock: 8, precioEfectivo: 85000, precioTarjeta: 95000)
  - `levis-501-40` (stock: 5, precioEfectivo: 85000, precioTarjeta: 95000)

### 3. **ModalProducto.tsx**
**Cambios COMPLETOS (NO PARCHES):**
- ❌ Eliminado: Interfaz de "Agregar Variantes"
- ✅ Nuevo: Campos individuales para `marca`, `articulo`, `talle`
- ✅ Nuevo: Campos separados `precioEfectivo` y `precioTarjeta`
- ✅ Nuevo: Comparativa visual de precios (Efectivo/Tarjeta/Diferencia)
- ✅ Mejorado: UI más limpia (6 campos principales)
- ✅ Todo en ESPAÑOL

**Campos del Modal:**
1. Nombre del Producto
2. Marca
3. Artículo
4. Categoría
5. Talle
6. Stock
7. Precio Efectivo (ARS)
8. Precio Tarjeta (ARS)
9. Imagen (Opcional)

### 4. **PaginaInventarioAdmin.tsx**
**Cambios:**
- ✅ Nueva: Pestaña "📊 Inventario" / "📥 Importar Excel"
- ✅ Tabla refactorizada con columnas: Producto | Marca | Talle | P. Efectivo | P. Tarjeta | Stock | Acciones
- ✅ Colores diferenciados:
  - Verde: Precio efectivo ($)
  - Azul: Precio tarjeta ($)
  - Rojo/Verde: Stock (sin stock = rojo)
- ✅ Búsqueda mejorada (por nombre, marca, talle)
- ✅ Importador Excel integrado en pestaña

### 5. **ImportadorExcel.tsx** (NUEVO ✅)
**Funcionalidades:**
- 📁 Carga de archivos Excel (.xlsx / .xls)
- 📋 Descarga de plantilla de ejemplo
- ✅ Procesamiento de múltiples pestañas (categorías)
- 🔄 Aplanamiento de matriz de talles
- ⚠️ Validación completa con errores detallados
- 📊 Estadísticas: Productos creados, actualizados, errores
- 🎨 UI con sistema Negro/Oro Premium

**Flujo:**
```
Excel file → Lectura XLSX → Validación → Transformación Plana → Upsert en Store
```

### 6. **utilsImportador.ts** (NUEVO ✅)
**Funciones Clave:**

```typescript
// Identifica talles en las columnas F-N
identificarTalles(primerFila): string[]

// Mapea una fila del Excel a formato estructurado
mapearFilaExcel(filaRaw, headersTalles): FilaExcelCruda

// Valida datos antes de crear productos
validarFila(fila, numeroFila): string[]

// APLANAMIENTO: Convierte 1 artículo con N talles en N registros
aplanarFilaATalles(fila, categoria): { productos: Producto[]; errores: string[] }

// Procesa un sheet completo
procesarSheet(datos, categoria): ResultadoImportacion

// Procesa múltiples sheets
procesarMultiplesSheets(sheets): { todosLosProductos, reporteDetalladoPorSheet, ... }
```

---

## 📊 ESTRUCTURA DE EXCEL ESPERADA

### Headers (Fila 1)
| Artículo | Marca | Descripción | Precio Ef. | Precio Tarj. | 36 | 38 | 40 | 42 | 44 | S | M | L | XL |
|----------|-------|-------------|-----------|--------------|----|----|----|----|----|----|----|----|-----|
| (A) | (B) | (C) | (D) | (E) | (F) | (G) | (H) | (I) | (J) | (K) | (L) | (M) | (N) |

### Datos (Filas 2+)
```
| 5660      | Levis | Jean Classic | 85000 | 95000 | 10 | 15 | 8 | 5  | 0 |    |    |     |     |
| Remera    | Bando | Remera      | 42000 | 47000 |    |    |   |    |   | 24 | 20 | 18  | 12  |
```

**Resultado de Importación:**
```
Fila 1 (Jean Levis):
  → levis-5660-36 (stock: 10)
  → levis-5660-38 (stock: 15)
  → levis-5660-40 (stock: 8)
  → levis-5660-42 (stock: 5)

Fila 2 (Remera Bando):
  → bando-remera-s (stock: 24)
  → bando-remera-m (stock: 20)
  → bando-remera-l (stock: 18)
  → bando-remera-xl (stock: 12)
```

---

## 🚀 PRÓXIMOS PASOS

### 1. **Instalar Dependencias**
```bash
cd frontend
npm install
```

Este comando instalará `xlsx` (librería para procesar Excel).

### 2. **Verificar Compilación**
```bash
npm run build
```

Debe compilar sin errores.

### 3. **Probar en Desarrollo**
```bash
npm run dev
```

Navega a Admin → Inventario → Pestaña "Importar Excel"

### 4. **Crear Excel de Prueba**
- Descarga la plantilla desde el botón "Descargar Plantilla" en el UI
- Completa datos
- Sube y verifica que se creen los registros con Upsert

---

## 💡 CARACTERÍSTICAS TÉCNICAS

### Estrategia de IDs (Anti-duplicados)
```typescript
ID = `${marca}-${articulo}-${talle}`
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9\-]/g, '')

Ejemplo: "Levis" + "501" + "36" 
        → "levis-501-36"

Si importas el mismo Excel 2 veces:
  - Primer import: 4 productos creados
  - Segundo import: 4 productos ACTUALIZADOS (mismo ID)
  → NO hay duplicados ✅
```

### Validación de Datos
- ✅ Artículo obligatorio
- ✅ Marca obligatoria
- ✅ Precio Efectivo > 0
- ✅ Precio Tarjeta > 0
- ✅ Al menos 1 talle con stock
- ✅ Stock ≥ 0
- ✅ Trimming automático de espacios

### Reportes de Importación
Por cada sheet (categoría):
- Cantidad de productos creados
- Cantidad de productos actualizados
- Detalles de errores por fila
- Resumen visual en cards

---

## 🎨 DISEÑO Y EXPERIENCIA

### Colores H&H Blend
- **Fondo:** Neutral-950 (Negro profundo)
- **Acentos:** Amber-500 (Oro Premium)
- **Precios Efectivo:** Verde (#10b981)
- **Precios Tarjeta:** Azul (#3b82f6)
- **Errores:** Rojo (#ef4444)
- **Stock Normal:** Verde (#22c55e)
- **Sin Stock:** Rojo (#ef4444)

### Componentes
- Modales con overlay blur
- Tablas responsivas
- Cards con estadísticas
- Tabs navegables
- Validación inline
- Toast notifications

---

## 📝 NOTAS IMPORTANTES

### ⚠️ CAMBIOS CRÍTICOS (SIN MARCHA ATRÁS)
1. **No hay más arrays de variantes** → Cada talle es registro independiente
2. **No hay más precio único** → Todos los productos tienen 2 precios
3. **No hay más colores en la BD** → Se capturan manualmente con imagenUrl
4. **stockMinimo eliminado** → No aplica al nuevo modelo

### ✅ VENTAJAS DE ESTA ARQUITECTURA
1. **Escalabilidad:** Fácil de conectar a backend SQL
2. **Consistencia:** Estructura plana = sin nesting innecesario
3. **Performance:** Queries directas sin agregaciones complejas
4. **Flexibilidad:** Cada talle puede tener precios diferentes
5. **Prevención de duplicados:** ID determinístico

### 🔄 FLUJO TÍPICO DE CARGA
```
1. Usuario descarga plantilla
2. Completa categorías en pestañas (ej: "pantalones", "remeras")
3. Por cada artículo, ingresa talles disponibles y stock
4. Sube Excel
5. Sistema valida y crea/actualiza productos
6. Ver reportes inmediatamente en UI
7. Editar precios/stock si es necesario desde tabla
```

---

## 🐛 TROUBLESHOOTING

**P: Los archivos Excel no se cargan**
R: Asegúrate que:
  - El archivo sea `.xlsx` o `.xls`
  - Primera fila = headers
  - Columnas A-E = datos principales
  - Columnas F-N = talles
  - Al menos 1 talle con número (stock)

**P: Se crean duplicados**
R: No debería ocurrir. El Upsert verifica si `ID` existe:
  - Si existe → UPDATE
  - Si NO existe → CREATE

**P: ¿Puedo cambiar la estructura de talles?**
R: SÍ. En `utilsImportador.ts`:
  - `INDICE_PRIMER_TALLE = 5` (Columna F)
  - `INDICE_ULTIMO_TALLE = 13` (Columna N)
  - Ajusta según necesidad

---

## 📞 SOPORTE

Esta refactorización está lista para:
- ✅ Conexión a backend REST/GraphQL
- ✅ Integración con base de datos SQL
- ✅ Exportación de datos a sistemas externos
- ✅ Sincronización en tiempo real

**Próximos pasos sugeridos:**
1. Crear API backend (Node/Express, FastAPI, etc.)
2. Conectar store a API
3. Implementar autenticación
4. Agregar logging y analytics

---

**Desarrollado:** Equipo Senior Architecture - H&H Blend Premium System  
**Fecha:** Mayo 2026  
**Versión:** 1.0 - Refactorización Robusta ✅
