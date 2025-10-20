import React, { useState, useEffect } from 'react';
import type { UserInfoDTO } from '../domain/dto';
import axios from 'axios';
import './MyPromotions.css';
import { useWallet } from '@suiet/wallet-kit';
import { Transaction } from '@mysten/sui/transactions';
import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';

interface Participant {
  id: string;
  user_public_key: string;
  submission_url: string;
  submission_text: string;
  status: string;
  submitted_at: string;
  reviewed_at: string | null;
  reviewer_notes: string | null;
  author_followers_count: number | null;
  author_username: string | null;
}

interface ParticipantsListProps {
  taskId: string;
  userInfo: UserInfoDTO | null;
  onClose: () => void;
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
  created_by: string;
  created_at: string;
}

const ParticipantsList = ({ taskId, userInfo, onClose }: ParticipantsListProps) => {
  const { connected, account, signAndExecuteTransaction } = useWallet();
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [task, setTask] = useState<PromotionTask | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [paymentLoading, setPaymentLoading] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!userInfo) {
          setError('User not authenticated');
          setLoading(false);
          return;
        }

        // 获取任务信息
        const tasksResponse = await axios.get('/api/promotion/tasks', {
          headers: {
            'Authorization': `Bearer ${userInfo.token}`
          }
        });

        if (tasksResponse.data.code === 200) {
          const foundTask = tasksResponse.data.data.find((t: PromotionTask) => t.id === taskId);
          setTask(foundTask || null);
        }

        // 获取任务的参与用户
        const participantsResponse = await axios.get(`/api/participation/task/${taskId}`, {
          headers: {
            'Authorization': `Bearer ${userInfo.token}`
          }
        });

        if (participantsResponse.data.code === 200) {
          setParticipants(participantsResponse.data.data.participations || []);
        }
      } catch (error: any) {
        setError(error.response?.data?.message || 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [taskId, userInfo]);

  const handlePayment = async (participant: Participant) => {
    if (!connected || !account) {
      setError('Please connect your wallet first');
      return;
    }

    if (!task) {
      setError('Task information not found');
      return;
    }

    setPaymentLoading(participant.id);

    try {
      // 使用真实的SUI代币转账实现
      const suiClient = new SuiClient({ url: getFullnodeUrl('testnet') });
      const senderAddress = account.address;
      
      // 检查发送者是否有足够的SUI代币
      const { data: coins } = await suiClient.getCoins({ owner: senderAddress });
      const rewardAmount = task.reward * 1000000000; // 转换为最小单位
      const totalAmount = rewardAmount + 100000000; // 奖励金额 + 预估gas费
      
      const suiCoin = coins.find(coin => 
        coin.coinType === '0x2::sui::SUI' && parseInt(coin.balance) >= totalAmount
      );
      
      if (!suiCoin) {
        setError(`Insufficient SUI balance. Need at least ${task.reward + 0.01} SUI (including gas fee)`);
        setPaymentLoading(null);
        return;
      }

      // 构建转账交易
      const txb = new Transaction();
      txb.setSender(senderAddress);
      txb.setGasBudget(10000000); // 设置gas预算

      // 拆分代币用于转账
      const [paymentCoin] = txb.splitCoins(txb.gas, [rewardAmount]);

      // 调用SUI转账函数
      txb.transferObjects([paymentCoin], participant.user_public_key);

      // 执行交易
      const result = await signAndExecuteTransaction({
        transaction: txb,
      });

      console.log('Payment successful:', result);
      
      // 调用后端API更新参与者状态为已支付
      await axios.put(`/api/participation/${participant.id}/paid`, {
        transaction_digest: result.digest
      }, {
        headers: {
          'Authorization': `Bearer ${userInfo?.token}`
        }
      });

      // 更新前端状态
      setParticipants(prev => prev.map(p => 
        p.id === participant.id ? { ...p, status: 'paid' } : p
      ));

      alert(`Payment of ${task.reward} SUI sent successfully to ${participant.user_public_key.slice(0, 8)}...${participant.user_public_key.slice(-6)}\nTransaction Digest: ${result.digest}`);
      
    } catch (error: any) {
      console.error('Payment failed:', error);
      setError(`Payment failed: ${error.message || 'Unknown error'}`);
    } finally {
      setPaymentLoading(null);
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'approved':
        return 'Approved';
      case 'rejected':
        return 'Rejected';
      case 'paid':
        return 'Paid';
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
      case 'paid':
        return 'status-paid';
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
                  {participant.author_username && (
                    <div className="submission-item">
                      <span className="label">X Username:</span>
                      <span className="value">
                        @{participant.author_username}
                      </span>
                    </div>
                  )}
                  {participant.author_followers_count !== null && (
                    <div className="submission-item">
                      <span className="label">Followers:</span>
                      <span className="value followers-count">
                        {participant.author_followers_count.toLocaleString()}
                      </span>
                    </div>
                  )}
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

                {participant.status === 'approved' && task && (
                  <div className="payment-actions">
                    <div className="payment-info">
                      <span className="reward-amount">Reward: {task.reward} SUI</span>
                    </div>
                    <button 
                      className="btn-pay"
                      onClick={() => handlePayment(participant)}
                      disabled={paymentLoading === participant.id || !connected}
                    >
                      {paymentLoading === participant.id ? 'Processing...' : 'Pay Reward'}
                    </button>
                    {!connected && (
                      <div className="wallet-notice">
                        Connect wallet to make payment
                      </div>
                    )}
                  </div>
                )}

                {participant.status === 'paid' && (
                  <div className="payment-status">
                    <span className="paid-badge">Paid</span>
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
