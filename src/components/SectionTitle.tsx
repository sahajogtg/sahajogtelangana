import React from 'react';

interface SectionTitleProps {
  title: string;
}

const SectionTitle: React.FC<SectionTitleProps> = ({ title }) => {
  return (
    <div className="text-center mb-12">
      <h2 className="text-3xl md:text-4xl font-bold text-[#5D2E46] mb-4">{title}</h2>
      <div className="flex items-center justify-center">
        <div className="w-16 h-px bg-[#8A1457]"></div>
        <div className="mx-4 text-[#E39321] text-2xl">
          <span role="img" aria-label="flower">❀</span>
        </div>
        <div className="w-16 h-px bg-[#8A1457]"></div>
      </div>
    </div>
  );
};

export default SectionTitle; 