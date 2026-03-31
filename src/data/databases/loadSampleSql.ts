/**
 * Resolve bundled sample database SQL by filename (e.g. "village_census.sql").
 * Used by Challenge in browser mode with Vite's import.meta.glob.
 */
const modules = import.meta.glob<string>('./*.sql', {
  eager: true,
  query: '?raw',
  import: 'default',
});

export function getBundledSampleSql(fileName: string): string | null {
  const key = Object.keys(modules).find(
    (k) => k === `./${fileName}` || k.endsWith(`/${fileName}`),
  );
  return key ? modules[key]! : null;
}

export function listBundledSampleFiles(): string[] {
  return Object.keys(modules).map((k) => k.replace(/^\.\//, ''));
}
