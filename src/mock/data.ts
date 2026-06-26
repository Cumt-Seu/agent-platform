// 集中式 Mock 数据 — 后端不可用时自动 fallback

import type {
  Session, ChatMessage, DagPlan,
  SkillDefinition, SkillStats, SkillCallLog,
  KnowledgeBase, KbDocument, SearchResult,
  ReviewTask, ReviewIssue,
  DiagnosisTask, DiagnosisResult, DiagnosisStep,
  FinetuneTask, Dataset, TrainingLog,
  KpiData, TrendData, SkillDistribution, RagPerformance,
  ModelConfig, User, CodeTemplate, McpTool, NotifyConfig, Notification,
} from '../types';

const now = Date.now();
const day = 86400000;

// ──────────────────── Agent / Chat ────────────────────

export const mockSessions: Session[] = [
  { sessionId: 's1', title: '如何实现用户认证模块', createdAt: now - day * 5, lastActiveAt: now - 60000, lastMessageSummary: '我建议使用 JWT + Refresh Token 方案...', pinned: true },
  { sessionId: 's2', title: '订单服务 OOM 问题排查', createdAt: now - day * 3, lastActiveAt: now - 3600000, lastMessageSummary: '根据堆栈分析，问题出在批量查询未分页...', pinned: true },
  { sessionId: 's3', title: 'Spring Boot 3.2 升级指南', createdAt: now - day * 2, lastActiveAt: now - day, lastMessageSummary: '主要变更点包括：1. Jakarta 命名空间迁移...', pinned: false },
  { sessionId: 's4', title: 'Redis 缓存穿透解决方案', createdAt: now - day, lastActiveAt: now - 7200000, lastMessageSummary: '可以采用布隆过滤器 + 缓存空值的双重策略...', pinned: false },
  { sessionId: 's5', title: '微服务链路追踪配置', createdAt: now - 3600000 * 6, lastActiveAt: now - 7200000, lastMessageSummary: '推荐使用 OpenTelemetry + Jaeger 方案...', pinned: false },
  { sessionId: 's6', title: 'K8s HPA 自动扩缩容', createdAt: now - 7200000, lastActiveAt: now - 1800000, lastMessageSummary: '建议基于 CPU + 自定义指标进行扩缩容...', pinned: false },
];

export const mockMessages: Record<string, ChatMessage[]> = {
  s1: [
    {
      id: 'm1', sessionId: 's1', type: 'user', content: '如何实现一个安全的用户认证模块？', timestamp: now - 300000,
    },
    {
      id: 'm2', sessionId: 's1', type: 'thinking', content: '', timestamp: now - 295000,
      thinkingInfo: { thinkingContent: '用户询问认证模块实现，需要考虑安全性最佳实践。应该涵盖 JWT、密码存储、会话管理等方面。', duration: 2500, isCollapsed: true },
    },
    {
      id: 'm3', sessionId: 's1', type: 'assistant', content: '我建议使用 **JWT + Refresh Token** 方案来实现用户认证模块，以下是核心设计要点：\n\n### 1. 认证流程\n- 用户登录 → 验证密码 → 签发 Access Token（短有效期 15min）+ Refresh Token（长有效期 7d）\n- Access Token 过期后用 Refresh Token 静默刷新\n- Refresh Token 过期需重新登录\n\n### 2. 密码存储\n- 使用 BCrypt 算法（默认 cost=10）\n- 绝不存储明文密码\n\n### 3. 安全加固\n- 所有 Token 通过 HttpOnly Cookie 传递（防 XSS）\n- Refresh Token 绑定设备指纹\n- 登录失败次数限制 + 验证码\n- CSRF Token 保护', timestamp: now - 290000,
      metadata: { tokens: 256, durationMs: 3200, model: 'qwen2.5-72b' },
    },
    {
      id: 'm4', sessionId: 's1', type: 'tool_call', content: '', timestamp: now - 280000,
      toolCalls: [{
        skillName: '代码生成', params: { language: 'java', module: 'auth' }, status: 'success', duration: 4500, result: '已生成认证模块代码',
      }],
    },
    {
      id: 'm5', sessionId: 's1', type: 'assistant', content: '```java\n@RestController\n@RequestMapping("/api/v1/auth")\npublic class AuthController {\n\n    @PostMapping("/login")\n    public ResponseEntity<LoginResult> login(@RequestBody LoginRequest req) {\n        // 验证密码\n        User user = userService.findByUsername(req.getUsername());\n        if (!passwordEncoder.matches(req.getPassword(), user.getPassword())) {\n            throw new AuthException("用户名或密码错误");\n        }\n        // 签发 Token\n        String accessToken = jwtService.generateAccessToken(user);\n        String refreshToken = jwtService.generateRefreshToken(user);\n        return ResponseEntity.ok(new LoginResult(accessToken, refreshToken));\n    }\n}\n```\n\n以上是核心登录接口的代码实现。', timestamp: now - 275000,
      codeBlocks: [{ language: 'java', code: '@RestController\n@RequestMapping("/api/v1/auth")\npublic class AuthController {\n\n    @PostMapping("/login")\n    public ResponseEntity<LoginResult> login(@RequestBody LoginRequest req) {\n        User user = userService.findByUsername(req.getUsername());\n        if (!passwordEncoder.matches(req.getPassword(), user.getPassword())) {\n            throw new AuthException("用户名或密码错误");\n        }\n        String accessToken = jwtService.generateAccessToken(user);\n        String refreshToken = jwtService.generateRefreshToken(user);\n        return ResponseEntity.ok(new LoginResult(accessToken, refreshToken));\n    }\n}', filePath: 'AuthController.java' }],
    },
  ],
  s2: [
    {
      id: 'm10', sessionId: 's2', type: 'user', content: '订单服务频繁出现 OOM，帮忙排查一下', timestamp: now - 600000,
    },
    {
      id: 'm11', sessionId: 's2', type: 'assistant', content: '根据堆栈分析，问题出在**批量查询未分页**。`OrderService.batchQuery()` 方法一次性加载全部订单数据到内存，当数据量超过 50 万条时触发 OOM。\n\n建议修复方案：\n1. 增加分页参数，每页不超过 1000 条\n2. 使用流式查询（MyBatis Cursor）替代一次性加载\n3. 增加 JVM 堆内存监控告警', timestamp: now - 590000,
    },
  ],
};

export const mockDagPlan: DagPlan = {
  nodes: [
    { id: 'n1', label: '需求分析', status: 'SUCCESS', skillName: 'knowledge_qa' },
    { id: 'n2', label: '代码生成', status: 'SUCCESS', skillName: 'code_generation' },
    { id: 'n3', label: '代码审查', status: 'running', skillName: 'code_review' },
    { id: 'n4', label: '故障诊断', status: 'PENDING', skillName: 'fault_diagnosis' },
    { id: 'n5', label: '测试用例', status: 'PENDING', skillName: 'code_generation' },
  ],
  edges: [
    { id: 'e1', source: 'n1', target: 'n2', type: 'FIXED' },
    { id: 'e2', source: 'n2', target: 'n3', type: 'FIXED' },
    { id: 'e3', source: 'n3', target: 'n4', type: 'CONDITIONAL', condition: 'has_issue' },
    { id: 'e4', source: 'n3', target: 'n5', type: 'SEND' },
  ],
};

// ──────────────────── Skill ────────────────────

export const mockSkills: SkillDefinition[] = [
  {
    skillId: 'code-gen', name: '代码生成', version: '2.1.0', category: 'CODE_GEN', status: 'ACTIVE',
    description: '基于需求描述自动生成代码，支持 Java、Python、Go 等主流语言', endpoint: '/api/v1/skills/code-gen/invoke',
    executionMode: 'ASYNC', authType: 'none',
    inputSchema: { type: 'object', properties: { language: { type: 'string' }, requirement: { type: 'string' } } },
    outputSchema: { type: 'object', properties: { code: { type: 'string' }, filePath: { type: 'string' } } },
    createdAt: now - day * 30, createdBy: 'admin',
  },
  {
    skillId: 'code-review', name: '代码审查', version: '1.8.0', category: 'CODE_REVIEW', status: 'ACTIVE',
    description: '对代码变更进行多维度审查，包括编码规范、安全漏洞、性能隐患等', endpoint: '/api/v1/skills/code-review/invoke',
    executionMode: 'ASYNC', authType: 'none',
    inputSchema: { type: 'object', properties: { diff: { type: 'string' }, dimensions: { type: 'array' } } },
    outputSchema: { type: 'object', properties: { issues: { type: 'array' }, score: { type: 'number' } } },
    createdAt: now - day * 25, createdBy: 'admin',
  },
  {
    skillId: 'fault-diag', name: '故障诊断', version: '1.5.0', category: 'FAULT_DIAG', status: 'ACTIVE',
    description: '基于异常日志和监控数据自动分析故障根因，提供修复建议', endpoint: '/api/v1/skills/fault-diag/invoke',
    executionMode: 'ASYNC', authType: 'none',
    inputSchema: { type: 'object', properties: { exceptionLog: { type: 'string' }, serviceName: { type: 'string' } } },
    outputSchema: { type: 'object', properties: { rootCauses: { type: 'array' }, solutions: { type: 'array' } } },
    createdAt: now - day * 20, createdBy: 'admin',
  },
  {
    skillId: 'knowledge-qa', name: '知识库问答', version: '1.3.0', category: 'KNOWLEDGE_QA', status: 'ACTIVE',
    description: '基于企业知识库进行 RAG 检索增强问答，支持规范、架构、接口等文档', endpoint: '/api/v1/skills/knowledge-qa/invoke',
    executionMode: 'SYNC', authType: 'api_key',
    inputSchema: { type: 'object', properties: { query: { type: 'string' }, kbIds: { type: 'array' } } },
    outputSchema: { type: 'object', properties: { answer: { type: 'string' }, sources: { type: 'array' } } },
    createdAt: now - day * 15, createdBy: 'admin',
  },
  {
    skillId: 'unit-test', name: '单元测试生成', version: '1.1.0', category: 'CODE_GEN', status: 'ACTIVE',
    description: '根据代码结构自动生成单元测试用例，覆盖核心逻辑分支', endpoint: '/api/v1/skills/unit-test/invoke',
    executionMode: 'ASYNC', authType: 'none',
    inputSchema: { type: 'object', properties: { sourceCode: { type: 'string' }, framework: { type: 'string' } } },
    outputSchema: { type: 'object', properties: { testCode: { type: 'string' }, coverage: { type: 'number' } } },
    createdAt: now - day * 10, createdBy: 'lisi',
  },
  {
    skillId: 'api-doc', name: '接口文档生成', version: '0.9.0', category: 'CODE_GEN', status: 'DISABLED',
    description: '根据代码注解自动生成 OpenAPI 接口文档，已暂停维护', endpoint: '/api/v1/skills/api-doc/invoke',
    executionMode: 'SYNC', authType: 'none',
    inputSchema: { type: 'object', properties: { sourcePath: { type: 'string' } } },
    outputSchema: { type: 'object', properties: { openapi: { type: 'object' } } },
    createdAt: now - day * 40, createdBy: 'zhangsan',
  },
];

export const mockSkillStats: Record<string, SkillStats> = {
  'code-gen': { todayCalls: 128, avgDuration: 3200, successRate: 0.96 },
  'code-review': { todayCalls: 67, avgDuration: 8500, successRate: 0.92 },
  'fault-diag': { todayCalls: 23, avgDuration: 12000, successRate: 0.88 },
  'knowledge-qa': { todayCalls: 256, avgDuration: 1800, successRate: 0.95 },
  'unit-test': { todayCalls: 45, avgDuration: 5600, successRate: 0.91 },
  'api-doc': { todayCalls: 0, avgDuration: 0, successRate: 0 },
};

export const mockSkillLogs: SkillCallLog[] = [
  { logId: 'log1', skillId: 'code-gen', caller: '张三', paramsSummary: '生成 UserController', status: 'SUCCESS', durationMs: 2800, calledAt: now - 300000 },
  { logId: 'log2', skillId: 'code-gen', caller: '李四', paramsSummary: '生成 OrderService', status: 'SUCCESS', durationMs: 3500, calledAt: now - 600000 },
  { logId: 'log3', skillId: 'code-review', caller: '王五', paramsSummary: '审查 MR #142', status: 'SUCCESS', durationMs: 9200, calledAt: now - 900000 },
  { logId: 'log4', skillId: 'fault-diag', caller: 'admin', paramsSummary: '诊断 OOM 异常', status: 'FAILED', durationMs: 15000, calledAt: now - 1200000 },
  { logId: 'log5', skillId: 'knowledge-qa', caller: '张三', paramsSummary: '查询部署规范', status: 'SUCCESS', durationMs: 1200, calledAt: now - 1500000 },
  { logId: 'log6', skillId: 'code-gen', caller: '李四', paramsSummary: '生成 PaymentService', status: 'TIMEOUT', durationMs: 30000, calledAt: now - 1800000 },
];

// ──────────────────── Knowledge ────────────────────

export const mockKnowledgeBases: KnowledgeBase[] = [
  { kbId: 'kb1', name: 'Java 编码规范', description: '阿里巴巴 Java 开发手册及团队扩展规范', embeddingModel: 'bge-large-zh-v1.5', chunkStrategy: '语义切片', maxChunkTokens: 512, overlapTokens: 64, docCount: 12, chunkCount: 342, status: 'ACTIVE', createdAt: now - day * 60 },
  { kbId: 'kb2', name: '微服务架构设计', description: 'Spring Cloud 微服务架构设计文档与最佳实践', embeddingModel: 'bge-large-zh-v1.5', chunkStrategy: '章节切片', maxChunkTokens: 1024, overlapTokens: 128, docCount: 8, chunkCount: 215, status: 'ACTIVE', createdAt: now - day * 45 },
  { kbId: 'kb3', name: '接口规范', description: 'RESTful API 设计规范与接口文档模板', embeddingModel: 'm3e-large', chunkStrategy: '语义切片', maxChunkTokens: 512, overlapTokens: 64, docCount: 5, chunkCount: 98, status: 'ACTIVE', createdAt: now - day * 30 },
  { kbId: 'kb4', name: '故障案例库', description: '历史故障排查案例与解决方案知识库', embeddingModel: 'bge-large-zh-v1.5', chunkStrategy: '代码切片', maxChunkTokens: 256, overlapTokens: 32, docCount: 15, chunkCount: 456, status: 'PROCESSING', createdAt: now - day * 2 },
  { kbId: 'kb5', name: 'DevOps 运维手册', description: 'K8s/Docker/CI-CD 运维操作手册', embeddingModel: 'text-embedding-3-large', chunkStrategy: '章节切片', maxChunkTokens: 1024, overlapTokens: 128, docCount: 3, chunkCount: 67, status: 'ACTIVE', createdAt: now - day * 15 },
];

export const mockKbDocuments: Record<string, KbDocument[]> = {
  kb1: [
    { docId: 'd1', kbId: 'kb1', title: 'Java编程规约.pdf', docType: '规范', format: 'PDF', chunkCount: 45, status: 'COMPLETED', uploadedAt: now - day * 55 },
    { docId: 'd2', kbId: 'kb1', title: '异常处理规范.md', docType: '规范', format: 'MD', chunkCount: 23, status: 'COMPLETED', uploadedAt: now - day * 50 },
    { docId: 'd3', kbId: 'kb1', title: '日志规范.docx', docType: '规范', format: 'Word', chunkCount: 18, status: 'COMPLETED', uploadedAt: now - day * 40 },
    { docId: 'd4', kbId: 'kb1', title: 'MySQL规约.pdf', docType: '规范', format: 'PDF', chunkCount: 34, status: 'COMPLETED', uploadedAt: now - day * 30 },
    { docId: 'd5', kbId: 'kb1', title: '安全编码指南.md', docType: '规范', format: 'MD', chunkCount: 28, status: 'PROCESSING', uploadedAt: now - 3600000 },
  ],
  kb2: [
    { docId: 'd10', kbId: 'kb2', title: '服务拆分原则.md', docType: '架构', format: 'MD', chunkCount: 32, status: 'COMPLETED', uploadedAt: now - day * 44 },
    { docId: 'd11', kbId: 'kb2', title: '网关设计.md', docType: '架构', format: 'MD', chunkCount: 25, status: 'COMPLETED', uploadedAt: now - day * 35 },
    { docId: 'd12', kbId: 'kb2', title: '分布式事务方案.pdf', docType: '架构', format: 'PDF', chunkCount: 41, status: 'COMPLETED', uploadedAt: now - day * 20 },
  ],
};

export const mockSearchResults: SearchResult[] = [
  { chunkId: 'c1', score: 0.92, title: 'Java编程规约.pdf', content: '所有的 POJO 类必须使用包装数据类型。RPC 方法的返回值和参数必须使用包装数据类型。所有的局部变量使用基本数据类型。', source: 'kb1/d1' },
  { chunkId: 'c2', score: 0.87, title: '异常处理规范.md', content: '不要捕获异常后不处理，也不要在 finally 块中 return。事务场景中，异常必须通过 throw 回滚。', source: 'kb1/d2' },
  { chunkId: 'c3', score: 0.81, title: '日志规范.docx', content: '应用中不可直接使用日志系统（Log4j、Logback）中的 API，而应依赖使用日志框架 SLF4J 中的 API。', source: 'kb1/d3' },
];

// ──────────────────── Review ────────────────────

export const mockReviewTasks: ReviewTask[] = [
  { reviewId: 'r1', mrTitle: 'feat: 新增用户认证模块', projectId: 'p1', projectName: '用户中心', status: 'COMPLETED', blockerCount: 1, majorCount: 3, minorCount: 5, infoCount: 2, qualityScore: 72, createdAt: now - day * 2 },
  { reviewId: 'r2', mrTitle: 'fix: 修复订单查询 N+1 问题', projectId: 'p2', projectName: '订单服务', status: 'REVIEWING', blockerCount: 0, majorCount: 2, minorCount: 4, infoCount: 1, qualityScore: 81, createdAt: now - 3600000 * 6 },
  { reviewId: 'r3', mrTitle: 'refactor: 重构支付回调逻辑', projectId: 'p3', projectName: '支付服务', status: 'COMPLETED', blockerCount: 0, majorCount: 1, minorCount: 3, infoCount: 0, qualityScore: 85, createdAt: now - day * 5 },
  { reviewId: 'r4', mrTitle: 'feat: 新增数据导出功能', projectId: 'p2', projectName: '订单服务', status: 'PENDING', blockerCount: 0, majorCount: 0, minorCount: 0, infoCount: 0, qualityScore: 0, createdAt: now - 1800000 },
  { reviewId: 'r5', mrTitle: 'chore: 升级 Spring Boot 3.2', projectId: 'p1', projectName: '用户中心', status: 'FAILED', blockerCount: 2, majorCount: 5, minorCount: 8, infoCount: 3, qualityScore: 45, createdAt: now - day * 7 },
];

export const mockReviewIssues: Record<string, ReviewIssue[]> = {
  r1: [
    { issueId: 'i1', reviewId: 'r1', severity: 'BLOCKER', category: 'SECURITY', filePath: 'src/main/java/com/example/AuthController.java', startLine: 45, endLine: 48, description: '密码明文传输：登录接口使用 HTTP 而非 HTTPS，存在中间人攻击风险', suggestion: '强制使用 HTTPS，并在 Nginx 层配置 HTTP→HTTPS 重定向', fixedCode: '@PostMapping(value = "/login", produces = MediaType.APPLICATION_JSON_VALUE)\npublic ResponseEntity<LoginResult> login(@RequestBody @Valid LoginRequest req,\n                                          HttpServletRequest request) {\n    // 强制 HTTPS\n    if (!request.isSecure()) {\n        throw new SecurityException("仅支持 HTTPS 访问");\n    }', status: 'OPEN' },
    { issueId: 'i2', reviewId: 'r1', severity: 'MAJOR', category: 'PERFORMANCE', filePath: 'src/main/java/com/example/UserService.java', startLine: 112, endLine: 118, description: '批量查询未使用缓存，每次请求都直接查数据库', suggestion: '引入 Redis 缓存层，设置合理的 TTL', fixedCode: '@Cacheable(value = "users", key = "#userId", unless = "#result == null")\npublic User getUserById(String userId) {\n    return userMapper.selectById(userId);\n}', status: 'OPEN' },
    { issueId: 'i3', reviewId: 'r1', severity: 'MAJOR', category: 'NAMING', filePath: 'src/main/java/com/example/UserService.java', startLine: 22, endLine: 22, description: '方法命名不规范：getU() 应改为 getUser()', suggestion: '遵循 Java 命名规范，方法名应表达完整语义', fixedCode: 'public User getUser(String userId) {\n    return getUserById(userId);\n}', status: 'FIXED' },
    { issueId: 'i4', reviewId: 'r1', severity: 'MINOR', category: 'LOGIC', filePath: 'src/main/java/com/example/AuthController.java', startLine: 67, endLine: 70, description: '登录失败提示"用户名或密码错误"过于笼统，不利于排查', suggestion: '在日志中记录详细错误原因，对外统一返回模糊提示', fixedCode: 'log.warn("登录失败: username={}, reason={}", req.getUsername(), e.getMessage());\nthrow new AuthException("用户名或密码错误");', status: 'OPEN' },
    { issueId: 'i5', reviewId: 'r1', severity: 'INFO', category: 'ARCH', filePath: 'src/main/java/com/example/AuthController.java', startLine: 1, endLine: 1, description: '建议将认证逻辑抽取为独立的 Spring Security Filter', suggestion: '使用 OncePerRequestFilter 实现统一的 JWT 认证过滤器', fixedCode: '', status: 'OPEN' },
  ],
  r2: [
    { issueId: 'i10', reviewId: 'r2', severity: 'MAJOR', category: 'PERFORMANCE', filePath: 'src/main/java/com/example/OrderService.java', startLine: 88, endLine: 95, description: '循环中执行数据库查询，存在 N+1 问题', suggestion: '使用 IN 查询批量获取关联数据', fixedCode: 'List<String> userIds = orders.stream().map(Order::getUserId).distinct().collect(Collectors.toList());\nMap<String, User> userMap = userService.batchGetUsers(userIds)\n    .stream().collect(Collectors.toMap(User::getId, Function.identity()));', status: 'OPEN' },
    { issueId: 'i11', reviewId: 'r2', severity: 'MAJOR', category: 'SECURITY', filePath: 'src/main/java/com/example/OrderService.java', startLine: 102, endLine: 105, description: 'SQL 拼接未使用参数化查询，存在 SQL 注入风险', suggestion: '使用 MyBatis 的 #{} 占位符替代 ${} 拼接', fixedCode: '@Select("SELECT * FROM orders WHERE order_id = #{orderId}")\nOrder getById(@Param("orderId") String orderId);', status: 'OPEN' },
  ],
};

// ──────────────────── Diagnosis ────────────────────

export const mockDiagnosisTasks: DiagnosisTask[] = [
  { diagnosisId: 'dg1', title: '订单服务 OOM 排障', serviceName: 'order-service', status: 'COMPLETED', createdAt: now - day * 2 },
  { diagnosisId: 'dg2', title: '网关超时问题排查', serviceName: 'api-gateway', status: 'COMPLETED', createdAt: now - day * 5 },
  { diagnosisId: 'dg3', title: '用户中心响应慢', serviceName: 'user-center', status: 'RUNNING', createdAt: now - 1800000 },
  { diagnosisId: 'dg4', title: '支付回调延迟', serviceName: 'payment-service', status: 'FAILED', createdAt: now - day * 7 },
];

export const mockDiagnosisResults: Record<string, { result: DiagnosisResult; steps: DiagnosisStep[] }> = {
  dg1: {
    result: {
      summary: '订单服务 OOM 根因是批量查询接口未设置分页限制，单次加载 50 万条记录导致堆内存溢出',
      impactScope: ['order-service', 'inventory-service', 'notification-service'],
      rootCauses: [
        { cause: 'OrderService.batchQuery() 未限制查询数量', confidence: 0.95, evidence: ['JVM 堆内存监控显示 Young GC 频繁', 'Heap Dump 显示 ArrayList 占用 1.2GB', '方法调用链追踪确认入口为 batchQuery'] },
        { cause: 'JVM 堆内存配置过小（仅 1GB）', confidence: 0.72, evidence: ['启动参数 -Xmx1g', '实际峰值内存需求约 2GB'] },
      ],
      solutions: [
        { description: '为批量查询接口增加分页参数', steps: ['添加 pageNum 和 pageSize 参数', '设置 pageSize 最大值 1000', '使用 MyBatis PageHelper 分页插件'], riskLevel: 'LOW', fixedCode: 'public PageResult<Order> batchQuery(OrderQuery query, int pageNum, int pageSize) {\n    pageSize = Math.min(pageSize, 1000);\n    PageHelper.startPage(pageNum, pageSize);\n    List<Order> orders = orderMapper.selectByQuery(query);\n    return PageResult.of(orders);\n}' },
        { description: '增大 JVM 堆内存至 2GB', steps: ['修改 -Xmx 参数为 2g', '调整 -Xms 为 2g', '重启服务'], riskLevel: 'LOW' },
      ],
      similarCases: [
        { caseId: 'sc1', title: '商品服务批量导出 OOM', similarity: 0.89, resolution: '增加流式导出 + 分页查询' },
        { caseId: 'sc2', title: '报表服务大数据量查询 OOM', similarity: 0.76, resolution: '引入游标查询 + 限制单次查询量' },
      ],
    },
    steps: [
      { stepName: '日志采集', skillName: 'fault-diag', status: 'SUCCESS', duration: 3200, output: '采集到 3 条关键异常日志' },
      { stepName: '堆栈分析', skillName: 'fault-diag', status: 'SUCCESS', duration: 8500, output: '定位到 OrderService.batchQuery 方法' },
      { stepName: '根因定位', skillName: 'knowledge-qa', status: 'SUCCESS', duration: 4200, output: '匹配到相似案例 2 个' },
      { stepName: '方案生成', skillName: 'code-gen', status: 'SUCCESS', duration: 6800, output: '生成 2 个修复方案' },
    ],
  },
  dg2: {
    result: {
      summary: '网关超时根因是下游用户中心响应慢，导致网关 504 超时',
      impactScope: ['api-gateway', 'user-center'],
      rootCauses: [
        { cause: '用户中心 /api/users 接口 P99 延迟达 8s', confidence: 0.91, evidence: ['Prometheus 监控 P99=8.2s', '数据库慢查询日志发现 3 条 SQL > 5s'] },
      ],
      solutions: [
        { description: '为用户查询接口增加 Redis 缓存', steps: ['引入 Spring Cache + Redis', '设置 TTL=30min', '增加缓存预热机制'], riskLevel: 'MEDIUM' },
      ],
      similarCases: [],
    },
    steps: [
      { stepName: '日志采集', skillName: 'fault-diag', status: 'SUCCESS', duration: 2100, output: '采集网关 access.log' },
      { stepName: '链路追踪', skillName: 'fault-diag', status: 'SUCCESS', duration: 5600, output: '定位到 user-center 延迟' },
      { stepName: '根因定位', skillName: 'fault-diag', status: 'SUCCESS', duration: 3800, output: '数据库慢查询导致' },
    ],
  },
};

// ──────────────────── Finetune ────────────────────

export const mockFinetuneTasks: FinetuneTask[] = [
  { taskId: 'ft1', name: '代码审查模型 v2', baseModel: 'qwen2.5-7b', datasetId: 'ds1', datasetName: '代码审查数据集', status: 'COMPLETED', loraR: 16, loraAlpha: 32, dropout: 0.05, epochs: 3, learningRate: '2e-4', targetModules: ['q_proj', 'v_proj'], createdAt: now - day * 10 },
  { taskId: 'ft2', name: '故障诊断模型 v1', baseModel: 'qwen2.5-14b', datasetId: 'ds2', datasetName: '故障案例数据集', status: 'TRAINING', loraR: 32, loraAlpha: 64, dropout: 0.1, epochs: 5, learningRate: '1e-4', targetModules: ['q_proj', 'k_proj', 'v_proj'], createdAt: now - day * 2 },
  { taskId: 'ft3', name: '代码生成增强', baseModel: 'deepseek-coder-6.7b', datasetId: 'ds3', datasetName: 'Java代码生成数据集', status: 'PENDING', loraR: 8, loraAlpha: 16, dropout: 0.05, epochs: 4, learningRate: '3e-4', targetModules: ['q_proj', 'v_proj'], createdAt: now - 3600000 },
  { taskId: 'ft4', name: '接口文档生成', baseModel: 'qwen2.5-7b', datasetId: 'ds1', datasetName: '代码审查数据集', status: 'FAILED', loraR: 16, loraAlpha: 32, dropout: 0.05, epochs: 3, learningRate: '2e-4', targetModules: ['q_proj', 'v_proj'], createdAt: now - day * 20 },
];

export const mockDatasets: Dataset[] = [
  { datasetId: 'ds1', name: '代码审查数据集', type: 'CODE_REVIEW', sampleCount: 15000, status: 'READY', createdAt: now - day * 30 },
  { datasetId: 'ds2', name: '故障案例数据集', type: 'FAULT_DIAG', sampleCount: 8000, status: 'READY', createdAt: now - day * 25 },
  { datasetId: 'ds3', name: 'Java代码生成数据集', type: 'CODE_GEN', sampleCount: 25000, status: 'READY', createdAt: now - day * 15 },
  { datasetId: 'ds4', name: '综合技能数据集', type: 'CODE_GEN', sampleCount: 12000, status: 'BUILDING', createdAt: now - 7200000 },
];

export const mockTrainingLogs: TrainingLog[] = [
  { timestamp: '2026-06-26 10:00', epoch: 1, totalEpochs: 3, loss: 2.45, valLoss: 2.52 },
  { timestamp: '2026-06-26 10:15', epoch: 1, totalEpochs: 3, loss: 1.89, valLoss: 1.95 },
  { timestamp: '2026-06-26 10:30', epoch: 1, totalEpochs: 3, loss: 1.56, valLoss: 1.63 },
  { timestamp: '2026-06-26 10:45', epoch: 2, totalEpochs: 3, loss: 1.23, valLoss: 1.35 },
  { timestamp: '2026-06-26 11:00', epoch: 2, totalEpochs: 3, loss: 1.02, valLoss: 1.18 },
  { timestamp: '2026-06-26 11:15', epoch: 2, totalEpochs: 3, loss: 0.89, valLoss: 1.08 },
  { timestamp: '2026-06-26 11:30', epoch: 3, totalEpochs: 3, loss: 0.76, valLoss: 0.98 },
  { timestamp: '2026-06-26 11:45', epoch: 3, totalEpochs: 3, loss: 0.68, valLoss: 0.94 },
  { timestamp: '2026-06-26 12:00', epoch: 3, totalEpochs: 3, loss: 0.62, valLoss: 0.91 },
];

// ──────────────────── Metrics ────────────────────

export const mockKpiData: KpiData = {
  totalCalls: 12836,
  callTrend: 12.5,
  successRate: 94.2,
  successRateTrend: 1.8,
  avgDuration: 3200,
  avgDurationTrend: -5.2,
  tokenUsage: 2856000,
  tokenUsageTrend: 8.3,
};

export const mockSkillDistribution: SkillDistribution[] = [
  { name: '代码生成', value: 4200 },
  { name: '代码审查', value: 2800 },
  { name: '知识库问答', value: 3500 },
  { name: '故障诊断', value: 1200 },
  { name: '单元测试', value: 1136 },
];

export const mockTrendData: TrendData = {
  labels: ['06-20', '06-21', '06-22', '06-23', '06-24', '06-25', '06-26'],
  series: [
    { name: '总调用', data: [1520, 1680, 1420, 1890, 1760, 1950, 1616] },
    { name: '成功', data: [1430, 1590, 1350, 1780, 1660, 1840, 1530] },
    { name: '失败', data: [90, 90, 70, 110, 100, 110, 86] },
  ],
};

export const mockRagPerformance: RagPerformance = {
  p99Latency: [
    { time: '06-20', value: 450 }, { time: '06-21', value: 420 }, { time: '06-22', value: 480 },
    { time: '06-23', value: 390 }, { time: '06-24', value: 410 }, { time: '06-25', value: 380 },
    { time: '06-26', value: 360 },
  ],
  accuracy: [
    { time: '06-20', value: 0.87 }, { time: '06-21', value: 0.88 }, { time: '06-22', value: 0.86 },
    { time: '06-23', value: 0.89 }, { time: '06-24', value: 0.90 }, { time: '06-25', value: 0.91 },
    { time: '06-26', value: 0.92 },
  ],
};

// ──────────────────── Settings ────────────────────

export const mockModels: ModelConfig[] = [
  { modelId: 'm1', name: 'Qwen2.5-72B', deployType: 'api', apiAddress: 'https://dashscope.aliyuncs.com/api/v1', maxContextLength: 131072, defaultTemperature: 0.7, status: '正常', isDefault: true },
  { modelId: 'm2', name: 'Qwen2.5-7B', deployType: 'private', apiAddress: 'http://gpu-node-01:8000/v1', maxContextLength: 32768, defaultTemperature: 0.7, status: '正常', isDefault: false },
  { modelId: 'm3', name: 'DeepSeek-Coder-6.7B', deployType: 'private', apiAddress: 'http://gpu-node-02:8000/v1', maxContextLength: 16384, defaultTemperature: 0.5, status: '正常', isDefault: false },
  { modelId: 'm4', name: 'BGE-Large-zh-v1.5', deployType: 'private', apiAddress: 'http://gpu-node-01:8080/embed', maxContextLength: 512, defaultTemperature: 0, status: '正常', isDefault: false },
  { modelId: 'm5', name: 'M3E-Large', deployType: 'private', apiAddress: 'http://gpu-node-03:8080/embed', maxContextLength: 512, defaultTemperature: 0, status: '异常', isDefault: false },
];

export const mockUsers: User[] = [
  { userId: 'u1', username: 'admin', realName: '管理员', email: 'admin@example.com', role: '管理员', department: '技术部', status: '启用', lastLoginAt: now - 60000 },
  { userId: 'u2', username: 'zhangsan', realName: '张三', email: 'zhangsan@example.com', role: '开发', department: '研发一部', status: '启用', lastLoginAt: now - 3600000 },
  { userId: 'u3', username: 'lisi', realName: '李四', email: 'lisi@example.com', role: '架构师', department: '架构组', status: '启用', lastLoginAt: now - 7200000 },
  { userId: 'u4', username: 'wangwu', realName: '王五', email: 'wangwu@example.com', role: '运维', department: '运维组', status: '启用', lastLoginAt: now - day },
  { userId: 'u5', username: 'zhaoliu', realName: '赵六', email: 'zhaoliu@example.com', role: '测试', department: '质量部', status: '禁用', lastLoginAt: now - day * 30 },
];

export const mockTemplates: CodeTemplate[] = [
  {
    templateId: 't1', name: 'Spring Boot Controller', category: 'CONTROLLER', language: 'Java', framework: 'Spring Boot',
    content: 'package {{basePackage}}.controller;\n\nimport org.springframework.web.bind.annotation.*;\n\n@RestController\n@RequestMapping("/api/v1/{{resourceName}}")\npublic class {{className}}Controller {\n\n    @Autowired\n    private {{className}}Service {{classNameLower}}Service;\n\n    @GetMapping\n    public ResponseEntity<PageResult<{{className}}DTO>> list({{className}}Query query) {\n        return ResponseEntity.ok({{classNameLower}}Service.list(query));\n    }\n\n    @GetMapping("/{id}")\n    public ResponseEntity<{{className}}DTO> getById(@PathVariable String id) {\n        return ResponseEntity.ok({{classNameLower}}Service.getById(id));\n    }\n\n    @PostMapping\n    public ResponseEntity<{{className}}DTO> create(@RequestBody @Valid {{className}}CreateRequest req) {\n        return ResponseEntity.ok({{classNameLower}}Service.create(req));\n    }\n}',
    variables: [
      { name: 'basePackage', type: 'string', defaultValue: 'com.example', required: true },
      { name: 'className', type: 'string', required: true },
      { name: 'resourceName', type: 'string', required: true },
      { name: 'classNameLower', type: 'string', required: false },
    ],
    createdAt: now - day * 60,
  },
  {
    templateId: 't2', name: 'MyBatis Mapper XML', category: 'MAPPER', language: 'XML', framework: 'MyBatis',
    content: '<?xml version="1.0" encoding="UTF-8"?>\n<!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN" "http://mybatis.org/dtd/mybatis-3-mapper.dtd">\n<mapper namespace="{{basePackage}}.mapper.{{className}}Mapper">\n\n    <resultMap id="BaseResultMap" type="{{basePackage}}.entity.{{className}}">\n        <id column="id" property="id"/>\n        <result column="created_at" property="createdAt"/>\n        <result column="updated_at" property="updatedAt"/>\n    </resultMap>\n\n</mapper>',
    variables: [
      { name: 'basePackage', type: 'string', defaultValue: 'com.example', required: true },
      { name: 'className', type: 'string', required: true },
    ],
    createdAt: now - day * 50,
  },
  {
    templateId: 't3', name: 'Service 接口', category: 'SERVICE', language: 'Java', framework: 'Spring Boot',
    content: 'package {{basePackage}}.service;\n\npublic interface {{className}}Service {\n\n    /**\n     * 分页查询\n     */\n    PageResult<{{className}}DTO> list({{className}}Query query);\n\n    /**\n     * 根据ID查询\n     */\n    {{className}}DTO getById(String id);\n\n    /**\n     * 创建\n     */\n    {{className}}DTO create({{className}}CreateRequest req);\n\n    /**\n     * 更新\n     */\n    {{className}}DTO update(String id, {{className}}UpdateRequest req);\n\n    /**\n     * 删除\n     */\n    void delete(String id);\n}',
    variables: [
      { name: 'basePackage', type: 'string', defaultValue: 'com.example', required: true },
      { name: 'className', type: 'string', required: true },
    ],
    createdAt: now - day * 45,
  },
];

export const mockMcpTools: McpTool[] = [
  { toolName: 'gitlab_mr_reader', description: '读取 GitLab MR 变更内容', serverName: 'gitlab-server', status: '在线', schema: { type: 'object', properties: { projectId: { type: 'string' }, mrIid: { type: 'number' } } } },
  { toolName: 'jenkins_trigger', description: '触发 Jenkins 构建任务', serverName: 'jenkins-server', status: '在线', schema: { type: 'object', properties: { jobName: { type: 'string' }, parameters: { type: 'object' } } } },
  { toolName: 'k8s_pod_reader', description: '读取 K8s Pod 日志和状态', serverName: 'k8s-server', status: '在线', schema: { type: 'object', properties: { namespace: { type: 'string' }, podName: { type: 'string' } } } },
  { toolName: 'sonar_scanner', description: '触发 SonarQube 代码质量扫描', serverName: 'sonar-server', status: '离线', schema: { type: 'object', properties: { projectKey: { type: 'string' } } } },
  { toolName: 'confluence_reader', description: '读取 Confluence 页面内容', serverName: 'confluence-server', status: '在线', schema: { type: 'object', properties: { spaceKey: { type: 'string' }, pageId: { type: 'string' } } } },
];

export const mockNotifyConfigs: NotifyConfig[] = [
  { id: 'nc1', eventType: '评审完成', channels: ['企业微信', '邮件'], receivers: ['zhangsan', 'lisi'], enabled: true },
  { id: 'nc2', eventType: '排障完成', channels: ['企业微信'], receivers: ['wangwu'], enabled: true },
  { id: 'nc3', eventType: '训练完成', channels: ['钉钉', '邮件'], receivers: ['lisi'], enabled: true },
  { id: 'nc4', eventType: '系统告警', channels: ['企业微信', '钉钉', '飞书'], receivers: ['admin', 'wangwu'], enabled: false },
];

// ──────────────────── Notification ────────────────────

export const mockNotifications: Notification[] = [
  { id: 'n1', type: '评审完成', title: 'MR "新增用户认证模块" 评审完成，质量分 72', time: now - 300000, read: false, link: '/review' },
  { id: 'n2', type: '排障完成', title: '订单服务 OOM 排障已完成，定位到 2 个根因', time: now - 1800000, read: false, link: '/diagnosis' },
  { id: 'n3', type: '系统告警', title: 'M3E-Large 嵌入模型服务异常，请检查', time: now - 3600000, read: true, link: '/settings' },
  { id: 'n4', type: '训练完成', title: '代码审查模型 v2 训练完成，最终 Loss 0.62', time: now - day, read: true, link: '/finetune' },
  { id: 'n5', type: '评审完成', title: 'MR "重构支付回调逻辑" 评审完成，质量分 85', time: now - day * 2, read: true, link: '/review' },
  { id: 'n6', type: '系统告警', title: 'GPU Node-03 磁盘使用率超过 85%', time: now - day * 3, read: true, link: '/settings' },
];
