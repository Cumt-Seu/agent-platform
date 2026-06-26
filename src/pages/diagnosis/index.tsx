// 故障排障页面 — 使用 diagnosisService + DagViewer + step_update SSE

import { Layout, Card, Typography, Input, Select, Button, DatePicker, Steps, List, Tag, Space, Progress, Divider } from 'antd';
import { PlayCircleOutlined } from '@ant-design/icons';
import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import StatusTag from '../../components/common/StatusTag';
import DagViewer from '../../components/business/DagViewer/DagViewer';
import { useSSE } from '../../hooks/useSSE';
import { formatRelativeTime, getConfidenceColor } from '../../utils/format';
import { diagnosisService } from '../../services/diagnosisService';
import type { DiagnosisStep, DiagnosisResult, RiskLevel } from '../../types';

const { Sider, Content } = Layout;
const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const RISK_COLORS: Record<RiskLevel, string> = {
  LOW: '#52C41A',
  MEDIUM: '#FAAD14',
  HIGH: '#FF4D4F',
};

const DiagnosisPage: React.FC = () => {
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const [steps, setSteps] = useState<DiagnosisStep[]>([]);
  const [result, setResult] = useState<DiagnosisResult | null>(null);
  const [logInput, setLogInput] = useState('');
  const [serviceInput, setServiceInput] = useState<string | undefined>();
  const queryClient = useQueryClient();

  const { data: tasks = [] } = useQuery({
    queryKey: ['diagnosisTasks'],
    queryFn: () => diagnosisService.getTasks(),
  });

  useQuery({
    queryKey: ['diagnosisDetail', selectedTask],
    queryFn: async () => {
      const detail = await diagnosisService.getTaskDetail(selectedTask!);
      setSteps(detail.steps);
      setResult(detail.result || null);
      return detail;
    },
    enabled: !!selectedTask,
  });

  const analyzeMutation = useMutation({
    mutationFn: (params: Parameters<typeof diagnosisService.analyze>[0]) => diagnosisService.analyze(params),
    onSuccess: (task) => {
      queryClient.invalidateQueries({ queryKey: ['diagnosisTasks'] });
      setSelectedTask(task.diagnosisId);
    },
  });

  // step_update SSE
  useSSE({
    url: `/api/v1/diagnosis/${selectedTask}/stream`,
    enabled: !!selectedTask && tasks.find((t) => t.diagnosisId === selectedTask)?.status === 'RUNNING',
    handlers: {
      onStepUpdate: (data) => {
        const step = data as DiagnosisStep;
        setSteps((prev) => [...prev, step]);
      },
      onDagUpdate: () => {
        // DagViewer 内部处理
      },
      onDone: () => {
        queryClient.invalidateQueries({ queryKey: ['diagnosisTasks'] });
        queryClient.invalidateQueries({ queryKey: ['diagnosisDetail', selectedTask] });
      },
    },
  });

  const handleStart = useCallback(() => {
    if (!logInput.trim()) return;
    analyzeMutation.mutate({
      exceptionLog: logInput,
      serviceName: serviceInput,
    });
  }, [logInput, serviceInput, analyzeMutation]);

  return (
    <Layout style={{ height: '100%', background: 'transparent', gap: 16 }}>
      <Sider width={280} style={{ background: '#fff', borderRadius: 8, padding: 16, overflow: 'auto' }}>
        <Title level={5} style={{ marginBottom: 16 }}>排障历史</Title>
        <List
          dataSource={tasks}
          renderItem={(task) => (
            <List.Item
              style={{
                cursor: 'pointer', padding: '10px 12px', borderRadius: 6,
                background: selectedTask === task.diagnosisId ? '#F0F5FF' : 'transparent',
                borderLeft: selectedTask === task.diagnosisId ? '3px solid #1677FF' : '3px solid transparent',
              }}
              onClick={() => setSelectedTask(task.diagnosisId)}
            >
              <List.Item.Meta
                title={<Text style={{ fontSize: 14 }}>{task.title}</Text>}
                description={
                  <Space size={8}>
                    <Text type="secondary" style={{ fontSize: 12 }}>{formatRelativeTime(task.createdAt)}</Text>
                    <StatusTag status={task.status} />
                  </Space>
                }
              />
            </List.Item>
          )}
        />
      </Sider>

      <Content style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card title="故障排障" style={{ borderRadius: 8 }}>
          <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
            <div style={{ flex: 1 }}>
              <Text style={{ display: 'block', marginBottom: 8 }}>异常日志</Text>
              <TextArea
                rows={4}
                placeholder="粘贴异常日志/告警信息，支持多行"
                value={logInput}
                onChange={(e) => setLogInput(e.target.value)}
                style={{ borderRadius: 6 }}
              />
            </div>
            <div style={{ width: 240 }}>
              <Text style={{ display: 'block', marginBottom: 8 }}>服务名称</Text>
              <Select
                placeholder="选择服务"
                allowClear
                showSearch
                style={{ width: '100%', marginBottom: 16 }}
                value={serviceInput}
                onChange={setServiceInput}
                options={[
                  { value: 'user-service', label: 'user-service' },
                  { value: 'order-service', label: 'order-service' },
                  { value: 'gateway', label: 'gateway' },
                ]}
              />
              <Text style={{ display: 'block', marginBottom: 8 }}>异常时间</Text>
              <DatePicker showTime style={{ width: '100%' }} />
            </div>
          </div>
          <Button
            type="primary"
            icon={<PlayCircleOutlined />}
            size="large"
            onClick={handleStart}
            loading={analyzeMutation.isPending}
          >
            开始排障
          </Button>
        </Card>

        {/* 排障步骤时间线 */}
        {selectedTask && steps.length > 0 && (
          <Card title="排障步骤" style={{ borderRadius: 8 }}>
            <Steps
              current={steps.findIndex((s) => s.status === 'RUNNING') || steps.filter((s) => s.status === 'SUCCESS').length}
              items={steps.map((step) => ({
                title: step.stepName,
                status: step.status === 'SUCCESS' ? 'finish' : step.status === 'RUNNING' ? 'process' : step.status === 'FAILED' ? 'error' : 'wait',
                description: step.output ? <Text type="secondary" style={{ fontSize: 12 }}>{step.output}</Text> : undefined,
              }))}
            />
          </Card>
        )}

        {/* DAG Viewer */}
        {selectedTask && (
          <Card title="执行计划" style={{ borderRadius: 8 }}>
            <DagViewer sessionId={selectedTask} mode="LIVE" />
          </Card>
        )}

        {/* 排障结果卡片 */}
        {selectedTask && result && (
          <Card title="排障结果" style={{ borderRadius: 8 }}>
            <Space direction="vertical" style={{ width: '100%' }} size={16}>
              <div>
                <Text strong style={{ display: 'block', marginBottom: 8 }}>故障摘要</Text>
                <Paragraph>{result.summary}</Paragraph>
                {result.impactScope.length > 0 && (
                  <Space>
                    {result.impactScope.map((scope) => <Tag key={scope}>{scope}</Tag>)}
                  </Space>
                )}
              </div>
              <Divider />
              <div>
                <Text strong style={{ display: 'block', marginBottom: 8 }}>根因分析</Text>
                {result.rootCauses.map((cause, idx) => (
                  <div key={idx} style={{ marginBottom: 8 }}>
                    <Space>
                      <Text>{idx + 1}. 置信度 {(cause.confidence * 100).toFixed(0)}%</Text>
                      <Progress percent={cause.confidence * 100} strokeColor={getConfidenceColor(cause.confidence)} style={{ width: 120 }} size="small" />
                    </Space>
                    <Paragraph type="secondary" style={{ marginLeft: 24, marginBottom: 4 }}>{cause.cause}</Paragraph>
                  </div>
                ))}
              </div>
              <Divider />
              <div>
                <Text strong style={{ display: 'block', marginBottom: 8 }}>处置方案</Text>
                {result.solutions.map((sol, idx) => (
                  <div key={idx} style={{ marginBottom: 8 }}>
                    <Space>
                      <Text>方案 {idx + 1}</Text>
                      <Tag color={RISK_COLORS[sol.riskLevel]}>{sol.riskLevel}</Tag>
                    </Space>
                    <Paragraph type="secondary" style={{ marginLeft: 24 }}>{sol.description}</Paragraph>
                  </div>
                ))}
              </div>
            </Space>
          </Card>
        )}
      </Content>
    </Layout>
  );
};

export default DiagnosisPage;
