import React, { useState, useEffect } from 'react';
import type { UserInfoDTO } from '../domain/dto';
import axios from 'axios';
import './MyPromotions.css';

interface Participant {
  id: string;
  user_public_key: string;
  submission_url: string;
  submission_text: string;
  status: string;
  submitted_at: string;
  reviewed_at: string | null;
  reviewer_notes: string | null;
}

interface ParticipantsListProps {
  taskId: string;
  userInfo: UserInfoDTO | null;
  onClose: () => void;
}

const ParticipantsList = ({ taskId, userInfo, onClose }: ParticipantsListProps) => {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchParticipants = async () => {
      try {
        if (!userInfo) {
          setError('User not authenticated');
          setLoading(false);
          return;
        }

        // 获取任务的参与用户
        const response = await axios.get(`/api/participation/task/${taskId}`, {
          headers: {
            'Authorization': `Bearer ${userInfo.token}`
          }
        });

        if (response.data.code === 200) {
          setParticipants(response.data.data.participations || []);
        }
      } catch (error: any) {
        setError(error.response?.data?.message || 'Failed to fetch participants');
      } finally {
        setLoading(false);
      }
    };

    fetchParticipants();
  }, [taskId, userInfo]);

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

  const handleApprove = async (participationId: string) => {
    try {
      await axios.put(`/api/participation/${participationId}/approve`, {}, {
        headers: {
          'Authorization': `Bearer ${userInfo?.token}`
        }
      });
      // 重新加载参与者列表
      setParticipants(prev => prev.map(p => 
        p.id === participationId ? { ...p, status: 'approved' } : p
      ));
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to approve participation');
    }
  };

  const handleReject = async (participationId: string) => {
    try {
      await axios.put(`/api/participation/${participationId}/reject`, {}, {
        headers: {
          'Authorization': `Bearer ${userInfo?.token}`
        }
      });
      // 重新加载参与者列表
      setParticipants(prev => prev.map(p => 
        p.id === participationId ? { ...p, status: 'rejected' } : p
      ));
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to reject participation');
    }
  };

  if (loading) {
    return (
      <div className="participants-modal">
        <div className="modal-content">
          <div className="modal-header">
            <h3>Participants</h3>
            <button className="close-btn" onClick={onClose}>×</button>
          </div>
          <div className="loading">Loading participants...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="participants-modal">
      <div className="modal-content">
        <div className="modal-header">
          <h3>Participants ({participants.length})</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        {error && <div className="error-message">{error}</div>}

        {participants.length === 0 ? (
          <div className="no-participants">
            <p>No participants yet</p>
          </div>
        ) : (
          <div className="participants-list">
            {participants.map(participant => (
              <div key={participant.id} className="participant-card">
                <div className="participant-header">
                  <div className="participant-info">
                    <h4 className="participant-address">
                      {participant.user_public_key.slice(0, 8)}...{participant.user_public_key.slice(-6)}
                    </h4>
                    <span className={`status-badge ${getStatusClass(participant.status)}`}>
                      {getStatusText(participant.status)}
                    </span>
                  </div>
                </div>

                <div className="submission-details">
                  <div className="submission-item">
                    <span className="label">Submission URL:</span>
                    <a 
                      href={participant.submission_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="submission-link"
                    >
                      {participant.submission_url}
                    </a>
                  </div>
                  <div className="submission-item">
                    <span className="label">Submission Text:</span>
                    <p className="submission-text">{participant.submission_text}</p>
                  </div>
                  <div className="submission-item">
                    <span className="label">Submitted At:</span>
                    <span className="value">
                      {new Date(parseInt(participant.submitted_at) * 1000).toLocaleString()}
                    </span>
                  </div>
                </div>

                {participant.reviewer_notes && (
                  <div className="review-notes">
                    <span className="label">Review Notes:</span>
                    <p className="notes-text">{participant.reviewer_notes}</p>
                  </div>
                )}

                {participant.status === 'pending' && (
                  <div className="review-actions">
                    <button 
                      className="btn-approve"
                      onClick={() => handleApprove(participant.id)}
                    >
                      Approve
                    </button>
                    <button 
                      className="btn-reject"
                      onClick={() => handleReject(participant.id)}
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ParticipantsList;
