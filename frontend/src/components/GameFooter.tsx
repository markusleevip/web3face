import './GameFooter.css';
import XLogo from '../assets/X_logo.svg';
import TGLogo from '../assets/Telegram_logo.svg';

const GameFooter = () => {
  return (
    <footer className="game-footer">
      <div className="social-links">
        <a 
          href="https://t.me"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img src={TGLogo} alt="Telegram"  />
        </a>
        <a 
          href="https://x.com"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img src={XLogo} alt="X (Twitter)"  />
        </a>
      </div>
      <p>© 2025 Web3 Face. All rights reserved.</p>
    </footer>
  );
};

export default GameFooter;
