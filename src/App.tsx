import { useEffect } from 'react';
import { useRoutes } from 'react-router-dom';
import { routes } from './routes/routes.tsx';
import { useAuthStore } from './store/authStore';

function App() {
  const { hydrate } = useAuthStore();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const routeElements = useRoutes(routes);

  return <>{routeElements}</>;
}

export default App;
