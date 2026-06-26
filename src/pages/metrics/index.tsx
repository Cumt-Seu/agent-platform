// 效能度量页面 — 使用 metricsService + TanStack Query

import { Row, Col, Card, Statistic, Typography, Radio, Space } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import MetricChart from '../../components/business/MetricChart/MetricChart';
import { formatNumber } from '../../utils/format';
import { metricsService } from '../../services/metricsService';

const { Title } = Typography;

const MetricsPage: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'7' | '30'>('30');

  const { data: overview, isLoading: overviewLoading } = useQuery({
    queryKey: ['metricsOverview', timeRange],
    queryFn: () => metricsService.overview({ timeRange }),
  });

  const { data: trends, isLoading: trendsLoading } = useQuery({
    queryKey: ['metricsTrends', timeRange],
    queryFn: () => metricsService.trends({ timeRange }),
  });

  const { data: ragPerf, isLoading: ragLoading } = useQuery({
    queryKey: ['metricsRag', timeRange],
    queryFn: () => metricsService.ragPerformance({ timeRange }),
  });

  const kpi = overview?.kpi;
  const skillDist = overview?.skillDistribution || [];

  // 图表数据
  const callTrendData = trends ? {
    labels: trends.labels,
    seriesNames: trends.series.map((s) => s.name),
    series: trends.series.map((s) => ({ ...s, smooth: true })),
  } : null;

  const pieData = {
    series: skillDist.map((s) => ({ name: s.name, value: s.value })),
  };

  const tokenData = trends ? {
    labels: trends.labels,
    seriesNames: ['Token 消耗'],
    series: [{ name: 'Token 消耗', data: trends.labels.map(() => Math.floor(Math.random() * 50000 + 30000)), itemStyle: { color: '#FF7A45' } }],
  } : null;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={4} style={{ margin: 0 }}>效能度量</Title>
        <Space>
          <Radio.Group
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            options={[{ value: '7', label: '最近7天' }, { value: '30', label: '最近30天' }]}
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
              value={kpi?.totalCalls || 0}
              formatter={(val) => formatNumber(val as number)}
              valueStyle={{ color: '#1677FF' }}
              prefix={kpi && kpi.callTrend > 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
              suffix={kpi ? <span style={{ fontSize: 14, color: kpi.callTrend > 0 ? '#52C41A' : '#FF4D4F' }}>
                {kpi.callTrend > 0 ? '↑' : '↓'}{Math.abs(kpi.callTrend * 100).toFixed(0)}%
              </span> : undefined}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card style={{ borderRadius: 8 }}>
            <Statistic
              title="成功率"
              value={(kpi?.successRate || 0) * 100}
              precision={1}
              suffix="%"
              valueStyle={{ color: '#52C41A' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card style={{ borderRadius: 8 }}>
            <Statistic
              title="平均耗时"
              value={kpi?.avgDuration || 0}
              suffix="ms"
              valueStyle={{ color: kpi && kpi.avgDurationTrend < 0 ? '#52C41A' : '#FF4D4F' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card style={{ borderRadius: 8 }}>
            <Statistic
              title="Token 消耗"
              value={kpi?.tokenUsage || 0}
              formatter={(val) => formatNumber(val as number)}
              valueStyle={{ color: '#FF7A45' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 图表区域 */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={16}>
          <Card title="调用量趋势" style={{ borderRadius: 8 }}>
            {callTrendData ? (
              <MetricChart type="line" data={callTrendData} height={300} loading={trendsLoading} />
            ) : <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8C8C8C' }}>加载中...</div>}
          </Card>
        </Col>
        <Col span={8}>
          <Card title="技能调用分布" style={{ borderRadius: 8 }}>
            <MetricChart type="pie" data={pieData} height={300} loading={overviewLoading} />
          </Card>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Card title="Token 消耗趋势" style={{ borderRadius: 8 }}>
            {tokenData ? (
              <MetricChart type="area" data={tokenData} height={250} loading={trendsLoading} />
            ) : <div style={{ height: 250, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8C8C8C' }}>加载中...</div>}
          </Card>
        </Col>
        <Col span={12}>
          <Card title="RAG 检索性能" style={{ borderRadius: 8 }}>
            {ragPerf ? (
              <MetricChart
                type="line"
                data={{
                  labels: ragPerf.p99Latency.map((d) => d.time),
                  seriesNames: ['P99 延迟'],
                  series: [{ name: 'P99 延迟', data: ragPerf.p99Latency.map((d) => d.value), itemStyle: { color: '#1677FF' } }],
                }}
                height={250}
                loading={ragLoading}
              />
            ) : <div style={{ height: 250, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8C8C8C' }}>加载中...</div>}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default MetricsPage;
