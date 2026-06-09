// 智能对话页面

import { Layout, Typography } from 'antd';
import {
  MessageOutlined,
  CodeOutlined,
  AuditOutlined,
  ToolOutlined,
  BookOutlined,
} from '@ant-design/icons';
import { useChatStore } from '../../stores/useChatStore';
import SearchBar from '../../components/common/SearchBar';
import { groupByTime, truncateText } from '../../utils/format';
import type { SkillType } from '../../types';

const { Sider, Content } = Layout;
const { Text, Title } = Typography;

const QUICK_ENTRIES: { label: string; icon: React.ReactNode; skill: SkillType; prompt: string }[] = [
  { label: '代码生成', icon: <CodeOutlined />, skill: 'code_generation', prompt: '请描述你需要生成的代码功能：' },
  { label: '代码评审', icon: <AuditOutlined />, skill: 'code_review', prompt: '请输入需要评审的代码或 MR 地址：' },
  { label: '故障排查', icon: <ToolOutlined />, skill: 'fault_diagnosis', prompt: '请粘贴异常日志或告警信息：' },
  { label: '知识问答', icon: <BookOutlined />, skill: 'knowledge_qa', prompt: '请输入你的问题：' },
];

const SKILL_OPTIONS: { key: SkillType; label: string }[] = [
  { key: 'auto', label: '自动' },
  { key: 'code_generation', label: '代码生成' },
  { key: 'code_review', label: '代码评审' },
  { key: 'fault_diagnosis', label: '故障排查' },
  { key: 'knowledge_qa', label: '知识问答' },
];

const ChatPage: React.FC = () => {
  const { sessions, currentSessionId, selectedSkill, setSelectedSkill } = useChatStore();

  const groupedSessions = groupByTime(sessions, 'lastActiveAt');

  return (
    <Layout style={{ height: '100%', background: '#fff', borderRadius: 8, overflow: 'hidden' }}>
      {/* 左侧：会话列表 */}
      <Sider
        width={280}
        style={{
          background: '#FAFAFA',
          borderRight: '1px solid #F0F0F0',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* 新建对话按钮 */}
        <div style={{ padding: '12px 16px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              padding: '8px 16px',
              border: '1px dashed #D9D9D9',
              borderRadius: 6,
              cursor: 'pointer',
              color: '#1677FF',
              fontSize: 14,
            }}
          >
            <MessageOutlined /> 新建对话
          </div>
        </div>

        {/* 搜索 */}
        <div style={{ padding: '0 16px 12px' }}>
          <SearchBar placeholder="搜索会话..." />
        </div>

        {/* 会话列表 */}
        <div style={{ flex: 1, overflow: 'auto', padding: '0 8px' }}>
          {groupedSessions.map((group) => (
            <div key={group.label}>
              <Text
                type="secondary"
                style={{ fontSize: 12, padding: '8px 8px 4px', display: 'block' }}
              >
                {group.label}
              </Text>
              {group.items.map((session) => (
                <div
                  key={session.sessionId}
                  className={session.sessionId === currentSessionId ? 'list-item-selected' : ''}
                  style={{
                    padding: '10px 12px',
                    borderRadius: 6,
                    cursor: 'pointer',
                    marginBottom: 2,
                    borderLeft: session.sessionId === currentSessionId ? '3px solid #1677FF' : '3px solid transparent',
                  }}
                >
                  <Text
                    ellipsis
                    style={{ fontSize: 14, display: 'block', fontWeight: session.pinned ? 600 : 400 }}
                  >
                    {session.title || '新对话'}
                  </Text>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {truncateText(session.lastMessageSummary || '', 30)}
                  </Text>
                </div>
              ))}
            </div>
          ))}
        </div>
      </Sider>

      {/* 右侧：对话区域 */}
      <Content style={{ display: 'flex', flexDirection: 'column' }}>
        {/* 消息区域 */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {/* 空状态：欢迎语卡片 */}
          <div style={{ textAlign: 'center', maxWidth: 600 }}>
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: 16,
                background: 'linear-gradient(135deg, #1677FF 0%, #69B1FF 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 24px',
                color: '#fff',
                fontSize: 28,
                fontWeight: 600,
              }}
            >
              AI
            </div>
            <Title level={3} style={{ marginBottom: 8 }}>
              你好！我是研发智能体
            </Title>
            <Text type="secondary" style={{ fontSize: 16, display: 'block', marginBottom: 32 }}>
              可以帮你生成代码、评审代码、排查故障、查询知识
            </Text>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              {QUICK_ENTRIES.map((entry) => (
                <div
                  key={entry.skill}
                  style={{
                    padding: '12px 20px',
                    border: '1px solid #D9D9D9',
                    borderRadius: 8,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#1677FF';
                    e.currentTarget.style.color = '#1677FF';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#D9D9D9';
                    e.currentTarget.style.color = 'inherit';
                  }}
                  onClick={() => setSelectedSkill(entry.skill)}
                >
                  {entry.icon}
                  <span>{entry.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 底部：技能选择 + 输入区域 */}
        <div style={{ borderTop: '1px solid #F0F0F0', padding: '12px 24px' }}>
          {/* 技能选择栏 */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            {SKILL_OPTIONS.map((option) => (
              <div
                key={option.key}
                onClick={() => setSelectedSkill(option.key)}
                style={{
                  padding: '4px 12px',
                  borderRadius: 4,
                  cursor: 'pointer',
                  fontSize: 13,
                  background: selectedSkill === option.key ? '#1677FF' : 'transparent',
                  color: selectedSkill === option.key ? '#fff' : '#000000A0',
                  border: `1px solid ${selectedSkill === option.key ? '#1677FF' : '#D9D9D9'}`,
                  transition: 'all 0.2s',
                }}
              >
                {option.label}
              </div>
            ))}
          </div>

          {/* 输入框 */}
          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
            <textarea
              placeholder="输入消息，Shift+Enter 换行"
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
            <button
              style={{
                height: 40,
                padding: '0 16px',
                background: '#1677FF',
                color: '#fff',
                border: 'none',
                borderRadius: 6,
                cursor: 'pointer',
                fontSize: 14,
                whiteSpace: 'nowrap',
              }}
            >
              发送
            </button>
          </div>
        </div>
      </Content>
    </Layout>
  );
};

export default ChatPage;
