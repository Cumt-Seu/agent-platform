// 技能管理页面 — 使用 skillService + useQuery

import { Row, Col, Card, Tag, Button, Typography, Space, Input, Select, Modal, Form, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import StatusTag from '../../components/common/StatusTag';
import SearchBar from '../../components/common/SearchBar';
import { SKILL_CATEGORY_COLORS } from '../../utils/constants';
import { formatDuration, formatPercent } from '../../utils/format';
import { skillService } from '../../services/skillService';
import type { SkillCategory, SkillStats } from '../../types';

const { Title, Text } = Typography;

const SkillPage: React.FC = () => {
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<SkillCategory | undefined>();
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  const { data: skills = [] } = useQuery({
    queryKey: ['skills'],
    queryFn: () => skillService.getSkills(),
  });

  const { data: skillStats } = useQuery({
    queryKey: ['skillStats'],
    queryFn: async () => {
      const statsMap: Record<string, SkillStats> = {};
      for (const skill of skills) {
        try {
          statsMap[skill.skillId] = await skillService.getStats(skill.skillId);
        } catch {
          statsMap[skill.skillId] = { todayCalls: 0, avgDuration: 0, successRate: 0 };
        }
      }
      return statsMap;
    },
    enabled: skills.length > 0,
  });

  const createMutation = useMutation({
    mutationFn: (params: Parameters<typeof skillService.createSkill>[0]) => skillService.createSkill(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['skills'] });
      message.success('注册成功');
      setRegisterModalOpen(false);
      form.resetFields();
    },
  });

  const filteredSkills = skills.filter((skill) => {
    const matchKeyword = !searchKeyword || skill.name.includes(searchKeyword) || skill.description.includes(searchKeyword);
    const matchCategory = !categoryFilter || skill.category === categoryFilter;
    return matchKeyword && matchCategory;
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={4} style={{ margin: 0 }}>技能管理</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setRegisterModalOpen(true)}>
          注册新技能
        </Button>
      </div>

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

      <Row gutter={[16, 16]}>
        {filteredSkills.map((skill) => {
          const stats = skillStats?.[skill.skillId];
          return (
            <Col key={skill.skillId} xs={24} sm={12} lg={8} xl={6}>
              <Card
                hoverable
                style={{ height: '100%' }}
                styles={{ body: { display: 'flex', flexDirection: 'column', height: '100%' } }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <div
                    style={{
                      width: 36, height: 36, borderRadius: 8,
                      background: SKILL_CATEGORY_COLORS[skill.category],
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#fff', fontSize: 16, fontWeight: 600,
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

                <Tag color={SKILL_CATEGORY_COLORS[skill.category]} style={{ marginBottom: 8, alignSelf: 'flex-start' }}>
                  {skill.category === 'CODE_GEN' ? '代码生成' :
                   skill.category === 'CODE_REVIEW' ? '代码评审' :
                   skill.category === 'FAULT_DIAG' ? '故障排障' : '知识问答'}
                </Tag>

                <Text
                  type="secondary"
                  style={{ marginBottom: 12, flex: 1, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
                >
                  {skill.description}
                </Text>

                <div style={{ borderTop: '1px solid #F0F0F0', paddingTop: 12, marginTop: 'auto' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <Text type="secondary" style={{ fontSize: 12 }}>今日调用: {stats?.todayCalls ?? '-'}次</Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>平均耗时: {stats ? formatDuration(stats.avgDuration) : '-'}</Text>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text type="secondary" style={{ fontSize: 12 }}>成功率: {stats ? formatPercent(stats.successRate) : '-'}</Text>
                    <Space size={4}>
                      <Button type="link" size="small">详情</Button>
                      <Button type="link" size="small">编辑</Button>
                      <Button type="link" size="small">调用</Button>
                    </Space>
                  </div>
                </div>
              </Card>
            </Col>
          );
        })}
      </Row>

      <Modal
        title="注册新技能"
        open={registerModalOpen}
        onCancel={() => setRegisterModalOpen(false)}
        width={720}
        onOk={() => form.submit()}
      >
        <Form
          form={form}
          layout="vertical"
          style={{ marginTop: 16 }}
          onFinish={(values) => createMutation.mutate(values)}
        >
          <Form.Item label="技能名称" name="name" rules={[{ required: true }]}>
            <Input placeholder="请输入技能名称" />
          </Form.Item>
          <Form.Item label="技能ID" name="skillId" rules={[{ required: true }]}>
            <Input placeholder="英文+下划线+数字，注册后不可修改" />
          </Form.Item>
          <Form.Item label="分类" name="category" rules={[{ required: true }]}>
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
          <Form.Item label="版本" name="version" rules={[{ required: true }]}>
            <Input placeholder="如 1.0.0" />
          </Form.Item>
          <Form.Item label="描述" name="description" rules={[{ required: true }]}>
            <Input.TextArea rows={3} placeholder="供大模型理解的技能描述" />
          </Form.Item>
          <Form.Item label="调用地址" name="endpoint" rules={[{ required: true }]}>
            <Input placeholder="Skill 服务端点地址" />
          </Form.Item>
          <Form.Item label="调用模式" name="executionMode" rules={[{ required: true }]}>
            <Select options={[{ value: 'SYNC', label: '同步' }, { value: 'ASYNC', label: '异步' }]} />
          </Form.Item>
          <Form.Item label="认证方式" name="authType">
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
