import { useEffect, useState } from 'react';
import { SqlLearnHub } from '@/components/learn/SqlLearnHub';
import { LearnSqlLoading } from '@/components/learn/LearnSqlLoading';
import { loadSqlWorlds } from '@/data/courses/loadSqlWorlds';
import type { World } from '@/data/courses/types';

export function CourseMap() {
  const [worlds, setWorlds] = useState<World[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    void loadSqlWorlds().then((w) => {
      if (!cancelled) setWorlds(w);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (worlds == null) {
    return <LearnSqlLoading />;
  }

  return <SqlLearnHub worlds={worlds} />;
}
