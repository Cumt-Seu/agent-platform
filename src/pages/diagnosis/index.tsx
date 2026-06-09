// 故障排障页面

import { Layout, Card, Typography, Input, Select, Button, DatePicker, Steps, List, Tag, Space, Progress, Divider } from 'antd';
import { PlayCircleOutlined } from '@ant-design/icons';
import { useState } from 'react';
import StatusTag from '../../components/common/StatusTag';
import { formatRelativeTime, getConfidenceColor } from '../../utils/format';
import type { DiagnosisTask, DiagnosisStep, RiskLevel } from '../../types';

const { Sider, Content } = Layout;
const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

// Mock 数据
const mockDiagnosisTasks: DiagnosisTask[] = [
  { diagnosisId: 'diag-001', title: 'NPE排查 - user-service', serviceName: 'user-service', status: 'COMPLETED', createdAt: Date.now() - 3600000 },
  { diagnosisId: 'diag-002', title: 'OOM排查 - order-service', serviceName: 'order-service', status: 'RUNNING', createdAt: Date.now() - 1800000 },
  { diagnosisId: 'diag-003', title: '超时排查 - gateway', serviceName: 'gateway', status: 'COMPLETED', createdAt: Date.now() - 86400000 },
];

const mockSteps: DiagnosisStep[] = [
  { stepName: '日志分析', skillName: 'log_analysis', status: 'SUCCESS', duration: 3200, output: '解析到 NullPointerException，位于 UserController.java:45' },
  { stepName: '监控指标关联', skillName: 'metrics_correlation', status: 'SUCCESS', duration: 5600, output: '异常时段 CPU 使用率飙升至 92%，内存使用率正常' },
  { stepName: '案例检索', skillName: 'case_search', status: 'SUCCESS', duration: 1800, output: '检索到 3 个相似案例' },
  { stepName: '方案推荐', skillName: 'solution_recommend', status: 'SUCCESS', duration: 4200, output: '推荐 2 个处置方案' },
];

const RISK_COLORS: Record<RiskLevel, string> = {
  LOW: '#52C41A',
  MEDIUM: '#FAAD14',
  HIGH: '#FF4D4F',
};

const DiagnosisPage: React.FC = () => {
  const [selectedTask, setSelectedTask] = useState<string | null>(null);

  return (
    <Layout style={{ height: '100%', background: 'transparent', gap: 16 }}>
      {/* 左侧：排障历史 */}
      <Sider
        width={280}
        style={{
          background: '#fff',
          borderRadius: 8,
          padding: 16,
          overflow: 'auto',
        }}
      >
        <Title level={5} style={{ marginBottom: 16 }}>排障历史</Title>
        <List
          dataSource={mockDiagnosisTasks}
          renderItem={(task) => (
            <List.Item
              style={{
                cursor: 'pointer',
                padding: '10px 12px',
                borderRadius: 6,
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

      {/* 右侧：排障工作台 */}
      <Content style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* 排障输入卡片 */}
        <Card title="故障排障" style={{ borderRadius: 8 }}>
          <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
            <div style={{ flex: 1 }}>
              <Text style={{ display: 'block', marginBottom: 8 }}>异常日志</Text>
              <TextArea
                rows={4}
                placeholder="粘贴异常日志/告警信息，支持多行"
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
          <Button type="primary" icon={<PlayCircleOutlined />} size="large">
            开始排障
          </Button>
        </Card>

        {/* 排障步骤时间线 */}
        {selectedTask && (
          <Card title="排障步骤" style={{ borderRadius: 8 }}>
            <Steps
              current={3}
              items={mockSteps.map((step) => ({
                title: step.stepName,
                status: step.status === 'SUCCESS' ? 'finish' : step.status === 'RUNNING' ? 'process' : step.status === 'FAILED' ? 'error' : 'wait',
                description: step.output ? (
                  <Text type="secondary" style={{ fontSize: 12 }}>{step.output}</Text>
                ) : undefined,
              }))}
            />
          </Card>
        )}

        {/* 排障结果卡片 */}
        {selectedTask && (
          <Card title="排障结果" style={{ borderRadius: 8 }}>
            <Space direction="vertical" style={{ width: '100%' }} size={16}>
              {/* 故障摘要 */}
              <div>
                <Text strong style={{ display: 'block', marginBottom: 8 }}>故障摘要</Text>
                <Paragraph>
                  user-service 在 10:30 出现 NPE，疑似 UserController.getUserById 方法空指针异常，影响用户查询接口
                </Paragraph>
                <Space>
                  <Tag>影响服务: user-service</Tag>
                  <Tag>影响接口: /api/user/{'{id}'}</Tag>
                </Space>
              </div>

              <Divider />

              {/* 根因分析 */}
              <div>
                <Text strong style={{ display: 'block', marginBottom: 8 }}>根因分析</Text>
                <div style={{ marginBottom: 8 }}>
                  <Space>
                    <Text>1. 置信度 85%</Text>
                    <Progress percent={85} strokeColor={getConfidenceColor(0.85)} style={{ width: 120 }} size="small" />
                  </Space>
                  <Paragraph type="secondary" style={{ marginLeft: 24, marginBottom: 4 }}>
                    UserService.findById 返回 null 未做空判断，直接调用 getter 方法触发 NPE
                  </Paragraph>
                </div>
              </div>

              <Divider />

              {/* 处置方案 */}
              <div>
                <Text strong style={{ display: 'block', marginBottom: 8 }}>处置方案</Text>
                <div style={{ marginBottom: 8 }}>
                  <Space>
                    <Text>方案 1</Text>
                    <Tag color={RISK_COLORS.LOW}>LOW</Tag>
                  </Space>
                  <Paragraph type="secondary" style={{ marginLeft: 24 }}>
                    在 UserController.getUserById 中添加空值判断，返回 404 响应
                  </Paragraph>
                </div>
              </div>
            </Space>
          </Card>
        )}
      </Content>
    </Layout>
  );
};

export default DiagnosisPage;
