import React from 'react';

const MainLayout = ({ children }: { children: React.ReactNode }) => (
  <div className="main-bg min-h-screen">{children}</div>
);

export default MainLayout; 