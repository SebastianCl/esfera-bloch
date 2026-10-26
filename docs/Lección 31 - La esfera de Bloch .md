

# Informe de Clase: La Esfera de Bloch

**Curso:** Mundo Cuántico (Diplomado en Fronteras de la Física)

**Institución / Programa:** Dr. Z Academy — Colegio de la Compañía de María

**Lección:** Lección 31 — *La esfera de Bloch*

---

## 1. Introducción y Planteamiento del Problema

En la representación convencional de los estados cuánticos de dos niveles (qubits) mediante el **círculo de Bloch**, nos encontramos con una limitación geométrica: solo es posible representar vectores en el plano 2D correspondientes a las direcciones $X$ y $Z$.

Dado un estado general expresado en la base computacional ($Z$):

$$\vert{}\Psi\rangle = a_u \vert{}u\rangle + a_d \vert{}d\rangle$$



se observa que la representación circular en dos dimensiones **omite la información asociada a la componente imaginaria de la fase**, correspondiente al eje $Y$.

---

## 2. Los Números Complejos y la Aportación de Gauss

Para comprender cómo incorporar la dimensión faltante, la clase recurre a la representación cartesiana de los números complejos introducida por **Karl Gauss**:

* **Plano Complejo:** Un número complejo $w = x + iy$ se ubica en un plano donde el eje horizontal ($X$) representa la parte real y el eje vertical ($Y$) representa la parte imaginaria ($iy$).


* **Fases e Interfeometría Cuántica:**
* La unidad imaginaria $+i$ se sitúa en la parte superior del eje imaginario.


* La unidad imaginaria $-i$ se sitúa en la parte inferior del eje imaginario.


* Los valores reales $+1$ y $-1$ se posicionan sobre el eje horizontal real.





---

## 3. Transición a la Esfera de Bloch (3D)

Para incluir todas las fases posibles y los autoestados de todos los operadores de spin ($S_x, S_y, S_z$), es necesario extender la representación geométrica a un espacio tridimensional:

* **Polo Norte y Polo Sur (Eje $Z$):**
* Estado superior: $\vert{}u\rangle$ (o $\vert{}0\rangle$)


* Estado inferior: $\vert{}d\rangle$ (o $\vert{}1\rangle$)




* **Autoestados del operador $S_x$ (Eje $X$):**
* $\vert{}r\rangle = \frac{1}{\sqrt{2}}\vert{}u\rangle + \frac{1}{\sqrt{2}}\vert{}d\rangle$


* $\vert{}l\rangle = \frac{1}{\sqrt{2}}\vert{}u\rangle - \frac{1}{\sqrt{2}}\vert{}d\rangle$




* **Autoestados del operador $S_y$ (Eje $Y$):**
* $\vert{}i\rangle = \frac{1}{\sqrt{2}}\vert{}u\rangle + i\frac{1}{\sqrt{2}}\vert{}d\rangle$


* $\vert{}o\rangle = \frac{1}{\sqrt{2}}\vert{}u\rangle - i\frac{1}{\sqrt{2}}\vert{}d\rangle$





---

## 4. Perspectiva Geométrica desde el Polo Superior

Al rotar el punto de vista y observar la esfera directamente desde el polo superior ($+Z$, estado $\vert{}u\rangle$), el ecuador de la esfera se despliega como la proyección del plano complejo:

* El eje ortogonal transversal contiene a los estados $\vert{}r\rangle$ y $\vert{}l\rangle$ (asociados a $+1$ y $-1$).


* El eje vertical imaginario proyecta los autoestados de $S_y$: el estado $\vert{}i\rangle$ en la fase $+i$ y el estado $\vert{}o\rangle$ en la fase $-i$.



---

## 5. Resumen de Autoestados Fundamentales

| Operador / Eje | Autoestado / Orientación | Expresión Matemática |
| --- | --- | --- |
| **$S_z$** | Polo Norte ($+Z$) | $\vert{}u\rangle$

 |
| **$S_z$** | Polo Sur ($-Z$) | $\vert{}d\rangle$

 |
| **$S_x$** | Derecha ($+X$) | $\vert{}r\rangle = \frac{1}{\sqrt{2}}\vert{}u\rangle + \frac{1}{\sqrt{2}}\vert{}d\rangle$

 |
| **$S_x$** | Izquierda ($-X$) | $\vert{}l\rangle = \frac{1}{\sqrt{2}}\vert{}u\rangle - \frac{1}{\sqrt{2}}\vert{}d\rangle$

 |
| **$S_y$** | Entrante / Fase $+i$ ($+Y$) | $\vert{}i\rangle = \frac{1}{\sqrt{2}}\vert{}u\rangle + i\frac{1}{\sqrt{2}}\vert{}d\rangle$

 |
| **$S_y$** | Saliente / Fase $-i$ ($-Y$) | $\vert{}o\rangle = \frac{1}{\sqrt{2}}\vert{}u\rangle - i\frac{1}{\sqrt{2}}\vert{}d\rangle$

 |

---

## 6. Conclusiones

1. **Necesidad de la representación en 3D:** El círculo bidimensional de Bloch no permite representar adecuadamente la fase compleja continua de un qubit.


2. **Visualización completa:** La esfera de Bloch ofrece un marco geométrico completo donde la superficie de la esfera de radio unitario alberga todos los estados puros de un sistema de dos niveles, unificando las bases de medida en los tres ejes del espacio físico ($X, Y, Z$).