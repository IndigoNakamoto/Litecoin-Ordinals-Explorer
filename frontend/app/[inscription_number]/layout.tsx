import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
}


const InscriptionLayout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <>
      <article className="mx-auto p-4 max-w-screen-lg pb-16">
        {children}
      </article>
    </>
  );
};

export default InscriptionLayout;