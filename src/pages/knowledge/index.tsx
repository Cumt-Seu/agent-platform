// 知识库管理页面 — 使用 knowledgeService + FileUploader

import { Row, Col, Card, Button, Typography, Space, Select, Modal, Form, Input, InputNumber, Drawer, Divider } from 'antd';
import { PlusOutlined, ExperimentOutlined, FileTextOutlined, GitlabOutlined, GlobalOutlined } from '@ant-design/icons';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import StatusTag from '../../components/common/StatusTag';
import SearchBar from '../../components/common/SearchBar';
import { formatNumber } from '../../utils/format';
import { knowledgeService } from '../../services/knowledgeService';
import type { SearchResult } from '../../types';

const { Title, Text } = Typography;

const KnowledgePage: React.FC = () => {
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [searchDrawerOpen, setSearchDrawerOpen] = useState(false);
  const [gitlabModalOpen, setGitlabModalOpen] = useState(false);
  const [confluenceModalOpen, setConfluenceModalOpen] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedKb, setSelectedKb] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  const { data: knowledgeBases = [] } = useQuery({
    queryKey: ['knowledgeBases'],
    queryFn: () => knowledgeService.getKnowledgeBases(),
  });

  useQuery({
    queryKey: ['kbDocuments', selectedKb],
    queryFn: () => knowledgeService.getDocuments(selectedKb!),
    enabled: !!selectedKb,
  });

  const createMutation = useMutation({
    mutationFn: (params: Parameters<typeof knowledgeService.createKnowledgeBase>[0]) =>
      knowledgeService.createKnowledgeBase(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledgeBases'] });
      setCreateModalOpen(false);
      form.resetFields();
    },
  });

  const handleSearch = async () => {
    if (!selectedKb || !searchQuery.trim()) return;
    try {
      const results = await knowledgeService.query(selectedKb, searchQuery);
      setSearchResults(results);
    } catch {
      setSearchResults([]);
    }
  };

  const filteredKbs = knowledgeBases.filter((kb) =>
    !searchKeyword || kb.name.includes(searchKeyword)
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={4} style={{ margin: 0 }}>知识库管理</Title>
        <Space>
          <Button icon={<GitlabOutlined />} onClick={() => setGitlabModalOpen(true)}>GitLab 导入</Button>
          <Button icon={<GlobalOutlined />} onClick={() => setConfluenceModalOpen(true)}>Confluence 同步</Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateModalOpen(true)}>
            创建知识库
          </Button>
        </Space>
      </div>

      <div style={{ marginBottom: 24 }}>
        <SearchBar placeholder="搜索知识库名称" value={searchKeyword} onChange={setSearchKeyword} style={{ width: 300 }} />
      </div>

      <Row gutter={[16, 16]}>
        {filteredKbs.map((kb) => (
          <Col key={kb.kbId} xs={24} sm={12} lg={8} xl={6}>
            <Card
              hoverable
              style={{ height: '100%' }}
              styles={{ body: { display: 'flex', flexDirection: 'column', height: '100%' } }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 8, background: '#E6F4FF',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#1677FF', fontSize: 20,
                }}>
                  <FileTextOutlined />
                </div>
                <div style={{ flex: 1 }}>
                  <Text strong style={{ fontSize: 16 }}>{kb.name}</Text>
                </div>
                <StatusTag status={kb.status} />
              </div>

              <div style={{ marginBottom: 12 }}>
                <Text type="secondary" style={{ fontSize: 13, display: 'block', marginBottom: 4 }}>
                  Embedding: {kb.embeddingModel}
                </Text>
                <Text type="secondary" style={{ fontSize: 13 }}>切片策略: {kb.chunkStrategy}</Text>
              </div>

              <div style={{ borderTop: '1px solid #F0F0F0', paddingTop: 12, marginTop: 'auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <Text type="secondary" style={{ fontSize: 12 }}>文档数: {kb.docCount}</Text>
                  <Text type="secondary" style={{ fontSize: 12 }}>切片数: {formatNumber(kb.chunkCount)}</Text>
                </div>
                <Space size={4}>
                  <Button type="link" size="small" icon={<FileTextOutlined />} onClick={() => setSelectedKb(kb.kbId)}>
                    管理文档
                  </Button>
                  <Button type="link" size="small" icon={<ExperimentOutlined />} onClick={() => { setSelectedKb(kb.kbId); setSearchDrawerOpen(true); }}>
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
        onOk={() => form.submit()}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }} onFinish={(values) => createMutation.mutate(values)}>
          <Form.Item label="知识库名称" name="name" rules={[{ required: true }]}>
            <Input placeholder="请输入知识库名称" />
          </Form.Item>
          <Form.Item label="描述" name="description">
            <Input.TextArea rows={3} placeholder="知识库用途描述" />
          </Form.Item>
          <Form.Item label="Embedding 模型" name="embeddingModel" rules={[{ required: true }]} initialValue="bge-large-zh-v1.5">
            <Select options={[
              { value: 'bge-large-zh-v1.5', label: 'bge-large-zh-v1.5' },
              { value: 'm3e-large', label: 'm3e-large' },
              { value: 'text-embedding-3-large', label: 'text-embedding-3-large' },
            ]} />
          </Form.Item>
          <Form.Item label="切片策略" name="chunkStrategy" rules={[{ required: true }]} initialValue="语义切片">
            <Select options={[
              { value: '语义切片', label: '语义切片' },
              { value: '章节切片', label: '章节切片' },
              { value: '代码切片', label: '代码切片' },
            ]} />
          </Form.Item>
          <Form.Item label="最大切片 Token 数" name="maxChunkTokens" rules={[{ required: true }]} initialValue={512}>
            <InputNumber min={128} max={2048} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label="重叠窗口大小" name="overlapTokens" rules={[{ required: true }]} initialValue={64}>
            <InputNumber min={0} max={256} style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>

      {/* GitLab 导入弹窗 */}
      <Modal
        title="GitLab 仓库导入"
        open={gitlabModalOpen}
        onCancel={() => setGitlabModalOpen(false)}
        onOk={() => setGitlabModalOpen(false)}
      >
        <Form layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item label="GitLab URL" required><Input placeholder="https://gitlab.company.com" /></Form.Item>
          <Form.Item label="项目 ID" required><Input placeholder="项目 ID" /></Form.Item>
          <Form.Item label="分支" required><Input placeholder="main" /></Form.Item>
          <Form.Item label="Access Token"><Input.Password placeholder="GitLab Personal Access Token" /></Form.Item>
        </Form>
      </Modal>

      {/* Confluence 同步弹窗 */}
      <Modal
        title="Confluence 同步"
        open={confluenceModalOpen}
        onCancel={() => setConfluenceModalOpen(false)}
        onOk={() => setConfluenceModalOpen(false)}
      >
        <Form layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item label="Confluence URL" required><Input placeholder="https://wiki.company.com" /></Form.Item>
          <Form.Item label="Space Key" required><Input placeholder="空间标识" /></Form.Item>
          <Form.Item label="Access Token"><Input.Password placeholder="Confluence API Token" /></Form.Item>
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
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onSearch={handleSearch}
          />
          <div style={{ display: 'flex', gap: 12 }}>
            <Select placeholder="召回数量" defaultValue={10} style={{ width: 120 }} options={[{ value: 5, label: '5条' }, { value: 10, label: '10条' }, { value: 20, label: '20条' }]} />
            <Select placeholder="重排数量" defaultValue={5} style={{ width: 120 }} options={[{ value: 3, label: '3条' }, { value: 5, label: '5条' }, { value: 10, label: '10条' }]} />
          </div>
          <Divider />
          {searchResults.length > 0 ? (
            searchResults.map((result) => (
              <Card key={result.chunkId} size="small" style={{ marginBottom: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <Text strong style={{ fontSize: 13 }}>{result.title}</Text>
                  <Text type="secondary" style={{ fontSize: 12 }}>相似度: {(result.score * 100).toFixed(1)}%</Text>
                </div>
                <Text type="secondary" style={{ fontSize: 12 }}>{result.content.slice(0, 200)}...</Text>
              </Card>
            ))
          ) : (
            <Text type="secondary">请输入查询文本进行检索测试</Text>
          )}
        </Space>
      </Drawer>
    </div>
  );
};

export default KnowledgePage;
