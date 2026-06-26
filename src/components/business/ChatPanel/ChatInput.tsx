// ChatInput — 多行输入，Shift+Enter换行，Enter发送，附件按钮

import { useState, useRef } from 'react';
import { Button, Upload } from 'antd';
import { SendOutlined, PaperClipOutlined } from '@ant-design/icons';

interface ChatInputProps {
  onSend: (message: string, attachments?: File[]) => void;
  disabled?: boolean;
  placeholder?: string;
}

const ChatInput: React.FC<ChatInputProps> = ({
  onSend,
  disabled = false,
  placeholder = '输入消息，Shift+Enter 换行',
}) => {
  const [value, setValue] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    const trimmed = value.trim();
    if (!trimmed && attachments.length === 0) return;
    onSend(trimmed, attachments);
    setValue('');
    setAttachments([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div>
      {/* 附件预览 */}
      {attachments.length > 0 && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
          {attachments.map((file, idx) => (
            <div
              key={idx}
              style={{
                padding: '2px 8px',
                background: '#F0F0F0',
                borderRadius: 4,
                fontSize: 12,
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <span>{file.name}</span>
              <span
                style={{ cursor: 'pointer', color: '#FF4D4F' }}
                onClick={() => setAttachments((prev) => prev.filter((_, i) => i !== idx))}
              >
                ×
              </span>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
        <Upload
          beforeUpload={(file) => {
            setAttachments((prev) => [...prev, file]);
            return false;
          }}
          showUploadList={false}
          multiple
        >
          <Button
            type="text"
            icon={<PaperClipOutlined />}
            disabled={disabled}
            style={{ height: 40 }}
          />
        </Upload>

        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          style={{
            flex: 1,
            minHeight: 40,
            maxHeight: 200,
            padding: '8px 12px',
            borderRadius: 6,
            border: '1px solid #D9D9D9',
            outline: 'none',
            resize: 'none',
            fontSize: 14,
            lineHeight: '22px',
            fontFamily: 'inherit',
          }}
          rows={1}
        />

        <Button
          type="primary"
          icon={<SendOutlined />}
          onClick={handleSend}
          disabled={disabled || (!value.trim() && attachments.length === 0)}
          style={{ height: 40, width: 40 }}
        />
      </div>
    </div>
  );
};

export default ChatInput;
