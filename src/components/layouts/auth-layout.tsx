import type { FC, ReactNode } from 'react';
import Logo from '@/components/shared/logo';
import Image from 'next/image';

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  description?: string;
}

const AuthLayout: FC<AuthLayoutProps> = ({ children, title, description }) => {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background">
      <div className="md:w-1/2 lg:w-2/5 bg-primary/10 p-8 flex flex-col items-center justify-center relative overflow-hidden">
        <Image 
          src="https://placehold.co/800x1000.png" 
          alt="KIWI Classroom Banner" 
          layout="fill" 
          objectFit="cover" 
          className="absolute inset-0 z-0 opacity-20"
          data-ai-hint="abstract nature"
        />
        <div className="relative z-10 text-center">
          <Logo size="large" className="text-primary mb-6" />
          <p className="text-2xl text-foreground/80 font-headline mt-4">
            Bienvenido a KIWI Classroom
          </p>
          <p className="text-lg text-foreground/70 mt-2">
            Libera tu potencial de aprendizaje.
          </p>
        </div>
      </div>
      <div className="w-full md:w-1/2 lg:w-3/5 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          <div className="text-center md:text-left mb-8">
            <h1 className="text-3xl font-bold text-primary font-headline">{title}</h1>
            {description && <p className="text-muted-foreground mt-2">{description}</p>}
          </div>
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
