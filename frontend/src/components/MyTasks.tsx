import React, { useState, useEffect } from 'react';
import type { UserInfoDTO } from '../domain/dto';
import api from '../utils/api';
import './MyTasks.css';

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

          console.log('Fetching user participations for:', userData.public_key);
          
          // 获取用户参与的任务
          const participationsResponse = await api.get('/participation/user');

          if (participationsResponse.data.code === 200) {
            const userParticipations = participationsResponse.data.data.participations;
            console.log('User participations:', userParticipations);
            setParticipations(userParticipations);

            // 获取所有任务信息
            const tasksResponse = await api.get('/promotion/tasks');
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
        return 'Pending';
      case 'approved':
        return 'Approved';
      case 'rejected':
        return 'Rejected';
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
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="my-tasks-container">
      <div className="tasks-header">
        <h1>My Participations</h1>
        <p>View all tasks you've participated in and track their review status</p>
        
        <div className="filter-buttons">
          <button 
            className={filter === 'all' ? 'active' : ''}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button 
            className={filter === 'pending' ? 'active' : ''}
            onClick={() => setFilter('pending')}
          >
            Pending
          </button>
          <button 
            className={filter === 'approved' ? 'active' : ''}
            onClick={() => setFilter('approved')}
          >
            Approved
          </button>
          <button 
            className={filter === 'rejected' ? 'active' : ''}
            onClick={() => setFilter('rejected')}
          >
            Rejected
          </button>
        </div>
      </div>

      <div className="participations-list">
        {filteredParticipations.length === 0 ? (
          <div className="no-participations">
            <p>No participation records found</p>
            <button 
              className="btn-primary"
              onClick={() => setCurrent('promotion-tasks')}
            >
              Join Tasks
            </button>
          </div>
        ) : (
          filteredParticipations.map(participation => {
            const task = getTaskById(participation.task_id);
            
            return (
              <div key={participation.id} className="participation-card">
                <div className="participation-header">
                  <div className="task-info">
                    <h3>{task ? task.name : 'Loading task info...'}</h3>
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
                      <span className="label">Platform:</span>
                      <span className="value">{task.platform.toUpperCase()}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Deadline:</span>
                      <span className="value">{task.deadline}</span>
                    </div>
                  </div>
                )}

                <div className="submission-info">
                  <div className="submission-item">
                    <span className="label">Submission URL:</span>
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
                    <span className="label">Submission Text:</span>
                    <p className="submission-text">{participation.submission_text}</p>
                  </div>
                  <div className="submission-item">
                    <span className="label">Submitted At:</span>
                    <span className="value">{new Date(parseInt(participation.submitted_at) * 1000).toLocaleString()}</span>
                  </div>
                </div>

                {participation.reviewer_notes && (
                  <div className="review-notes">
                    <span className="label">Review Notes:</span>
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
