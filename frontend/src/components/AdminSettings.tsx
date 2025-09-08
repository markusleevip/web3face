import React, { useState, useEffect } from 'react';
import {Transaction} from '@mysten/sui/transactions';
import { InputNumber } from 'antd';
import { useWallet } from "@suiet/wallet-kit";
import type { UserInfoDTO } from '../domain/dto';
import './AdminSettings.css';

const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;
const feeConfigAddress = import.meta.env.VITE_FEE_CONFIG_ADDRESS;
const adminCapAddress = import.meta.env.VITE_ADMIN_CAP_ADDRESS;
const ONE_SUI_IN_LAMPORTS = 1_000_000_000;

const AdminSettings: React.FC = () => {
  const [userInfo, setUserInfo] = useState<UserInfoDTO | null>(null);
  const [feeAmount, setFeeAmount] = useState<number>(0.5);
  const [digest, setDigest] = useState<string | null>(null);
  const wallet = useWallet();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUserInfo(JSON.parse(userData));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    window.location.reload();
  };

  async function updateFeeNFT() {
    if (!wallet.address) {
      console.error('Wallet address is not available');
      return;
    }

    const txb = new Transaction();
    txb.setSender(wallet.address);
    txb.setGasBudget(10_000_000);
    const feeConfigObjectId = txb.object(feeConfigAddress);
    const adminCapObjectId = txb.object(adminCapAddress);

    const contractModule = "web3face_nft";
    const contractMethod = "update_fee"; 

    console.log("updateFeeNFT");
    txb.moveCall({
      target: `${contractAddress}::${contractModule}::${contractMethod}`,
      arguments: [
        adminCapObjectId,        
        feeConfigObjectId,
        txb.pure.u64(ONE_SUI_IN_LAMPORTS * feeAmount)
      ],
    });
    const resData = await wallet.signAndExecuteTransaction({
      transaction: txb,
      
    });
    setDigest(resData.digest);
    console.log(resData.digest);
  }

  if (!userInfo?.is_admin) {
    return (
      <div className="admin-container">
        <div className="admin-card">
          <h2>Access Denied</h2>
          <p>You do not have administrator privileges.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <div className="admin-card">
        <h2>Administrator Settings</h2>
        
        <div className="admin-section">
          <h3>User Information</h3>
          <div className="info-row">
            <span className="label">Public Key:</span>
            <span className="value">{userInfo.public_key}</span>
          </div>
          <div className="info-row">
            <span className="label">Nickname:</span>
            <span className="value">{userInfo.nickname}</span>
          </div>
          <div className="info-row">
            <span className="label">Role:</span>
            <span className="value admin-badge">Administrator</span>
          </div>
        </div>

        <div className="admin-section">
          <h3>NFT Fee Management</h3>
          <div className="form-group">
            <span className="label">Config fee (SUI): </span>
            <InputNumber<string>
              style={{ width: '100%' }}
              defaultValue="0.5"
              min="0"
              max="10"
              step="0.01"
              onChange={(value) => setFeeAmount(value ? Number(value) : 0)}
              stringMode
            />
          </div>
          <button className="admin-btn primary" onClick={() => updateFeeNFT()}>
            Update Fee NFT
          </button>
          
          {digest && (
            <div className="transaction-result">
              <p>Transaction Digest: {digest}</p>
              <p className="success-text">Fee update successful!</p>
            </div>
          )}
        </div>

        <div className="admin-section">
          <h3>Quick Actions</h3>
          <div className="admin-tools">
            <button className="admin-btn secondary">
              View Logs
            </button>
            <button className="admin-btn danger" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
