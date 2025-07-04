import React from 'react';
import { useNavigate } from 'react-router-dom';

const MenuItem = ({ item, activeSection, setActiveSection }) => {
  const navigate = useNavigate();

  const handleClick = (e) => {
    e.preventDefault();
    setActiveSection(item.id);
    navigate(item.path);
  };

  return (
    <li className={`menu-item ${activeSection === item.id ? 'active' : ''}`}>
      <a href={item.path} onClick={handleClick}>
        {item.icon && <i className={`fas ${item.icon}`} />}
        <span>{item.label}</span>
      </a>
    </li>
  );
};

export default MenuItem;
