import { useState, useEffect }  from 'react';

import type { LoginRequest } from '../domain/request';
import type { UserInfoDTO } from '../domain/dto';

import {
  useWallet,
} from "@suiet/wallet-kit"

import './Auth.css'

import { Button } from 'antd'
import api from '../utils/api';


const Auth = () => {
  const [signature, setSignature] = useState('');
  const [userInfo, setUserInfo] = useState<UserInfoDTO | null>(null);
  const wallet = useWallet();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUserInfo(JSON.parse(userData));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUserInfo(null);
    window.location.reload();
  };


  const handleSign = async () => {
    try {
      if (!wallet.address) {
        console.error('Wallet address is not available');      
      }

      const signText = new Date().getTime().toString();
      const signResult = await wallet.signPersonalMessage({
        message: new TextEncoder().encode(signText),
      });
      setSignature(signResult.signature);
      console.log('Signature:', signResult.signature);
      var loginRequest: LoginRequest = {
        public_key: wallet.address!, 
        sign: signResult.signature,
        sign_text: signText,
      }
      api.post('/auth', loginRequest)      
        .then(response => {
          console.log('Login successful:', response.data);
        if(response.data.code == 200 ) {
          localStorage.setItem('user', JSON.stringify(response.data.data));
          localStorage.setItem('token', response.data.data.token);
          // 重新加载页面以更新导航栏
          window.location.reload();
        }
        })
        .catch(error => {
          console.error('Login failed:', error);
        });

    } catch (err) {
      console.error('Sign failed:', err);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        {userInfo ? (
          <>
            <h2>Welcome Back!</h2>
            <div className="user-info">
              <p>Nickname: {userInfo.nickname}</p>
            </div>
            <Button 
              type="primary" 
              onClick={handleLogout}
              className="logout-btn"
            >
              Logout
            </Button>
          </>
        ) : (
          <>
            <h2>Login with Wallet</h2>
            <Button 
              type="primary" 
              onClick={handleSign}
              disabled={!wallet.connected}
            >
              Sign with Sui Wallet
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default Auth;
