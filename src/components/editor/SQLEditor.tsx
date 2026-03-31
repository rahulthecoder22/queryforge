import Editor from '@monaco-editor/react';
import { KeyCode, KeyMod, type editor } from 'monaco-editor';

interface SQLEditorProps {
  value: string;
  onChange: (v: string) => void;
  onRun?: () => void;
  theme?: 'vs-dark' | 'light';
  className?: string;
}

export function SQLEditor({
  value,
  onChange,
  onRun,
  theme = 'vs-dark',
  className = '',
}: SQLEditorProps) {
  const handleMount = (ed: editor.IStandaloneCodeEditor) => {
    ed.addCommand(KeyMod.CtrlCmd | KeyCode.Enter, () => onRun?.());
  };

  return (
    <div className={`min-h-0 flex-1 overflow-hidden rounded-lg border border-[var(--border-subtle)] ${className}`}>
      <Editor
        height="100%"
        defaultLanguage="sql"
        theme={theme}
        value={value}
        onChange={(v) => onChange(v ?? '')}
        onMount={handleMount}
        options={{
          minimap: { enabled: false },
          fontSize: 13,
          fontFamily: 'JetBrains Mono, Menlo, monospace',
          scrollBeyondLastLine: false,
          wordWrap: 'on',
          padding: { top: 12 },
          automaticLayout: true,
        }}
      />
    </div>
  );
}
