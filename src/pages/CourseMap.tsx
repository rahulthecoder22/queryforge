import { SqlLearnHub } from '@/components/learn/SqlLearnHub';
import { worlds } from '@/data/courses';

export function CourseMap() {
  return <SqlLearnHub worlds={worlds} />;
}
