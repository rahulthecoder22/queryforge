import { motion } from 'framer-motion';
import { NavLink } from 'react-router-dom';
import { loadSqlWorlds } from '@/data/courses/loadSqlWorlds';

const items: { to: string; end?: boolean; label: string; icon: string }[] = [
  { to: '/', end: true, label: 'Dashboard', icon: '◆' },
  { to: '/workspace', label: 'Workspace', icon: '▣' },
  { to: '/documents', label: 'Documents', icon: '{}' },
  { to: '/learn', label: 'Learn SQL', icon: '◎' },
  { to: '/learn/mongo', label: 'Learn Mongo', icon: '🍃' },
  { to: '/learn/wiki', label: 'Wiki', icon: '📚' },
  { to: '/masterclass', label: 'Masterclass', icon: '◇' },
  { to: '/settings', label: 'Settings', icon: '⚙' },
];

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium no-drag transition-colors ${
    isActive
      ? 'text-[var(--text-primary)]'
      : 'text-[var(--text-secondary)] hover:bg-[var(--glass-highlight)] hover:text-[var(--text-primary)]'
  }`;

export function Sidebar() {
  return (
    <motion.aside
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ type: 'spring', stiffness: 280, damping: 32 }}
      className="qf-glass flex w-56 shrink-0 flex-col border-r border-[var(--border-subtle)] p-3"
    >
      <div className="drag mb-8 px-2 pt-10">
        <div className="qf-display text-xl font-extrabold tracking-tight">
          <span className="bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-info)] bg-clip-text text-transparent">
            Query
          </span>
          <span className="text-[var(--text-primary)]">Forge</span>
        </div>
        <p className="mt-1 text-[10px] font-medium uppercase tracking-[0.2em] text-[var(--text-muted)]">
          Learn · Build · Ship
        </p>
      </div>
      <nav className="flex flex-1 flex-col gap-0.5">
        {items.map((item, i) => (
          <motion.div
            key={item.to}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.04 * i, type: 'spring', stiffness: 380, damping: 28 }}
          >
            <NavLink
              to={item.to}
              end={item.end}
              className={linkClass}
              onMouseEnter={() => {
                if (item.to === '/learn') void loadSqlWorlds();
              }}
            >
              {({ isActive }) => (
                <>
                  {isActive ? (
                    <motion.span
                      layoutId="sidebar-active"
                      className="absolute inset-0 rounded-xl bg-[var(--accent-primary)]/18"
                      transition={{ type: 'spring', stiffness: 380, damping: 34 }}
                    />
                  ) : null}
                  <span
                    className={`relative z-[1] flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs ${
                      isActive
                        ? 'bg-[var(--accent-primary)]/25 text-[var(--accent-info)]'
                        : 'bg-[var(--bg-tertiary)] text-[var(--text-muted)] group-hover:text-[var(--text-secondary)]'
                    }`}
                  >
                    {item.icon === '{}' ? <span className="font-mono text-[10px]">{'{}'}</span> : item.icon}
                  </span>
                  <span className="relative z-[1]">{item.label}</span>
                </>
              )}
            </NavLink>
          </motion.div>
        ))}
      </nav>
    </motion.aside>
  );
}
