'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Car, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { t } from '@/lib/constants';
import { toast } from 'sonner';

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleCredentials(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    console.log('[LOGIN] Attempting credentials login with email:', email);
    try {
      const res = await signIn('credentials', {
        email,
        password: formData.get('password') as string,
        redirect: false,
      });
      console.log('[LOGIN] signIn response:', JSON.stringify(res));
      setLoading(false);
      if (res?.error) {
        console.log('[LOGIN] Error:', res.error);
        toast.error('Credenciales incorrectas');
      } else if (res?.ok) {
        console.log('[LOGIN] Success, redirecting to dashboard');
        window.location.href = '/dashboard';
      } else {
        console.log('[LOGIN] Unexpected response - no error but not ok');
        toast.error('Respuesta inesperada del servidor');
      }
    } catch (err) {
      console.error('[LOGIN] Exception during signIn:', err);
      setLoading(false);
      toast.error('Error de conexión al servidor');
    }
  }

  async function handleMagicLink(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const res = await signIn('email', {
      email: formData.get('email') as string,
      redirect: false,
    });
    setLoading(false);
    if (res?.error) {
      toast.error('Error al enviar el enlace');
    } else {
      toast.success('Enlace enviado a tu correo electrónico');
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary">
            <Car className="h-6 w-6 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl">{t.login_title}</CardTitle>
          <CardDescription>{t.login_subtitle}</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="credentials">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="credentials">{t.login_credentials}</TabsTrigger>
              <TabsTrigger value="magic-link">{t.login_magic_link}</TabsTrigger>
            </TabsList>

            <TabsContent value="credentials">
              <form onSubmit={handleCredentials} className="mt-4 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="cred-email">{t.email}</Label>
                  <Input
                    id="cred-email"
                    name="email"
                    type="email"
                    placeholder="admin@dealer.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cred-password">{t.password}</Label>
                  <Input id="cred-password" name="password" type="password" required />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {t.login}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="magic-link">
              <form onSubmit={handleMagicLink} className="mt-4 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="ml-email">{t.email}</Label>
                  <Input
                    id="ml-email"
                    name="email"
                    type="email"
                    placeholder="tu@correo.com"
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {t.login_magic_link}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
