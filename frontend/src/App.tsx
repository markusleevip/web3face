import React, { useState } from 'react';
import PromotionTasks from './components/PromotionTasks';
import PromotionDetail from './components/PromotionDetail';
import Home from './components/Home';
import NFT from './components/Nft';
import Blog from './components/Blog';
import Support from './components/Support';
import Auth from './components/Auth';
import AdminSettings from './components/AdminSettings';
import GameNav from './components/GameNav';
import GameFooter from './components/GameFooter';
import Advertiser from './components/Advertiser';
import ParticipationForm from './components/ParticipationForm';
import MyTasks from './components/MyTasks';


import './App.css';

interface AppState {
  page: string;
  taskId?: number;
}

const App: React.FC = () => {
  const [current, setCurrent] = useState<AppState>({ page: 'home' });

  const handleSetCurrent = (page: string, taskId?: number) => {
    setCurrent({ page, taskId });
  };

  return (
    <div className="game-app">
      <GameNav current={current.page} setCurrent={(page) => handleSetCurrent(page)} />
      <main>
        {current.page === 'home' && <PromotionTasks setCurrent={handleSetCurrent} />}
        {current.page === 'promotion-detail' && <PromotionDetail taskId={current.taskId} setCurrent={handleSetCurrent} />}
        {current.page === 'participation-form' && <ParticipationForm taskId={current.taskId!} setCurrent={handleSetCurrent} />}
        {current.page === 'my-tasks' && <MyTasks setCurrent={handleSetCurrent} />}
        {current.page === 'nft' && <NFT />}
        {current.page === 'blog' && <Blog />}
        {current.page === 'advertiser' && <Advertiser />}
        {current.page === 'support' && <Support />}
        {current.page === 'auth' && <Auth />}
        {current.page === 'admin' && <AdminSettings />}
      </main>
      <GameFooter />
    </div>
  );
};

export default App;
