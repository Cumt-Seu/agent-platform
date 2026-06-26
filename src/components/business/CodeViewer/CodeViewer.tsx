// CodeViewer — Monaco Editor 只读模式封装

import Editor from '@monaco-editor/react';

interface CodeViewerProps {
  value: string;
  language?: string;
  fileName?: string;
  highlightLines?: number[];
  height?: number;
}

const CodeViewer: React.FC<CodeViewerProps> = ({
  value,
  language = 'plaintext',
  fileName,
  highlightLines,
  height = 400,
}) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleEditorMount = (editor: any) => {
    if (highlightLines && highlightLines.length > 0) {
      editor.deltaDecorations([], highlightLines.map((line) => ({
        range: {
          startLineNumber: line,
          startColumn: 1,
          endLineNumber: line,
          endColumn: 1,
        },
        options: {
          isWholeLine: true,
          className: 'highlighted-line',
          backgroundColor: '#FFF3CD',
        },
      })));
    }
  };

  return (
    <div style={{ border: '1px solid #F0F0F0', borderRadius: 8, overflow: 'hidden' }}>
      {fileName && (
        <div
          style={{
            background: '#FAFAFA',
            padding: '4px 12px',
            borderBottom: '1px solid #F0F0F0',
            fontSize: 12,
            color: '#8C8C8C',
          }}
        >
          {fileName}
        </div>
      )}
      <Editor
        value={value}
        language={language}
        theme="vs"
        onMount={handleEditorMount}
        options={{
          readOnly: true,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          lineNumbers: 'on',
          fontSize: 13,
          wordWrap: 'on',
          domReadOnly: true,
          renderLineHighlight: 'none',
        }}
        height={height}
      />
    </div>
  );
};

export default CodeViewer;
