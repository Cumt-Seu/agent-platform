// 代码评审页面

import { Table, Button, Typography, Space, Modal, Form, Select, Checkbox, Radio } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useState } from 'react';
import StatusTag from '../../components/common/StatusTag';
import SeverityBadge from '../../components/common/SeverityBadge';
import { getScoreColor } from '../../utils/format';
import type { ReviewTask } from '../../types';

const { Title, Text } = Typography;

// Mock 数据
const mockReviewTasks: ReviewTask[] = [
  {
    reviewId: 'REV-001',
    mrTitle: 'feat: 用户模块重构',
    projectId: 'proj-001',
    projectName: '用户中心',
    status: 'COMPLETED',
    blockerCount: 2,
    majorCount: 5,
    minorCount: 8,
    infoCount: 3,
    qualityScore: 72,
    createdAt: Date.now() - 86400000 * 2,
  },
  {
    reviewId: 'REV-002',
    mrTitle: 'fix: 修复订单超时问题',
    projectId: 'proj-002',
    projectName: '订单系统',
    status: 'REVIEWING',
    blockerCount: 0,
    majorCount: 3,
    minorCount: 4,
    infoCount: 2,
    qualityScore: 85,
    createdAt: Date.now() - 86400000,
  },
  {
    reviewId: 'REV-003',
    mrTitle: 'refactor: 数据库连接池优化',
    projectId: 'proj-003',
    projectName: '基础服务',
    status: 'PENDING',
    blockerCount: 0,
    majorCount: 0,
    minorCount: 0,
    infoCount: 0,
    qualityScore: 0,
    createdAt: Date.now(),
  },
];

const columns = [
  {
    title: 'ID',
    dataIndex: 'reviewId',
    key: 'reviewId',
    render: (text: string) => <a>{text}</a>,
  },
  {
    title: 'MR 标题',
    dataIndex: 'mrTitle',
    key: 'mrTitle',
    ellipsis: true,
  },
  {
    title: '项目',
    dataIndex: 'projectName',
    key: 'projectName',
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    render: (status: string) => <StatusTag status={status} />,
  },
  {
    title: '问题数',
    key: 'issues',
    render: (_: unknown, record: ReviewTask) => (
      <Space size={4}>
        {record.blockerCount > 0 && <SeverityBadge severity="BLOCKER" count={record.blockerCount} />}
        {record.majorCount > 0 && <SeverityBadge severity="MAJOR" count={record.majorCount} />}
        {record.minorCount > 0 && <SeverityBadge severity="MINOR" count={record.minorCount} />}
        {record.infoCount > 0 && <SeverityBadge severity="INFO" count={record.infoCount} />}
      </Space>
    ),
  },
  {
    title: '评分',
    dataIndex: 'qualityScore',
    key: 'qualityScore',
    render: (score: number) =>
      score > 0 ? (
        <span style={{ color: getScoreColor(score), fontWeight: 600 }}>
          {score}/100
        </span>
      ) : (
        <Text type="secondary">-</Text>
      ),
  },
  {
    title: '操作',
    key: 'action',
    render: () => <Button type="link" size="small">查看详情</Button>,
  },
];

const ReviewPage: React.FC = () => {
  const [createModalOpen, setCreateModalOpen] = useState(false);

  return (
    <div>
      {/* 页面标题和操作 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={4} style={{ margin: 0 }}>代码评审</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateModalOpen(true)}>
          发起评审
        </Button>
      </div>

      {/* 筛选栏 */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
        <Select placeholder="项目" allowClear style={{ width: 180 }} />
        <Select placeholder="状态" allowClear style={{ width: 140 }}
          options={[
            { value: 'PENDING', label: '待评审' },
            { value: 'REVIEWING', label: '评审中' },
            { value: 'COMPLETED', label: '已完成' },
            { value: 'FAILED', label: '失败' },
          ]}
        />
        <Select placeholder="严重度" allowClear style={{ width: 140 }}
          options={[
            { value: 'BLOCKER', label: 'BLOCKER' },
            { value: 'MAJOR', label: 'MAJOR' },
            { value: 'MINOR', label: 'MINOR' },
            { value: 'INFO', label: 'INFO' },
          ]}
        />
      </div>

      {/* 评审任务列表 */}
      <Table
        columns={columns}
        dataSource={mockReviewTasks}
        rowKey="reviewId"
        pagination={{ pageSize: 10 }}
        style={{ background: '#fff', borderRadius: 8 }}
      />

      {/* 发起评审弹窗 */}
      <Modal
        title="发起代码评审"
        open={createModalOpen}
        onCancel={() => setCreateModalOpen(false)}
        width={600}
        onOk={() => setCreateModalOpen(false)}
      >
        <Form layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item label="项目" required>
            <Select placeholder="选择项目" options={[
              { value: 'proj-001', label: '用户中心' },
              { value: 'proj-002', label: '订单系统' },
              { value: 'proj-003', label: '基础服务' },
            ]} />
          </Form.Item>
          <Form.Item label="MR ID" required>
            <Select placeholder="选择 Merge Request" />
          </Form.Item>
          <Form.Item label="评审维度" required>
            <Checkbox.Group
              options={[
                { label: '编码规范', value: 'NAMING' },
                { label: '安全漏洞', value: 'SECURITY' },
                { label: '性能隐患', value: 'PERFORMANCE' },
                { label: '逻辑审查', value: 'LOGIC' },
                { label: '架构合规', value: 'ARCH' },
              ]}
            />
          </Form.Item>
          <Form.Item label="评审模式" required>
            <Radio.Group
              options={[
                { label: 'AI 评审', value: 'ai' },
                { label: 'AI+人工评审', value: 'ai_and_human' },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ReviewPage;
