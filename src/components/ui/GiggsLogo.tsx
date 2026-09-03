import React from 'react';

interface GiggsLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  textColor?: 'dark' | 'light';
  className?: string;
}

export const GiggsLogoIcon: React.FC<{ sizePx?: number; className?: string }> = ({
  sizePx = 32,
  className = ''
}) => {
  return (
    <img
      src="/assets/giggs-logo-icon.png"
      alt="GIGGS Icon"
      width={sizePx}
      height={sizePx}
      className={`shrink-0 object-contain rounded-xl select-none ${className}`}
      style={{ width: `${sizePx}px`, height: `${sizePx}px` }}
    />
  );
};

export const GiggsLogo: React.FC<GiggsLogoProps> = ({
  size = 'md',
  showText = true,
  textColor = 'dark',
  className = ''
}) => {
  const heightMap = {
    sm: 'h-6 sm:h-7',
    md: 'h-8 sm:h-9',
    lg: 'h-10 sm:h-11',
    xl: 'h-12 sm:h-14'
  };

  const currentHeight = heightMap[size] || heightMap.md;

  if (showText) {
    return (
      <img
        src="/assets/giggs-full-logo.png"
        alt="GIGGS Logo"
        className={`object-contain shrink-0 select-none ${currentHeight} ${className}`}
        style={{
          filter: textColor === 'light' ? 'brightness(0) invert(1)' : 'none'
        }}
      />
    );
  }

  return (
    <div className={`inline-flex items-center ${className}`}>
      <GiggsLogoIcon sizePx={size === 'sm' ? 24 : size === 'lg' ? 40 : size === 'xl' ? 48 : 32} />
    </div>
  );
};
