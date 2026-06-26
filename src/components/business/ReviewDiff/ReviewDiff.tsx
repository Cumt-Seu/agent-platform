// ReviewDiff — 基于 Monaco DiffEditor

import { useRef, useCallback } from 'react';
import { DiffEditor } from '@monaco-editor/react';
import { Popover, Button, Typography, Space } from 'antd';
import type { ReviewIssue, Severity } from '../../../types';
import { SEVERITY_COLORS } from '../../../utils/constants';

const { Text } = Typography;

interface ReviewDiffProps {
  originalCode: string;
  modifiedCode: string;
  language?: string;
  issues: ReviewIssue[];
  onApplyFix?: (issueId: string) => void;
}

const ReviewDiff: React.FC<ReviewDiffProps> = ({
  originalCode,
  modifiedCode,
  language = 'java',
  issues,
  onApplyFix,
}) => {
  const editorRef = useRef<unknown>(null);

  const handleEditorMount = useCallback((editor: unknown) => {
    editorRef.current = editor;
  }, []);

  // TODO: 装饰器 — 问题行 gutter 区域显示严重性颜色条，后续通过 editor.deltaDecorations 应用

  return (
    <div style={{ border: '1px solid #F0F0F0', borderRadius: 8, overflow: 'hidden' }}>
      {/* 问题列表 */}
      {issues.length > 0 && (
        <div style={{ padding: '8px 12px', background: '#FAFAFA', borderBottom: '1px solid #F0F0F0' }}>
          <Text strong style={{ fontSize: 13 }}>问题 ({issues.length})</Text>
        </div>
      )}
      <div style={{ maxHeight: 200, overflow: 'auto', background: '#FAFAFA' }}>
        {issues.map((issue) => (
          <div
            key={issue.issueId}
            style={{
              padding: '6px 12px',
              borderLeft: `3px solid ${SEVERITY_COLORS[issue.severity as Severity]}`,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '1px solid #F0F0F0',
            }}
          >
            <div>
              <Space size={4}>
                <Text style={{ fontSize: 12, color: SEVERITY_COLORS[issue.severity as Severity] }}>
                  {issue.severity}
                </Text>
                <Text style={{ fontSize: 12 }}>L{issue.startLine}-{issue.endLine}</Text>
              </Space>
              <div>
                <Text type="secondary" style={{ fontSize: 12 }}>{issue.description}</Text>
              </div>
            </div>
            {issue.fixedCode && onApplyFix && (
              <Popover
                content={
                  <div style={{ maxWidth: 400 }}>
                    <Text style={{ fontSize: 12 }}>{issue.suggestion}</Text>
                    <pre style={{ fontSize: 11, background: '#F5F5F5', padding: 8, borderRadius: 4, marginTop: 8, overflow: 'auto' }}>
                      {issue.fixedCode}
                    </pre>
                  </div>
                }
                title="修复建议"
                trigger="hover"
              >
                <Button
                  type="link"
                  size="small"
                  onClick={() => onApplyFix(issue.issueId)}
                >
                  应用修复
                </Button>
              </Popover>
            )}
          </div>
        ))}
      </div>

      {/* Diff Editor */}
      <DiffEditor
        original={originalCode}
        modified={modifiedCode}
        language={language}
        onMount={handleEditorMount}
        theme="vs"
        options={{
          readOnly: true,
          renderSideBySide: true,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          fontSize: 13,
          lineNumbers: 'on',
        }}
        height={500}
      />
    </div>
  );
};

export default ReviewDiff;
