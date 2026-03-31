import { motion } from 'framer-motion';
import type { TheoryVisualId } from '@/data/lessonTheory/types';

type Props = { id: TheoryVisualId; accent?: string };

/** Compact animated mental models for the theory column. */
export function TheoryVisualStage({ id, accent = 'var(--accent-primary)' }: Props) {
  if (id === 'none') return null;

  return (
    <div
      className="relative overflow-hidden rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-tertiary)]/80 p-4"
      aria-hidden
    >
      <div className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-[var(--text-muted)]">
        Interactive model
      </div>
      <p className="mb-3 text-[10px] text-[var(--text-muted)]">
        Motion hints at data flow. For full explanations open Masterclass → Visual lab or the Wiki.
      </p>
      <div className="min-h-[120px]">
        {id === 'mongo-boolean' && <VisBoolean accent={accent} />}
        {id === 'mongo-string-eq' && <VisStringEq accent={accent} />}
        {id === 'mongo-in-array' && <VisInArray accent={accent} />}
        {id === 'mongo-compare' && <VisCompare accent={accent} />}
        {id === 'mongo-dot' && <VisDot accent={accent} />}
        {id === 'mongo-or' && <VisOr accent={accent} />}
        {id === 'mongo-and-implicit' && <VisAndImplicit accent={accent} />}
        {id === 'mongo-elem' && <VisElem accent={accent} />}
        {id === 'mongo-exists' && <VisExists accent={accent} />}
        {id === 'mongo-ne' && <VisNe accent={accent} />}
        {id === 'mongo-nin' && <VisNin accent={accent} />}
        {id === 'mongo-compound' && <VisCompound accent={accent} />}
        {id === 'sql-select' && <VisSqlSelect accent={accent} />}
        {id === 'sql-where' && <VisSqlWhere accent={accent} />}
        {id === 'sql-join' && <VisSqlJoin accent={accent} />}
        {id === 'sql-group' && <VisSqlGroup accent={accent} />}
      </div>
    </div>
  );
}

function VisBoolean({ accent }: { accent: string }) {
  return (
    <div className="flex items-center justify-center gap-4 font-mono text-xs">
      <motion.span
        className="rounded-lg px-3 py-2 text-[var(--text-secondary)]"
        initial={{ opacity: 0.3 }}
        animate={{ opacity: 1, boxShadow: `0 0 0 2px ${accent}` }}
        transition={{ repeat: Infinity, duration: 2, repeatType: 'reverse' }}
      >
        remote: true
      </motion.span>
      <span className="text-[var(--text-muted)]">→</span>
      <span className="text-[var(--accent-success)]">match</span>
    </div>
  );
}

function VisStringEq({ accent }: { accent: string }) {
  return (
    <motion.div
      className="text-center font-mono text-xs text-[var(--text-primary)]"
      initial={{ scale: 0.95 }}
      animate={{ scale: 1 }}
      transition={{ repeat: Infinity, duration: 1.8, repeatType: 'reverse' }}
    >
      <span style={{ color: accent }}>&quot;role&quot;</span>
      <span className="text-[var(--text-muted)]">: </span>
      <span className="text-[var(--accent-warning)]">&quot;engineer&quot;</span>
    </motion.div>
  );
}

function VisInArray({ accent }: { accent: string }) {
  const skills = ['sql', 'go', 'rust'];
  return (
    <div className="flex flex-col items-center gap-2 font-mono text-[10px]">
      <div className="flex gap-1">
        {skills.map((s, i) => (
          <motion.span
            key={s}
            className="rounded px-2 py-1 bg-[var(--bg-secondary)] text-[var(--text-secondary)]"
            animate={{
              outlineColor: s === 'sql' ? accent : 'transparent',
              outlineWidth: 2,
              outlineStyle: 'solid',
            }}
            transition={{ delay: i * 0.2, duration: 0.4 }}
          >
            {s}
          </motion.span>
        ))}
      </div>
      <span className="text-[var(--text-muted)]">$in picks a hit inside the array</span>
    </div>
  );
}

function VisCompare({ accent }: { accent: string }) {
  return (
    <div className="flex items-center justify-center gap-2 font-mono text-xs">
      <span className="text-[var(--text-muted)]">tenureMonths</span>
      <motion.span style={{ color: accent }} animate={{ x: [0, 4, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>
        {'{ "$gte": 36 }'}
      </motion.span>
    </div>
  );
}

function VisDot({ accent }: { accent: string }) {
  return (
    <motion.div
      className="space-y-1 text-center font-mono text-[10px] text-[var(--text-secondary)]"
      initial={{ opacity: 0.5 }}
      animate={{ opacity: 1 }}
      transition={{ repeat: Infinity, duration: 2, repeatType: 'reverse' }}
    >
      <div>meta → office</div>
      <div style={{ color: accent }}>{'"meta.office": "NYC"'}</div>
    </motion.div>
  );
}

function VisOr({ accent }: { accent: string }) {
  return (
    <div className="flex justify-center gap-3 text-[10px] font-mono">
      <motion.div className="rounded border border-dashed px-2 py-1" style={{ borderColor: accent }} layout>
        engineer
      </motion.div>
      <span className="text-[var(--text-muted)]">$or</span>
      <motion.div className="rounded border border-dashed px-2 py-1" style={{ borderColor: accent }} layout>
        data
      </motion.div>
    </div>
  );
}

function VisAndImplicit({ accent }: { accent: string }) {
  return (
    <div className="flex flex-wrap justify-center gap-2 font-mono text-[10px]">
      {['level', 'band'].map((k, i) => (
        <motion.span
          key={k}
          className="rounded-full px-2 py-0.5"
          style={{ backgroundColor: `${accent}22`, color: accent }}
          initial={{ y: 6, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: i * 0.15 }}
        >
          {k}
        </motion.span>
      ))}
      <span className="w-full text-center text-[var(--text-muted)]">same object → AND</span>
    </div>
  );
}

function VisElem({ accent }: { accent: string }) {
  return (
    <div className="flex flex-col items-center gap-2 font-mono text-[10px]">
      <div className="flex gap-2">
        <motion.div
          className="rounded border px-2 py-3"
          style={{ borderColor: accent }}
          animate={{ scale: [1, 1.03, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          line A
        </motion.div>
        <div className="rounded border border-[var(--border-subtle)] px-2 py-3 opacity-40">line B</div>
      </div>
      <span className="text-[var(--text-muted)]">$elemMatch = one row must satisfy all</span>
    </div>
  );
}

function VisExists({ accent }: { accent: string }) {
  return (
    <motion.div
      className="text-center font-mono text-[10px] text-[var(--text-secondary)]"
      animate={{ color: ['var(--text-secondary)', accent, 'var(--text-secondary)'] }}
      transition={{ duration: 2, repeat: Infinity }}
    >
      certs[0] ?
      <br />
      <span className="text-[var(--text-muted)]">$exists guards array emptiness</span>
    </motion.div>
  );
}

function VisNe({ accent }: { accent: string }) {
  return (
    <div className="text-center font-mono text-xs">
      <motion.span style={{ color: accent }} animate={{ opacity: [1, 0.4, 1] }} transition={{ repeat: Infinity, duration: 1.2 }}>
        ≠ cancelled
      </motion.span>
    </div>
  );
}

function VisNin({ accent }: { accent: string }) {
  return (
    <div className="text-center font-mono text-[10px] text-[var(--text-muted)]">
      <motion.span style={{ color: accent }}>skills ∩ {'{python}'} = ∅</motion.span>
    </div>
  );
}

function VisCompound({ accent }: { accent: string }) {
  return (
    <div className="flex items-center justify-center gap-1 font-mono text-[10px]">
      <motion.span layout style={{ color: accent }} animate={{ rotate: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 3 }}>
        ( A ∧ B )
      </motion.span>
      <span className="text-[var(--text-muted)]">∨</span>
      <span style={{ color: accent }}>( C )</span>
    </div>
  );
}

function VisSqlSelect({ accent }: { accent: string }) {
  return (
    <div className="space-y-1 text-center font-mono text-[10px]">
      <motion.div style={{ color: accent }} initial={{ x: -8 }} animate={{ x: 0 }}>
        SELECT …
      </motion.div>
      <div className="text-[var(--text-muted)]">↓</div>
      <div>FROM table</div>
    </div>
  );
}

function VisSqlWhere({ accent }: { accent: string }) {
  return (
    <div className="flex flex-col items-center gap-1 font-mono text-[10px]">
      <span className="text-[var(--text-muted)]">rows flow down</span>
      <motion.div
        className="w-full max-w-[200px] rounded border py-2 text-center"
        style={{ borderColor: accent }}
        animate={{ scaleY: [1, 1.08, 1] }}
        transition={{ repeat: Infinity, duration: 2 }}
      >
        WHERE sieve
      </motion.div>
    </div>
  );
}

function VisSqlJoin({ accent }: { accent: string }) {
  return (
    <div className="flex items-end justify-center gap-3 font-mono text-[10px]">
      <motion.div className="h-12 w-10 rounded-t border border-b-0 px-1" style={{ borderColor: accent }}>
        A
      </motion.div>
      <motion.div
        className="h-8 w-10 rounded-t border border-b-0 px-1"
        style={{ borderColor: accent }}
        animate={{ y: [0, -4, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
      >
        B
      </motion.div>
      <span className="mb-1 text-[var(--text-muted)]">ON</span>
    </div>
  );
}

function VisSqlGroup({ accent }: { accent: string }) {
  return (
    <div className="flex justify-center gap-2 font-mono text-[10px]">
      {['a', 'b', 'c'].map((g, i) => (
        <motion.div
          key={g}
          className="rounded px-2 py-3"
          style={{ backgroundColor: `${accent}18` }}
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ delay: i * 0.1 }}
        >
          {g}
        </motion.div>
      ))}
    </div>
  );
}
