import { Link } from 'react-router-dom';
import { CHAPTERS } from '@/lib/course';

/** Índice del curso. Enlaces del router, nunca <a href="#…"> (ruta con hash). */
export function CourseToc() {
  return (
    <nav aria-label="Capítulos">
      <ol className="list-decimal list-inside text-sm space-y-1 sm:columns-2">
        {CHAPTERS.map((c) => (
          <li key={c.slug}>
            <Link
              to={`/teoria/${c.slug}`}
              className="underline-offset-2 hover:underline hover:text-primary scroll-mt-[var(--dock-h,0px)] lg:scroll-mt-0"
            >
              {c.title}
            </Link>
          </li>
        ))}
      </ol>
    </nav>
  );
}
