// import React, { useState } from 'react';
import {ConnectButton} from '@suiet/wallet-kit';
import { useEffect, useState } from 'react';
import type { UserInfoDTO } from '../domain/dto';

import './GameNav.css';
import logo from '../assets/logo.png';

const GameNav = ({ current, setCurrent }: { current: string, setCurrent: (key: string) => void }) => {
  const [userInfo, setUserInfo] = useState<UserInfoDTO | null>(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUserInfo(JSON.parse(userData));
    }
  }, []);
  return (
    <nav className="game-nav">
      <div  className="nav-logo" >
        <img src={logo} alt="Logo"/>
      </div>
      <div 
        className={`nav-item ${current === 'home' ? 'active' : ''}`}
        onClick={() => setCurrent('home')}
      >
        Promotion
      </div>
      {userInfo && (
        <div 
          className={`nav-item ${current === 'my-tasks' ? 'active' : ''}`}
          onClick={() => setCurrent('my-tasks')}
        >
          我的任务
        </div>
      )}
       <div 
        className={`nav-item ${current === 'nft' ? 'active' : ''}`}
        onClick={() => setCurrent('nft')}
      >
        NFT
      </div>
      <div 
        className={`nav-item ${current === 'blog' ? 'active' : ''}`}
        onClick={() => setCurrent('blog')}
      >
        Blog
      </div>
      <div 
        className={`nav-item ${current === 'advertiser' ? 'active' : ''}`}
        onClick={() => setCurrent('advertiser')}
      >
        Advertiser
      </div>
      <div
        className={`nav-item ${current === 'support' ? 'active' : ''}`}
        onClick={() => setCurrent('support')}
      >
        Support
      </div>
      <div
        className={`nav-item ${current === 'auth' ? 'active' : ''}`}
        onClick={() => setCurrent('auth')}
      >
        {userInfo ? 'Logout' : 'Login'}
      </div>
      {userInfo?.is_admin && (
        <div
          className={`nav-item ${current === 'admin' ? 'active' : ''}`}
          onClick={() => setCurrent('admin')}
        >
          Settings
        </div>
      )}
      <div className="nav-connect">
        <ConnectButton />
      </div>
    </nav>
  );
};

export default GameNav;
