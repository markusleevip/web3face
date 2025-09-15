import React, { useState, useEffect } from 'react';
import './PromotionTasks.css';

interface PromotionTask {
  id: number;
  title: string;
  description: string;
  platform: 'x' | 'telegram' | 'discord' | 'instagram';
  reward: number;
  status: 'active' | 'completed' | 'pending';
  deadline: string;
  requirements: string[];
}

interface PromotionTasksProps {
  setCurrent: (page: string, taskId?: number) => void;
}

const PromotionTasks = ({ setCurrent }: PromotionTasksProps) => {
  const [tasks, setTasks] = useState<PromotionTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  const handleTaskClick = (taskId: number) => {
    setCurrent('promotion-detail', taskId);
  };

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
        ]
      }
    ];

    setTasks(mockTasks);
    setLoading(false);
  }, []);

  const filteredTasks = tasks.filter(task => 
    filter === 'all' || task.status === filter
  );

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

  return (
    <div className="promotion-tasks-container">
      <div className="tasks-header">
        <h1>社交媒体推广任务</h1>
        <p>参与推广任务，赚取奖励！选择适合你的任务开始推广</p>
        
        <div className="filter-buttons">
          <button 
            className={filter === 'all' ? 'active' : ''}
            onClick={() => setFilter('all')}
          >
            全部任务
          </button>
          <button 
            className={filter === 'active' ? 'active' : ''}
            onClick={() => setFilter('active')}
          >
            进行中
          </button>
          <button 
            className={filter === 'completed' ? 'active' : ''}
            onClick={() => setFilter('completed')}
          >
            已完成
          </button>
        </div>
      </div>

      <div className="tasks-grid">
        {filteredTasks.map(task => (
          <div key={task.id} className="task-card" onClick={() => handleTaskClick(task.id)}>
            <div className="task-header">
              <div className="platform-icon">
                {getPlatformIcon(task.platform)}
              </div>
              <div className="task-info">
                <h3 className="task-title">{task.title}</h3>
                {getStatusBadge(task.status)}
              </div>
            </div>
            
            <p className="task-description">{task.description}</p>
            
            <div className="task-details">
              <div className="reward">
                <span className="label">奖励:</span>
                <span className="value">{task.reward} USDT</span>
              </div>
              <div className="deadline">
                <span className="label">截止:</span>
                <span className="value">{task.deadline}</span>
              </div>
            </div>

            <div className="requirements">
              <h4>要求:</h4>
              <ul>
                {task.requirements.map((req, index) => (
                  <li key={index}>{req}</li>
                ))}
              </ul>
            </div>

            <button className="participate-btn">
              {task.status === 'active' ? '立即参与' : '查看详情'}
            </button>
          </div>
        ))}
      </div>

      {filteredTasks.length === 0 && (
        <div className="no-tasks">
          <p>暂无{filter === 'all' ? '' : filter}任务</p>
        </div>
      )}
    </div>
  );
};

export default PromotionTasks;
