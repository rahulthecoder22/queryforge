import { NavLink } from 'react-router-dom';

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors no-drag ${
    isActive
      ? 'bg-[var(--accent-primary)]/20 text-[var(--text-primary)]'
      : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]'
  }`;

export function Sidebar() {
  return (
    <aside className="flex w-52 shrink-0 flex-col border-r border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-3">
      <div className="drag mb-6 px-2 pt-10 text-lg font-semibold tracking-tight text-[var(--text-primary)]">
        QueryForge
      </div>
      <nav className="flex flex-1 flex-col gap-1">
        <NavLink to="/" end className={linkClass}>
          <span>⌂</span> Dashboard
        </NavLink>
        <NavLink to="/workspace" className={linkClass}>
          <span>▣</span> Workspace
        </NavLink>
        <NavLink to="/documents" className={linkClass}>
          <span className="font-mono text-xs">{'{}'}</span> Documents
        </NavLink>
        <NavLink to="/learn" className={linkClass}>
          <span>◎</span> Learn SQL
        </NavLink>
        <NavLink to="/learn/mongo" className={linkClass}>
          <span>🍃</span> Learn Mongo
        </NavLink>
        <NavLink to="/learn/wiki" className={linkClass}>
          <span>📚</span> Wiki
        </NavLink>
        <NavLink to="/masterclass" className={linkClass}>
          <span>◆</span> Masterclass
        </NavLink>
        <NavLink to="/settings" className={linkClass}>
          <span>⚙</span> Settings
        </NavLink>
      </nav>
    </aside>
  );
}
