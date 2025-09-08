import { useState, useEffect }  from 'react';
import {Transaction} from '@mysten/sui/transactions'
import { SuiClient,getFullnodeUrl } from '@mysten/sui/client';
import type { UserInfoDTO} from '../domain/dto';
import {
  useWallet,
} from "@suiet/wallet-kit";

import {  Input , InputNumber } from 'antd';
import './Nft.css';

const suiScanUrl = import.meta.env.VITE_SUISCAN_URL;
const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;
const feeConfigAddress = import.meta.env.VITE_FEE_CONFIG_ADDRESS;
const adminCapAddress = import.meta.env.VITE_ADMIN_CAP_ADDRESS;
const appName = import.meta.env.VITE_APP_NAME;

const fee = 200_000_000;
const ONE_SUI_IN_LAMPORTS = 1_000_000_000;
const NFT = () => {
  const [status, setStatus] = useState('');

  const [userInfo, setUserInfo] = useState<UserInfoDTO | null>(null);
  const [digest, setDigest] = useState<string | null>(null);
  
  const [nftName,setNftName] = useState<string>('Demo NFT');
  const [nftImgUrl,setNftImgUrl] = useState<string>('https://web3face.xyz/static/resource/icon-512.png');

  // amount: number = 1 * 1_000_000_000; // 1 SUI in lamports
  const [amount, setAmount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const wallet = useWallet();

  async function createNFT() {
    if (!wallet.address) {
      console.error('Wallet address is not available');
      return;
    }
    const suiClient = new SuiClient({ url: getFullnodeUrl('testnet') }); // 可以选择 'mainnet', 'testnet', 'devnet'
    const senderAddress = wallet.address;
    const { data: coins } = await suiClient.getCoins({ owner: senderAddress });    
    const suiCoin = coins.find(coin => coin.coinType === '0x2::sui::SUI' && parseInt(coin.balance) >= fee);
    if (!suiCoin) {
      setStatus('错误: 没有找到足够的 Testnet SUI 币用于支付。请确保您至少有 0.2 SUI 测试币。');
      setLoading(false);
      return;
    }

    const txb = new Transaction();
    const [coin] = txb.splitCoins(txb.gas, [fee])

    txb.setSender(wallet.address);
    txb.setGasBudget(10_000_000);

    const paymentCoin = txb.object(coin);
    const feeConfigObjectId = txb.object(feeConfigAddress);
    console.log(parseInt(suiCoin.balance));
    console.log(suiCoin.coinObjectId);

    const contractModule = "web3face_nft";
    const contractMethod = "mint";     

    txb.moveCall({
      target: `${contractAddress}::${contractModule}::${contractMethod}`,
      arguments: [
        paymentCoin,
        txb.pure.string(nftName),
        txb.pure.string(nftImgUrl),
        feeConfigObjectId,
      ],
    });

  console.log("nftName:", nftName);
  console.log("nftImgUrl:", nftImgUrl);

    const resData = await wallet.signAndExecuteTransaction({
      transaction: txb,
      
    });
    console.log(resData.digest)
    setDigest(resData.digest);
    return txb;
  }

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
      setError(new Error('No user data found'));
      setLoading(false);
    }
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="nft-container">
      <div className="nft-header">
      <p>appName:{appName}</p>
        <p>suiScanUrl:{suiScanUrl}</p>
        <p>合约地址:{contractAddress}</p>          
        <p>feeConfig地址:{feeConfigAddress}</p>
      </div>

      {/* Create NFT Section */}
      <div className="transaction-section">
        <h3 className="section-title">Create NFT</h3>
        <div className="form-group">
          <span className="gradient">Current chain of wallet: </span>
          {wallet.chain?.name}
        </div>

        <div className="form-group">
          <span className="gradient">NFT Name: </span>
          <Input 
            type="text"
            value={nftName || ''}
            onChange={(e) => setNftName(e.target.value)}
            placeholder="Enter NFT Name"
            className="img-input"
          />
        </div>

        <div className="form-group">
          <span className="gradient">NFT Image URL: </span>
          <Input 
            type="text"
            value={nftImgUrl || ''}
            onChange={(e) => setNftImgUrl(e.target.value)}
            placeholder="Enter NFT Image URL"
            className="img-input"
          />
        </div>
        
        <button className='btn btn-primary' onClick={() => createNFT()}>
          Create NFT
        </button>
      </div>


      {digest && (
        <div className="transaction-section">
          <p>Transaction Digest: {digest}</p>
          <a 
            className="transaction-link" 
            target="_blank" 
            rel="noopener noreferrer"
            href={`${suiScanUrl}tx/${digest}`}
          >
            View on Suiscan
          </a>
        </div>
      )}

      <div className="data-display">
        <pre>{JSON.stringify(userInfo, null, 2)}</pre>
      </div>
      <div>
      {status && (
        <p className={`mt-6 text-center text-sm ${status.includes('错误') ? 'text-red-600' : 'text-green-600'} font-medium bg-gray-100 p-3 rounded-lg`}>
          {status}
        </p>
      )}
      </div>
    </div>
  );
};

export default NFT;
