# 🔮 State Navigator - Esfera de Bloch Interactiva

Una herramienta educativa interactiva para visualizar y manipular estados cuánticos en tiempo real utilizando la representación de la Esfera de Bloch.

![State Navigator](https://img.shields.io/badge/Estado-En%20Desarrollo-yellow)
![React](https://img.shields.io/badge/React-18.3.1-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-blue)
![Three.js](https://img.shields.io/badge/Three.js-0.160.1-green)
![Vite](https://img.shields.io/badge/Vite-5.4.19-orange)

## 🌟 Características

### 🎯 Visualización 3D Interactiva
- **Esfera de Bloch en 3D**: Visualización completa con ejes coordenados y etiquetas
- **Interacción directa**: Haz clic en la esfera para establecer estados cuánticos
- **Animaciones fluidas**: Transiciones suaves entre estados
- **Controles de cámara**: Zoom, rotación y paneo para explorar desde cualquier ángulo

### 🎛️ Compuertas Cuánticas
- **Compuertas Pauli**: X, Y, Z para rotaciones fundamentales
- **Compuerta Hadamard**: Creación de superposiciones
- **Compuertas de fase**: S y T para manipulación de fase
- **Aplicación en tiempo real**: Observa inmediatamente el efecto de cada compuerta

### 📊 Estados Predefinidos
- **Estados básicos**: |0⟩, |1⟩ (base computacional)
- **Estados de superposición**: |+⟩, |-⟩ (base X)
- **Estados de fase**: |+i⟩, |-i⟩ (base Y)
- **Estados aleatorios**: Generación automática para exploración

### 🎚️ Controles Precisos
- **Rotaciones parametrizadas**: Sliders para RX(θ) y RY(φ)
- **Valores en tiempo real**: Visualización de ángulos en grados
- **Control manual**: Ajuste fino de los parámetros del estado

### 📚 Contenido Educativo
- **Teoría integrada**: Explicaciones de conceptos cuánticos
- **Información del estado**: Representación matemática en tiempo real
- **Notificaciones informativas**: Feedback sobre cada operación

## 🚀 Inicio Rápido

### Prerrequisitos
- Node.js 18+ o Bun
- npm, pnpm, o bun

### Instalación

```bash
# Clonar el repositorio
git clone https://github.com/tu-usuario/state-navigator.git
cd state-navigator

# Instalar dependencias (elige tu gestor preferido)
npm install
# o
pnpm install
# o
bun install
```

### Desarrollo

```bash
# Iniciar servidor de desarrollo
npm run dev
# o
pnpm dev
# o
bun dev
```

La aplicación estará disponible en `http://localhost:5173`

### Construcción

```bash
# Construir para producción
npm run build
# o
pnpm build
# o
bun run build
```

## 🛠️ Tecnologías

### Frontend
- **React 18.3.1** - Biblioteca de interfaz de usuario
- **TypeScript** - Tipado estático para JavaScript
- **Vite** - Herramientas de construcción rápida
- **Tailwind CSS** - Framework de CSS utilitario

### Visualización 3D
- **Three.js** - Biblioteca de gráficos 3D
- **@react-three/fiber** - Renderer React para Three.js
- **@react-three/drei** - Helpers y abstracciones útiles

### UI/UX
- **shadcn/ui** - Componentes de interfaz modernos
- **Radix UI** - Primitivos de UI accesibles
- **Lucide React** - Iconos consistentes
- **Sonner** - Notificaciones toast elegantes

### Estado y Navegación
- **React Router DOM** - Enrutamiento del lado del cliente
- **TanStack Query** - Gestión de estado del servidor
- **React Hook Form** - Gestión de formularios

## 📁 Estructura del Proyecto

```
src/
├── components/
│   ├── BlochSphere.tsx      # Componente principal de visualización 3D
│   ├── QuantumControls.tsx  # Panel de control de compuertas y estados
│   ├── StateDisplay.tsx     # Información del estado cuántico
│   ├── QuantumEducation.tsx # Contenido educativo y teoría
│   └── ui/                  # Componentes de interfaz reutilizables
├── pages/
│   ├── Index.tsx           # Página principal de la aplicación
│   └── NotFound.tsx        # Página de error 404
├── hooks/                  # Hooks personalizados
├── lib/                    # Utilidades y configuraciones
└── styles/                 # Estilos globales
```

## 🎮 Uso

### Navegación Básica
1. **Visualizar**: La esfera se muestra automáticamente al cargar
2. **Rotar vista**: Arrastra para rotar la cámara alrededor de la esfera
3. **Zoom**: Usa la rueda del ratón para acercar/alejar
4. **Interactuar**: Haz clic en cualquier punto de la esfera para establecer ese estado

### Aplicar Compuertas
1. Ve al panel de **Controles**
2. Haz clic en cualquier compuerta (X, Y, Z, H, S, T)
3. Observa la transformación en tiempo real
4. Las notificaciones mostrarán el nuevo estado

### Estados Predefinidos
1. Selecciona un estado del panel de **Estados Predefinidos**
2. El vector se moverá inmediatamente a la posición correspondiente
3. Úsalos como punto de partida para experimentar

### Control Manual
1. Utiliza los sliders para **RX(θ)** y **RY(φ)**
2. Observa cómo cambia el vector en tiempo real
3. Los valores se muestran en grados para fácil comprensión

## 📖 Conceptos Cuánticos

### Esfera de Bloch
La Esfera de Bloch es una representación geométrica de los estados puros de un sistema cuántico de dos niveles (qubit). Cada punto en la superficie de la esfera corresponde a un estado cuántico único.

### Coordenadas
- **θ (theta)**: Ángulo polar (0 a π)
- **φ (phi)**: Ángulo azimutal (-π a π)
- **Polos**: |0⟩ (norte) y |1⟩ (sur)
- **Ecuador**: Estados de superposición

### Compuertas Cuánticas
- **X**: Rotación π alrededor del eje X (bit flip)
- **Y**: Rotación π alrededor del eje Y
- **Z**: Rotación π alrededor del eje Z (phase flip)
- **H**: Hadamard, crea superposiciones
- **S**: Phase gate (π/2)
- **T**: π/8 gate (π/4)

## 🤝 Contribuir

Las contribuciones son bienvenidas! Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

### Áreas de Contribución
- 🐛 Corrección de bugs
- ✨ Nuevas compuertas cuánticas
- 📚 Contenido educativo adicional
- 🎨 Mejoras de UI/UX
- 📱 Responsividad móvil
- 🌐 Internacionalización
- ⚡ Optimizaciones de rendimiento

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo [LICENSE](LICENSE) para más detalles.

## 📧 Contacto

- **Autor**: SebastianCl
- **Repositorio**: [GitHub](https://github.com/SebastianCl/state-navigator)
- **Issues**: [Reportar problemas](https://github.com/SebastianCl/state-navigator/issues)

---

*Hecho con ❤️ para la educación en computación cuántica*

## 🎯 Ejemplos de Uso Educativo

### Para Estudiantes
1. **Exploración libre**: Experimenta haciendo clic en diferentes puntos
2. **Seguimiento de compuertas**: Aplica compuertas secuencialmente y observa el efecto
3. **Comparación de estados**: Alterna entre estados predefinidos para entender diferencias

### Para Educadores
1. **Demostraciones en clase**: Proyecta la aplicación para explicar conceptos
2. **Tareas interactivas**: Asigna ejercicios específicos con la herramienta
3. **Evaluación visual**: Verifica comprensión a través de manipulación de estados

### Ejercicios Sugeridos
1. **Ejercicio 1**: Partir de |0⟩ y llegar a |1⟩ usando solo compuertas X
2. **Ejercicio 2**: Crear |+⟩ desde |0⟩ usando Hadamard
3. **Ejercicio 3**: Explorar el efecto de aplicar H dos veces consecutivas
4. **Ejercicio 4**: Crear todos los estados del ecuador usando diferentes compuertas
