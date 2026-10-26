# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Qué es

Herramienta educativa en español para visualizar y manipular el estado de un qubit sobre la Esfera de Bloch. SPA de React 18 + TypeScript + Vite con Three.js (vía `@react-three/fiber`) para el 3D y shadcn/ui + Tailwind para la interfaz. Generada originalmente con Lovable (de ahí `lovable-tagger` en `vite.config.ts`, activo solo en modo development).

## Comandos

```bash
pnpm dev          # servidor Vite en http://localhost:8080 (puerto fijado en vite.config.ts)
pnpm build        # build de producción a dist/
pnpm build:dev    # build en modo development
pnpm lint         # eslint .
pnpm preview      # sirve dist/
pnpm test         # vitest run (src/lib/bloch.test.ts y src/lib/format.test.ts)
```

No hay script de typecheck. `pnpm build` no corre `tsc`; para verificar tipos usa `npx tsc -p tsconfig.app.json --noEmit`. `.claude/launch.json` define la configuración `dev` para levantar el servidor desde el navegador integrado de Claude.

Hay tres lockfiles (`pnpm-lock.yaml`, `package-lock.json`, `bun.lockb`). `pnpm-workspace.yaml` y `pnpm.overrides` en `package.json` indican que pnpm es el gestor en uso; no regeneres los otros lockfiles.

## Arquitectura

Toda la lógica de la app vive en un solo estado: `theta` y `phi` (ángulos esféricos, en radianes) en `src/pages/Index.tsx`. Esa página es el único lugar donde se transforma el estado; los componentes son presentacionales y reciben `theta`/`phi` más callbacks.

- `src/lib/bloch.ts`: matemática pura del qubit, sin React. Conversión θ/φ ↔ vector de Bloch, rotación de Rodrigues, el catálogo `GATE_ROTATIONS` (cada compuerta X, Y, Z, H, S, T como eje unitario + ángulo), `KET_STATES` (los seis autoestados por clave `KetKey`: zero, one, plus, minus, plusI, minusI), probabilidades en las bases Z/X/Y (`measurementProbabilities`) y las utilidades del círculo de Bloch (`isOnCircle`, `projectToCircle`, `circleAngleFromState`, `stateFromCircleAngle`: α ∈ [0, 2π) con x = sin α, z = cos α). `applyGate` ahí es la única implementación de las compuertas. La parte de espacio de Hilbert: `amplitudes` (α real ≥ 0 y φ = 0 en los polos, vía `isPole`), `spinorToBlochVector`, `densityMatrix` y `purity`, `fidelity` y `angleBetween` (|⟨ψ₁|ψ₂⟩|² = cos²(θ_B/2)), `rotationMatrix` (exp(−i α/2 n̂·σ)), `applyMatrix`, el catálogo `GATE_UNITARIES` (matriz y fase global γ de cada compuerta, U = e^{iγ} R_n̂(α); mismas claves que `GATE_ROTATIONS`, un test lo comprueba) y `randomState` (uniforme sobre la esfera: cos θ uniforme). Tests en `bloch.test.ts`, que cruzan el camino de Hilbert (matrices) con el geométrico (Rodrigues).
- `src/lib/complex.ts`: aritmética compleja mínima (`Complex`, `Matrix2`, Pauli, producto, adjunta, traza) que usa `bloch.ts`. `src/lib/format.ts`: `formatComplex` (decimales, nunca "-0.000"), `formatComplexExact` (0, ±1, ±i, ±1/√2, e^(iπ/4)) y `formatGlobalPhase`; viven en `lib/` por la regla `react-refresh/only-export-components`. Tests en `format.test.ts`.
- `src/lib/notation.ts`: las dos notaciones de los autoestados, "computacional" (|0⟩, |1⟩, |+⟩, |−⟩, |+i⟩, |−i⟩) y "curso" (|u⟩, |d⟩, |r⟩, |l⟩, |i⟩, |o⟩, la de Susskind que usan las lecciones). Todo texto que nombre un estado pasa por `ket(key, notation)`; nunca escribas `|0⟩` a mano en la UI.
- `src/lib/modes.ts`: `ViewMode` = libre | polo | circulo y sus etiquetas. `polo` solo cambia la cámara; `circulo` además restringe el estado al plano XZ (amplitudes reales, lección 30).
- `src/pages/Index.tsx`: dueño del estado: `theta`, `phi`, `lastRotation`, `notation`, `mode` e `history` (compuertas aplicadas con el estado previo, para deshacer). `applyGate` delega en `@/lib/bloch`, anima con `lastRotation` (id incremental) y apila en `history`; deshacer aplica la rotación inversa animada. Cualquier cambio manual (preset, reset, slider, click) pasa por `manualChange`, que anula la animación y vacía el historial. En modo círculo, `leaveCircleIfNeeded` detecta cuando una compuerta o preset saca el estado del plano XZ: explica la limitación con un toast y pasa a `libre` (ese es el momento "añadir el eje Y" de la lección 31). Cada acción dispara un toast de `sonner`.
- `src/components/BlochSphere.tsx`: `Canvas` de react-three-fiber. El vector dibujado se actualiza en `useFrame`, no por React: si llega una `lastRotation`, recorre el arco de la rotación desde el estado previo (0.9 s) y muestra el eje de rotación con su etiqueta durante 1.5 s más; si no, sigue al estado real con suavizado exponencial (slerp). Las etiquetas (ejes, seis autoestados, eje de rotación) usan `Billboard` para mirar siempre a la cámara; desde el polo, las del ecuador añaden su valor en el plano complejo (+1, −1, +i, −i). `CameraRig` contiene los `OrbitControls` y mueve la cámara a `CAMERA_POSITIONS[mode]` interpolando dirección y radio; si el usuario arrastra en modo polo, avisa con `onUserOrbit` y la vista vuelve a libre sin animar. En modo círculo se oculta el eje Y y se resalta el anillo XZ. El click sobre la esfera invierte el mapeo de ejes; la proyección al círculo la hace `Index.tsx`.
- `src/components/StateDisplay.tsx`: recibe también `mode`. Deriva de θ/φ la notación de Dirac (forma cartesiana y polar, con la convención de fase global explicada; en modo círculo añade la forma cos(α/2)|0⟩ + sin(α/2)|1⟩ y, si α > 180°, la nota del signo global), coordenadas (φ "indefinida" en los polos), probabilidades en las tres bases con el ángulo θ_B a cada autoestado, fase relativa y la matriz de densidad con `MatrixView`. Solo cálculo y render.
- `src/components/QuantumControls.tsx`: botones de compuertas (con descripción, eje y ángulo en un `Tooltip` de shadcn; el `TooltipProvider` está en `App.tsx`), circuito aplicado con deshacer/vaciar, sliders y presets. Los sliders trabajan en grados enteros (θ 0–180, φ -180–180; en modo círculo un único α 0–359) y convierten a radianes en el callback. Para añadir una compuerta hay que tocar la lista `gates` aquí y, en `src/lib/bloch.ts`, `GATE_ROTATIONS` y `GATE_UNITARIES` (matriz y fase global; el test de claves falla si falta una); los presets salen de `KET_KEYS`.
- `src/components/QuantumEducation.tsx`: acordeón de teoría que sigue el hilo de las lecciones 30 y 31 (fasor → Hilbert y Born → círculo de Bloch → plano complejo y eje Y → seis autoestados → coordenadas → compuertas como rotaciones → medición en otras bases → matriz de densidad e interior de la esfera). Incluye la fase global y la 3-esfera (§2), el doble recubrimiento SU(2)→SO(3) y la descomposición de Euler (§6), las matrices de cada compuerta con su fase global (§7: rejilla de `MatrixView` debajo de la tabla, porque la tarjeta derecha es más estrecha en `lg` que en móvil) y la relación ángulo ↔ probabilidad (§8). Recibe `onSelectMode` y `onPreset` para que los botones de cada sección lleven la esfera al modo o estado del que se habla.
- `src/components/MatrixView.tsx`: matriz 2×2 entre corchetes; recibe la función de formato (decimal o exacta) y no fija el tamaño del texto, lo pone quien la usa.
- `src/components/ui/`: shadcn/ui completo tal como lo generó Lovable. La mayoría no se usa; no lo borres ni lo edites a mano, regenera con la CLI de shadcn si hace falta (`components.json` define los alias).

### Convención de ejes (importante)

Se usa la convención de física: Z vertical, |0⟩ en el polo norte (z=+1), |1⟩ en el polo sur. Three.js tiene Y vertical, así que `BlochSphere.tsx` mapea física→Three.js con `toThree`/`fromThree` como `(x, y, z) → (y, z, x)`, una permutación cíclica. No uses el intercambio simple `(x, z, y)`: es una reflexión, deja una terna izquierda en pantalla (X × Y = -Z) e invierte el sentido de giro de las compuertas. Todo lo que se dibuja (ejes, etiquetas, eje de rotación, arco) pasa por `toThree`. `src/lib/bloch.ts` y `StateDisplay.tsx` trabajan en convención física sin mapeo. Al tocar cualquier cálculo geométrico, respeta esta separación.

Rangos: θ ∈ [0, π], φ ∈ (-π, π], garantizados por `toSpherical` en `src/lib/bloch.ts` (usa `atan2(√(x²+y²), z)` y no `acos(z)` porque `acos` pierde precisión cerca de los polos). Los sliders de `QuantumControls.tsx` respetan esos rangos.

Fase global: `amplitudes` en `src/lib/bloch.ts` fija α real ≥ 0 y, en los polos, φ = 0 (ahí sería una fase global, no observable); `StateDisplay.tsx` explica esa convención. Las compuertas son rotaciones salvo fase global: `GATE_UNITARIES[g].globalPhase` es la γ de U = e^{iγ} R_n̂(α) y los tests comprueban cada matriz contra `rotationMatrix`. El ángulo α de la esfera aparece como α/2 en las matrices (SU(2) recubre dos veces a SO(3)).

### Routing y proveedores

`src/App.tsx` monta `ThemeProvider` de `next-themes`, `TooltipProvider`, el toaster de `sonner` (el único que usa la app; `@/components/ui/toaster` queda en `ui/` sin montar) y `BrowserRouter` con una sola ruta `/` más catch-all 404. El header tiene un enlace a `../index.html`: la app se despliega como subpágina de un sitio mayor, no como raíz.

### Estilos y tema

Tema oscuro por defecto definido como variables HSL en `src/index.css` (`:root` es el tema oscuro, `.light` el claro). `ThemeProvider` usa `attribute="class"` con `value={{ dark: 'theme-dark', light: 'light' }}`: la clase `light` activa el tema claro y el oscuro recibe una clase sin reglas a propósito, para no disparar las variantes `dark:` de los componentes de `ui/`. `ThemeToggle.tsx` alterna y `next-themes` lo persiste en localStorage. La escena 3D es transparente sobre `sphere-container`, así que `BlochSphere.tsx` lee `resolvedTheme` fuera del `Canvas` y pasa una paleta (`PALETTES`) a la escena. `tailwind.config.ts` expone colores `quantum-{blue,purple,cyan,magenta}`, `bg-gradient-quantum`, `shadow-glow` y animaciones `quantum-pulse`, `glow`. Clases utilitarias propias como `quantum-glow`, `math-formula` y `sphere-container` están en `index.css`.

### Tipografía

Sans (pila del sistema, `fontFamily.sans` en `tailwind.config.ts`) para interfaz y prosa; monoespaciada solo para fórmulas (`.math-formula`), kets en botones, badges y celdas de tabla, y valores numéricos (`font-mono tabular-nums` en los `Badge`). Dentro de un párrafo los kets van en la fuente del texto. El header solo lleva lo global: enlace al sitio, notación y tema; Reiniciar y Aleatorio están al pie de `QuantumControls`.

### Layout

La rejilla de `Index.tsx` tiene altura fija de ventana solo en `lg` (`lg:h-[calc(100vh-140px)]`) y cada tarjeta hace scroll por dentro (`lg:min-h-0`, `lg:overflow-y-auto`). Por debajo de `lg` las tarjetas se apilan con altura natural en el orden esfera (`order-first`, `60vh`), controles y estado (`order-last`). Si tocas alturas, mantén esa separación: las utilidades de scroll interno llevan prefijo `lg:`. `StateDisplay` y `QuantumEducation` no llevan `Card` propia: la pone `Index.tsx`.

Táctil y pantallas pequeñas: OrbitControls pone `touch-action: none` en el canvas; `index.css` lo sobreescribe a `pan-y` por debajo de `lg` para que el gesto vertical siga siendo scroll de página y solo el horizontal gire la cámara. `BlochSphere.tsx` desactiva la rueda de zoom y el paneo por debajo de `lg` con `useMediaQuery` (`src/hooks/use-media-query.ts`), salvo el zoom en punteros gruesos (pellizco). El giro manual que saca de la vista polar se detecta con un umbral de píxeles sobre el puntero (`ORBIT_SLOP`), no con `onStart` de OrbitControls, para que un tap, un click o el arranque de un scroll no cambien de modo. `VIEW_MODES` tiene `touchDescription` para el texto de ayuda en táctil.

### TypeScript

`strict` está desactivado en todos los tsconfig (`noImplicitAny: false`, `strictNullChecks: false`). ESLint tiene `@typescript-eslint/no-unused-vars` en off. Alias `@/` → `src/`.

## Documentación de dominio

`docs/` contiene informes de clase (Lección 30 y 31) sobre el estado cuántico y la esfera de Bloch y una investigación teórica más amplia (`Investigación Esfera de Bloch.md`: matriz de densidad, SU(2)/SO(3), compuertas como matrices, canales de ruido, errores conceptuales), en Markdown. Son material de referencia para el contenido educativo, no se consumen desde el código.

Ojo con la investigación: su mapeo a Three.js (x, z, −y) y su rango φ ∈ [0, 2π) difieren a propósito de los del código (permutación cíclica (y, z, x) y (−π, π]; ambos mapeos son rotaciones propias), y llama "geodésica" a la trayectoria de una compuerta, que en realidad es la circunferencia alrededor del eje (solo es un círculo máximo cuando r ⊥ n̂). No alinees el código al documento. Los estados mixtos y los canales de ruido que describe no están implementados: la app solo muestra estados puros y la teoría (§9) los menciona como texto.

## graphify

`graphify-out/` (ignorado por git) contiene un grafo de conocimiento del código. Se regenera sin LLM con `graphify update .`; las etiquetas de comunidades están curadas a mano en `graphify-out/.graphify_labels.json` y se reaplican con `graphify cluster-only . --no-label`.
