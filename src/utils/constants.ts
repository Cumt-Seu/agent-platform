// 常量定义

// API 基础路径
export const API_BASE_URL = '/api/v1';

// 侧边栏宽度
export const SIDEBAR_WIDTH_EXPANDED = 200;
export const SIDEBAR_WIDTH_COLLAPSED = 64;

// 顶部栏高度
export const HEADER_HEIGHT = 56;

// 底部状态栏高度
export const STATUS_BAR_HEIGHT = 32;

// 内容区内边距
export const CONTENT_PADDING = 24;

// 评审严重度颜色
export const SEVERITY_COLORS = {
  BLOCKER: '#FF4D4F',
  MAJOR: '#FF7A45',
  MINOR: '#FAAD14',
  INFO: '#1677FF',
} as const;

// 技能分类颜色
export const SKILL_CATEGORY_COLORS = {
  CODE_GEN: '#1677FF',
  CODE_REVIEW: '#FF7A45',
  FAULT_DIAG: '#FF4D4F',
  KNOWLEDGE_QA: '#52C41A',
} as const;

// 状态颜色
export const STATUS_COLORS = {
  SUCCESS: '#52C41A',
  WARNING: '#FAAD14',
  ERROR: '#FF4D4F',
  INFO: '#1677FF',
  PROCESSING: '#1677FF',
  PENDING: '#8C8C8C',
} as const;

// 文件类型图标映射
export const FILE_TYPE_ICONS: Record<string, string> = {
  PDF: 'file-pdf',
  Word: 'file-word',
  MD: 'file-markdown',
  Confluence: 'file-text',
  java: 'code',
  py: 'code',
  js: 'code',
  ts: 'code',
  xml: 'code',
  json: 'code',
  yaml: 'code',
  yml: 'code',
};

// 支持上传的文件类型
export const SUPPORTED_FILE_TYPES = [
  '.java', '.py', '.xml', '.log', '.json', '.yaml', '.yml', '.md', '.txt'
];

// 最大文件大小 (10MB)
export const MAX_FILE_SIZE = 10 * 1024 * 1024;

// 最大附件数量
export const MAX_ATTACHMENTS = 5;

// Token 警告阈值
export const TOKEN_WARNING_THRESHOLD = 0.8;

// 代码块折叠行数阈值
export const CODE_FOLD_THRESHOLD = 50;

// 默认显示代码行数
export const CODE_PREVIEW_LINES = 10;
