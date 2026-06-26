// CodeBlockCard — Monaco Editor 只读，>50行可折叠

import { useState } from 'react';
import { Button, Typography } from 'antd';
import Editor from '@monaco-editor/react';
import { CODE_FOLD_THRESHOLD, CODE_PREVIEW_LINES } from '../../../utils/constants';

const { Text } = Typography;

interface CodeBlockCardProps {
  language: string;
  code: string;
  filePath?: string;
}

const CodeBlockCard: React.FC<CodeBlockCardProps> = ({ language, code, filePath }) => {
  const [expanded, setExpanded] = useState(false);
  const lines = code.split('\n');
  const shouldFold = lines.length > CODE_FOLD_THRESHOLD;
  const displayCode = shouldFold && !expanded
    ? lines.slice(0, CODE_PREVIEW_LINES).join('\n') + '\n...'
    : code;

  return (
    <div
      style={{
        border: '1px solid #F0F0F0',
        borderRadius: 8,
        overflow: 'hidden',
        marginBottom: 8,
      }}
    >
      {filePath && (
        <div
          style={{
            background: '#FAFAFA',
            padding: '4px 12px',
            borderBottom: '1px solid #F0F0F0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Text type="secondary" style={{ fontSize: 12 }}>{filePath}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>{language}</Text>
        </div>
      )}
      <div style={{ height: shouldFold && !expanded ? 200 : Math.max(100, Math.min(lines.length * 20, 500)) }}>
        <Editor
          value={displayCode}
          language={language}
          theme="vs"
          options={{
            readOnly: true,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            lineNumbers: 'on',
            fontSize: 13,
            wordWrap: 'on',
            domReadOnly: true,
            renderLineHighlight: 'none',
            overviewRulerBorder: false,
            hideCursorInOverviewRuler: true,
            scrollbar: { vertical: 'auto', horizontal: 'auto' },
          }}
        />
      </div>
      {shouldFold && (
        <div style={{ textAlign: 'center', padding: '4px 0', borderTop: '1px solid #F0F0F0' }}>
          <Button type="link" size="small" onClick={() => setExpanded(!expanded)}>
            {expanded ? '收起' : `展开全部 (${lines.length} 行)`}
          </Button>
        </div>
      )}
    </div>
  );
};

export default CodeBlockCard;
