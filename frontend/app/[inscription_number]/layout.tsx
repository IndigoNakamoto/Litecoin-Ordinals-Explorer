import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
}


const InscriptionLayout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <>
      <article className="mx-auto p-4 max-w-[700px] pb-16">
        {children}
      </article>
    </>
  );
};

export default InscriptionLayout;