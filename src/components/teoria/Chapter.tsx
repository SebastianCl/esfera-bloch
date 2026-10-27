import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { chapterInfo, chapterNumber, nextChapter, prevChapter, type ChapterSlug } from '@/lib/course';
import { CHAPTER_TITLE, KICKER } from '@/lib/styles';

interface ChapterProps {
  slug: ChapterSlug;
  children: ReactNode;
  exercise: ReactNode;
}

/**
 * Marco de un capítulo: kicker con número y procedencia, título (h2), cuerpo,
 * ejercicio y enlaces al anterior y al siguiente. El id es el slug: los enlaces
 * profundos /#/teoria/<slug> hacen scroll hasta aquí.
 */
export function Chapter({ slug, children, exercise }: ChapterProps) {
  const info = chapterInfo(slug);
  const n = chapterNumber(slug);
  const prev = prevChapter(slug);
  const next = nextChapter(slug);

  return (
    <section
      id={slug}
      aria-labelledby={`${slug}-titulo`}
      className="scroll-mt-[var(--dock-h,0px)] lg:scroll-mt-6 space-y-4 pt-8 border-t border-border/40 first:border-0 first:pt-0"
    >
      <div>
        <p className={KICKER}>
          Capítulo {n} · {info.source}
        </p>
        <h2 id={`${slug}-titulo`} className={CHAPTER_TITLE}>
          {n}. {info.title}
        </h2>
      </div>
      <div className="space-y-3 text-sm leading-relaxed text-foreground">{children}</div>
      {exercise}
      <nav aria-label={`Capítulo ${n}: anterior y siguiente`} className="flex justify-between gap-4 text-sm">
        {prev ? (
          <Link to={`/teoria/${prev.slug}`} className="underline-offset-2 hover:underline hover:text-primary">
            ← {n - 1}. {prev.title}
          </Link>
        ) : (
          <Link to="/teoria" className="underline-offset-2 hover:underline hover:text-primary">
            ← Índice
          </Link>
        )}
        {next ? (
          <Link to={`/teoria/${next.slug}`} className="text-right underline-offset-2 hover:underline hover:text-primary">
            {n + 1}. {next.title} →
          </Link>
        ) : (
          <Link to="/" className="text-right underline-offset-2 hover:underline hover:text-primary">
            Ir al laboratorio →
          </Link>
        )}
      </nav>
    </section>
  );
}
