import React, { useState, useEffect } from 'react';
import type { UserInfoDTO } from '../domain/dto';
import axios from 'axios';
import ParticipantsList from './ParticipantsList';
import './MyPromotions.css';

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
  created_by: string;
  created_at: string;
}

interface MyPromotionsProps {
  userInfo: UserInfoDTO | null;
}

const MyPromotions = ({ userInfo }: MyPromotionsProps) => {
  const [promotions, setPromotions] = useState<PromotionTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [showParticipants, setShowParticipants] = useState(false);

  useEffect(() => {
    const fetchMyPromotions = async () => {
      try {
        if (!userInfo) {
          setError('User not authenticated');
          setLoading(false);
          return;
        }

        // 获取所有任务
        const response = await axios.get('/api/promotion/tasks', {
          headers: {
            'Authorization': `Bearer ${userInfo.token}`
          }
        });

        if (response.data.code === 200) {
          // 过滤出当前用户创建的任务
          const allTasks = response.data.data;
          const myTasks = allTasks.filter((task: PromotionTask) => 
            task.created_by === userInfo.public_key
          );
          setPromotions(myTasks);
        }
      } catch (error: any) {
        setError(error.response?.data?.message || 'Failed to fetch promotions');
      } finally {
        setLoading(false);
      }
    };

    fetchMyPromotions();
  }, [userInfo]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="status-badge active">Active</span>;
      case 'completed':
        return <span className="status-badge completed">Completed</span>;
      case 'pending':
        return <span className="status-badge pending">Pending</span>;
      default:
        return <span className="status-badge">Unknown</span>;
    }
  };

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

  if (loading) {
    return (
      <div className="my-promotions-container">
        <div className="loading">Loading your promotions...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="my-promotions-container">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="my-promotions-container">
      <div className="promotions-header">
        <h2>My Promotions</h2>
        <p>View and manage all promotion tasks you've created</p>
      </div>

      {promotions.length === 0 ? (
        <div className="no-promotions">
          <div className="empty-state">
            <h3>No Promotions Created</h3>
            <p>You haven't created any promotion tasks yet.</p>
            <p>Start by creating your first promotion task!</p>
          </div>
        </div>
      ) : (
        <div className="promotions-grid">
          {promotions.map(promotion => (
            <div key={promotion.id} className="promotion-card">
              <div className="promotion-header">
                <div className="platform-icon">
                  {getPlatformIcon(promotion.platform)}
                </div>
                <div className="promotion-info">
                  <h3 className="promotion-title">{promotion.name}</h3>
                  {getStatusBadge(promotion.status)}
                </div>
              </div>
              
              <p className="promotion-description">{promotion.description}</p>
              
              <div className="promotion-details">
                <div className="detail-item">
                  <span className="label">Reward:</span>
                  <span className="value reward">{promotion.reward} USDC</span>
                </div>
                <div className="detail-item">
                  <span className="label">Deadline:</span>
                  <span className="value">{promotion.deadline}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Created:</span>
                  <span className="value">
                    {new Date(promotion.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="requirements">
                <h4>Requirements:</h4>
                <ul>
                  {promotion.requirements.map((req, index) => (
                    <li key={index}>{req}</li>
                  ))}
                </ul>
              </div>

              <div className="promotion-actions">
                <button 
                  className="btn-view-participants"
                  onClick={() => {
                    setSelectedTaskId(promotion.id);
                    setShowParticipants(true);
                  }}
                >
                  View Participants
                </button>
                <button className="btn-edit">
                  Edit
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showParticipants && selectedTaskId && (
        <ParticipantsList
          taskId={selectedTaskId}
          userInfo={userInfo}
          onClose={() => {
            setShowParticipants(false);
            setSelectedTaskId(null);
          }}
        />
      )}
    </div>
  );
};

export default MyPromotions;
