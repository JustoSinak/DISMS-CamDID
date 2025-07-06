import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import UserDashboardContent from '../shared/UserDashboardContent';
import Sidebar from '../shared/Sidebar';

const UserDashboard = () => {
  const { user } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  console.log('UserDashboard: Component rendered with user:', user);

  useEffect(() => {
    const handleResize = () => {
      const newWidth = window.innerWidth;
      setWindowWidth(newWidth);

      if (newWidth < 1024) {
        setIsCollapsed(true);
      } else if (newWidth >= 1280) {
        setIsCollapsed(false);
      }

      if (newWidth >= 768) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isMobileMenuOpen]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex h-screen">
        <Sidebar
          isCollapsed={isCollapsed}
          onCollapseChange={setIsCollapsed}
          isMobileMenuOpen={isMobileMenuOpen}
          onMobileMenuClose={() => setIsMobileMenuOpen(false)}
        />

        <div className={`flex flex-col flex-1 min-w-0 transition-all duration-300 ease-in-out
          ${windowWidth >= 768 ? (isCollapsed ? 'md:ml-20' : 'md:ml-64') : 'ml-0'}`}>
          <UserDashboardContent onMobileMenuOpen={() => setIsMobileMenuOpen(true)} />
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;