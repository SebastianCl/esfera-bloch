# Marco Teórico y Arquitectura Técnica de la Esfera de Bloch para Aplicaciones Educativas Interactivas y Sistemas de Inteligencia Artificial

## Fundamentos Matemáticos y Geométricos de la Esfera de Bloch

La esfera de Bloch constituye la representación geométrica fundamental de los estados cuánticos puros y mixtos pertenecientes a un espacio de Hilbert bidimensional ($\mathcal{H} \cong \mathbb{C}^2$), correspondiente a un único qubit. Un estado cuántico puro general $\vert{}\psi\rangle$ se expresa algebraicamente como una combinación lineal de los estados de la base computacional $\{\vert{}0\rangle, \vert{}1\rangle\}$:

$$
\vert{}\psi\rangle = \alpha \vert{}0\rangle + \beta \vert{}1\rangle
$$

donde los coeficientes $\alpha, \beta \in \mathbb{C}$ satisfacen la condición de normalización $\vert{}\alpha\vert{}^2 + \vert{}\beta\vert{}^2 = 1$. Debido a la invarianza de las observables físicas ante un factor de fase global $e^{i\gamma}$, los estados $\vert{}\psi\rangle$ y $e^{i\gamma}\vert{}\psi\rangle$ representan exactamente el mismo estado físico. Mediante la extracción explícita de esta fase global no observable, el estado puro se parametriza canónicamente utilizando dos ángulos reales, el ángulo polar $\theta$ y el ángulo azimutal $\phi$:

$$
\vert{}\psi\rangle = \cos\left(\frac{\theta}{2}\right) \vert{}0\rangle + e^{i\phi} \sin\left(\frac{\theta}{2}\right) \vert{}1\rangle
$$

En esta parametrización, el ángulo polar (o colatitud) $\theta \in [0, \pi]$ determina la distribución de probabilidad entre los estados base $\vert{}0\rangle$ y $\vert{}1\rangle$, mientras que el ángulo azimutal (o longitud) $\phi \in [0, 2\pi)$ define la fase relativa entre ambas componentes. Mapeado geométricamente, cada estado puro determina un punto único sobre la superficie de una esfera unitaria $S^2$ en $\mathbb{R}^3$, conocida como la superficie de la esfera de Bloch. Las coordenadas cartesianas del vector de Bloch $\vec{r} = (r_x, r_y, r_z)$ se derivan directamente de las funciones trigonométricas de estos ángulos:

$$
\begin{aligned}
r_x &= \sin\theta \cos\phi \\
r_y &= \sin\theta \sin\phi \\
r_z &= \cos\theta
\end{aligned}
$$

La generalización formal hacia estados mixtos —sistemas cuánticos con incertidumbre clásica o acoplados a un entorno— requiere el formalismo de la matriz de densidad $\rho$. Cualquier operador de densidad de dimensión $2 \times 2$ hermítico, positivo semidefinido y de traza unitaria ($\text{Tr}(\rho) = 1$) se expande unívocamente en la base formada por la matriz identidad $I$ y las tres matrices de Pauli $\vec{\sigma} = (\sigma_x, \sigma_y, \sigma_z)$:

$$
\rho = \frac{1}{2} \left( I + \vec{r} \cdot \vec{\sigma} \right) = \frac{1}{2} \begin{pmatrix} 1 + r_z & r_x - i r_y \\ r_x + i r_y & 1 - r_z \end{pmatrix}
$$

Las componentes del vector de Bloch $\vec{r}$ se obtienen calculando los valores esperados de los operadores de Pauli en el estado $\rho$, tal que $r_i = \text{Tr}(\rho \sigma_i)$ para $i \in \{x, y, z\}$. La pureza del estado cuántico, definida como $\text{Tr}(\rho^2)$, se relaciona directamente con la magnitud del vector de Bloch $\vert{}\vec{r}\vert{}$:

$$
\text{Tr}(\rho^2) = \frac{1}{2} \left( 1 + \vert{}\vec{r}\vert{}^2 \right)
$$

Esta formulación algebraica establece tres regiones geométricas claramente diferenciadas en el espacio tridimensional. En primer lugar, los estados puros satisfacen $\vert{}\vec{r}\vert{} = 1$ y $\text{Tr}(\rho^2) = 1$, de modo que sus vectores de estado yacen estrictamente sobre la superficie exterior de la esfera unitaria. En segundo lugar, los estados mixtos presentan una norma restringida $0 \le \vert{}\vec{r}\vert{} < 1$ y una pureza menor a la unidad, lo que sitúa geométricamente sus puntos de densidad en el interior del volumen de la esfera. En tercer lugar, el estado colectivamente conocido como máximamente mixto posee una norma nula $\vert{}\vec{r}\vert{} = 0$ y pureza mínima $\text{Tr}(\rho^2) = 1/2$, lo que colapsa su representación al origen tridimensional exacto $(0,0,0)$ donde $\rho = \frac{1}{2}I$, reflejando la máxima ignorancia sobre la información del sistema.

| Propiedad / métrica | Estado puro | Estado mixto general | Estado máximamente mixto |
| --- | --- | --- | --- |
| Ubicación geométrica | Superficie exterior ($S^2$) | Interior del volumen ($D^3$) | Centro del origen $(0,0,0)$ |
| Norma del vector de Bloch | $\Vert{}\vec{r}\Vert{} = 1$ | $0 \le \Vert{}\vec{r}\Vert{} < 1$ | $\Vert{}\vec{r}\Vert{} = 0$ |
| Pureza | $\text{Tr}(\rho^2) = 1$ | $1/2 \le \text{Tr}(\rho^2) < 1$ | $\text{Tr}(\rho^2) = 1/2$ |
| Grados de libertad reales | 2 ($\theta, \phi$) | 3 ($r_x, r_y, r_z$) | 0 |
| Entropía de von Neumann | $S(\rho) = 0$ | $0 < S(\rho) < 1$ | $S(\rho) = 1$ |

El análisis algebraico de $SU(2)$ y $SO(3)$ revela la existencia de un homomorfismo de cobertura doble entre el grupo unitario especial $SU(2)$ (que actúa sobre vectores de estado en $\mathbb{C}^2$) y el grupo ortogonal especial $SO(3)$ (que actúa sobre vectores tridimensionales en $\mathbb{R}^3$). Como consecuencia, una rotación física de un ángulo $\alpha$ sobre la esfera de Bloch corresponde a una transformación unitaria parametrizada por un ángulo $\alpha/2$ en el espacio de Hilbert. Por consiguiente, una rotación completa de $2\pi$ en la esfera de Bloch invierte el signo del vector de estado ($\vert{}\psi\rangle \to -\vert{}\psi\rangle$), reflejando la naturaleza spinorial del qubit.

## Cinemática Cuántica: Compuertas Unitarias como Rotaciones Tridimensionales

Toda compuerta cuántica de un solo qubit se describe matemáticamente por un operador unitario $U \in U(2)$. Prescindiendo de factores de fase global, $U$ pertenece a $SU(2)$ y actúa geométricamente como una rotación rígida del vector de Bloch alrededor de un eje especificado en el espacio tridimensional. La expresión general para un operador que ejecuta una rotación por un ángulo $\alpha$ alrededor de un eje unitario $\hat{n} = (n_x, n_y, n_z)$ viene dada por la exponencial de matriz:

$$
R_{\hat{n}}(\alpha) = \exp\left( -i \frac{\alpha}{2} \hat{n} \cdot \vec{\sigma} \right) = \cos\left(\frac{\alpha}{2}\right) I - i \sin\left(\frac{\alpha}{2}\right) \left( n_x \sigma_x + n_y \sigma_y + n_z \sigma_z \right)
$$

Esta ecuación se demuestra expandiendo la serie de Taylor de la exponencial matricial y aplicando las propiedades algebraicas de las matrices de Pauli, en particular sus conmutadores y anticonmutadores:

$$
[\sigma_j, \sigma_k] = 2i \sum_{l} \epsilon_{jkl} \sigma_l, \quad \{\sigma_j, \sigma_k\} = 2 \delta_{jk} I \implies (\hat{n} \cdot \vec{\sigma})^2 = I
$$

Bajo la acción de $R_{\hat{n}}(\alpha)$, un vector de Bloch inicial $\vec{r}$ se transforma en un nuevo vector $\vec{r}'$ que obedece exactamente la fórmula de rotación de Rodrigues en tres dimensiones:

$$
\vec{r}' = \vec{r} \cos\alpha + (\hat{n} \times \vec{r}) \sin\alpha + \hat{n} (\hat{n} \cdot \vec{r}) (1 - \cos\alpha)
$$

Las compuertas cuánticas elementales constituyen casos particulares de esta transformación de rotación. La transformación sobre la matriz de densidad se ejecuta mediante $\rho' = U \rho U^\dagger$.

| Compuerta | Matriz | Eje de rotación | Ángulo | Transformación del vector de Bloch |
| --- | --- | --- | --- | --- |
| Pauli-X ($X$) | $\begin{pmatrix} 0 & 1 \\ 1 & 0 \end{pmatrix}$ | $(1, 0, 0)$ | $\pi$ | $(x, -y, -z)$ |
| Pauli-Y ($Y$) | $\begin{pmatrix} 0 & -i \\ i & 0 \end{pmatrix}$ | $(0, 1, 0)$ | $\pi$ | $(-x, y, -z)$ |
| Pauli-Z ($Z$) | $\begin{pmatrix} 1 & 0 \\ 0 & -1 \end{pmatrix}$ | $(0, 0, 1)$ | $\pi$ | $(-x, -y, z)$ |
| Hadamard ($H$) | $\frac{1}{\sqrt{2}}\begin{pmatrix} 1 & 1 \\ 1 & -1 \end{pmatrix}$ | $\frac{1}{\sqrt{2}}(1, 0, 1)$ | $\pi$ | $(z, -y, x)$ |
| Fase ($S$) | $\begin{pmatrix} 1 & 0 \\ 0 & i \end{pmatrix}$ | $(0, 0, 1)$ | $\pi/2$ | $(-y, x, z)$ |
| Fase ($T$) | $\begin{pmatrix} 1 & 0 \\ 0 & e^{i\pi/4} \end{pmatrix}$ | $(0, 0, 1)$ | $\pi/4$ | $(\frac{x-y}{\sqrt{2}}, \frac{x+y}{\sqrt{2}}, z)$ |
| $R_x(\theta)$ | $\begin{pmatrix} \cos(\theta/2) & -i\sin(\theta/2) \\ -i\sin(\theta/2) & \cos(\theta/2) \end{pmatrix}$ | $(1, 0, 0)$ | $\theta$ | $(x, y\cos\theta - z\sin\theta, y\sin\theta + z\cos\theta)$ |
| $R_y(\theta)$ | $\begin{pmatrix} \cos(\theta/2) & -\sin(\theta/2) \\ \sin(\theta/2) & \cos(\theta/2) \end{pmatrix}$ | $(0, 1, 0)$ | $\theta$ | $(x\cos\theta + z\sin\theta, y, -x\sin\theta + z\cos\theta)$ |
| $R_z(\theta)$ | $\begin{pmatrix} e^{-i\theta/2} & 0 \\ 0 & e^{i\theta/2} \end{pmatrix}$ | $(0, 0, 1)$ | $\theta$ | $(x\cos\theta - y\sin\theta, x\sin\theta + y\cos\theta, z)$ |

Cualquier operador unitario arbitrario $U \in SU(2)$ puede descomponerse de forma equivalente en una secuencia de rotaciones de Euler utilizando dos ejes ortogonales, de uso recurrente en compiladores cuánticos e interfaces interactivas:

$$
U = R_z(\alpha) R_y(\beta) R_z(\gamma)
$$

Esta propiedad garantiza que desde el estado inicial $\vert{}0\rangle$ sea posible alcanzar cualquier punto sobre la superficie de la esfera mediante una secuencia de tres rotaciones de Euler.

## Dinámica de Sistemas Abiertos: Canales de Ruido y Decoherencia

La interacción inevitable entre un qubit y su entorno térmico destruye la evolución estrictamente unitaria y transforma las rotaciones rígidas sobre la superficie $S^2$ en mapas completamente positivos y de traza preservada (CPTP). En la representación operacional de Kraus, la matriz de densidad del sistema evoluciona según la suma:

$$
\rho' = \mathcal{E}(\rho) = \sum_k E_k \rho E_k^\dagger, \quad \text{con } \sum_k E_k^\dagger E_k = I
$$

Desde una perspectiva geométrica, los canales de ruido deforman la esfera de Bloch, contrayendo el volumen interior y desplazando o colapsando los vectores de estado hacia subespacios mixtos.

### Amortiguamiento de amplitud

El canal de amortiguamiento de amplitud (*amplitude damping*) modela la relajación de energía del sistema hacia su entorno (proceso caracterizado por el tiempo de vida medio $T_1$), donde el qubit pierde un cuanto de energía a una tasa de probabilidad $\gamma \in [0, 1]$. Sus operadores de Kraus vienen dados por:

$$
E_0 = \begin{pmatrix} 1 & 0 \\ 0 & \sqrt{1-\gamma} \end{pmatrix}, \quad E_1 = \begin{pmatrix} 0 & \sqrt{\gamma} \\ 0 & 0 \end{pmatrix}
$$

Las componentes del vector de Bloch se transforman mediante un mapa afín no homogéneo:

$$
r_x' = \sqrt{1-\gamma} \, r_x, \quad r_y' = \sqrt{1-\gamma} \, r_y, \quad r_z' = \gamma + (1-\gamma) r_z
$$

Este canal contrae asimétricamente la esfera de Bloch y desplaza su centro de masa hacia el Polo Norte $(0, 0, 1)$, que corresponde al estado fundamental $\vert{}0\rangle$. Cuando la tasa de disipación alcanza $\gamma = 1$, la totalidad del volumen de la esfera colapsa a un único punto en el polo superior.

### Amortiguamiento de fase

El canal de amortiguamiento de fase (*phase damping*) describe el desfasamiento cuántico sin pérdida de energía, producido por la fluctuación aleatoria de la frecuencia de transición a una tasa $\lambda \in [0, 1]$. Los operadores de Kraus estándar son:

$$
E_0 = \sqrt{1-\lambda} I, \quad E_1 = \sqrt{\lambda} \begin{pmatrix} 1 & 0 \\ 0 & 0 \end{pmatrix}, \quad E_2 = \sqrt{\lambda} \begin{pmatrix} 0 & 0 \\ 0 & 1 \end{pmatrix}
$$

La transformación afín preserva la componente de la población $r_z$ mientras atenúa exponencialmente la coherencia transversal en $r_x$ y $r_y$:

$$
r_x' = (1-\lambda) r_x, \quad r_y' = (1-\lambda) r_y, \quad r_z' = r_z
$$

Geométricamente, el desfasamiento comprime la esfera de Bloch de manera cilíndrica a lo largo del eje $Z$, transformándola en un esferoide prolato que, en el límite $\lambda = 1$, colapsa en un segmento lineal unidimensional comprendido entre $\vert{}0\rangle$ y $\vert{}1\rangle$.

| Canal | Proceso físico | Escala de tiempo | Transformación del vector de Bloch | Geometría resultante |
| --- | --- | --- | --- | --- |
| Amortiguamiento de amplitud | Relajación térmica y pérdida de energía al entorno | $T_1$ | $(\sqrt{1-\gamma}r_x, \sqrt{1-\gamma}r_y, \gamma + (1-\gamma)r_z)$ | Elipsoide contraído y desplazado hacia el polo norte $(0, 0, 1)$ |
| Amortiguamiento de fase | Dispersión de fase sin intercambio de energía | $T_\phi$ | $((1-\lambda)r_x, (1-\lambda)r_y, r_z)$ | Esferoide comprimido radialmente hacia el eje $Z$ |
| Despolarización | Pérdida isotrópica de información cuántica | $T_{\text{depol}}$ | $((1-p)r_x, (1-p)r_y, (1-p)r_z)$ | Esfera concéntrica reducida hacia el origen $(0,0,0)$ |
| Inversión de bit/fase | Error discreto de Pauli ($X$, $Y$ o $Z$) | $T_{\text{gate}}$ | Depende de la compuerta de Pauli aplicada | Reflexión de las componentes correspondientes |

## Análisis Pedagógico y Corrección de Obstáculos Cognitivos

La enseñanza de la mecánica cuántica mediante la esfera de Bloch enfrenta dificultades conceptuales que conviene abordar explícitamente.

El obstáculo más frecuente consiste en interpretar el ángulo espacial tridimensional entre dos vectores de Bloch $\theta_B$ como si fuera el ángulo directo entre dos vectores en el espacio de Hilbert. Los estudiantes asumen de manera natural que dos estados son ortogonales cuando forman un ángulo de $90^\circ$ en la esfera de Bloch. La corrección formal exige demostrar que el producto interno en el espacio de Hilbert depende de la mitad del ángulo espacial, según la relación:

$$
\vert{}\langle \psi_1 \vert{} \psi_2 \rangle\vert{}^2 = \cos^2\left(\frac{\theta_B}{2}\right)
$$

Esta ley matemática explica por qué los estados verdaderamente ortogonales ($\langle \psi_1 \vert{} \psi_2 \rangle = 0$) se sitúan a un ángulo $\theta_B = \pi$ ($180^\circ$), ubicándose en puntos antípodas opuestos de la esfera, mientras que una separación espacial de $90^\circ$ en el ecuador representa en realidad un solapamiento cuántico de $\vert{}\langle \psi_1 \vert{} \psi_2 \rangle\vert{}^2 = 1/2$, caracterizado por una interferencia máxima.

Otro error común ocurre al intentar extender ingenuamente la esfera de Bloch a sistemas de múltiples qubits mediante la superposición de vectores independientes. Cuando dos qubits se entrelazan en un estado como el estado de Bell $\vert{}\Phi^+\rangle = \frac{\vert{}00\rangle + \vert{}11\rangle}{\sqrt{2}}$, el sistema global ya no se puede factorizar como un producto tensorial de dos estados puros individuales. Al calcular la matriz de densidad reducida del primer qubit trazando el segundo ($\rho_A = \text{Tr}_B(\vert{}\Phi^+\rangle\langle\Phi^+\vert{})$), el resultado es la matriz proporcional a la identidad $\rho_A = \frac{1}{2}I$. Este resultado posiciona el vector del qubit individual exactamente en el origen tridimensional $(0,0,0)$ con pureza mínima $1/2$. Por tanto, la contracción del vector hacia el interior de la esfera individual constituye la firma geométrica visual del entrelazamiento cuántico con el resto del sistema.

Finalmente, existe una confusión recurrente con respecto al papel de las fases globales versus las fases relativas. Muchos estudiantes consideran erróneamente que el estado $\vert{}-\rangle = \frac{\vert{}0\rangle - \vert{}1\rangle}{\sqrt{2}}$ es idéntico a $\vert{}+\rangle = \frac{\vert{}0\rangle + \vert{}1\rangle}{\sqrt{2}}$ al interpretar el signo negativo como una fase irrelevante. El agente de IA debe clarificar que mientras la fase global no altera la posición del estado, la fase relativa $\phi$ determina la orientación horizontal sobre el ecuador de la esfera. En consecuencia, $\vert{}+\rangle$ se proyecta sobre la coordenada $(1,0,0)$ y $\vert{}-\rangle$ sobre $(-1,0,0)$, produciendo resultados medibles totalmente opuestos al cambiar la base de medición mediante compuertas de rotación.

| Error conceptual | Manifestación en la interfaz | Explicación correctiva | Estrategia interactiva |
| --- | --- | --- | --- |
| Ortogonalidad a $90^\circ$ | Duda al observar $\vert{}0\rangle$ y $\vert{}1\rangle$ en polos opuestos ($180^\circ$). | El ángulo entre estados en Hilbert es la mitad del ángulo geométrico. | Graficar $\lvert\langle \psi_1 \mid \psi_2 \rangle\rvert^2$ frente a $\theta_B$. |
| Entrelazamiento multiqubit | Intento de representar un qubit entrelazado mediante un vector puro en la superficie. | El estado reducido puede ser mixto; el vector local se desplaza al interior de la esfera. | Aplicar CNOT y mostrar el cambio en la pureza local. |
| Spin físico vs. qubit | Asociar el vector con una rotación de una carga en el espacio real. | La esfera representa un espacio abstracto de estados, no una orientación mecánica. | Sincronizar la esfera con un histograma de probabilidades. |
| Fase relativa | Suponer que las rotaciones alrededor de $Z$ no afectan al estado. | La fase relativa determina las probabilidades en otra base de medición. | Aplicar $Z$ seguido de $H$ para evidenciar la interferencia. |


## Arquitectura de Software e Implementación Web (WebGL / Three.js)

El desarrollo de una aplicación web interactiva de alto rendimiento dedicada a la esfera de Bloch requiere una arquitectura desacoplada estructurada en tres módulos principales: un motor de cálculo matemático especializado en álgebras complejas, una capa de renderizado gráfico basada en WebGL mediante la biblioteca Three.js, y un módulo de interfaz de usuario receptivo.

### Convención de coordenadas

Existe un desacople estructural entre la convención matemática de la esfera de Bloch (donde el eje $Z$ apunta verticalmente al Polo Norte) y el sistema de coordenadas cartesiano de mano derecha por defecto en Three.js (donde el eje $Y$ es el eje vertical que apunta hacia arriba). La transformación espacial directa entre las coordenadas del vector de Bloch $(r_x, r_y, r_z)$ y las coordenadas de la escena 3D $(X_{\text{webgl}}, Y_{\text{webgl}}, Z_{\text{webgl}})$ se define formalmente como:

$$
\begin{aligned}
X_{\text{webgl}} &= r_x = \sin\theta \cos\phi, \\
Y_{\text{webgl}} &= r_z = \cos\theta, \\
Z_{\text{webgl}} &= -r_y = -\sin\theta \sin\phi.
\end{aligned}
$$

En la construcción de la escena Three.js, la esfera translúcida externa se genera mediante una geometría esférica THREE.SphereGeometry(radius, 64, 64) combinada con un material físico THREE.MeshPhysicalMaterial que incorpora opacidad parcial (opacity: 0.15), rugosidad baja y alta transmisión de luz para simular un contenedor transparente. Para la representación del vector de estado, se utiliza un objeto THREE.ArrowHelper o una malla personalizada que ajusta su dirección y longitud en cada fotograma.

### Interpolación de rotaciones

Para lograr animaciones fluidas al aplicar una compuerta cuántica $U = R_{\hat{n}}(\alpha)$, debe evitarse la interpolación lineal simple de las coordenadas cartesianas (LERP), ya que esta reduce erróneamente la longitud del vector durante la transición. La metodología matemáticamente rigurosa convierte el operador de rotación a un cuaternión de Hamilton $q = (q_w, q_x, q_y, q_z)$:

$$
q = \left( \cos\left(\frac{\alpha}{2}\right), \, n_x \sin\left(\frac{\alpha}{2}\right), \, n_y \sin\left(\frac{\alpha}{2}\right), \, n_z \sin\left(\frac{\alpha}{2}\right) \right)
$$

Dado un cuaternión inicial $q_{\text{inicio}}$ y uno final $q_{\text{fin}}$, la trayectoria de animación en el parámetro de tiempo $t \in [0, 1]$ se evalúa mediante la interpolación esférica de cuaterniones (SLERP) empleando THREE.Quaternion.slerp, que interpola las orientaciones a velocidad angular constante:

$$
\text{SLERP}(q_{\text{inicio}}, q_{\text{fin}}, t) = \frac{\sin((1-t)\Omega)}{\sin\Omega} q_{\text{inicio}} + \frac{\sin(t\Omega)}{\sin\Omega} q_{\text{fin}}
$$

### Implementación de referencia con Three.js

La siguiente implementación muestra una infraestructura básica en JavaScript y Three.js para gestionar la escena y transformar coordenadas cuánticas a coordenadas de la escena 3D.

```js
import * as THREE from 'three';

// 1. Inicialización de la Escena, Cámara y Renderer
const container = document.getElementById('bloch-container');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
camera.position.set(2.5, 1.8, 3.0);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(container.clientWidth, container.clientHeight);
renderer.setPixelRatio(window.devicePixelRatio);
container.appendChild(renderer.domElement);

// 2. Iluminación de la Escena
const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
scene.add(ambientLight);
const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
dirLight.position.set(5, 10, 7);
scene.add(dirLight);

// 3. Geometría y Material de la Esfera Translúcida
const sphereGeo = new THREE.SphereGeometry(1, 48, 48);
const sphereMat = new THREE.MeshPhysicalMaterial({
  color: 0x3b82f6,
  transparent: true,
  opacity: 0.15,
  roughness: 0.1,
  metalness: 0.1,
  clearcoat: 1.0
});
const blochSphere = new THREE.Mesh(sphereGeo, sphereMat);
scene.add(blochSphere);

// 4. Ejes Coordenados Ajustados (WebGL Y es el Z cuántico)
function createAxis(from, to, color) {
  const points = [from, to];
  const geo = new THREE.BufferGeometry().setFromPoints(points);
  const mat = new THREE.LineBasicMaterial({ color: color, linewidth: 2 });
  return new THREE.Line(geo, mat);
}

const axisX = createAxis(new THREE.Vector3(-1.2, 0, 0), new THREE.Vector3(1.2, 0, 0), 0xef4444); // Rojo: X
const axisY = createAxis(new THREE.Vector3(0, 0, -1.2), new THREE.Vector3(0, 0, 1.2), 0x10b981); // Verde: Y
const axisZ = createAxis(new THREE.Vector3(0, -1.2, 0), new THREE.Vector3(0, 1.2, 0), 0x3b82f6); // Azul: Z
scene.add(axisX); scene.add(axisY); scene.add(axisZ);

// 5. Vector de Bloch Interactivo (ArrowHelper)
const arrowHelper = new THREE.ArrowHelper(
  new THREE.Vector3(0, 1, 0),
  new THREE.Vector3(0, 0, 0),
  1.0,
  0xf59e0b,
  0.15,
  0.08
);
scene.add(arrowHelper);

// 6. Conversión Matemáticas Cuánticas a WebGL
export function updateQubitVisualState(theta, phi, radius = 1.0) {
  const rx = radius * Math.sin(theta) * Math.cos(phi);
  const ry = radius * Math.sin(theta) * Math.sin(phi);
  const rz = radius * Math.cos(theta);

  const targetVec = new THREE.Vector3(rx, rz, -ry);
  arrowHelper.setDirection(targetVec.clone().normalize());
  arrowHelper.setLength(targetVec.length());
}

// 7. Bucle de Renderizado
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();
```

## Modelos de Datos y Contexto Estructurado para el Agente de IA

Para habilitar una integración fluida entre la aplicación web y el agente de inteligencia artificial, se requiere un esquema de intercambio de datos estandarizado en formato JSON. Este modelo de datos permite al agente de IA interpretar el estado actual del qubit, analizar las probabilidades de medición y generar respuestas explicativas o ejecutar acciones directas sobre la interfaz gráfica.

### Esquema JSON para la Representación del Estado del Qubit

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "BlochSphereQubitState",
  "type": "object",
  "properties": {
    "qubit_id": { "type": "string", "example": "q0" },
    "is_pure": { "type": "boolean", "example": true },
    "purity": { "type": "number", "minimum": 0.5, "maximum": 1.0, "example": 1.0 },
    "state_vector": {
      "type": "object",
      "properties": {
        "alpha": { "type": "object", "properties": { "real": { "type": "number" }, "imag": { "type": "number" } } },
        "beta": { "type": "object", "properties": { "real": { "type": "number" }, "imag": { "type": "number" } } }
      }
    },
    "spherical_coordinates": {
      "type": "object",
      "properties": {
        "theta_rad": { "type": "number", "minimum": 0, "maximum": 3.141592653589793 },
        "phi_rad": { "type": "number", "minimum": 0, "maximum": 6.283185307179586 }
      }
    },
    "bloch_vector": {
      "type": "object",
      "properties": {
        "rx": { "type": "number", "minimum": -1.0, "maximum": 1.0 },
        "ry": { "type": "number", "minimum": -1.0, "maximum": 1.0 },
        "rz": { "type": "number", "minimum": -1.0, "maximum": 1.0 },
        "magnitude": { "type": "number", "minimum": 0.0, "maximum": 1.0 }
      }
    },
    "density_matrix": {
      "type": "array",
      "items": {
        "type": "array",
        "items": {
          "type": "object",
          "properties": { "real": { "type": "number" }, "imag": { "type": "number" } }
        }
      }
    },
    "measurement_probabilities": {
      "type": "object",
      "properties": {
        "prob_0": { "type": "number", "minimum": 0.0, "maximum": 1.0 },
        "prob_1": { "type": "number", "minimum": 0.0, "maximum": 1.0 }
      }
    }
  },
  "required": ["qubit_id", "is_pure", "bloch_vector", "measurement_probabilities"]
}
```

### Instancia de Ejemplo: Estado de Superposición $\vert{}+\rangle$

```json
{
  "qubit_id": "q0",
  "is_pure": true,
  "purity": 1.0,
  "state_vector": {
    "alpha": { "real": 0.707107, "imag": 0.0 },
    "beta": { "real": 0.707107, "imag": 0.0 }
  },
  "spherical_coordinates": {
    "theta_rad": 1.570796,
    "phi_rad": 0.0
  },
  "bloch_vector": {
    "rx": 1.0,
    "ry": 0.0,
    "rz": 0.0,
    "magnitude": 1.0
  },
  "density_matrix": [
    [{ "real": 0.5, "imag": 0.0 }, { "real": 0.5, "imag": 0.0 }],
    [{ "real": 0.5, "imag": 0.0 }, { "real": 0.5, "imag": 0.0 }]
  ],
  "measurement_probabilities": {
    "prob_0": 0.5,
    "prob_1": 0.5
  }
}
```

### Esquema JSON para Operaciones de Compuertas Cuánticas

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "QuantumGateOperation",
  "type": "object",
  "properties": {
    "gate_label": { "type": "string", "example": "HADAMARD" },
    "rotation_axis": {
      "type": "object",
      "properties": {
        "nx": { "type": "number" },
        "ny": { "type": "number" },
        "nz": { "type": "number" }
      }
    },
    "angle_rad": { "type": "number", "example": 3.141592653589793 },
    "quaternion_rotation": {
      "type": "object",
      "properties": {
        "w": { "type": "number" },
        "x": { "type": "number" },
        "y": { "type": "number" },
        "z": { "type": "number" }
      }
    },
    "pedagogical_description": {
      "type": "string",
      "example": "El operador Hadamard rota el vector 180 grados alrededor del eje diagonal (X+Z)/sqrt(2), mapeando el estado polo norte |0> hacia el estado ecuatorial |+>."
    }
  }
}
```

## Conclusiones y Recomendaciones de Implementación

El desarrollo exitoso de una plataforma interactiva de aprendizaje sobre la esfera de Bloch requiere integrar con precisión las bases matemáticas del espacio de Hilbert bidimensional con las tecnologías de renderizado tridimensional moderno. Las recomendaciones fundamentales sintetizadas de este estudio articulan cuatro pilares clave de desarrollo.

En primer lugar, se debe fundamentar el motor de física sobre la matriz de densidad $\rho$ y el espacio $SU(2)$, garantizando que la extracción de las componentes del vector de Bloch $\vec{r} = (r_x, r_y, r_z)$ evite las indeseadas singularidades de representación polar en los polos norte y sur ($\theta = 0, \pi$), donde el ángulo de longitud $\phi$ carece de unicidad.

En segundo lugar, el diseño gráfico y la lógica conversacional del agente de IA deben estructurarse activamente alrededor de los errores pedagógicos documentados. La interfaz debe contrastar continuamente la representación geométrica tridimensional con las probabilidades de medición de Born y el producto interno de estados, permitiendo al usuario comprobar visualmente que la separación de $180^\circ$ sobre la esfera corresponde a la ortogonalidad cuántica formal, y que las pérdidas de pureza ($\vert{}\vec{r}\vert{} < 1$) se deben a decoherencia o entrelazamiento con sistemas externos.

En tercer lugar, para las secuencias de animación de compuertas cuánticas, es imprescindible emplear la interpolación esférica de cuaterniones (SLERP) en lugar de interpolaciones cartesianas simples. Esto preserva la norma del vector sobre la superficie de la esfera y describe las trayectorias circulares correspondientes a las rotaciones físicas.

Finalmente, los esquemas JSON definidos deben integrarse como el canal de comunicación bidireccional entre la interfaz WebGL y el modelo de lenguaje. De este modo, el agente de IA no solo responde verbalmente a las preguntas del usuario, sino que puede interpretar el estado exacto del qubit en pantalla, diagnosticar confusiones en tiempo real y desencadenar animaciones instructivas dentro del entorno tridimensional interactivo.
