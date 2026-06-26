// 代码评审页面 — 使用 reviewService + ReviewDiff

import { Table, Button, Typography, Space, Modal, Form, Select, Checkbox, Radio, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import StatusTag from '../../components/common/StatusTag';
import SeverityBadge from '../../components/common/SeverityBadge';
import ReviewDiff from '../../components/business/ReviewDiff/ReviewDiff';
import { getScoreColor } from '../../utils/format';
import { reviewService } from '../../services/reviewService';
import type { ReviewTask } from '../../types';

const { Title, Text } = Typography;

const ReviewPage: React.FC = () => {
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedReviewId, setSelectedReviewId] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const [form] = Form.useForm();

  const { data: tasks = [] } = useQuery({
    queryKey: ['reviewTasks'],
    queryFn: () => reviewService.getTasks(),
  });

  const { data: issues = [] } = useQuery({
    queryKey: ['reviewIssues', selectedReviewId],
    queryFn: () => reviewService.getIssues(selectedReviewId!),
    enabled: !!selectedReviewId,
  });

  const submitMutation = useMutation({
    mutationFn: (params: Parameters<typeof reviewService.submit>[0]) => reviewService.submit(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviewTasks'] });
      message.success('评审已提交');
      setCreateModalOpen(false);
      form.resetFields();
    },
  });

  const applyFixMutation = useMutation({
    mutationFn: ({ reviewId, issueId }: { reviewId: string; issueId: string }) =>
      reviewService.applyFix(reviewId, issueId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviewIssues', selectedReviewId] });
      message.success('修复已应用');
    },
  });

  const columns = [
    { title: 'ID', dataIndex: 'reviewId', key: 'reviewId', render: (text: string) => <a>{text}</a> },
    { title: 'MR 标题', dataIndex: 'mrTitle', key: 'mrTitle', ellipsis: true },
    { title: '项目', dataIndex: 'projectName', key: 'projectName' },
    { title: '状态', dataIndex: 'status', key: 'status', render: (status: string) => <StatusTag status={status} /> },
    {
      title: '问题数', key: 'issues',
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
      title: '评分', dataIndex: 'qualityScore', key: 'qualityScore',
      render: (score: number) =>
        score > 0 ? <span style={{ color: getScoreColor(score), fontWeight: 600 }}>{score}/100</span> : <Text type="secondary">-</Text>,
    },
    {
      title: '操作', key: 'action',
      render: (_: unknown, record: ReviewTask) => (
        <Button type="link" size="small" onClick={() => setSelectedReviewId(record.reviewId)}>
          查看详情
        </Button>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={4} style={{ margin: 0 }}>代码评审</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateModalOpen(true)}>
          发起评审
        </Button>
      </div>

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
      </div>

      <Table
        columns={columns}
        dataSource={tasks}
        rowKey="reviewId"
        pagination={{ pageSize: 10 }}
        style={{ background: '#fff', borderRadius: 8, marginBottom: 24 }}
      />

      {/* 评审详情 — ReviewDiff */}
      {selectedReviewId && issues.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <Title level={5}>评审详情 — {selectedReviewId}</Title>
          <ReviewDiff
            originalCode="// Original code will be loaded from API"
            modifiedCode="// Modified code will be loaded from API"
            language="java"
            issues={issues}
            onApplyFix={(issueId) => applyFixMutation.mutate({ reviewId: selectedReviewId, issueId })}
          />
        </div>
      )}

      <Modal
        title="发起代码评审"
        open={createModalOpen}
        onCancel={() => setCreateModalOpen(false)}
        width={600}
        onOk={() => form.submit()}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}
          onFinish={(values) => submitMutation.mutate(values)}
        >
          <Form.Item label="项目" name="projectId" rules={[{ required: true }]}>
            <Select placeholder="选择项目" options={[
              { value: 'proj-001', label: '用户中心' },
              { value: 'proj-002', label: '订单系统' },
              { value: 'proj-003', label: '基础服务' },
            ]} />
          </Form.Item>
          <Form.Item label="MR ID" name="mrId" rules={[{ required: true }]}>
            <Select placeholder="选择 Merge Request" />
          </Form.Item>
          <Form.Item label="评审维度" name="dimensions" rules={[{ required: true }]}>
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
          <Form.Item label="评审模式" name="mode" rules={[{ required: true }]}>
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
