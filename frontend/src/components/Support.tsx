// import React from 'react';
import './Support.css';

const Support = () => {
  const faqs = [
    {
      question: 'How do I get started with Web3Face?',
      answer: 'Check out our getting started guide in the documentation section for step-by-step instructions.'
    },
    {
      question: 'What blockchain networks do you support?',
      answer: 'We currently support Ethereum, Polygon, and Binance Smart Chain, with more networks coming soon.'
    },
    {
      question: 'How can I contact the support team?',
      answer: 'You can use the contact form on this page or reach out through our community channels.'
    },
    {
      question: 'What are your response times?',
      answer: 'We aim to respond to all inquiries within 24 hours during business days.'
    }
  ];

  return (
    <div className="support-container">
      {/* Hero Section */}
      <section className="support-hero">
        <h1 className="support-title">We're Here to Help</h1>
        <p className="support-subtitle">
          Our support team is ready to assist you with any questions or issues you may have.
        </p>        
      </section>

      {/* Main Content Sections */}
      <div className="support-sections">
         {/* FAQ Section */}
        <section className="support-section">
          <h2 className="section-title">Frequently Asked Questions</h2>
          <div className="faq-list">
            {faqs.map((faq, index) => (
              <div key={index} className="faq-item">
                <h3 className="faq-question">{faq.question}</h3>
                <p className="faq-answer">{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Support;
