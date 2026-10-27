import { useState } from "react";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "next-themes";
import { HashRouter, Routes, Route } from "react-router-dom";
import { NotationContext, readStoredNotation, storeNotation } from "@/hooks/use-notation";
import type { Notation } from "@/lib/notation";
import Index from "./pages/Index";
import Teoria from "./pages/Teoria";
import NotFound from "./pages/NotFound";

// El tema oscuro es el de `:root` en index.css y el claro la clase `.light`.
// Se mapea "dark" a una clase sin reglas para no activar las variantes `dark:`
// de los componentes generados, que están pensadas para otro esquema.
//
// Rutas con hash (/#/ y /#/teoria): la app se sirve como subpágina estática sin
// fallback, así que una ruta "de verdad" daría 404 al recargar. Los enlaces a
// capítulos son parámetros de ruta (/#/teoria/<slug>); nunca <a href="#…">.
const App = () => {
  // La notación la elige el header y la leen las dos páginas; se persiste como el tema.
  const [notation, setNotationState] = useState<Notation>(readStoredNotation);
  const setNotation = (next: Notation) => {
    setNotationState(next);
    storeNotation(next);
  };

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      value={{ dark: "theme-dark", light: "light" }}
      storageKey="esfera-bloch-theme"
    >
      <TooltipProvider>
        <NotationContext.Provider value={{ notation, setNotation }}>
          <Sonner />
          <HashRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/teoria/:capitulo?" element={<Teoria />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </HashRouter>
        </NotationContext.Provider>
      </TooltipProvider>
    </ThemeProvider>
  );
};

export default App;
