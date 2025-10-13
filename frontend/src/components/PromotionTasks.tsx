import React, { useState, useEffect } from 'react';
import './PromotionTasks.css';
import axios from 'axios';

interface PromotionTask {
  id: number;
  name: string;
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

  // 从API获取真实数据
  useEffect(() => {
    const fetchPromotionTasks = async () => {
      try {
        const response = await axios.get('/api/promotion/tasks');
        if (response.data.code === 200) {
          const apiTasks = response.data.data.map((task: any) => ({
            id: parseInt(task.id.replace(/\D/g, '')) || Math.floor(Math.random() * 1000),
            name: task.name || task.title,
            title: task.title,
            description: task.description,
            platform: task.platform as 'x' | 'telegram' | 'discord' | 'instagram',
            reward: task.reward,
            status: task.status as 'active' | 'completed' | 'pending',
            deadline: task.deadline,
            requirements: task.requirements
          }));
          setTasks(apiTasks);
        } else {
          console.error('Failed to fetch promotion tasks:', response.data.message);
        }
      } catch (error) {
        console.error('Error fetching promotion tasks:', error);
        // 如果API调用失败，使用模拟数据作为后备
        const mockTasks: PromotionTask[] = [
          {
            id: 1,
            name: 'X平台内容推广',
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
          }
        ];
        setTasks(mockTasks);
      } finally {
        setLoading(false);
      }
    };

    fetchPromotionTasks();
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
                <h3 className="task-title">{task.name}</h3>
                {getStatusBadge(task.status)}
              </div>
            </div>
            
            <p className="task-description">{task.description}</p>
            
            <div className="task-details">
              <div className="reward">
                <span className="label">奖励:</span>
                <span className="value">{task.reward} USDC</span>
              </div>
              <div className="deadline">
                <span className="label">截止:</span>
                <span className="value">{task.deadline}</span>
              </div>
            </div>

            <div className="requirements">
              <h4>任务要求:</h4>
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
