// import React, { useState } from 'react';
import {ConnectButton} from '@suiet/wallet-kit';

import './GameNav.css';
import logo from '../assets/logo.png';

const GameNav = ({ current, setCurrent }: { current: string, setCurrent: (key: string) => void }) => {
  return (
    <nav className="game-nav">
      <div  className="nav-logo" >
        <img src={logo} alt="Logo"/>
      </div>
      <div 
        className={`nav-item ${current === 'home' ? 'active' : ''}`}
        onClick={() => setCurrent('home')}
      >
        Home
      </div>      
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
        className={`nav-item ${current === 'support' ? 'active' : ''}`}
        onClick={() => setCurrent('support')}
      >
        Support
      </div>
      <div
        className={`nav-item ${current === 'auth' ? 'active' : ''}`}
        onClick={() => setCurrent('auth')}
      >
        Login
      </div>
      <div className="nav-connect">
        <ConnectButton />
      </div>
    </nav>
  );
};

export default GameNav;
