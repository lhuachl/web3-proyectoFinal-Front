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
import { SignUpSchema, type SignUpInput } from '@/utility/schemas/auth';
import { useAuthStore } from '@/store/authStore';

export function SignUp() {
  const navigate = useNavigate();
  const { signup, isLoading, error } = useAuthStore();
  const { register, handleSubmit, formState: { errors } } = useForm<SignUpInput>({
    resolver: zodResolver(SignUpSchema),
  });

  const onSubmit = async (data: SignUpInput) => {
    try {
      await signup(data.name, data.email, data.password);
      navigate('/dashboard');
    } catch (err) {
      console.error('Signup error:', err);
    }
  };

  return (
    <div className="screen-center bg-background">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Crear nueva cuenta</CardTitle>
          <CardDescription>
            Regístrate para acceder a la peluquería
          </CardDescription>
          <CardAction>
            <Link to="/auth/signin">
              <Button variant="link">¿Ya tienes cuenta? Inicia sesión</Button>
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
                <Label htmlFor="name">Nombre</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Tu nombre completo"
                  {...register('name')}
                />
                {errors.name && (
                  <span className="text-red-600 text-sm">{errors.name.message}</span>
                )}
              </div>
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
                <Label htmlFor="password">Contraseña</Label>
                <Input 
                  id="password" 
                  type="password"
                  {...register('password')}
                />
                {errors.password && (
                  <span className="text-red-600 text-sm">{errors.password.message}</span>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
                <Input 
                  id="confirmPassword" 
                  type="password"
                  {...register('confirmPassword')}
                />
                {errors.confirmPassword && (
                  <span className="text-red-600 text-sm">{errors.confirmPassword.message}</span>
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
            {isLoading ? 'Registrando...' : 'Registrarse'}
          </Button>
          <Button variant="outline" className="w-full">
            Registrarse con Google
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
