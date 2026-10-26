# 🔮 Esfera de Bloch interactiva

Herramienta educativa en español para visualizar y manipular el estado de un qubit sobre la esfera de Bloch. Nació de las lecciones 30 (*Píntame el estado*) y 31 (*La esfera de Bloch*) del curso Mundo Cuántico, y sigue su hilo: del fasor al círculo de Bloch, del círculo al plano complejo de Gauss y de ahí a la esfera completa.

![React](https://img.shields.io/badge/React-18-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Three.js](https://img.shields.io/badge/Three.js-0.160-green)
![Vite](https://img.shields.io/badge/Vite-7-orange)
![Vitest](https://img.shields.io/badge/Tests-Vitest-6E9F18)

## 🌟 Qué hace

### Esfera 3D
- **Vector de estado** sobre una esfera con ejes X, Y, Z y los seis autoestados etiquetados: |0⟩ y |1⟩ en los polos; |+⟩, |−⟩, |+i⟩ y |−i⟩ en el ecuador.
- **Compuertas como rotaciones**: al aplicar X, Y, Z, H, S o T el vector recorre el arco real de la rotación y se muestra el eje con su etiqueta.
- **Click sobre la esfera** para fijar un estado; **sliders** de θ y φ en grados enteros; cámara libre con arrastre y rueda.

### Tres modos de vista
- **Esfera 3D**: cámara libre.
- **Desde el polo**: la cámara se coloca sobre |0⟩ y el ecuador se ve como el plano complejo, con |+⟩ en +1, |−⟩ en −1, |+i⟩ en +i y |−i⟩ en −i (lección 31).
- **Círculo 2D**: el estado se restringe al plano XZ, el de las amplitudes reales, con un único ángulo α (lección 30). Si una compuerta o un preset introduce una fase imaginaria, la app avisa y abre la esfera completa.

### Panel de estado
- Notación de Dirac en forma cartesiana y polar, comprobación de norma 1.
- Coordenadas esféricas y cartesianas.
- Probabilidades de medición en las **tres bases** (Z, X e Y) y fase relativa.

### Controles
- Compuertas X, Y, Z, H, S y T con su eje y ángulo.
- **Circuito aplicado**: secuencia de compuertas con deshacer paso a paso (rotación inversa animada) y vaciar.
- Seis estados predefinidos, reinicio y estado aleatorio.
- **Selector de notación**: computación cuántica (|0⟩, |1⟩, |+⟩, …) o la del curso (|u⟩, |d⟩, |r⟩, |l⟩, |i⟩, |o⟩).
- Tema oscuro o claro.

### Teoría
Pestaña con ocho secciones que siguen las dos lecciones, con botones que llevan la esfera al modo o estado del que se habla. Los informes de clase están en `docs/`.

## 🚀 Inicio rápido

Requiere Node.js 18+ y pnpm.

```bash
pnpm install
pnpm dev
```

La aplicación queda en `http://localhost:8080` (puerto fijado en `vite.config.ts`).

```bash
pnpm test      # tests de la matemática del qubit (Vitest)
pnpm lint      # eslint
pnpm build     # build de producción en dist/
pnpm preview   # sirve dist/
```

Para comprobar tipos: `npx tsc -p tsconfig.app.json --noEmit`.

## 🛠️ Tecnologías

- **React 18 + TypeScript + Vite**
- **Three.js** vía **@react-three/fiber** y **@react-three/drei** para el 3D
- **shadcn/ui**, **Radix UI** y **Tailwind CSS** para la interfaz
- **Sonner** para las notificaciones, **next-themes** para el tema
- **Vitest** para los tests

## 📁 Estructura

```
src/
├── lib/
│   ├── bloch.ts             # Matemática del qubit: vector de Bloch, Rodrigues,
│   │                        # compuertas como eje + ángulo, bases, círculo de Bloch
│   ├── bloch.test.ts        # Tests de lo anterior
│   ├── notation.ts          # Las dos notaciones de los autoestados
│   └── modes.ts             # Modos de vista (libre, polo, círculo)
├── components/
│   ├── BlochSphere.tsx      # Escena 3D: esfera, etiquetas, animación, cámaras
│   ├── QuantumControls.tsx  # Compuertas, circuito, sliders y presets
│   ├── StateDisplay.tsx     # Estado actual, coordenadas y probabilidades
│   ├── QuantumEducation.tsx # Teoría siguiendo las lecciones
│   ├── ThemeToggle.tsx      # Interruptor de tema
│   └── ui/                  # shadcn/ui generado
├── pages/
│   ├── Index.tsx            # Página principal y dueña del estado
│   └── NotFound.tsx
└── index.css                # Tema (variables HSL) y utilidades propias
docs/                        # Informes de las lecciones 30 y 31
```

## 📐 Convenciones

- Convención de física: Z vertical, |0⟩ en el polo norte. θ ∈ [0, π], φ ∈ (−π, π].
- |ψ⟩ = cos(θ/2)|0⟩ + e^{iφ} sin(θ/2)|1⟩; x = sin θ cos φ, y = sin θ sin φ, z = cos θ.
- Cada compuerta es una rotación de la esfera: X, Y, Z y H giran π alrededor de X, Y, Z y (X+Z)/√2; S y T giran π/2 y π/4 alrededor de Z.
- Three.js tiene Y vertical; el mapeo física → Three.js es la permutación cíclica (x, y, z) → (y, z, x), que conserva la orientación de la terna.

## 📄 Licencia

MIT.

## 📧 Contacto

- **Autor**: SebastianCl
- **Repositorio**: [GitHub](https://github.com/SebastianCl/state-navigator)
