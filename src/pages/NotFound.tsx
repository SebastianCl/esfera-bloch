import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

// Con el hash router cualquier "#algo" suelto acaba aquí: en español y con el tema.
const NotFound = () => (
  <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
    <div className="text-center space-y-2">
      <h1 className="text-4xl font-bold">404</h1>
      <p className="text-muted-foreground">Esta página no existe.</p>
      <Button asChild variant="link">
        <Link to="/">Volver al laboratorio</Link>
      </Button>
    </div>
  </div>
);

export default NotFound;
