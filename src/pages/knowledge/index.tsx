// 知识库管理页面

import { Row, Col, Card, Button, Typography, Space, Select, Modal, Form, Input, InputNumber, Drawer, Divider } from 'antd';
import { PlusOutlined, ExperimentOutlined, FileTextOutlined } from '@ant-design/icons';
import { useState } from 'react';
import StatusTag from '../../components/common/StatusTag';
import SearchBar from '../../components/common/SearchBar';
import { formatNumber } from '../../utils/format';
import type { KnowledgeBase } from '../../types';

const { Title, Text } = Typography;

// Mock 数据
const mockKnowledgeBases: KnowledgeBase[] = [
  {
    kbId: 'kb-001',
    name: 'Java编码规范',
    description: '公司Java开发编码规范文档',
    embeddingModel: 'bge-large-zh-v1.5',
    chunkStrategy: '语义切片',
    maxChunkTokens: 512,
    overlapTokens: 64,
    docCount: 45,
    chunkCount: 1280,
    status: 'ACTIVE',
    createdAt: Date.now() - 86400000 * 30,
  },
  {
    kbId: 'kb-002',
    name: '微服务架构文档',
    description: '微服务架构设计文档和最佳实践',
    embeddingModel: 'bge-large-zh-v1.5',
    chunkStrategy: '章节切片',
    maxChunkTokens: 512,
    overlapTokens: 64,
    docCount: 23,
    chunkCount: 560,
    status: 'ACTIVE',
    createdAt: Date.now() - 86400000 * 20,
  },
  {
    kbId: 'kb-003',
    name: '故障案例库',
    description: '历史故障案例和解决方案',
    embeddingModel: 'm3e-large',
    chunkStrategy: '语义切片',
    maxChunkTokens: 512,
    overlapTokens: 64,
    docCount: 128,
    chunkCount: 3200,
    status: 'PROCESSING',
    createdAt: Date.now() - 86400000 * 5,
  },
];

const KnowledgePage: React.FC = () => {
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [searchDrawerOpen, setSearchDrawerOpen] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');

  return (
    <div>
      {/* 页面标题和操作 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={4} style={{ margin: 0 }}>知识库管理</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateModalOpen(true)}>
          创建知识库
        </Button>
      </div>

      {/* 搜索 */}
      <div style={{ marginBottom: 24 }}>
        <SearchBar
          placeholder="搜索知识库名称"
          value={searchKeyword}
          onChange={setSearchKeyword}
          style={{ width: 300 }}
        />
      </div>

      {/* 知识库卡片列表 */}
      <Row gutter={[16, 16]}>
        {mockKnowledgeBases.map((kb) => (
          <Col key={kb.kbId} xs={24} sm={12} lg={8} xl={6}>
            <Card
              hoverable
              style={{ height: '100%' }}
              styles={{ body: { display: 'flex', flexDirection: 'column', height: '100%' } }}
            >
              {/* 顶部：图标 + 名称 + 状态 */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 8,
                    background: '#E6F4FF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#1677FF',
                    fontSize: 20,
                  }}
                >
                  <FileTextOutlined />
                </div>
                <div style={{ flex: 1 }}>
                  <Text strong style={{ fontSize: 16 }}>{kb.name}</Text>
                </div>
                <StatusTag status={kb.status} />
              </div>

              {/* 配置信息 */}
              <div style={{ marginBottom: 12 }}>
                <Text type="secondary" style={{ fontSize: 13, display: 'block', marginBottom: 4 }}>
                  Embedding: {kb.embeddingModel}
                </Text>
                <Text type="secondary" style={{ fontSize: 13 }}>
                  切片策略: {kb.chunkStrategy}
                </Text>
              </div>

              {/* 统计信息 */}
              <div style={{ borderTop: '1px solid #F0F0F0', paddingTop: 12, marginTop: 'auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <Text type="secondary" style={{ fontSize: 12 }}>文档数: {kb.docCount}</Text>
                  <Text type="secondary" style={{ fontSize: 12 }}>切片数: {formatNumber(kb.chunkCount)}</Text>
                </div>
                <Space size={4}>
                  <Button type="link" size="small" icon={<FileTextOutlined />}>管理文档</Button>
                  <Button type="link" size="small" icon={<ExperimentOutlined />} onClick={() => setSearchDrawerOpen(true)}>
                    检索测试
                  </Button>
                </Space>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* 创建知识库弹窗 */}
      <Modal
        title="创建知识库"
        open={createModalOpen}
        onCancel={() => setCreateModalOpen(false)}
        width={600}
        onOk={() => {
          setCreateModalOpen(false);
        }}
      >
        <Form layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item label="知识库名称" required>
            <Input placeholder="请输入知识库名称" />
          </Form.Item>
          <Form.Item label="描述">
            <Input.TextArea rows={3} placeholder="知识库用途描述" />
          </Form.Item>
          <Form.Item label="Embedding 模型" required>
            <Select
              defaultValue="bge-large-zh-v1.5"
              options={[
                { value: 'bge-large-zh-v1.5', label: 'bge-large-zh-v1.5' },
                { value: 'm3e-large', label: 'm3e-large' },
                { value: 'text-embedding-3-large', label: 'text-embedding-3-large' },
              ]}
            />
          </Form.Item>
          <Form.Item label="切片策略" required>
            <Select
              defaultValue="语义切片"
              options={[
                { value: '语义切片', label: '语义切片' },
                { value: '章节切片', label: '章节切片' },
                { value: '代码切片', label: '代码切片' },
              ]}
            />
          </Form.Item>
          <Form.Item label="最大切片 Token 数" required>
            <InputNumber min={128} max={2048} defaultValue={512} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label="重叠窗口大小" required>
            <InputNumber min={0} max={256} defaultValue={64} style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>

      {/* 检索测试抽屉 */}
      <Drawer
        title="检索测试"
        placement="right"
        width={600}
        open={searchDrawerOpen}
        onClose={() => setSearchDrawerOpen(false)}
      >
        <Space direction="vertical" style={{ width: '100%' }} size={16}>
          <Input.Search
            placeholder="输入查询文本"
            enterButton="检索"
            size="large"
          />
          <div style={{ display: 'flex', gap: 12 }}>
            <Select placeholder="召回数量" defaultValue={10} style={{ width: 120 }} options={[{ value: 5, label: '5条' }, { value: 10, label: '10条' }, { value: 20, label: '20条' }]} />
            <Select placeholder="重排数量" defaultValue={5} style={{ width: 120 }} options={[{ value: 3, label: '3条' }, { value: 5, label: '5条' }, { value: 10, label: '10条' }]} />
          </div>
          <Divider />
          <Text type="secondary">请输入查询文本进行检索测试</Text>
        </Space>
      </Drawer>
    </div>
  );
};

export default KnowledgePage;
