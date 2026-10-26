import type { BlochVector, GateRotation } from '@/lib/bloch';
import { axisColor } from '@/lib/colors';

/**
 * Icono de una compuerta: la esfera vista de frente con su eje de rotación y un
 * arco con el ángulo girado. Todo sale de GATE_ROTATIONS, así que una compuerta
 * nueva en el catálogo tiene icono sin tocar nada aquí.
 *
 * Proyección oblicua física → 2D: X a la derecha, Z arriba y Y como una
 * diagonal corta hacia el fondo, como en los dibujos de los apuntes.
 * El tamaño en pantalla lo pone quien lo usa (className); el viewBox escala.
 */
const SIZE = 28;
const CENTER = SIZE / 2;
const RADIUS = 11;
const Y_SKEW = 0.45;
const ARC_RADIUS = 0.62; // fracción del radio de la esfera
const ARC_SEGMENTS = 24;

const project = (v: BlochVector): [number, number] => [
  CENTER + (v.x - Y_SKEW * v.y) * RADIUS,
  CENTER - (v.z - Y_SKEW * v.y) * RADIUS,
];

const scale = (v: BlochVector, s: number): BlochVector => ({ x: v.x * s, y: v.y * s, z: v.z * s });
const cross = (a: BlochVector, b: BlochVector): BlochVector => ({
  x: a.y * b.z - a.z * b.y,
  y: a.z * b.x - a.x * b.z,
  z: a.x * b.y - a.y * b.x,
});
const normalize = (v: BlochVector): BlochVector => {
  const n = Math.hypot(v.x, v.y, v.z) || 1;
  return scale(v, 1 / n);
};

/** Puntos de la circunferencia perpendicular al eje, desde 0 hasta `angle`, proyectados. */
const arcPath = (axis: BlochVector, angle: number, radius: number): string => {
  // Base ortonormal del plano perpendicular al eje: u ⊥ n y v = n × u.
  // Ir de u hacia v es el sentido antihorario visto desde la punta del eje.
  const helper: BlochVector = Math.abs(axis.z) > 0.9 ? { x: 1, y: 0, z: 0 } : { x: 0, y: 0, z: 1 };
  const u = normalize(cross(helper, axis));
  const v = cross(axis, u);
  const steps = Math.max(2, Math.round((ARC_SEGMENTS * Math.abs(angle)) / (2 * Math.PI)));
  const points: string[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = (angle * i) / steps;
    const p = {
      x: (u.x * Math.cos(t) + v.x * Math.sin(t)) * radius,
      y: (u.y * Math.cos(t) + v.y * Math.sin(t)) * radius,
      z: (u.z * Math.cos(t) + v.z * Math.sin(t)) * radius,
    };
    const [px, py] = project(p);
    points.push(`${px.toFixed(2)},${py.toFixed(2)}`);
  }
  return `M${points.join(' L')}`;
};

export function GateIcon({
  rotation,
  theme = 'dark',
  className,
}: {
  rotation: GateRotation;
  theme?: 'dark' | 'light';
  className?: string;
}) {
  const color = axisColor(rotation.axis, theme);
  const [x1, y1] = project(scale(rotation.axis, -1.15));
  const [x2, y2] = project(scale(rotation.axis, 1.15));
  const [ax, ay] = project({ x: -1, y: 0, z: 0 });
  const [bx, by] = project({ x: 1, y: 0, z: 0 });
  const [cx, cy] = project({ x: 0, y: 0, z: -1 });
  const [dx, dy] = project({ x: 0, y: 0, z: 1 });
  const fullTurn = arcPath(rotation.axis, 2 * Math.PI, ARC_RADIUS);
  const turned = arcPath(rotation.axis, rotation.angle, ARC_RADIUS);

  return (
    <svg
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      {/* Esfera y ejes X, Z de referencia, tenues */}
      <circle cx={CENTER} cy={CENTER} r={RADIUS} fill="none" stroke="currentColor" strokeOpacity={0.55} />
      <line x1={ax} y1={ay} x2={bx} y2={by} stroke="currentColor" strokeOpacity={0.3} />
      <line x1={cx} y1={cy} x2={dx} y2={dy} stroke="currentColor" strokeOpacity={0.3} />
      {/* Vuelta completa (tenue) y ángulo girado (en color) alrededor del eje */}
      <path d={fullTurn} fill="none" stroke={color} strokeOpacity={0.35} strokeWidth={1} />
      <path d={turned} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" />
      {/* Eje de rotación, con la punta marcada */}
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={2} strokeLinecap="round" />
      <circle cx={x2} cy={y2} r={2.2} fill={color} />
    </svg>
  );
}
