// 效能度量页面

import { Row, Col, Card, Statistic, Typography, Radio, Space } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import { useState } from 'react';
import ReactECharts from 'echarts-for-react';
import { formatNumber } from '../../utils/format';

const { Title } = Typography;

// Mock KPI 数据
const mockKpi = {
  totalCalls: 12856,
  callTrend: 0.12,
  successRate: 0.968,
  successRateTrend: 0.005,
  avgDuration: 3200,
  avgDurationTrend: -0.3,
  tokenUsage: 2450000,
  tokenUsageTrend: 0.23,
};

// Mock 调用量趋势数据
const generateTrendData = () => {
  const days = 30;
  const labels = [];
  const codeGen = [];
  const codeReview = [];
  const faultDiag = [];
  const knowledgeQa = [];

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    labels.push(`${date.getMonth() + 1}/${date.getDate()}`);
    codeGen.push(Math.floor(Math.random() * 100 + 50));
    codeReview.push(Math.floor(Math.random() * 60 + 20));
    faultDiag.push(Math.floor(Math.random() * 30 + 10));
    knowledgeQa.push(Math.floor(Math.random() * 80 + 40));
  }

  return { labels, codeGen, codeReview, faultDiag, knowledgeQa };
};

const trendData = generateTrendData();

const MetricsPage: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'7' | '30'>('30');

  // 调用量趋势图表配置
  const callTrendOption = {
    tooltip: { trigger: 'axis' },
    legend: { data: ['代码生成', '代码评审', '故障排障', '知识问答'] },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { type: 'category', data: trendData.labels },
    yAxis: { type: 'value', name: '调用次数' },
    series: [
      { name: '代码生成', type: 'line', data: trendData.codeGen, smooth: true, itemStyle: { color: '#1677FF' } },
      { name: '代码评审', type: 'line', data: trendData.codeReview, smooth: true, itemStyle: { color: '#FF7A45' } },
      { name: '故障排障', type: 'line', data: trendData.faultDiag, smooth: true, itemStyle: { color: '#52C41A' } },
      { name: '知识问答', type: 'line', data: trendData.knowledgeQa, smooth: true, itemStyle: { color: '#722ED1' } },
    ],
  };

  // 技能调用分布饼图配置
  const pieOption = {
    tooltip: { trigger: 'item' },
    legend: { bottom: 0 },
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      data: [
        { value: 489, name: '代码生成', itemStyle: { color: '#1677FF' } },
        { value: 234, name: '代码评审', itemStyle: { color: '#FF7A45' } },
        { value: 156, name: '故障排障', itemStyle: { color: '#52C41A' } },
        { value: 378, name: '知识问答', itemStyle: { color: '#722ED1' } },
      ],
      label: { formatter: '{b}: {d}%' },
    }],
  };

  // 评审质量趋势柱状图配置
  const reviewQualityOption = {
    tooltip: { trigger: 'axis' },
    legend: { data: ['BLOCKER', 'MAJOR', 'MINOR', 'INFO'] },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { type: 'category', data: trendData.labels.slice(-7) },
    yAxis: { type: 'value', name: '问题数量' },
    series: [
      { name: 'BLOCKER', type: 'bar', stack: 'total', data: [2, 1, 3, 0, 2, 1, 1], itemStyle: { color: '#FF4D4F' } },
      { name: 'MAJOR', type: 'bar', stack: 'total', data: [5, 3, 4, 6, 3, 5, 4], itemStyle: { color: '#FF7A45' } },
      { name: 'MINOR', type: 'bar', stack: 'total', data: [8, 6, 7, 9, 5, 8, 6], itemStyle: { color: '#FAAD14' } },
      { name: 'INFO', type: 'bar', stack: 'total', data: [3, 2, 4, 3, 2, 3, 2], itemStyle: { color: '#1677FF' } },
    ],
  };

  // Token 消耗趋势面积图配置
  const tokenUsageOption = {
    tooltip: { trigger: 'axis' },
    legend: { data: ['Qwen2.5-72B', 'GPT-4o'] },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { type: 'category', data: trendData.labels },
    yAxis: { type: 'value', name: 'Token 数量' },
    series: [
      {
        name: 'Qwen2.5-72B',
        type: 'line',
        stack: 'total',
        areaStyle: { opacity: 0.3 },
        data: trendData.labels.map(() => Math.floor(Math.random() * 50000 + 30000)),
        itemStyle: { color: '#1677FF' },
      },
      {
        name: 'GPT-4o',
        type: 'line',
        stack: 'total',
        areaStyle: { opacity: 0.3 },
        data: trendData.labels.map(() => Math.floor(Math.random() * 20000 + 10000)),
        itemStyle: { color: '#722ED1' },
      },
    ],
  };

  return (
    <div>
      {/* 页面标题和时间范围选择 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={4} style={{ margin: 0 }}>效能度量</Title>
        <Space>
          <Radio.Group
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            options={[
              { value: '7', label: '最近7天' },
              { value: '30', label: '最近30天' },
            ]}
            optionType="button"
          />
        </Space>
      </div>

      {/* KPI 指标卡片 */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card style={{ borderRadius: 8 }}>
            <Statistic
              title="Agent 调用总量"
              value={mockKpi.totalCalls}
              formatter={(val) => formatNumber(val as number)}
              valueStyle={{ color: '#1677FF' }}
              prefix={mockKpi.callTrend > 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
              suffix={
                <span style={{ fontSize: 14, color: mockKpi.callTrend > 0 ? '#52C41A' : '#FF4D4F' }}>
                  {mockKpi.callTrend > 0 ? '↑' : '↓'}{Math.abs(mockKpi.callTrend * 100).toFixed(0)}%
                </span>
              }
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card style={{ borderRadius: 8 }}>
            <Statistic
              title="成功率"
              value={mockKpi.successRate * 100}
              precision={1}
              suffix="%"
              valueStyle={{ color: '#52C41A' }}
              prefix={mockKpi.successRateTrend > 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card style={{ borderRadius: 8 }}>
            <Statistic
              title="平均耗时"
              value={mockKpi.avgDuration}
              suffix="ms"
              valueStyle={{ color: mockKpi.avgDurationTrend < 0 ? '#52C41A' : '#FF4D4F' }}
              prefix={mockKpi.avgDurationTrend < 0 ? <ArrowDownOutlined /> : <ArrowUpOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card style={{ borderRadius: 8 }}>
            <Statistic
              title="Token 消耗"
              value={mockKpi.tokenUsage}
              formatter={(val) => formatNumber(val as number)}
              valueStyle={{ color: '#FF7A45' }}
              prefix={<ArrowUpOutlined />}
              suffix={
                <span style={{ fontSize: 14, color: '#FF7A45' }}>
                  ↑{(mockKpi.tokenUsageTrend * 100).toFixed(0)}%
                </span>
              }
            />
          </Card>
        </Col>
      </Row>

      {/* 图表区域 */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={16}>
          <Card title="调用量趋势" style={{ borderRadius: 8 }}>
            <ReactECharts option={callTrendOption} style={{ height: 300 }} />
          </Card>
        </Col>
        <Col span={8}>
          <Card title="技能调用分布" style={{ borderRadius: 8 }}>
            <ReactECharts option={pieOption} style={{ height: 300 }} />
          </Card>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={12}>
          <Card title="评审质量趋势" style={{ borderRadius: 8 }}>
            <ReactECharts option={reviewQualityOption} style={{ height: 300 }} />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="Token 消耗趋势" style={{ borderRadius: 8 }}>
            <ReactECharts option={tokenUsageOption} style={{ height: 300 }} />
          </Card>
        </Col>
      </Row>

      {/* RAG 检索性能 */}
      <Row gutter={16}>
        <Col span={12}>
          <Card title="检索延迟 P99" style={{ borderRadius: 8 }}>
            <ReactECharts
              option={{
                tooltip: { trigger: 'axis' },
                grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
                xAxis: { type: 'category', data: trendData.labels.slice(-7) },
                yAxis: { type: 'value', name: '延迟 (ms)' },
                series: [{
                  type: 'line',
                  data: [320, 280, 450, 380, 290, 310, 350],
                  itemStyle: { color: '#1677FF' },
                  markLine: { data: [{ yAxis: 500, lineStyle: { color: '#FF4D4F', type: 'dashed' }, label: { formatter: 'SLA 500ms' } }] },
                }],
              }}
              style={{ height: 250 }}
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="检索准确率" style={{ borderRadius: 8 }}>
            <ReactECharts
              option={{
                tooltip: { trigger: 'axis' },
                grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
                xAxis: { type: 'category', data: trendData.labels.slice(-7) },
                yAxis: { type: 'value', name: '准确率 (%)', min: 70, max: 100 },
                series: [{
                  type: 'line',
                  data: [88, 90, 85, 92, 89, 91, 87],
                  itemStyle: { color: '#52C41A' },
                  markLine: { data: [{ yAxis: 80, lineStyle: { color: '#FF4D4F', type: 'dashed' }, label: { formatter: '最低 80%' } }] },
                }],
              }}
              style={{ height: 250 }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default MetricsPage;
