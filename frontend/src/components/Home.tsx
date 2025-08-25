import './Home.css';
import { FiLayers, FiCode, FiDatabase} from 'react-icons/fi';

interface HomeProps {
  setCurrent: (page: string) => void;
}

const Home = ({ setCurrent }: HomeProps) => {
  const features = [
    {
      icon: <FiLayers size={32} />,
      title: 'Easy NFT Creation',
      description: 'Transform your digital art, photos, or designs into unique NFTs with our simple-to-use tools. No coding knowledge required!'
    },
    {
      icon: <FiCode size={32} />,
      title: 'Secure Minting',
      description: 'We use the latest blockchain technology to ensure your NFTs are securely minted and truly yours, giving you full ownership and control.'
    },
    {
      icon: <FiDatabase size={32} />,
      title: 'Effortless Marketplace',
      description: 'List your NFTs for sale on our integrated marketplace. Connect with a global community of buyers and start earning from your creations.'
    }

  ];

  return (
    <div className="home-container">
      <section className="hero-section">
        <h1 className="hero-title">What is Web3Face?</h1>
        <p className="hero-subtitle">
          Unleash your creativity and become a part of the Web3 revolution with our platform. We provide a seamless and intuitive experience for anyone to create, mint, and sell their own unique NFTs. Whether you're an artist, collector, or just curious about the world of digital assets, our site makes it easy to turn your ideas into valuable, tradable NFTs.
        </p>
      </section>

      <section className="features-section">
        <h2 className="section-title">Why Choose Our Platform</h2>
        <div className="features-grid">
          {features.map((feature, index) => (
            <div key={index} className="feature-card">
              <div className="feature-icon">{feature.icon}</div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-desc">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="cta-section">
        <h2 className="cta-title">Ready to Get Started?</h2>
        <p className="hero-subtitle">
          Join thousands of businesses already using our platform
        </p>
        <div className="cta-buttons">
          <button className="btn secondary-btn" onClick={() => setCurrent('support')}>
            Contact Us
          </button>
        </div>
      </section>
    </div>
  );
};

export default Home;
