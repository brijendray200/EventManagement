import React from 'react';
import './PageLoader.css';

const PageLoader = ({ title = 'Loading your next screen...' }) => {
  return (
    <div className="page-loader-shell">
      <div className="page-loader-card glass-panel">
        <div className="page-loader-orb"></div>
        <div className="page-loader-ring"></div>
        <h2 className="gradient-text">EventSphere</h2>
        <p>{title}</p>
      </div>
    </div>
  );
};

export default PageLoader;
