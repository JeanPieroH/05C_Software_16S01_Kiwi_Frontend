import AuthLayout from '@/components/layouts/auth-layout';
import LoginForm from '@/components/auth/login-form';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Login - KIWI Classroom',
  description: 'Log in to your KIWI Classroom account.',
};

export default function LoginPage() {
  return (
    <AuthLayout title="Sign In to KIWI" description="Enter your credentials to access your account.">
      <LoginForm />
    </AuthLayout>
  );
}
