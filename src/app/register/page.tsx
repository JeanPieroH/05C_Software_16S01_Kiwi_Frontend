import AuthLayout from '@/components/layouts/auth-layout';
import RegisterForm from '@/components/auth/register-form';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Register - KIWI Classroom',
  description: 'Create your KIWI Classroom account.',
};

export default function RegisterPage() {
  return (
    <AuthLayout title="Join KIWI Classroom" description="Sign up to start your learning journey.">
      <RegisterForm />
    </AuthLayout>
  );
}
