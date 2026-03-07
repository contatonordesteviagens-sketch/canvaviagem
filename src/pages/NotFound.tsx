import { useLocation, useNavigate, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);

    // Auto-redirect to home after 5 seconds as requested by the user
    const timeout = setTimeout(() => {
      navigate("/");
    }, 5000);

    return () => clearTimeout(timeout);
  }, [location.pathname, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4 text-center">
      <div className="max-w-md w-full">
        <h1 className="mb-6 text-7xl font-black bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">404</h1>
        <h2 className="text-2xl font-bold mb-4">Página não encontrada</h2>
        <p className="mb-8 text-muted-foreground italic">
          Ops! Não encontramos o que você procurava. Você será redirecionado para a página principal em alguns segundos...
        </p>
        <Button asChild className="rounded-full px-8">
          <Link to="/">Voltar Agora</Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
