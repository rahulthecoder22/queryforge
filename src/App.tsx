import { lazy, Suspense } from 'react';
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from '@/layouts/AppShell';
import { Dashboard } from '@/pages/Dashboard';
import { Workspace } from '@/pages/Workspace';
import { CourseMap } from '@/pages/CourseMap';
import { LearnSqlLoading } from '@/components/learn/LearnSqlLoading';
import { Settings } from '@/pages/Settings';
import { DocumentLab } from '@/pages/DocumentLab';
import { MongoCourseMap } from '@/pages/MongoCourseMap';
import { MongoChallenge } from '@/pages/MongoChallenge';
import { MasterclassCurriculum } from '@/pages/MasterclassCurriculum';
import { DatabaseWiki } from '@/pages/DatabaseWiki';
import { InterviewGuide } from '@/pages/InterviewGuide';
import { DsaHub } from '@/pages/DsaHub';
import { DsaChallenge } from '@/pages/DsaChallenge';

const Challenge = lazy(async () => {
  const m = await import('@/pages/Challenge');
  return { default: m.Challenge };
});

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<Dashboard />} />
          <Route path="workspace" element={<Workspace />} />
          <Route path="documents" element={<DocumentLab />} />
          <Route path="learn/mongo/:levelId" element={<MongoChallenge />} />
          <Route path="learn/mongo" element={<MongoCourseMap />} />
          <Route path="masterclass" element={<MasterclassCurriculum />} />
          <Route path="learn/wiki" element={<DatabaseWiki />} />
          <Route path="interview-guide" element={<InterviewGuide />} />
          <Route path="learn/dsa/:challengeId" element={<DsaChallenge />} />
          <Route path="learn/dsa" element={<DsaHub />} />
          <Route path="learn" element={<CourseMap />} />
          <Route
            path="learn/:levelId"
            element={
              <Suspense fallback={<LearnSqlLoading />}>
                <Challenge />
              </Suspense>
            }
          />
          <Route path="settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}
