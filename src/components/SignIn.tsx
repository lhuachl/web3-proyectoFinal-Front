import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { LoginSchema, type LoginInput } from '@/utility/schemas/auth';
import { useAuthStore } from '@/store/authStore';

export function SignIn() {
  const navigate = useNavigate();
  const { login, isLoading, error } = useAuthStore();
  const { register, handleSubmit, formState: { errors } } = useForm<LoginInput>({
    resolver: zodResolver(LoginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    try {
      await login(data.email, data.password);
      navigate('/dashboard');
    } catch (err) {
      console.error('Login error:', err);
    }
  };

  return (
    <div className="screen-center bg-background">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Ingresa a tu cuenta</CardTitle>
          <CardDescription>
            Ingresa tu correo electrónico a continuación para iniciar sesión en tu cuenta
          </CardDescription>
          <CardAction>
            <Link to="/auth/signup">
              <Button variant="link">¿No tienes cuenta? Regístrate</Button>
            </Link>
          </CardAction>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-6">
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="cliente@peluqueria.com"
                  {...register('email')}
                />
                {errors.email && (
                  <span className="text-red-600 text-sm">{errors.email.message}</span>
                )}
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                  <a
                    href="#"
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                  >
                    Olvidaste tu contraseña?
                  </a>
                </div>
                <Input 
                  id="password" 
                  type="password"
                  {...register('password')}
                />
                {errors.password && (
                  <span className="text-red-600 text-sm">{errors.password.message}</span>
                )}
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex-col gap-2">
          <Button 
            type="submit" 
            className="w-full"
            disabled={isLoading}
            onClick={handleSubmit(onSubmit)}
          >
            {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </Button>
          <Button variant="outline" className="w-full">
            Iniciar sesión con Google
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
