// DagViewer — 使用 React Flow 渲染 DAG

import { useCallback, useMemo, useState, useEffect } from 'react';
import ReactFlow, {
  type Node,
  type Edge,
  type NodeTypes,
  Position,
  MarkerType,
  useNodesState,
  useEdgesState,
  Background,
  Controls,
} from 'reactflow';
import 'reactflow/dist/style.css';
import type { DagPlan, DagNodeStatus, DagEdgeType } from '../../../types';
import { useSSE } from '../../../hooks/useSSE';

// 节点状态颜色
const STATUS_COLORS: Record<DagNodeStatus, string> = {
  PENDING: '#8C8C8C',
  running: '#1677FF',
  SUCCESS: '#52C41A',
  FAILED: '#FF4D4F',
  SKIPPED: '#D9D9D9',
};

// 自定义节点
function DagNodeComponent({ data }: { data: { label: string; status: DagNodeStatus; skillName?: string } }) {
  const bgColor = STATUS_COLORS[data.status] || '#8C8C8C';
  const isRunning = data.status === 'running';

  return (
    <div
      style={{
        padding: '8px 16px',
        borderRadius: 8,
        border: `2px solid ${bgColor}`,
        background: '#fff',
        minWidth: 120,
        textAlign: 'center',
        animation: isRunning ? 'pulse 1.5s ease-in-out infinite' : 'none',
      }}
    >
      <div style={{ fontWeight: 600, fontSize: 13, color: bgColor }}>{data.label}</div>
      {data.skillName && (
        <div style={{ fontSize: 11, color: '#8C8C8C', marginTop: 2 }}>{data.skillName}</div>
      )}
    </div>
  );
}

const nodeTypes: NodeTypes = {
  dagNode: DagNodeComponent,
};

// 边样式
function getEdgeStyle(type: DagEdgeType): Record<string, unknown> {
  switch (type) {
    case 'CONDITIONAL':
      return { strokeDasharray: '5 5', stroke: '#FAAD14' };
    case 'SEND':
      return { stroke: '#722ED1', strokeWidth: 2 };
    case 'FIXED':
    default:
      return { stroke: '#8C8C8C' };
  }
}

interface DagViewerProps {
  sessionId: string;
  mode: 'LIVE' | 'ARCHIVE';
  initialPlan?: DagPlan;
}

const DagViewer: React.FC<DagViewerProps> = ({ sessionId, mode, initialPlan }) => {
  const [plan, setPlan] = useState<DagPlan>(initialPlan || { nodes: [], edges: [] });
  const [sseConnected, setSseConnected] = useState(false);

  // LIVE 模式：监听 SSE dag_update 事件
  useSSE({
    url: `/api/v1/agent/sessions/${sessionId}/dag/stream`,
    enabled: mode === 'LIVE',
    handlers: {
      onDagUpdate: (data) => {
        setPlan(data as DagPlan);
      },
      onDone: () => setSseConnected(false),
      onError: () => setSseConnected(false),
    },
  });

  // SSE 断开时 2s 轮询降级
  useEffect(() => {
    if (mode !== 'LIVE' || sseConnected) return;
    const timer = setInterval(async () => {
      try {
        const { agentService } = await import('../../../services/agentService');
        const dagPlan = await agentService.getDagState(sessionId);
        setPlan(dagPlan);
      } catch {
        // ignore
      }
    }, 2000);
    return () => clearInterval(timer);
  }, [mode, sseConnected, sessionId]);

  // 转换为 React Flow 节点
  const initialNodes: Node[] = useMemo(() =>
    plan.nodes.map((node, idx) => ({
      id: node.id,
      type: 'dagNode',
      position: { x: (idx % 4) * 200, y: Math.floor(idx / 4) * 100 },
      data: { label: node.label, status: node.status, skillName: node.skillName },
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
    })),
    [plan.nodes]
  );

  const initialEdges: Edge[] = useMemo(() =>
    plan.edges.map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      style: getEdgeStyle(edge.type),
      markerEnd: { type: MarkerType.ArrowClosed },
      label: edge.condition || undefined,
    })),
    [plan.edges]
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [plan, initialNodes, initialEdges, setNodes, setEdges]);

  const onInit = useCallback(() => {
    if (mode === 'LIVE') {
      setSseConnected(true);
    }
  }, [mode]);

  if (plan.nodes.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: 40, color: '#8C8C8C' }}>
        暂无 DAG 执行计划
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: 400 }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        onInit={onInit}
        fitView
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
};

export default DagViewer;
