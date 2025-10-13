import React, { useState, useEffect } from 'react';
import type { UserInfoDTO } from '../domain/dto';
import axios from 'axios';

interface TaskParticipation {
  id: string;
  task_id: string;
  user_public_key: string;
  submission_url: string;
  submission_text: string;
  status: string; // "pending", "approved", "rejected"
  submitted_at: string;
  reviewed_at: string | null;
  reviewer_notes: string | null;
}

interface PromotionTask {
  id: string;
  name: string;
  title: string;
  description: string;
  platform: string;
  reward: number;
  status: string;
  deadline: string;
  requirements: string[];
}

interface MyTasksProps {
  setCurrent: (page: string, taskId?: number) => void;
}

const MyTasks = ({ setCurrent }: MyTasksProps) => {
  const [participations, setParticipations] = useState<TaskParticipation[]>([]);
  const [tasks, setTasks] = useState<PromotionTask[]>([]);
  const [userInfo, setUserInfo] = useState<UserInfoDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = localStorage.getItem('user');
        if (user) {
          const userData = JSON.parse(user);
          setUserInfo(userData);

          // 获取用户参与的任务
          const participationsResponse = await axios.get('/api/participation/user', {
            headers: {
              'Authorization': `Bearer ${userData.token}`
            }
          });

          if (participationsResponse.data.code === 200) {
            const userParticipations = participationsResponse.data.data.participations;
            setParticipations(userParticipations);

            // 获取所有任务信息
            const tasksResponse = await axios.get('/api/promotion/tasks');
            if (tasksResponse.data.code === 200) {
              setTasks(tasksResponse.data.data);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getTaskById = (taskId: string) => {
    return tasks.find(task => task.id === taskId);
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return '待审核';
      case 'approved':
        return '已通过';
      case 'rejected':
        return '已拒绝';
      default:
        return status;
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'pending':
        return 'status-pending';
      case 'approved':
        return 'status-approved';
      case 'rejected':
        return 'status-rejected';
      default:
        return '';
    }
  };

  const filteredParticipations = participations.filter(participation => 
    filter === 'all' || participation.status === filter
  );

  if (loading) {
    return <div className="loading">加载中...</div>;
  }

  return (
    <div className="my-tasks-container">
      <div className="tasks-header">
        <h1>我的任务</h1>
        <p>查看您参与的所有推广任务</p>
        
        <div className="filter-buttons">
          <button 
            className={filter === 'all' ? 'active' : ''}
            onClick={() => setFilter('all')}
          >
            全部
          </button>
          <button 
            className={filter === 'pending' ? 'active' : ''}
            onClick={() => setFilter('pending')}
          >
            待审核
          </button>
          <button 
            className={filter === 'approved' ? 'active' : ''}
            onClick={() => setFilter('approved')}
          >
            已通过
          </button>
          <button 
            className={filter === 'rejected' ? 'active' : ''}
            onClick={() => setFilter('rejected')}
          >
            已拒绝
          </button>
        </div>
      </div>

      <div className="participations-list">
        {filteredParticipations.length === 0 ? (
          <div className="no-participations">
            <p>暂无参与记录</p>
            <button 
              className="btn-primary"
              onClick={() => setCurrent('promotion-tasks')}
            >
              去参与任务
            </button>
          </div>
        ) : (
          filteredParticipations.map(participation => {
            const task = getTaskById(participation.task_id);
            
            return (
              <div key={participation.id} className="participation-card">
                <div className="participation-header">
                  <div className="task-info">
                    <h3>{task ? task.name : '任务信息加载中...'}</h3>
                    <span className={`status-badge ${getStatusClass(participation.status)}`}>
                      {getStatusText(participation.status)}
                    </span>
                  </div>
                  {task && (
                    <div className="task-reward">
                      {task.reward} USDC
                    </div>
                  )}
                </div>

                {task && (
                  <div className="task-details">
                    <div className="detail-item">
                      <span className="label">平台:</span>
                      <span className="value">{task.platform.toUpperCase()}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">截止时间:</span>
                      <span className="value">{task.deadline}</span>
                    </div>
                  </div>
                )}

                <div className="submission-info">
                  <div className="submission-item">
                    <span className="label">提交链接:</span>
                    <a 
                      href={participation.submission_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="submission-link"
                    >
                      {participation.submission_url}
                    </a>
                  </div>
                  <div className="submission-item">
                    <span className="label">提交说明:</span>
                    <p className="submission-text">{participation.submission_text}</p>
                  </div>
                  <div className="submission-item">
                    <span className="label">提交时间:</span>
                    <span className="value">{new Date(parseInt(participation.submitted_at) * 1000).toLocaleString()}</span>
                  </div>
                </div>

                {participation.reviewer_notes && (
                  <div className="review-notes">
                    <span className="label">审核意见:</span>
                    <p className="notes-text">{participation.reviewer_notes}</p>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default MyTasks;
