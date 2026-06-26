// 模型微调页面 — 使用 finetuneService + 训练监控

import { Table, Button, Typography, Space, Modal, Form, Input, InputNumber, Select, Card, Progress, message } from 'antd';
import { PlusOutlined, EyeOutlined, MonitorOutlined, RestOutlined, PlayCircleOutlined, ExportOutlined } from '@ant-design/icons';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import StatusTag from '../../components/common/StatusTag';
import MetricChart from '../../components/business/MetricChart/MetricChart';
import { formatNumber } from '../../utils/format';
import { finetuneService } from '../../services/finetuneService';
import type { FinetuneTask, FinetuneStatus } from '../../types';

const { Title, Text } = Typography;

const getActionByStatus = (status: FinetuneStatus) => {
  switch (status) {
    case 'COMPLETED': return { label: '详情', icon: <EyeOutlined /> };
    case 'TRAINING': return { label: '监控', icon: <MonitorOutlined /> };
    case 'FAILED': return { label: '重试', icon: <RestOutlined /> };
    case 'PENDING': return { label: '开始', icon: <PlayCircleOutlined /> };
  }
};

const FinetunePage: React.FC = () => {
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [monitorTaskId, setMonitorTaskId] = useState<string | null>(null);
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  const { data: tasks = [] } = useQuery({
    queryKey: ['finetuneTasks'],
    queryFn: () => finetuneService.getTasks(),
  });

  const { data: datasets = [] } = useQuery({
    queryKey: ['datasets'],
    queryFn: () => finetuneService.getDatasets(),
  });

  const { data: trainingLogs } = useQuery({
    queryKey: ['trainingLogs', monitorTaskId],
    queryFn: () => finetuneService.getTrainingLogs(monitorTaskId!),
    enabled: !!monitorTaskId,
    refetchInterval: monitorTaskId ? 5000 : false,
  });

  const createMutation = useMutation({
    mutationFn: (params: Parameters<typeof finetuneService.createTask>[0]) => finetuneService.createTask(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finetuneTasks'] });
      message.success('任务已创建');
      setCreateModalOpen(false);
      form.resetFields();
    },
  });

  const startMutation = useMutation({
    mutationFn: (taskId: string) => finetuneService.start(taskId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['finetuneTasks'] }),
  });

  const exportMutation = useMutation({
    mutationFn: (taskId: string) => finetuneService.exportWeights(taskId),
    onSuccess: (data) => {
      window.open(data.downloadUrl, '_blank');
      message.success('权重导出成功');
    },
  });

  const columns = [
    { title: 'ID', dataIndex: 'taskId', key: 'taskId' },
    { title: '任务名称', dataIndex: 'name', key: 'name' },
    { title: '基座模型', dataIndex: 'baseModel', key: 'baseModel' },
    { title: '数据集', dataIndex: 'datasetName', key: 'datasetName' },
    { title: '状态', dataIndex: 'status', key: 'status', render: (status: FinetuneStatus) => <StatusTag status={status} /> },
    {
      title: '操作', key: 'action',
      render: (_: unknown, record: FinetuneTask) => {
        const action = getActionByStatus(record.status);
        return (
          <Space>
            <Button type="link" size="small" icon={action.icon} onClick={() => {
              if (record.status === 'TRAINING') setMonitorTaskId(record.taskId);
              if (record.status === 'PENDING') startMutation.mutate(record.taskId);
            }}>
              {action.label}
            </Button>
            {record.status === 'COMPLETED' && (
              <Button type="link" size="small" icon={<ExportOutlined />} onClick={() => exportMutation.mutate(record.taskId)}>
                导出
              </Button>
            )}
          </Space>
        );
      },
    },
  ];

  // 训练进度图表数据
  const chartData = trainingLogs ? {
    labels: trainingLogs.map((l) => `Epoch ${l.epoch}`),
    seriesNames: ['Loss', 'Val Loss'],
    series: [
      { name: 'Loss', data: trainingLogs.map((l) => l.loss), itemStyle: { color: '#1677FF' } },
      { name: 'Val Loss', data: trainingLogs.map((l) => l.valLoss ?? 0), itemStyle: { color: '#FF7A45' } },
    ],
  } : null;

  const currentTask = tasks.find((t) => t.taskId === monitorTaskId);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={4} style={{ margin: 0 }}>模型微调</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateModalOpen(true)}>
          新建微调任务
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={tasks}
        rowKey="taskId"
        pagination={{ pageSize: 10 }}
        style={{ background: '#fff', borderRadius: 8, marginBottom: 24 }}
      />

      {/* 训练监控 */}
      {monitorTaskId && chartData && (
        <Card title={`训练监控 — ${currentTask?.name || monitorTaskId}`} style={{ borderRadius: 8, marginBottom: 24 }}>
          {currentTask && (
            <div style={{ marginBottom: 16 }}>
              <Space size={24}>
                <Text>Epoch: {trainingLogs?.[trainingLogs.length - 1]?.epoch || 0}/{currentTask.epochs}</Text>
                <Progress
                  percent={Math.round(((trainingLogs?.[trainingLogs.length - 1]?.epoch || 0) / currentTask.epochs) * 100)}
                  style={{ width: 200 }}
                />
              </Space>
            </div>
          )}
          <MetricChart type="line" data={chartData} height={300} />
        </Card>
      )}

      {/* 数据集管理 */}
      <Title level={5} style={{ marginBottom: 16 }}>数据集管理</Title>
      <Table
        columns={[
          { title: 'ID', dataIndex: 'datasetId', key: 'datasetId' },
          { title: '数据集名称', dataIndex: 'name', key: 'name' },
          { title: '类型', dataIndex: 'type', key: 'type' },
          { title: '样本数', dataIndex: 'sampleCount', key: 'sampleCount', render: (v: number) => formatNumber(v) },
          { title: '状态', dataIndex: 'status', key: 'status', render: (s: string) => <StatusTag status={s} /> },
          {
            title: '操作', key: 'action',
            render: () => <Space><Button type="link" size="small">查看</Button><Button type="link" size="small">编辑</Button><Button type="link" size="small" danger>删除</Button></Space>,
          },
        ]}
        dataSource={datasets}
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
        onOk={() => form.submit()}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }} onFinish={(values) => createMutation.mutate(values)}>
          <Form.Item label="任务名称" name="name" rules={[{ required: true }]}>
            <Input placeholder="微调任务名称" />
          </Form.Item>
          <Form.Item label="基座模型" name="baseModel" rules={[{ required: true }]}>
            <Select placeholder="选择基座模型" options={[
              { value: 'Qwen2.5-72B', label: 'Qwen2.5-72B' },
              { value: 'Qwen2.5-14B', label: 'Qwen2.5-14B' },
            ]} />
          </Form.Item>
          <Form.Item label="数据集" name="datasetId" rules={[{ required: true }]}>
            <Select placeholder="选择数据集" options={datasets.map((d) => ({ value: d.datasetId, label: d.name }))} />
          </Form.Item>
          <Space size={16}>
            <Form.Item label="LoRA 秩 (r)" name="loraR" rules={[{ required: true }]} initialValue={16}>
              <InputNumber min={1} max={64} />
            </Form.Item>
            <Form.Item label="缩放因子 (alpha)" name="loraAlpha" rules={[{ required: true }]} initialValue={32}>
              <InputNumber min={1} max={128} />
            </Form.Item>
            <Form.Item label="Dropout" name="dropout" rules={[{ required: true }]} initialValue={0.05}>
              <InputNumber min={0} max={1} step={0.01} />
            </Form.Item>
          </Space>
          <Space size={16}>
            <Form.Item label="训练轮数" name="epochs" rules={[{ required: true }]} initialValue={3}>
              <InputNumber min={1} max={100} />
            </Form.Item>
            <Form.Item label="学习率" name="learningRate" rules={[{ required: true }]} initialValue="2e-4">
              <Input style={{ width: 120 }} />
            </Form.Item>
          </Space>
          <Form.Item label="目标模块" name="targetModules" rules={[{ required: true }]} initialValue={['q_proj', 'k_proj', 'v_proj']}>
            <Select
              mode="multiple"
              options={['q_proj', 'k_proj', 'v_proj', 'o_proj', 'gate_proj', 'up_proj', 'down_proj'].map((m) => ({ value: m, label: m }))}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default FinetunePage;
