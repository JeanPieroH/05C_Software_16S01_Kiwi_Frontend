import AuthLayout from '@/components/layouts/auth-layout';
import RegisterForm from '@/components/auth/register-form';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Register - KIWI Classroom',
  description: 'Create your KIWI Classroom account.',
};

export default function RegisterPage() {
  return (
    <AuthLayout title="Únete a KIWI Classroom" description="Registrese para iniciar su viaje de aprendizaje.">
      <RegisterForm />
    </AuthLayout>
  );
}
