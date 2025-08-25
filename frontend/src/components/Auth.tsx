import { useState }  from 'react';

import type { LoginRequest } from '../domain/request';

import {
  useWallet,
} from "@suiet/wallet-kit"

import './Auth.css'

import { Button } from 'antd'
import axios from 'axios';


const Auth = () => {
  const [signature, setSignature] = useState('');
  const wallet = useWallet();


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
      axios.post('/api/auth', loginRequest)      
        .then(response => {
          console.log('Login successful:', response.data);
          if(response.data.code == 200 ) {
            localStorage.setItem('user', JSON.stringify(response.data.data));          
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
        <h2>Login with Wallet</h2>
        <Button 
          type="primary" 
          onClick={handleSign}
          disabled={!wallet.connected}
        >          Sign with Sui Wallet
        </Button>
      </div>
    </div>
  );
};

export default Auth;
