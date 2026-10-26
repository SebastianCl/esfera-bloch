# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Qué es

Herramienta educativa en español para visualizar y manipular el estado de un qubit sobre la Esfera de Bloch. SPA de React 18 + TypeScript + Vite con Three.js (vía `@react-three/fiber`) para el 3D y shadcn/ui + Tailwind para la interfaz. Generada originalmente con Lovable (de ahí `lovable-tagger` en `vite.config.ts`, activo solo en modo development).

## Comandos

```bash
pnpm dev          # servidor Vite en http://localhost:8080 (el README dice 5173; el puerto real está en vite.config.ts)
pnpm build        # build de producción a dist/
pnpm build:dev    # build en modo development
pnpm lint         # eslint .
pnpm preview      # sirve dist/
```

No hay tests ni script de typecheck. `pnpm build` no corre `tsc`; para verificar tipos usa `npx tsc -p tsconfig.app.json --noEmit`.

Hay tres lockfiles (`pnpm-lock.yaml`, `package-lock.json`, `bun.lockb`). `pnpm-workspace.yaml` y `pnpm.overrides` en `package.json` indican que pnpm es el gestor en uso; no regeneres los otros lockfiles.

## Arquitectura

Toda la lógica de la app vive en un solo estado: `theta` y `phi` (ángulos esféricos, en radianes) en `src/pages/Index.tsx`. Esa página es el único lugar donde se transforma el estado; los componentes son presentacionales y reciben `theta`/`phi` más callbacks.

- `src/pages/Index.tsx`: dueño del estado. Implementa `applyGate` (X, Y, Z, H, S, T como transformaciones directas sobre θ/φ, no como matrices unitarias; la Hadamard es una aproximación por casos), `applyPreset` (|0⟩, |1⟩, |+⟩, |-⟩, |+i⟩, |-i⟩, random), reset, sliders y click en la esfera. Cada acción dispara un toast de `sonner`.
- `src/components/BlochSphere.tsx`: `Canvas` de react-three-fiber con `OrbitControls`. Convierte θ/φ a cartesianas y maneja el click sobre la esfera invirtiendo esa conversión.
- `src/components/StateDisplay.tsx`: deriva de θ/φ la notación de Dirac, coordenadas cartesianas, probabilidades y fase relativa. Solo cálculo y render.
- `src/components/QuantumControls.tsx`: botones de compuertas y presets, sliders de θ y φ. Las listas `gates` y `presets` son los catálogos; para añadir una compuerta hay que tocar aquí y el `switch` de `applyGate` en `Index.tsx`.
- `src/components/QuantumEducation.tsx`: acordeón de teoría, contenido estático.
- `src/components/ui/`: shadcn/ui completo tal como lo generó Lovable. La mayoría no se usa; no lo borres ni lo edites a mano, regenera con la CLI de shadcn si hace falta (`components.json` define los alias).

### Convención de ejes (importante)

Se usa la convención de física: Z vertical, |0⟩ en el polo norte (z=+1), |1⟩ en el polo sur. Three.js tiene Y vertical, así que `BlochSphere.tsx` mapea física→Three.js como `(x, y, z) → (x, z, y)`: el eje Z físico se dibuja sobre el Y de Three.js y el Y físico sobre el Z de Three.js. Las etiquetas de ejes en pantalla ya reflejan el mapeo. `StateDisplay.tsx` calcula las cartesianas en convención física sin mapeo. Al tocar cualquier cálculo geométrico, respeta esta separación.

Rangos: θ ∈ [0, π], φ se normaliza a (-π, π] en `applyGate`. El slider de θ en `QuantumControls.tsx` permite hasta 2π, pero `applyGate` lo recorta a [0, π].

### Routing y proveedores

`src/App.tsx` monta `QueryClientProvider` (TanStack Query, sin uso real todavía), `TooltipProvider`, dos toasters (`@/components/ui/toaster` y `sonner`; la app usa `sonner`) y `BrowserRouter` con una sola ruta `/` más catch-all 404. El header tiene un enlace a `../index.html`: la app se despliega como subpágina de un sitio mayor, no como raíz.

### Estilos

Tema oscuro por defecto definido como variables HSL en `src/index.css` (`:root` es el tema oscuro, `.light` el claro). `tailwind.config.ts` expone colores `quantum-{blue,purple,cyan,magenta}`, `bg-gradient-quantum`, `shadow-glow` y animaciones `quantum-pulse`, `glow`. Clases utilitarias propias como `quantum-glow`, `math-formula` y `sphere-container` están en `index.css`.

### TypeScript

`strict` está desactivado en todos los tsconfig (`noImplicitAny: false`, `strictNullChecks: false`). ESLint tiene `@typescript-eslint/no-unused-vars` en off. Alias `@/` → `src/`.

## Documentación de dominio

`docs/` contiene informes de clase (Lección 30 y 31) sobre el estado cuántico y la esfera de Bloch, en Markdown. Son material de referencia para el contenido educativo, no se consumen desde el código.

## graphify

`graphify-out/` (ignorado por git) contiene un grafo de conocimiento del código. Se regenera sin LLM con `graphify update .`; las etiquetas de comunidades están curadas a mano en `graphify-out/.graphify_labels.json` y se reaplican con `graphify cluster-only . --no-label`.
