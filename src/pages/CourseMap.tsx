import { useEffect, useSyncExternalStore } from 'react';
import { SqlLearnHub } from '@/components/learn/SqlLearnHub';
import { LearnSqlLoading } from '@/components/learn/LearnSqlLoading';
import {
  getSqlWorldsSnapshot,
  loadSqlWorlds,
  subscribeSqlWorldsCatalog,
} from '@/data/courses/loadSqlWorlds';

export function CourseMap() {
  const worlds = useSyncExternalStore(
    subscribeSqlWorldsCatalog,
    getSqlWorldsSnapshot,
    () => null,
  );

  useEffect(() => {
    void loadSqlWorlds();
  }, []);

  if (worlds == null) {
    return <LearnSqlLoading />;
  }

  return <SqlLearnHub worlds={worlds} />;
}
