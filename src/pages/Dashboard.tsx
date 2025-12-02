import { useAuthStore } from '@/store/authStore';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export function Dashboard() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/auth/signin');
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border bg-card">
        <div className="container-centered flex items-center justify-between py-4">
          <h1 className="heading-3">Peluquería Web3</h1>
          <div className="flex-center-y gap-4">
            {user && <span className="text-sm text-muted-foreground">Hola, {user.name}</span>}
            <Button variant="outline" onClick={handleLogout}>
              Cerrar sesión
            </Button>
          </div>
        </div>
      </nav>

      <main className="container-centered py-8">
        <div className="grid gap-6">
          <div className="card-padded">
            <h2 className="heading-2 mb-2">Bienvenido al Dashboard</h2>
            <p className="text-muted">
              Este es tu panel de control personalizado. Aquí podrás gestionar tus citas y más.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="card-padded hover-elevated">
              <h3 className="heading-4 mb-2">Mis Citas</h3>
              <p className="text-small mb-4">Gestiona tus citas programadas</p>
              <Button className="w-full" variant="outline">
                Ver citas
              </Button>
            </div>

            <div className="card-padded hover-elevated">
              <h3 className="heading-4 mb-2">Servicios</h3>
              <p className="text-small mb-4">Explora nuestros servicios disponibles</p>
              <Button className="w-full" variant="outline">
                Ver servicios
              </Button>
            </div>

            <div className="card-padded hover-elevated">
              <h3 className="heading-4 mb-2">Mi Perfil</h3>
              <p className="text-small mb-4">Actualiza tu información personal</p>
              <Button className="w-full" variant="outline">
                Editar perfil
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
