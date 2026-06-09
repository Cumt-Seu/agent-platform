// 模型微调页面

import { Table, Button, Typography, Space, Modal, Form, Input, InputNumber, Select } from 'antd';
import { PlusOutlined, EyeOutlined, MonitorOutlined, RestOutlined, PlayCircleOutlined } from '@ant-design/icons';
import { useState } from 'react';
import StatusTag from '../../components/common/StatusTag';
import { formatNumber } from '../../utils/format';
import type { FinetuneTask, FinetuneStatus } from '../../types';

const { Title } = Typography;

// Mock 数据
const mockFinetuneTasks: FinetuneTask[] = [
  {
    taskId: 'FT-001',
    name: '代码生成优化-v2',
    baseModel: 'Qwen2.5-72B',
    datasetId: 'ds-001',
    datasetName: '代码生成数据集',
    status: 'COMPLETED',
    loraR: 16,
    loraAlpha: 32,
    dropout: 0.05,
    epochs: 3,
    learningRate: '2e-4',
    targetModules: ['q_proj', 'k_proj', 'v_proj'],
    createdAt: Date.now() - 86400000 * 7,
  },
  {
    taskId: 'FT-002',
    name: '代码评审增强',
    baseModel: 'Qwen2.5-72B',
    datasetId: 'ds-002',
    datasetName: '代码评审数据集',
    status: 'TRAINING',
    loraR: 32,
    loraAlpha: 64,
    dropout: 0.1,
    epochs: 5,
    learningRate: '1e-4',
    targetModules: ['q_proj', 'k_proj', 'v_proj', 'o_proj'],
    createdAt: Date.now() - 86400000 * 2,
  },
  {
    taskId: 'FT-003',
    name: '故障排障微调',
    baseModel: 'Qwen2.5-14B',
    datasetId: 'ds-003',
    datasetName: '故障排障数据集',
    status: 'PENDING',
    loraR: 16,
    loraAlpha: 32,
    dropout: 0.05,
    epochs: 3,
    learningRate: '2e-4',
    targetModules: ['q_proj', 'v_proj'],
    createdAt: Date.now(),
  },
];

const getActionByStatus = (status: FinetuneStatus) => {
  switch (status) {
    case 'COMPLETED':
      return { label: '详情', icon: <EyeOutlined /> };
    case 'TRAINING':
      return { label: '监控', icon: <MonitorOutlined /> };
    case 'FAILED':
      return { label: '重试', icon: <RestOutlined /> };
    case 'PENDING':
      return { label: '开始', icon: <PlayCircleOutlined /> };
  }
};

const columns = [
  { title: 'ID', dataIndex: 'taskId', key: 'taskId' },
  { title: '任务名称', dataIndex: 'name', key: 'name' },
  { title: '基座模型', dataIndex: 'baseModel', key: 'baseModel' },
  { title: '数据集', dataIndex: 'datasetName', key: 'datasetName' },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    render: (status: FinetuneStatus) => <StatusTag status={status} />,
  },
  {
    title: '操作',
    key: 'action',
    render: (_: unknown, record: FinetuneTask) => {
      const action = getActionByStatus(record.status);
      return <Button type="link" size="small" icon={action.icon}>{action.label}</Button>;
    },
  },
];

const FinetunePage: React.FC = () => {
  const [createModalOpen, setCreateModalOpen] = useState(false);

  return (
    <div>
      {/* 页面标题和操作 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={4} style={{ margin: 0 }}>模型微调</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateModalOpen(true)}>
          新建微调任务
        </Button>
      </div>

      {/* 微调任务列表 */}
      <Table
        columns={columns}
        dataSource={mockFinetuneTasks}
        rowKey="taskId"
        pagination={{ pageSize: 10 }}
        style={{ background: '#fff', borderRadius: 8, marginBottom: 24 }}
      />

      {/* 数据集管理 */}
      <Title level={5} style={{ marginBottom: 16 }}>数据集管理</Title>
      <Table
        columns={[
          { title: 'ID', dataIndex: 'datasetId', key: 'datasetId' },
          { title: '数据集名称', dataIndex: 'name', key: 'name' },
          { title: '类型', dataIndex: 'type', key: 'type' },
          { title: '样本数', dataIndex: 'sampleCount', key: 'sampleCount', render: (v: number) => formatNumber(v) },
          { title: '状态', dataIndex: 'status', key: 'status', render: (s: string) => <StatusTag status={s} /> },
          { title: '操作', key: 'action', render: () => <Space><Button type="link" size="small">查看</Button><Button type="link" size="small">编辑</Button><Button type="link" size="small" danger>删除</Button></Space> },
        ]}
        dataSource={[
          { datasetId: 'ds-001', name: '代码生成数据集', type: 'CODE_GEN', sampleCount: 12500, status: 'READY' },
          { datasetId: 'ds-002', name: '代码评审数据集', type: 'CODE_REVIEW', sampleCount: 8300, status: 'READY' },
          { datasetId: 'ds-003', name: '故障排障数据集', type: 'FAULT_DIAG', sampleCount: 5600, status: 'BUILDING' },
        ]}
        rowKey="datasetId"
        pagination={false}
        style={{ background: '#fff', borderRadius: 8 }}
      />

      {/* 新建微调任务弹窗 */}
      <Modal
        title="新建微调任务"
        open={createModalOpen}
        onCancel={() => setCreateModalOpen(false)}
        width={600}
        onOk={() => setCreateModalOpen(false)}
      >
        <Form layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item label="任务名称" required>
            <Input placeholder="微调任务名称" />
          </Form.Item>
          <Form.Item label="基座模型" required>
            <Select placeholder="选择基座模型" options={[
              { value: 'Qwen2.5-72B', label: 'Qwen2.5-72B' },
              { value: 'Qwen2.5-14B', label: 'Qwen2.5-14B' },
            ]} />
          </Form.Item>
          <Form.Item label="数据集" required>
            <Select placeholder="选择数据集" options={[
              { value: 'ds-001', label: '代码生成数据集' },
              { value: 'ds-002', label: '代码评审数据集' },
              { value: 'ds-003', label: '故障排障数据集' },
            ]} />
          </Form.Item>
          <Space size={16}>
            <Form.Item label="LoRA 秩 (r)" required>
              <InputNumber min={1} max={64} defaultValue={16} />
            </Form.Item>
            <Form.Item label="缩放因子 (alpha)" required>
              <InputNumber min={1} max={128} defaultValue={32} />
            </Form.Item>
            <Form.Item label="Dropout" required>
              <InputNumber min={0} max={1} step={0.01} defaultValue={0.05} />
            </Form.Item>
          </Space>
          <Space size={16}>
            <Form.Item label="训练轮数" required>
              <InputNumber min={1} max={100} defaultValue={3} />
            </Form.Item>
            <Form.Item label="学习率" required>
              <Input defaultValue="2e-4" style={{ width: 120 }} />
            </Form.Item>
          </Space>
          <Form.Item label="目标模块" required>
            <Select
              mode="multiple"
              defaultValue={['q_proj', 'k_proj', 'v_proj']}
              options={['q_proj', 'k_proj', 'v_proj', 'o_proj', 'gate_proj', 'up_proj', 'down_proj'].map((m) => ({ value: m, label: m }))}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default FinetunePage;
