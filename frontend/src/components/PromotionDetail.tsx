import React, { useState, useEffect } from 'react';
import './PromotionDetail.css';

interface PromotionTask {
  id: number;
  title: string;
  description: string;
  platform: 'x' | 'telegram' | 'discord' | 'instagram';
  reward: number;
  status: 'active' | 'completed' | 'pending';
  deadline: string;
  requirements: string[];
  detailedDescription?: string;
  steps?: string[];
  submissionGuidelines?: string[];
}

interface PromotionDetailProps {
  taskId?: number;
  setCurrent: (page: string) => void;
}

const PromotionDetail = ({ taskId, setCurrent }: PromotionDetailProps) => {
  const [task, setTask] = useState<PromotionTask | null>(null);
  const [loading, setLoading] = useState(true);

  // 模拟数据 - 实际项目中应该从API获取
  useEffect(() => {
    const mockTasks: PromotionTask[] = [
      {
        id: 1,
        title: 'X平台内容推广',
        description: '在X平台发布关于我们产品的推文，需要包含指定标签和链接',
        platform: 'x',
        reward: 50,
        status: 'active',
        deadline: '2025-09-15',
        requirements: [
          '至少100个粉丝',
          '推文包含#Web3Face标签',
          '保持推文至少24小时'
        ],
        detailedDescription: '在X平台创建一条关于Web3Face项目的推文，内容需要包含项目介绍、特色功能以及为什么用户应该关注我们。推文必须包含指定的标签和项目链接。',
        steps: [
          '登录你的X账号',
          '创建一条新的推文',
          '包含内容：介绍Web3Face项目 + 项目特色',
          '添加标签：#Web3Face #NFT #区块链',
          '包含项目链接：https://web3face.xyz',
          '发布推文并保持至少24小时'
        ],
        submissionGuidelines: [
          '提交推文链接作为完成证明',
          '确保推文是公开可见的',
          '推文内容不能是垃圾广告',
          '完成审核后奖励将在3个工作日内发放'
        ]
      },
      {
        id: 2,
        title: 'Telegram群组推广',
        description: '在相关Telegram群组中分享我们的项目信息',
        platform: 'telegram',
        reward: 30,
        status: 'active',
        deadline: '2025-09-20',
        requirements: [
          '群组成员至少500人',
          '分享后截图证明',
          '不能是垃圾广告群组'
        ],
        detailedDescription: '在相关的加密货币、NFT或区块链Telegram群组中分享Web3Face项目信息。分享内容应该有价值，不能是简单的垃圾广告。',
        steps: [
          '找到相关的Telegram群组',
          '确保群组质量（非垃圾广告群）',
          '编写有价值的分享内容',
          '在群组中分享项目信息',
          '截图分享内容作为证明'
        ],
        submissionGuidelines: [
          '提交分享内容的截图',
          '截图需要显示群组名称和成员数量',
          '分享内容不能违反群组规则',
          '审核通过后奖励将在2个工作日内发放'
        ]
      },
      {
        id: 3,
        title: 'Discord社区建设',
        description: '在我们的Discord服务器中活跃参与讨论，帮助新成员',
        platform: 'discord',
        reward: 20,
        status: 'active',
        deadline: '2025-09-25',
        requirements: [
          '每日至少发送5条有帮助的消息',
          '帮助解答新手问题',
          '保持友好态度'
        ],
        detailedDescription: '加入我们的Discord社区，积极参与讨论，帮助新成员了解项目，解答他们的问题，营造友好的社区氛围。',
        steps: [
          '加入Web3Face Discord服务器',
          '阅读社区规则和指南',
          '在适当的频道参与讨论',
          '帮助解答新成员的问题',
          '保持积极友好的态度'
        ],
        submissionGuidelines: [
          '需要连续参与7天',
          '每天至少5条有帮助的消息',
          '消息质量会被审核',
          '奖励按周结算'
        ]
      },
      {
        id: 4,
        title: 'Instagram内容创作',
        description: '创建关于我们产品的Instagram帖子或故事',
        platform: 'instagram',
        reward: 40,
        status: 'completed',
        deadline: '2025-09-10',
        requirements: [
          '至少500个粉丝',
          '高质量图片或视频',
          '包含产品链接'
        ],
        detailedDescription: '在Instagram上创建高质量的视觉内容来展示Web3Face项目。可以是产品截图、使用教程或创意内容。',
        steps: [
          '准备高质量的图片或视频',
          '编写有吸引力的文案',
          '添加相关标签',
          '包含项目链接',
          '发布帖子或故事'
        ],
        submissionGuidelines: [
          '提交帖子链接或截图',
          '内容需要是原创的',
          '图片/视频质量需要达到标准',
          '审核通过后立即发放奖励'
        ]
      }
    ];

    const foundTask = mockTasks.find(t => t.id === (taskId || 0));
    setTask(foundTask || null);
    setLoading(false);
  }, [taskId]);

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'x':
        return '🐦';
      case 'telegram':
        return '📱';
      case 'discord':
        return '🎮';
      case 'instagram':
        return '📸';
      default:
        return '🌐';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="status-badge active">进行中</span>;
      case 'completed':
        return <span className="status-badge completed">已完成</span>;
      case 'pending':
        return <span className="status-badge pending">待审核</span>;
      default:
        return <span className="status-badge">未知</span>;
    }
  };

  if (loading) {
    return <div className="loading">加载中...</div>;
  }

  if (!task) {
    return (
      <div className="not-found">
        <h2>任务未找到</h2>
        <button onClick={() => setCurrent('home')} className="back-btn">
          返回任务列表
        </button>
      </div>
    );
  }

  return (
    <div className="promotion-detail-container">
      <button onClick={() => setCurrent('home')} className="back-btn">
        ← 返回任务列表
      </button>

      <div className="detail-header">
        <div className="platform-icon-large">
          {getPlatformIcon(task.platform)}
        </div>
        <div className="header-info">
          <h1>{task.title}</h1>
          <div className="header-meta">
            {getStatusBadge(task.status)}
            <span className="reward-large">{task.reward} USDT</span>
          </div>
        </div>
      </div>

      <div className="detail-content">
        <div className="detail-section">
          <h2>任务描述</h2>
          <p>{task.detailedDescription || task.description}</p>
        </div>

        <div className="detail-section">
          <h2>任务要求</h2>
          <ul className="requirements-list">
            {task.requirements.map((req, index) => (
              <li key={index}>{req}</li>
            ))}
          </ul>
        </div>

        {task.steps && task.steps.length > 0 && (
          <div className="detail-section">
            <h2>操作步骤</h2>
            <ol className="steps-list">
              {task.steps.map((step, index) => (
                <li key={index}>{step}</li>
              ))}
            </ol>
          </div>
        )}

        <div className="detail-section">
          <h2>任务详情</h2>
          <div className="task-details-grid">
            <div className="detail-item">
              <span className="label">平台:</span>
              <span className="value">{task.platform.toUpperCase()}</span>
            </div>
            <div className="detail-item">
              <span className="label">奖励:</span>
              <span className="value reward">{task.reward} USDT</span>
            </div>
            <div className="detail-item">
              <span className="label">状态:</span>
              <span className="value">{getStatusBadge(task.status)}</span>
            </div>
            <div className="detail-item">
              <span className="label">截止日期:</span>
              <span className="value">{task.deadline}</span>
            </div>
          </div>
        </div>

        {task.submissionGuidelines && task.submissionGuidelines.length > 0 && (
          <div className="detail-section">
            <h2>提交指南</h2>
            <ul className="guidelines-list">
              {task.submissionGuidelines.map((guideline, index) => (
                <li key={index}>{guideline}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="action-buttons">
          {task.status === 'active' && (
            <button className="participate-btn primary">
              立即参与
            </button>
          )}
          <button className="participate-btn secondary">
            分享任务
          </button>
        </div>
      </div>
    </div>
  );
};

export default PromotionDetail;
