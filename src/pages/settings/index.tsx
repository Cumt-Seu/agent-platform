// 系统设置页面

import { Tabs, Table, Button, Typography, Space, Modal, Form, Input, InputNumber, Select, Slider, Switch, Card, Tag } from 'antd';
import { PlusOutlined, ApiOutlined, KeyOutlined } from '@ant-design/icons';
import { useState } from 'react';
import StatusTag from '../../components/common/StatusTag';
import type { ModelConfig, User, CodeTemplate, McpTool, NotifyConfig } from '../../types';

const { Title, Text } = Typography;

// Mock 数据
const mockModels: ModelConfig[] = [
  { modelId: 'm-001', name: 'Qwen2.5-72B', deployType: 'private', apiAddress: 'http://llm-server:8000/v1', maxContextLength: 32768, defaultTemperature: 0.7, status: '正常', isDefault: true },
  { modelId: 'm-002', name: 'Qwen2.5-14B', deployType: 'private', apiAddress: 'http://llm-server:8001/v1', maxContextLength: 16384, defaultTemperature: 0.7, status: '正常', isDefault: false },
  { modelId: 'm-003', name: 'GPT-4o', deployType: 'api', apiAddress: 'https://api.openai.com/v1', maxContextLength: 128000, defaultTemperature: 0.5, status: '正常', isDefault: false },
];

const mockUsers: User[] = [
  { userId: 'u-001', username: 'zhangsan', realName: '张三', email: 'zhangsan@company.com', role: '开发', department: '技术部/后端组', status: '启用', lastLoginAt: Date.now() - 3600000 },
  { userId: 'u-002', username: 'lisi', realName: '李四', email: 'lisi@company.com', role: '架构师', department: '技术部/架构组', status: '启用', lastLoginAt: Date.now() - 86400000 },
  { userId: 'u-003', username: 'wangwu', realName: '王五', email: 'wangwu@company.com', role: '运维', department: '运维部', status: '禁用' },
];

const mockTemplates: CodeTemplate[] = [
  { templateId: 't-001', name: 'SpringBoot Controller', category: 'CONTROLLER', language: 'Java', framework: 'SpringBoot', content: '', variables: [], createdAt: Date.now() - 86400000 * 30 },
  { templateId: 't-002', name: 'MyBatis Mapper', category: 'MAPPER', language: 'XML', framework: 'MyBatis', content: '', variables: [], createdAt: Date.now() - 86400000 * 20 },
];

const mockMcpTools: McpTool[] = [
  { toolName: 'git_diff', description: '获取 Git 仓库 Diff 信息', serverName: 'git-server', status: '在线' },
  { toolName: 'log_query', description: '查询日志系统', serverName: 'log-server', status: '在线' },
  { toolName: 'metrics_query', description: '查询监控指标', serverName: 'metrics-server', status: '离线' },
];

const mockNotifyConfigs: NotifyConfig[] = [
  { id: 'n-001', eventType: '评审完成', channels: ['邮件', '企业微信'], receivers: ['开发组', '架构师组'], enabled: true },
  { id: 'n-002', eventType: '排障完成', channels: ['钉钉'], receivers: ['运维组'], enabled: true },
  { id: 'n-003', eventType: '系统告警', channels: ['邮件', '企业微信', '钉钉', '飞书'], receivers: ['管理员'], enabled: true },
];

const SettingsPage: React.FC = () => {
  const [modelModalOpen, setModelModalOpen] = useState(false);
  const [userModalOpen, setUserModalOpen] = useState(false);

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
                    <Select
                      defaultValue="m-001"
                      style={{ width: 200 }}
                      options={mockModels.map((m) => ({ value: m.modelId, label: m.name }))}
                    />
                  </Space>
                  <Button type="primary" icon={<PlusOutlined />} onClick={() => setModelModalOpen(true)}>
                    添加模型
                  </Button>
                </div>
                <Table
                  columns={[
                    { title: 'ID', dataIndex: 'modelId', key: 'modelId' },
                    { title: '模型名称', dataIndex: 'name', key: 'name' },
                    { title: '部署方式', dataIndex: 'deployType', key: 'deployType', render: (v: string) => v === 'private' ? '私有部署' : 'API 调用' },
                    { title: 'API 地址', dataIndex: 'apiAddress', key: 'apiAddress', ellipsis: true },
                    { title: '状态', dataIndex: 'status', key: 'status', render: (s: string) => <StatusTag status={s === '正常' ? 'ACTIVE' : 'ERROR'} /> },
                    { title: '操作', key: 'action', render: () => <Space><Button type="link" size="small">编辑</Button><Button type="link" size="small" icon={<ApiOutlined />}>测试连接</Button><Button type="link" size="small" danger>删除</Button></Space> },
                  ]}
                  dataSource={mockModels}
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
                  <Button type="primary" icon={<PlusOutlined />} onClick={() => setUserModalOpen(true)}>
                    添加用户
                  </Button>
                </div>
                <Table
                  columns={[
                    { title: '用户名', dataIndex: 'username', key: 'username' },
                    { title: '姓名', dataIndex: 'realName', key: 'realName' },
                    { title: '角色', dataIndex: 'role', key: 'role', render: (v: string) => <Tag>{v}</Tag> },
                    { title: '部门', dataIndex: 'department', key: 'department' },
                    { title: '状态', dataIndex: 'status', key: 'status', render: (s: string) => <StatusTag status={s === '启用' ? 'ACTIVE' : 'DISABLED'} /> },
                    { title: '操作', key: 'action', render: () => <Space><Button type="link" size="small">编辑</Button><Button type="link" size="small" icon={<KeyOutlined />}>重置密码</Button><Button type="link" size="small">禁用</Button></Space> },
                  ]}
                  dataSource={mockUsers}
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
                  <Button type="primary" icon={<PlusOutlined />}>新建模板</Button>
                </div>
                <Table
                  columns={[
                    { title: 'ID', dataIndex: 'templateId', key: 'templateId' },
                    { title: '模板名称', dataIndex: 'name', key: 'name' },
                    { title: '分类', dataIndex: 'category', key: 'category', render: (v: string) => <Tag color="blue">{v}</Tag> },
                    { title: '语言', dataIndex: 'language', key: 'language' },
                    { title: '框架', dataIndex: 'framework', key: 'framework' },
                    { title: '操作', key: 'action', render: () => <Space><Button type="link" size="small">编辑</Button><Button type="link" size="small">复制</Button><Button type="link" size="small" danger>删除</Button></Space> },
                  ]}
                  dataSource={mockTemplates}
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
                  { title: '操作', key: 'action', render: () => <Space><Button type="link" size="small">查看 Schema</Button><Button type="link" size="small">测试</Button></Space> },
                ]}
                dataSource={mockMcpTools}
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
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Space><Tag color="blue">邮件</Tag><Text type="secondary">SMTP 服务器 / 端口 / 发件人 / 认证信息</Text></Space>
                      <Button type="link" size="small">配置</Button>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Space><Tag color="green">企业微信</Tag><Text type="secondary">Webhook 地址 / 密钥</Text></Space>
                      <Button type="link" size="small">配置</Button>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Space><Tag color="orange">钉钉</Tag><Text type="secondary">Webhook 地址 / 密钥</Text></Space>
                      <Button type="link" size="small">配置</Button>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Space><Tag color="purple">飞书</Tag><Text type="secondary">Webhook 地址 / 密钥</Text></Space>
                      <Button type="link" size="small">配置</Button>
                    </div>
                  </Space>
                </Card>
                <Card title="通知规则" style={{ borderRadius: 8 }}>
                  <Table
                    columns={[
                      { title: '事件类型', dataIndex: 'eventType', key: 'eventType' },
                      { title: '通知渠道', dataIndex: 'channels', key: 'channels', render: (v: string[]) => v.map((c) => <Tag key={c}>{c}</Tag>) },
                      { title: '接收人', dataIndex: 'receivers', key: 'receivers', render: (v: string[]) => v.join(', ') },
                      { title: '启用状态', dataIndex: 'enabled', key: 'enabled', render: (v: boolean) => <Switch checked={v} size="small" /> },
                      { title: '操作', key: 'action', render: () => <Space><Button type="link" size="small">编辑</Button><Button type="link" size="small" danger>删除</Button></Space> },
                    ]}
                    dataSource={mockNotifyConfigs}
                    rowKey="id"
                    pagination={false}
                  />
                </Card>
              </div>
            ),
          },
        ]}
      />

      {/* 添加/编辑模型弹窗 */}
      <Modal
        title="添加模型"
        open={modelModalOpen}
        onCancel={() => setModelModalOpen(false)}
        width={600}
        onOk={() => setModelModalOpen(false)}
      >
        <Form layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item label="模型名称" required>
            <Input placeholder="模型显示名称" />
          </Form.Item>
          <Form.Item label="部署方式" required>
            <Select options={[
              { value: 'private', label: '私有部署' },
              { value: 'api', label: 'API 调用' },
            ]} />
          </Form.Item>
          <Form.Item label="API 地址" required>
            <Input placeholder="模型服务端点地址" />
          </Form.Item>
          <Form.Item label="API Key">
            <Input.Password placeholder="API 密钥" />
          </Form.Item>
          <Form.Item label="最大上下文长度" required>
            <InputNumber min={1024} defaultValue={32768} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label="默认温度">
            <Slider min={0} max={2} step={0.1} defaultValue={0.7} marks={{ 0: '0', 1: '1', 2: '2' }} />
          </Form.Item>
        </Form>
      </Modal>

      {/* 添加用户弹窗 */}
      <Modal
        title="添加用户"
        open={userModalOpen}
        onCancel={() => setUserModalOpen(false)}
        width={600}
        onOk={() => setUserModalOpen(false)}
      >
        <Form layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item label="用户名" required>
            <Input placeholder="登录名" />
          </Form.Item>
          <Form.Item label="姓名" required>
            <Input placeholder="真实姓名" />
          </Form.Item>
          <Form.Item label="邮箱">
            <Input placeholder="邮箱地址" />
          </Form.Item>
          <Form.Item label="角色" required>
            <Select options={[
              { value: '开发', label: '开发' },
              { value: '测试', label: '测试' },
              { value: '架构师', label: '架构师' },
              { value: '运维', label: '运维' },
              { value: '管理者', label: '管理者' },
              { value: '管理员', label: '管理员' },
            ]} />
          </Form.Item>
          <Form.Item label="初始密码" required>
            <Input.Password placeholder="初始密码" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default SettingsPage;
