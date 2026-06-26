// GlobalSearchModal — 居中 Modal，Ctrl+K 快捷键

import { useState, useEffect, useCallback, useRef } from 'react';
import { Modal, Input, Tabs, List, Typography, Empty } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useDebounce } from '../../../hooks/useDebounce';

const { Text } = Typography;

interface SearchResult {
  id: string;
  title: string;
  description?: string;
  link: string;
  type: 'skill' | 'knowledge' | 'session';
}

interface GlobalSearchModalProps {
  open: boolean;
  onClose: () => void;
}

const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({ open, onClose }) => {
  const [keyword, setKeyword] = useState('');
  const debouncedKeyword = useDebounce(keyword, 300);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'skill' | 'knowledge' | 'session'>('skill');
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  // 搜索逻辑
  useEffect(() => {
    if (!debouncedKeyword.trim()) {
      setResults([]);
      return;
    }

    // Mock 搜索结果 — 实际项目中调用 service
    const mockResults: SearchResult[] = [
      { id: '1', title: `搜索: ${debouncedKeyword}`, description: '示例结果', link: '/chat', type: activeTab },
    ];
    setResults(mockResults);
    setSelectedIndex(0);
  }, [debouncedKeyword, activeTab]);

  // 键盘导航
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && results[selectedIndex]) {
      navigate(results[selectedIndex].link);
      onClose();
    } else if (e.key === 'Escape') {
      onClose();
    }
  }, [results, selectedIndex, navigate, onClose]);

  // 打开时聚焦输入框
  useEffect(() => {
    if (open) {
      setKeyword('');
      setResults([]);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={640}
      centered
      styles={{ body: { padding: 0 } }}
      title={null}
      destroyOnClose
    >
      <div style={{ padding: '16px 16px 0' }}>
        <Input
          ref={inputRef as never}
          placeholder="搜索技能、知识库文档、历史会话..."
          prefix={<SearchOutlined style={{ color: '#8C8C8C' }} />}
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onKeyDown={handleKeyDown}
          size="large"
          allowClear
        />
      </div>

      <Tabs
        activeKey={activeTab}
        onChange={(key) => setActiveTab(key as 'skill' | 'knowledge' | 'session')}
        style={{ padding: '0 16px' }}
        items={[
          { key: 'skill', label: '技能' },
          { key: 'knowledge', label: '知识库文档' },
          { key: 'session', label: '历史会话' },
        ]}
      />

      <div style={{ maxHeight: 400, overflow: 'auto', padding: '0 16px 16px' }}>
        {results.length === 0 ? (
          <Empty description={debouncedKeyword ? '未找到结果' : '输入关键词开始搜索'} image={Empty.PRESENTED_IMAGE_SIMPLE} />
        ) : (
          <List
            dataSource={results}
            renderItem={(item, idx) => (
              <List.Item
                style={{
                  cursor: 'pointer',
                  padding: '8px 12px',
                  background: idx === selectedIndex ? '#F0F5FF' : 'transparent',
                  borderRadius: 6,
                }}
                onClick={() => {
                  navigate(item.link);
                  onClose();
                }}
              >
                <List.Item.Meta
                  title={<Text style={{ fontWeight: idx === selectedIndex ? 600 : 400 }}>{item.title}</Text>}
                  description={item.description ? <Text type="secondary" style={{ fontSize: 12 }}>{item.description}</Text> : undefined}
                />
              </List.Item>
            )}
          />
        )}
      </div>
    </Modal>
  );
};

export default GlobalSearchModal;
