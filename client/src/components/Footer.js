import React from 'react';
import { Link } from 'react-router-dom';
import { FaGithub, FaTwitter, FaLinkedin } from 'react-icons/fa';
import styles from '../styles/Footer.module.scss';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.row}>
          <div className={styles.column}>
            <h4>SovereignID</h4>
            <p>Blockchain-based self-sovereign digital identity management.</p>
          </div>
          
          <div className={styles.column}>
            <h4>Quick Links</h4>
            <ul>
              <li><Link to="/about">About</Link></li>
              <li><Link to="/faq">FAQ</Link></li>
              <li><Link to="/support">Support</Link></li>
              <li><a href="https://docs.sovereignid.io" target="_blank" rel="noopener noreferrer">Documentation</a></li>
            </ul>
          </div>
          
          <div className={styles.column}>
            <h4>Legal</h4>
            <ul>
              <li><Link to="/privacy">Privacy Policy</Link></li>
              <li><Link to="/terms">Terms of Service</Link></li>
              <li><Link to="/security">Security</Link></li>
            </ul>
          </div>
          
          <div className={styles.column}>
            <h4>Connect With Us</h4>
            <div className={styles.socialLinks}>
              <a href="https://github.com/sovereignid" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
                <FaGithub />
              </a>
              <a href="https://twitter.com/sovereignid" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                <FaTwitter />
              </a>
              <a href="https://linkedin.com/company/sovereignid" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                <FaLinkedin />
              </a>
            </div>
          </div>
        </div>
        
        <div className={styles.copyright}>
          <p>&copy; {currentYear} SovereignID. All rights reserved.</p>
          <p>Powered by Ethereum & IPFS</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;