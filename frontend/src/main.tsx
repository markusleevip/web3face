import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import {
  WalletProvider,
  type Chain,  
  SuiTestnetChain,
  
} from '@suiet/wallet-kit'
import '@suiet/wallet-kit/style.css'
const SupportedChains: Chain[] = [
  
  SuiTestnetChain,
  
  // NOTE: you can add custom chain (network),
  // but make sure the connected wallet does support it
  // customChain,
];
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <WalletProvider chains={SupportedChains}>
        <App />
    </WalletProvider>
  </StrictMode>,
)
