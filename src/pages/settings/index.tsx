// 系统设置页面 — 5个Tab完整实现

import { Tabs, Table, Button, Typography, Space, Modal, Form, Input, InputNumber, Select, Slider, Switch, Card, Tag, message } from 'antd';
import { PlusOutlined, ApiOutlined, KeyOutlined } from '@ant-design/icons';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Editor from '@monaco-editor/react';
import StatusTag from '../../components/common/StatusTag';
import { settingsService } from '../../services/settingsService';
import type { ModelConfig, CodeTemplate, McpTool } from '../../types';

const { Title, Text } = Typography;

const SettingsPage: React.FC = () => {
  const [modelModalOpen, setModelModalOpen] = useState(false);
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [templateEditorOpen, setTemplateEditorOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<CodeTemplate | null>(null);
  const [mcpTestModalOpen, setMcpTestModalOpen] = useState(false);
  const [testingTool, setTestingTool] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const [modelForm] = Form.useForm();
  const [userForm] = Form.useForm();

  // Queries
  const { data: models = [] } = useQuery({ queryKey: ['models'], queryFn: () => settingsService.getModels() });
  const { data: users = [] } = useQuery({ queryKey: ['users'], queryFn: () => settingsService.getUsers() });
  const { data: templates = [] } = useQuery({ queryKey: ['templates'], queryFn: () => settingsService.getTemplates() });
  const { data: mcpTools = [] } = useQuery({ queryKey: ['mcpTools'], queryFn: () => settingsService.getMcpTools() });
  const { data: notifyRules = [] } = useQuery({ queryKey: ['notifyRules'], queryFn: () => settingsService.getNotificationRules() });
  const { data: notifyChannels = [] } = useQuery({ queryKey: ['notifyChannels'], queryFn: () => settingsService.getNotificationChannels() });

  // Mutations
  const createModelMutation = useMutation({
    mutationFn: (params: Parameters<typeof settingsService.createModel>[0]) => settingsService.createModel(params),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['models'] }); message.success('模型已添加'); setModelModalOpen(false); modelForm.resetFields(); },
  });

  const createUserMutation = useMutation({
    mutationFn: (params: Parameters<typeof settingsService.createUser>[0]) => settingsService.createUser(params),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['users'] }); message.success('用户已添加'); setUserModalOpen(false); userForm.resetFields(); },
  });

  const testModelMutation = useMutation({
    mutationFn: (modelId: string) => settingsService.testModelConnection(modelId),
    onSuccess: (data) => message.success(data.success ? '连接成功' : `连接失败: ${data.message}`),
  });

  const deleteModelMutation = useMutation({
    mutationFn: (modelId: string) => settingsService.deleteModel(modelId),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['models'] }); message.success('已删除'); },
  });

  const CHANNEL_TAGS: Record<string, string> = { '邮件': 'blue', '企业微信': 'green', '钉钉': 'orange', '飞书': 'purple' };

  return (
    <div>
      <Title level={4} style={{ marginBottom: 24 }}>系统设置</Title>

      <Tabs
        defaultActiveKey="models"
        items={[
          {
            key: 'models',
            label: '模型配置',
            children: (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                  <Space>
                    <Text>默认模型:</Text>
                    <Select defaultValue="m-001" style={{ width: 200 }} options={models.map((m) => ({ value: m.modelId, label: m.name }))} />
                  </Space>
                  <Button type="primary" icon={<PlusOutlined />} onClick={() => setModelModalOpen(true)}>添加模型</Button>
                </div>
                <Table
                  columns={[
                    { title: 'ID', dataIndex: 'modelId', key: 'modelId' },
                    { title: '模型名称', dataIndex: 'name', key: 'name' },
                    { title: '部署方式', dataIndex: 'deployType', key: 'deployType', render: (v: string) => v === 'private' ? '私有部署' : 'API 调用' },
                    { title: 'API 地址', dataIndex: 'apiAddress', key: 'apiAddress', ellipsis: true },
                    { title: '状态', dataIndex: 'status', key: 'status', render: (s: string) => <StatusTag status={s === '正常' ? 'ACTIVE' : 'ERROR'} /> },
                    {
                      title: '操作', key: 'action',
                      render: (_: unknown, record: ModelConfig) => (
                        <Space>
                          <Button type="link" size="small">编辑</Button>
                          <Button type="link" size="small" icon={<ApiOutlined />} onClick={() => testModelMutation.mutate(record.modelId)} loading={testModelMutation.isPending}>测试连接</Button>
                          <Button type="link" size="small" danger onClick={() => deleteModelMutation.mutate(record.modelId)}>删除</Button>
                        </Space>
                      ),
                    },
                  ]}
                  dataSource={models}
                  rowKey="modelId"
                  pagination={false}
                />
              </div>
            ),
          },
          {
            key: 'users',
            label: '用户管理',
            children: (
              <div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
                  <Button type="primary" icon={<PlusOutlined />} onClick={() => setUserModalOpen(true)}>添加用户</Button>
                </div>
                <Table
                  columns={[
                    { title: '用户名', dataIndex: 'username', key: 'username' },
                    { title: '姓名', dataIndex: 'realName', key: 'realName' },
                    { title: '角色', dataIndex: 'role', key: 'role', render: (v: string) => <Tag>{v}</Tag> },
                    { title: '部门', dataIndex: 'department', key: 'department' },
                    { title: '状态', dataIndex: 'status', key: 'status', render: (s: string) => <StatusTag status={s === '启用' ? 'ACTIVE' : 'DISABLED'} /> },
                    {
                      title: '操作', key: 'action',
                      render: () => <Space><Button type="link" size="small">编辑</Button><Button type="link" size="small" icon={<KeyOutlined />}>重置密码</Button><Button type="link" size="small">禁用</Button></Space>,
                    },
                  ]}
                  dataSource={users}
                  rowKey="userId"
                  pagination={false}
                />
              </div>
            ),
          },
          {
            key: 'templates',
            label: '代码模板',
            children: (
              <div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
                  <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditingTemplate(null); setTemplateEditorOpen(true); }}>新建模板</Button>
                </div>
                <Table
                  columns={[
                    { title: 'ID', dataIndex: 'templateId', key: 'templateId' },
                    { title: '模板名称', dataIndex: 'name', key: 'name' },
                    { title: '分类', dataIndex: 'category', key: 'category', render: (v: string) => <Tag color="blue">{v}</Tag> },
                    { title: '语言', dataIndex: 'language', key: 'language' },
                    { title: '框架', dataIndex: 'framework', key: 'framework' },
                    {
                      title: '操作', key: 'action',
                      render: (_: unknown, record: CodeTemplate) => (
                        <Space>
                          <Button type="link" size="small" onClick={() => { setEditingTemplate(record); setTemplateEditorOpen(true); }}>编辑</Button>
                          <Button type="link" size="small">复制</Button>
                          <Button type="link" size="small" danger>删除</Button>
                        </Space>
                      ),
                    },
                  ]}
                  dataSource={templates}
                  rowKey="templateId"
                  pagination={false}
                />
              </div>
            ),
          },
          {
            key: 'mcp',
            label: 'MCP 工具',
            children: (
              <Table
                columns={[
                  { title: '工具名称', dataIndex: 'toolName', key: 'toolName' },
                  { title: '描述', dataIndex: 'description', key: 'description' },
                  { title: '所属 Server', dataIndex: 'serverName', key: 'serverName' },
                  { title: '状态', dataIndex: 'status', key: 'status', render: (s: string) => <StatusTag status={s === '在线' ? 'ACTIVE' : 'ERROR'} /> },
                  {
                    title: '操作', key: 'action',
                    render: (_: unknown, record: McpTool) => (
                      <Space>
                        <Button type="link" size="small">查看 Schema</Button>
                        <Button type="link" size="small" onClick={() => { setTestingTool(record.toolName); setMcpTestModalOpen(true); }}>测试</Button>
                      </Space>
                    ),
                  },
                ]}
                dataSource={mcpTools}
                rowKey="toolName"
                pagination={false}
              />
            ),
          },
          {
            key: 'notifications',
            label: '通知设置',
            children: (
              <div>
                <Card title="通知渠道配置" style={{ marginBottom: 16, borderRadius: 8 }}>
                  <Space direction="vertical" style={{ width: '100%' }} size={12}>
                    {(notifyChannels.length > 0 ? notifyChannels : [
                      { channel: '邮件', configured: true },
                      { channel: '企业微信', configured: true },
                      { channel: '钉钉', configured: false },
                      { channel: '飞书', configured: false },
                    ]).map((ch) => (
                      <div key={ch.channel} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Space>
                          <Tag color={CHANNEL_TAGS[ch.channel] || 'blue'}>{ch.channel}</Tag>
                          <Text type="secondary" style={{ fontSize: 12 }}>{ch.configured ? '已配置' : '未配置'}</Text>
                        </Space>
                        <Button type="link" size="small">{ch.configured ? '重新配置' : '配置'}</Button>
                      </div>
                    ))}
                  </Space>
                </Card>
                <Card title="通知规则" style={{ borderRadius: 8 }}>
                  <Table
                    columns={[
                      { title: '事件类型', dataIndex: 'eventType', key: 'eventType' },
                      { title: '通知渠道', dataIndex: 'channels', key: 'channels', render: (v: string[]) => v.map((c) => <Tag key={c} color={CHANNEL_TAGS[c]}>{c}</Tag>) },
                      { title: '接收人', dataIndex: 'receivers', key: 'receivers', render: (v: string[]) => v.join(', ') },
                      { title: '启用状态', dataIndex: 'enabled', key: 'enabled', render: (v: boolean) => <Switch checked={v} size="small" /> },
                      { title: '操作', key: 'action', render: () => <Space><Button type="link" size="small">编辑</Button><Button type="link" size="small" danger>删除</Button></Space> },
                    ]}
                    dataSource={notifyRules}
                    rowKey="id"
                    pagination={false}
                  />
                </Card>
              </div>
            ),
          },
        ]}
      />

      {/* 添加模型弹窗 */}
      <Modal title="添加模型" open={modelModalOpen} onCancel={() => setModelModalOpen(false)} width={600} onOk={() => modelForm.submit()}>
        <Form form={modelForm} layout="vertical" style={{ marginTop: 16 }} onFinish={(values) => createModelMutation.mutate(values)}>
          <Form.Item label="模型名称" name="name" rules={[{ required: true }]}><Input placeholder="模型显示名称" /></Form.Item>
          <Form.Item label="部署方式" name="deployType" rules={[{ required: true }]}>
            <Select options={[{ value: 'private', label: '私有部署' }, { value: 'api', label: 'API 调用' }]} />
          </Form.Item>
          <Form.Item label="API 地址" name="apiAddress" rules={[{ required: true }]}><Input placeholder="模型服务端点地址" /></Form.Item>
          <Form.Item label="API Key" name="apiKey"><Input.Password placeholder="API 密钥" /></Form.Item>
          <Form.Item label="最大上下文长度" name="maxContextLength" rules={[{ required: true }]} initialValue={32768}>
            <InputNumber min={1024} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label="默认温度" name="defaultTemperature" initialValue={0.7}>
            <Slider min={0} max={2} step={0.1} marks={{ 0: '0', 1: '1', 2: '2' }} />
          </Form.Item>
        </Form>
      </Modal>

      {/* 添加用户弹窗 */}
      <Modal title="添加用户" open={userModalOpen} onCancel={() => setUserModalOpen(false)} width={600} onOk={() => userForm.submit()}>
        <Form form={userForm} layout="vertical" style={{ marginTop: 16 }} onFinish={(values) => createUserMutation.mutate(values)}>
          <Form.Item label="用户名" name="username" rules={[{ required: true }]}><Input placeholder="登录名" /></Form.Item>
          <Form.Item label="姓名" name="realName" rules={[{ required: true }]}><Input placeholder="真实姓名" /></Form.Item>
          <Form.Item label="邮箱" name="email"><Input placeholder="邮箱地址" /></Form.Item>
          <Form.Item label="角色" name="role" rules={[{ required: true }]}>
            <Select options={[
              { value: '开发', label: '开发' }, { value: '测试', label: '测试' },
              { value: '架构师', label: '架构师' }, { value: '运维', label: '运维' },
              { value: '管理者', label: '管理者' }, { value: '管理员', label: '管理员' },
            ]} />
          </Form.Item>
          <Form.Item label="初始密码" name="password" rules={[{ required: true }]}><Input.Password placeholder="初始密码" /></Form.Item>
        </Form>
      </Modal>

      {/* 代码模板编辑弹窗 — Monaco Editor */}
      <Modal
        title={editingTemplate ? `编辑模板: ${editingTemplate.name}` : '新建模板'}
        open={templateEditorOpen}
        onCancel={() => setTemplateEditorOpen(false)}
        width={800}
        footer={null}
      >
        <Form layout="vertical" style={{ marginTop: 16 }}>
          <Space size={16} style={{ marginBottom: 16 }}>
            <Form.Item label="模板名称" initialValue={editingTemplate?.name}><Input style={{ width: 200 }} /></Form.Item>
            <Form.Item label="分类" initialValue={editingTemplate?.category}>
              <Select style={{ width: 140 }} options={[
                { value: 'CONTROLLER', label: 'CONTROLLER' }, { value: 'SERVICE', label: 'SERVICE' },
                { value: 'DAO', label: 'DAO' }, { value: 'MAPPER', label: 'MAPPER' }, { value: 'DTO', label: 'DTO' },
              ]} />
            </Form.Item>
            <Form.Item label="语言" initialValue={editingTemplate?.language}>
              <Select style={{ width: 120 }} options={[
                { value: 'Java', label: 'Java' }, { value: 'Python', label: 'Python' },
                { value: 'XML', label: 'XML' }, { value: 'SQL', label: 'SQL' },
              ]} />
            </Form.Item>
          </Space>
          <Form.Item label="模板内容">
            <div style={{ border: '1px solid #F0F0F0', borderRadius: 6 }}>
              <Editor
                value={editingTemplate?.content || ''}
                language="java"
                theme="vs"
                height={400}
                options={{
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  fontSize: 13,
                  wordWrap: 'on',
                }}
              />
            </div>
          </Form.Item>
          <Form.Item label="变量定义">
            <Text type="secondary" style={{ fontSize: 12 }}>使用 {'{{variableName}}'} 语法定义模板变量</Text>
          </Form.Item>
        </Form>
      </Modal>

      {/* MCP 工具测试弹窗 */}
      <Modal
        title={`测试工具: ${testingTool}`}
        open={mcpTestModalOpen}
        onCancel={() => setMcpTestModalOpen(false)}
        onOk={() => setMcpTestModalOpen(false)}
        width={600}
      >
        <Form layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item label="调用参数 (JSON)">
            <Input.TextArea rows={6} defaultValue="{}" style={{ fontFamily: 'monospace' }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default SettingsPage;
