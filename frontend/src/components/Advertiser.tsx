
import React, { useState, useEffect } from 'react';
import type { UserInfoDTO} from '../domain/dto';
import './Advertiser.css';
import axios from 'axios';
import MyPromotions from './MyPromotions';

const Advertiser = () => {
  const [currentView, setCurrentView] = useState<'create' | 'my-promotions'>('create');
  const [platform, setPlatform] = useState('x');
  const [userInfo, setUserInfo] = useState<UserInfoDTO | null>(null);

  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [reward, setReward] = useState(50);
  const [requirements, setRequirements] = useState('');
  const [deadline, setDeadline] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (!userInfo) {
        setError('User not authenticated');
        setLoading(false);
        return;
      }

      // 首先获取推文信息
      console.log('Creating promotion task for platform:', platform, 'with URL:', url);
      console.log('Using token:', userInfo.token);
      
      const tweetInfoResponse = await axios.post(`/api/promotion/${platform}`, 
        { url },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${userInfo.token}`
          }
        }
      );

      // 然后创建推广任务
      const promotionTaskRequest = {
        platform: platform,
        url: url,
        name: name,
        title: name || `${platform.toUpperCase()} 推广任务`,
        description: `推广内容: ${url}`,
        reward: reward, // 使用用户输入的奖励金额
        deadline: deadline || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 使用用户输入的截止时间或默认7天后
        requirements: requirements ? requirements.split('\n').filter(req => req.trim()) : [
          '至少100个粉丝',
          '内容包含指定标签',
          '保持内容至少24小时'
        ],
        created_by: userInfo.public_key
      };

      const createTaskResponse = await axios.post('/api/promotion/tasks', 
        promotionTaskRequest,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${userInfo.token}`
          }
        }
      );

      setSuccess('Promotion task created successfully!');
      console.log('Promotion task created:', createTaskResponse.data);
      setUrl('');
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to create promotion task');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {

    const user = localStorage.getItem('user');
    if (user) {
      console.log('User data:', JSON.parse(user));
      let userInfo = JSON.parse(user) as UserInfoDTO;
      setUserInfo(userInfo);
      console.log('User Public Key:', userInfo.public_key);
      console.log('User Nickname:', userInfo.nickname);
      console.log('User Token:', userInfo.token);
      console.log('Is Admin:', userInfo.is_admin);
      setLoading(false);
    } else {
      console.log('No user data found');
      setLoading(false);
    }
  }, []);

  return (
    <div className="advertiser-container">
      <div className="advertiser-header">
        <h1>Promotion Task</h1>
        <button 
          className={`view-toggle-btn ${currentView === 'my-promotions' ? 'active' : ''}`}
          onClick={() => setCurrentView(currentView === 'create' ? 'my-promotions' : 'create')}
        >
          {currentView === 'create' ? 'My Promotions' : 'Create Promotion'}
        </button>
      </div>

      {currentView === 'create' ? (
        <form onSubmit={handleSubmit} className="promotion-form">
        <div className="form-group">
          <label htmlFor="platform">Social Platform</label>
          <select
            id="platform"
            value={platform}
            onChange={(e) => setPlatform(e.target.value)}
            className="form-control"
            required
          >
            <option value="x">X (Twitter)</option>
            {/* Additional platforms can be added here */}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="name">Task Name</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="form-control"
            placeholder="Enter task name"
            required
          />
          <small className="form-text">
            Give your promotion task a name
          </small>
        </div>

        <div className="form-group">
          <label htmlFor="url">Post URL</label>
          <input
            type="url"
            id="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="form-control"
            placeholder="https://x.com/username/status/1234567890"
            required
          />
          <small className="form-text">
            Enter the URL of the post you want to promote
          </small>
        </div>

        <div className="form-group">
          <label htmlFor="reward">Reward (USDC)</label>
          <input
            type="number"
            id="reward"
            value={reward}
            onChange={(e) => setReward(Number(e.target.value))}
            className="form-control"
            placeholder="50"
            min="1"
            required
          />
          <small className="form-text">
            Set the reward amount in USDC
          </small>
        </div>

        <div className="form-group">
          <label htmlFor="requirements">Requirements</label>
          <textarea
            id="requirements"
            value={requirements}
            onChange={(e) => setRequirements(e.target.value)}
            className="form-control"
            placeholder="Enter requirements, one per line
• At least 100 followers
• Include specific hashtags
• Keep content for at least 24 hours"
            rows={4}
          />
          <small className="form-text">
            Enter task requirements, one per line
          </small>
        </div>

        <div className="form-group">
          <label htmlFor="deadline">Deadline</label>
          <input
            type="date"
            id="deadline"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className="form-control"
            min={new Date().toISOString().split('T')[0]}
          />
          <small className="form-text">
            Set the deadline for this promotion task
          </small>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <button 
          type="submit" 
          className="btn-submit" 
          disabled={loading}
        >
          {loading ? 'Creating...' : 'Create Promotion Task'}
        </button>
      </form>
      ) : (
        <MyPromotions userInfo={userInfo} />
      )}
    </div>
  );
};

export default Advertiser;
