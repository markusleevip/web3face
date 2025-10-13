import React, { useState, useEffect } from 'react';
import type { UserInfoDTO } from '../domain/dto';
import axios from 'axios';

interface ParticipationFormProps {
  taskId: number;
  setCurrent: (page: string, taskId?: number) => void;
}

interface PromotionTask {
  id: number;
  name: string;
  title: string;
  description: string;
  platform: string;
  reward: number;
  status: string;
  deadline: string;
  requirements: string[];
}

const ParticipationForm = ({ taskId, setCurrent }: ParticipationFormProps) => {
  const [task, setTask] = useState<PromotionTask | null>(null);
  const [userInfo, setUserInfo] = useState<UserInfoDTO | null>(null);
  const [submissionUrl, setSubmissionUrl] = useState('');
  const [submissionText, setSubmissionText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchTaskDetails = async () => {
      try {
        const response = await axios.get('/api/promotion/tasks');
        if (response.data.code === 200) {
          const tasks = response.data.data;
          const foundTask = tasks.find((t: any) => 
            parseInt(t.id.replace(/\D/g, '')) === taskId || t.id === taskId.toString()
          );
          if (foundTask) {
            setTask({
              id: taskId,
              name: foundTask.name || foundTask.title,
              title: foundTask.title,
              description: foundTask.description,
              platform: foundTask.platform,
              reward: foundTask.reward,
              status: foundTask.status,
              deadline: foundTask.deadline,
              requirements: foundTask.requirements
            });
          }
        }
      } catch (error) {
        console.error('Error fetching task details:', error);
      }
    };

    const user = localStorage.getItem('user');
    if (user) {
      setUserInfo(JSON.parse(user));
    }

    fetchTaskDetails();
  }, [taskId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (!userInfo) {
        setError('请先登录');
        setLoading(false);
        return;
      }

      if (!submissionUrl || !submissionText) {
        setError('请填写所有必填字段');
        setLoading(false);
        return;
      }

      const participationRequest = {
        task_id: taskId.toString(),
        submission_url: submissionUrl,
        submission_text: submissionText
      };

      const response = await axios.post('/api/participation', 
        participationRequest,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${userInfo.token}`
          }
        }
      );

      setSuccess('参与任务提交成功！等待审核');
      setTimeout(() => {
        setCurrent('promotion-tasks');
      }, 2000);
    } catch (error: any) {
      setError(error.response?.data?.message || '提交失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  if (!task) {
    return <div className="loading">加载任务信息中...</div>;
  }

  return (
    <div className="participation-form-container">
      <div className="form-header">
        <button 
          className="back-button"
          onClick={() => setCurrent('promotion-tasks')}
        >
          ← 返回任务列表
        </button>
        <h1>参与推广任务</h1>
      </div>

      <div className="task-info-card">
        <h2>{task.name}</h2>
        <p className="task-description">{task.description}</p>
        
        <div className="task-details">
          <div className="detail-item">
            <span className="label">平台:</span>
            <span className="value">{task.platform.toUpperCase()}</span>
          </div>
          <div className="detail-item">
            <span className="label">奖励:</span>
            <span className="value">{task.reward} USDC</span>
          </div>
          <div className="detail-item">
            <span className="label">截止时间:</span>
            <span className="value">{task.deadline}</span>
          </div>
        </div>

        <div className="requirements">
          <h3>任务要求:</h3>
          <ul>
            {task.requirements.map((req, index) => (
              <li key={index}>{req}</li>
            ))}
          </ul>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="participation-form">
        <div className="form-group">
          <label htmlFor="submissionUrl">提交链接 *</label>
          <input
            type="url"
            id="submissionUrl"
            value={submissionUrl}
            onChange={(e) => setSubmissionUrl(e.target.value)}
            className="form-control"
            placeholder="请输入您完成推广的链接"
            required
          />
          <small className="form-text">
            请提供您完成推广任务的链接（如推文链接、帖子链接等）
          </small>
        </div>

        <div className="form-group">
          <label htmlFor="submissionText">提交说明 *</label>
          <textarea
            id="submissionText"
            value={submissionText}
            onChange={(e) => setSubmissionText(e.target.value)}
            className="form-control"
            placeholder="请简要说明您是如何完成推广任务的"
            rows={4}
            required
          />
          <small className="form-text">
            请描述您完成推广任务的具体情况
          </small>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <button 
          type="submit" 
          className="btn-submit" 
          disabled={loading}
        >
          {loading ? '提交中...' : '提交参与'}
        </button>
      </form>
    </div>
  );
};

export default ParticipationForm;
