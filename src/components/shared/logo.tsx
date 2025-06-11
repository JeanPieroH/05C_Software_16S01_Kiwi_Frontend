import type { FC } from 'react';

interface LogoProps {
  className?: string;
  size?: 'small' | 'medium' | 'large';
}

const Logo: FC<LogoProps> = ({ className, size = 'medium' }) => {
  const sizeClasses = {
    small: 'text-3xl',
    medium: 'text-5xl',
    large: 'text-7xl',
  };

  return (
    <div className={`font-headline font-bold text-primary ${sizeClasses[size]} ${className}`}>
      KIWI
    </div>
  );
};

export default Logo;
