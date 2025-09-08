import React, { useState } from 'react';
import Home from './components/Home';
import NFT from './components/Nft';
import Blog from './components/Blog';
import Support from './components/Support';
import Auth from './components/Auth';
import AdminSettings from './components/AdminSettings';
import GameNav from './components/GameNav';
import GameFooter from './components/GameFooter';

import './App.css';

const App: React.FC = () => {
  const [current, setCurrent] = useState('home');

  return (
    <div className="game-app">
      <GameNav current={current} setCurrent={setCurrent} />
      <main>
        {current === 'home' && <Home setCurrent={setCurrent} />}
        {current === 'nft' && <NFT />}
        {current === 'blog' && <Blog />}
        {current === 'support' && <Support />}
        {current === 'auth' && <Auth />}
        {current === 'admin' && <AdminSettings />}
      </main>
      <GameFooter />
    </div>
  );
};

export default App;
