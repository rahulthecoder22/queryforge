import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AmbientBackdrop } from '@/components/layout/AmbientBackdrop';
import { Sidebar } from '@/components/shared/Sidebar';
import { AnimatedOutlet } from '@/layouts/AnimatedOutlet';
import { getQueryForge } from '@/lib/electron';
import { emitExplainQuery, emitRunQuery } from '@/lib/workspaceEvents';
import { useDatabaseStore } from '@/stores/databaseStore';
import { useCourseStore } from '@/stores/courseStore';

export function AppShell() {
  const navigate = useNavigate();
  const setActiveDbPath = useDatabaseStore((s) => s.setActiveDbPath);
  const hydrateCourse = useCourseStore((s) => s.hydrate);
  const touchSession = useCourseStore((s) => s.touchSession);
  const courseHydrated = useCourseStore((s) => s.hydrated);

  useEffect(() => {
    void hydrateCourse();
  }, [hydrateCourse]);

  useEffect(() => {
    if (!courseHydrated) return;
    touchSession();
  }, [courseHydrated, touchSession]);

  useEffect(() => {
    const qf = getQueryForge();
    if (!qf) return;

    const unsubs: Array<() => void> = [];

    unsubs.push(
      qf.on('run-query', () => {
        emitRunQuery();
      }),
    );
    unsubs.push(
      qf.on('explain-query', () => {
        emitExplainQuery();
      }),
    );
    unsubs.push(
      qf.on('open-database-path', (p) => {
        if (typeof p === 'string') {
          void qf.db.setActive(p);
          setActiveDbPath(p);
        }
      }),
    );
    unsubs.push(
      qf.on('new-database', () => {
        window.dispatchEvent(new CustomEvent('queryforge-new-database'));
      }),
    );
    unsubs.push(
      qf.on('goto-learn', () => {
        navigate('/learn');
      }),
    );
    unsubs.push(
      qf.on('goto-dashboard', () => {
        navigate('/');
      }),
    );
    unsubs.push(
      qf.on('goto-documents', () => {
        navigate('/documents');
      }),
    );

    void qf.db.getActive().then((p) => {
      if (p) setActiveDbPath(p);
    });

    return () => unsubs.forEach((u) => u());
  }, [navigate, setActiveDbPath]);

  return (
    <div className="relative flex h-screen overflow-hidden bg-[var(--bg-primary)]">
      <AmbientBackdrop />
      <Sidebar />
      <main className="relative z-[1] min-w-0 flex-1 overflow-hidden">
        <AnimatedOutlet />
      </main>
    </div>
  );
}
