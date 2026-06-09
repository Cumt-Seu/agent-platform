// 技能管理页面

import { Row, Col, Card, Tag, Button, Typography, Space, Input, Select, Modal, Form, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useState } from 'react';
import StatusTag from '../../components/common/StatusTag';
import SearchBar from '../../components/common/SearchBar';
import { SKILL_CATEGORY_COLORS } from '../../utils/constants';
import { formatDuration, formatPercent } from '../../utils/format';
import type { SkillCategory, SkillDefinition, SkillStats } from '../../types';

const { Title, Text } = Typography;

// Mock 数据
const mockSkills: (SkillDefinition & SkillStats)[] = [
  {
    skillId: 'code_generation',
    name: '代码生成',
    version: '1.2.0',
    category: 'CODE_GEN',
    status: 'ACTIVE',
    description: '根据自然语言描述生成高质量代码，支持 Java、Python 等多种语言',
    endpoint: 'http://skill-server:8080/code-gen',
    executionMode: 'ASYNC',
    authType: 'api_key',
    inputSchema: {},
    outputSchema: {},
    createdAt: Date.now() - 86400000 * 30,
    createdBy: 'admin',
    todayCalls: 156,
    avgDuration: 2300,
    successRate: 0.987,
  },
  {
    skillId: 'code_review',
    name: '代码评审',
    version: '1.1.0',
    category: 'CODE_REVIEW',
    status: 'ACTIVE',
    description: '自动评审代码变更，检测编码规范、安全漏洞、性能隐患等问题',
    endpoint: 'http://skill-server:8080/code-review',
    executionMode: 'ASYNC',
    authType: 'api_key',
    inputSchema: {},
    outputSchema: {},
    createdAt: Date.now() - 86400000 * 25,
    createdBy: 'admin',
    todayCalls: 89,
    avgDuration: 5600,
    successRate: 0.955,
  },
  {
    skillId: 'fault_diagnosis',
    name: '故障排障',
    version: '1.0.0',
    category: 'FAULT_DIAG',
    status: 'ACTIVE',
    description: '分析异常日志和监控指标，定位故障根因并推荐处置方案',
    endpoint: 'http://skill-server:8080/fault-diag',
    executionMode: 'ASYNC',
    authType: 'api_key',
    inputSchema: {},
    outputSchema: {},
    createdAt: Date.now() - 86400000 * 20,
    createdBy: 'admin',
    todayCalls: 34,
    avgDuration: 8200,
    successRate: 0.912,
  },
  {
    skillId: 'knowledge_qa',
    name: '知识问答',
    version: '1.3.0',
    category: 'KNOWLEDGE_QA',
    status: 'ACTIVE',
    description: '基于企业知识库进行智能问答，支持规范查询、架构文档检索',
    endpoint: 'http://skill-server:8080/knowledge-qa',
    executionMode: 'SYNC',
    authType: 'none',
    inputSchema: {},
    outputSchema: {},
    createdAt: Date.now() - 86400000 * 15,
    createdBy: 'admin',
    todayCalls: 210,
    avgDuration: 1200,
    successRate: 0.965,
  },
];

const SkillPage: React.FC = () => {
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<SkillCategory | undefined>();

  const filteredSkills = mockSkills.filter((skill) => {
    const matchKeyword = !searchKeyword || skill.name.includes(searchKeyword) || skill.description.includes(searchKeyword);
    const matchCategory = !categoryFilter || skill.category === categoryFilter;
    return matchKeyword && matchCategory;
  });

  return (
    <div>
      {/* 页面标题和操作 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={4} style={{ margin: 0 }}>技能管理</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setRegisterModalOpen(true)}>
          注册新技能
        </Button>
      </div>

      {/* 筛选栏 */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
        <SearchBar
          placeholder="搜索技能名称或描述"
          value={searchKeyword}
          onChange={setSearchKeyword}
          style={{ width: 300 }}
        />
        <Select
          placeholder="技能分类"
          allowClear
          style={{ width: 160 }}
          value={categoryFilter}
          onChange={setCategoryFilter}
          options={[
            { value: 'CODE_GEN', label: '代码生成' },
            { value: 'CODE_REVIEW', label: '代码评审' },
            { value: 'FAULT_DIAG', label: '故障排障' },
            { value: 'KNOWLEDGE_QA', label: '知识问答' },
          ]}
        />
      </div>

      {/* 技能卡片列表 */}
      <Row gutter={[16, 16]}>
        {filteredSkills.map((skill) => (
          <Col key={skill.skillId} xs={24} sm={12} lg={8} xl={6}>
            <Card
              hoverable
              style={{ height: '100%' }}
              styles={{ body: { display: 'flex', flexDirection: 'column', height: '100%' } }}
            >
              {/* 顶部：图标 + 名称 + 版本 + 分类 + 状态 */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 8,
                    background: SKILL_CATEGORY_COLORS[skill.category],
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontSize: 16,
                    fontWeight: 600,
                  }}
                >
                  {skill.name[0]}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Text strong style={{ fontSize: 16 }}>{skill.name}</Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>v{skill.version}</Text>
                  </div>
                </div>
                <StatusTag status={skill.status} />
              </div>

              <Tag
                color={SKILL_CATEGORY_COLORS[skill.category]}
                style={{ marginBottom: 8, alignSelf: 'flex-start' }}
              >
                {skill.category === 'CODE_GEN' ? '代码生成' :
                 skill.category === 'CODE_REVIEW' ? '代码评审' :
                 skill.category === 'FAULT_DIAG' ? '故障排障' : '知识问答'}
              </Tag>

              {/* 描述 */}
              <Text
                type="secondary"
                style={{ marginBottom: 12, flex: 1, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
              >
                {skill.description}
              </Text>

              {/* 运行指标 */}
              <div style={{ borderTop: '1px solid #F0F0F0', paddingTop: 12, marginTop: 'auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <Text type="secondary" style={{ fontSize: 12 }}>今日调用: {skill.todayCalls}次</Text>
                  <Text type="secondary" style={{ fontSize: 12 }}>平均耗时: {formatDuration(skill.avgDuration)}</Text>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text type="secondary" style={{ fontSize: 12 }}>成功率: {formatPercent(skill.successRate)}</Text>
                  <Space size={4}>
                    <Button type="link" size="small">详情</Button>
                    <Button type="link" size="small">编辑</Button>
                    <Button type="link" size="small">调用</Button>
                  </Space>
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* 注册新技能弹窗 */}
      <Modal
        title="注册新技能"
        open={registerModalOpen}
        onCancel={() => setRegisterModalOpen(false)}
        width={720}
        onOk={() => {
          message.success('注册成功');
          setRegisterModalOpen(false);
        }}
      >
        <Form layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item label="技能名称" required>
            <Input placeholder="请输入技能名称" />
          </Form.Item>
          <Form.Item label="技能ID" required>
            <Input placeholder="英文+下划线+数字，注册后不可修改" />
          </Form.Item>
          <Form.Item label="分类" required>
            <Select
              placeholder="选择技能分类"
              options={[
                { value: 'CODE_GEN', label: '代码生成' },
                { value: 'CODE_REVIEW', label: '代码评审' },
                { value: 'FAULT_DIAG', label: '故障排障' },
                { value: 'KNOWLEDGE_QA', label: '知识问答' },
              ]}
            />
          </Form.Item>
          <Form.Item label="版本" required>
            <Input placeholder="如 1.0.0" />
          </Form.Item>
          <Form.Item label="描述" required>
            <Input.TextArea rows={3} placeholder="供大模型理解的技能描述" />
          </Form.Item>
          <Form.Item label="调用地址" required>
            <Input placeholder="Skill 服务端点地址" />
          </Form.Item>
          <Form.Item label="调用模式" required>
            <Select
              options={[
                { value: 'SYNC', label: '同步' },
                { value: 'ASYNC', label: '异步' },
              ]}
            />
          </Form.Item>
          <Form.Item label="认证方式">
            <Select
              allowClear
              options={[
                { value: 'none', label: '无' },
                { value: 'api_key', label: 'API Key' },
                { value: 'oauth2', label: 'OAuth2' },
                { value: 'custom', label: '自定义' },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default SkillPage;
