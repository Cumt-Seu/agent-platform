// MetricChart — ECharts 通用封装

import ReactECharts from 'echarts-for-react';

type ChartType = 'line' | 'bar' | 'pie' | 'area';

interface MetricChartProps {
  type: ChartType;
  title?: string;
  data: Record<string, unknown>;
  height?: number;
  loading?: boolean;
}

const MetricChart: React.FC<MetricChartProps> = ({
  type,
  title,
  data,
  height = 300,
  loading = false,
}) => {
  const option = buildOption(type, title, data);

  return (
    <ReactECharts
      option={option}
      style={{ height }}
      showLoading={loading}
      opts={{ renderer: 'canvas' }}
    />
  );
};

function buildOption(type: ChartType, title: string | undefined, data: Record<string, unknown>) {
  const baseOption: Record<string, unknown> = {
    tooltip: { trigger: type === 'pie' ? 'item' : 'axis' },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
  };

  if (title) {
    baseOption.title = { text: title, left: 'center', textStyle: { fontSize: 14 } };
  }

  switch (type) {
    case 'pie':
      return {
        ...baseOption,
        legend: { bottom: 0 },
        series: [{
          type: 'pie',
          radius: ['40%', '70%'],
          data: data.series || [],
          label: { formatter: '{b}: {d}%' },
        }],
      };

    case 'area':
      return {
        ...baseOption,
        legend: { data: (data.seriesNames as string[]) || [] },
        xAxis: { type: 'category', data: data.labels || [] },
        yAxis: { type: 'value' },
        series: ((data.series as Array<Record<string, unknown>>) || []).map((s) => ({
          ...s,
          type: 'line',
          areaStyle: { opacity: 0.3 },
          smooth: true,
        })),
      };

    case 'bar':
      return {
        ...baseOption,
        legend: { data: (data.seriesNames as string[]) || [] },
        xAxis: { type: 'category', data: data.labels || [] },
        yAxis: { type: 'value' },
        series: ((data.series as Array<Record<string, unknown>>) || []).map((s) => ({
          ...s,
          type: 'bar',
        })),
      };

    case 'line':
    default:
      return {
        ...baseOption,
        legend: { data: (data.seriesNames as string[]) || [] },
        xAxis: { type: 'category', data: data.labels || [] },
        yAxis: { type: 'value' },
        series: ((data.series as Array<Record<string, unknown>>) || []).map((s) => ({
          ...s,
          type: 'line',
          smooth: true,
        })),
      };
  }
}

export default MetricChart;
