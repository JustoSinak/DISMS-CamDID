import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { 
  FaHome, 
  FaIdCard, 
  FaShareAlt, 
  FaWallet, 
  FaCog,
  FaQuestionCircle,
  FaShieldAlt
} from 'react-icons/fa';
import styles from '../styles/Sidebar.module.scss';

const Sidebar = () => {
  const { user } = useAuth();
  
  // Navigation items with icons
  const navItems = [
    { path: '/dashboard', name: 'Dashboard', icon: <FaHome /> },
    { path: '/register-id', name: 'Register ID', icon: <FaIdCard /> },
    { path: '/share-identity', name: 'Share Identity', icon: <FaShareAlt /> },
    { path: '/credential-wallet', name: 'Credentials', icon: <FaWallet /> },
    { path: '/settings', name: 'Settings', icon: <FaCog /> },
  ];

  return (
    <aside className={styles.sidebar}>
      <div className={styles.userInfo}>
        <div className={styles.userAvatar}>
          {user?.profileImage ? (
            <img src={user.profileImage} alt={user.name} />
          ) : (
            <div className={styles.defaultAvatar}>
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
          )}
        </div>
        <div className={styles.userDetails}>
          <h3>{user?.name || 'User'}</h3>
          <div className={styles.didIdentifier}>
            <span>{user?.did ? `${user.did.substring(0, 10)}...` : 'Not registered'}</span>
          </div>
        </div>
      </div>

      <div className={styles.identityStatus}>
        <div className={styles.statusIndicator}>
          <div className={user?.verified ? styles.verifiedBadge : styles.unverifiedBadge}>
            {user?.verified ? 'Verified' : 'Unverified'}
          </div>
        </div>
      </div>

      <nav className={styles.navMenu}>
        <ul>
          {navItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  isActive ? `${styles.navItem} ${styles.active}` : styles.navItem
                }
              >
                <span className={styles.navIcon}>{item.icon}</span>
                <span className={styles.navText}>{item.name}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className={styles.helpSection}>
        <div className={styles.helpItem}>
          <FaQuestionCircle />
          <span>Help Center</span>
        </div>
        <div className={styles.helpItem}>
          <FaShieldAlt />
          <span>Privacy Controls</span>
        </div>
      </div>

      <div className={styles.blockchainStatus}>
        <div className={styles.networkIndicator}>
          <span className={styles.dot}></span>
          <span>Ethereum Mainnet</span>
        </div>
        <div className={styles.gasPrice}>
          Gas: 45 Gwei
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;