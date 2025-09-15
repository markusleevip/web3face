
import React, { useState, useEffect } from 'react';
import type { UserInfoDTO} from '../domain/dto';
import './Advertiser.css';
import axios from 'axios';

const Advertiser = () => {
  const [platform, setPlatform] = useState('x');
  const [userInfo, setUserInfo] = useState<UserInfoDTO | null>(null);

  const [url, setUrl] = useState('');
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
      console.log('Creating promotion task for platform:', platform, 'with URL:', url);
      console.log('Using token:', userInfo.token);
      const response = await axios.post(`/api/promotion/${platform}`, 
        { url },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${userInfo.token}`
          }
        }
      );

      setSuccess('Promotion task created successfully!');
      console.log('Promotion task created:', response.data);
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
      <h1>Create Promotion Task</h1>
      
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
    </div>
  );
};

export default Advertiser;
