// 格式化工具函数

/**
 * 千分位格式化数字
 */
export function formatNumber(num: number): string {
  return num.toLocaleString('zh-CN');
}

/**
 * 格式化耗时
 */
export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${(ms / 60000).toFixed(1)}min`;
}

/**
 * 格式化百分比
 */
export function formatPercent(value: number, decimals = 1): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

/**
 * 格式化 Token 数量
 */
export function formatTokens(count: number): string {
  if (count < 1000) return `${count}`;
  if (count < 1000000) return `${(count / 1000).toFixed(1)}K`;
  return `${(count / 1000000).toFixed(2)}M`;
}

/**
 * 相对时间格式化
 */
export function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return '刚刚';
  if (minutes < 60) return `${minutes}分钟前`;
  if (hours < 24) return `${hours}小时前`;
  if (days < 7) return `${days}天前`;
  return new Date(timestamp).toLocaleDateString('zh-CN');
}

/**
 * 截断文本
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

/**
 * 时间分组（今天/昨天/7天内/更早）
 */
export function groupByTime<T extends { lastActiveAt?: number; createdAt?: number }>(
  items: T[],
  timeField: 'lastActiveAt' | 'createdAt' = 'createdAt'
): { label: string; items: T[] }[] {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const yesterday = today - 86400000;
  const weekAgo = today - 7 * 86400000;

  const groups: { label: string; items: T[] }[] = [
    { label: '今天', items: [] },
    { label: '昨天', items: [] },
    { label: '7天内', items: [] },
    { label: '更早', items: [] },
  ];

  items.forEach((item) => {
    const time = item[timeField] ?? 0;
    if (time >= today) groups[0].items.push(item);
    else if (time >= yesterday) groups[1].items.push(item);
    else if (time >= weekAgo) groups[2].items.push(item);
    else groups[3].items.push(item);
  });

  return groups.filter((g) => g.items.length > 0);
}

/**
 * 质量评分颜色
 */
export function getScoreColor(score: number): string {
  if (score >= 80) return '#52C41A';
  if (score >= 60) return '#FAAD14';
  return '#FF4D4F';
}

/**
 * 置信度颜色
 */
export function getConfidenceColor(confidence: number): string {
  if (confidence > 0.8) return '#FF4D4F';
  if (confidence > 0.5) return '#FF7A45';
  return '#FAAD14';
}
