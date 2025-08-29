import { Card } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";

export function QuantumEducation() {
  return (
    <Card className="p-4">
      <h3 className="text-lg font-semibold mb-4 text-primary">Teoría Cuántica</h3>
      
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="bloch-sphere">
          <AccordionTrigger className="text-sm">¿Qué es la Esfera de Bloch?</AccordionTrigger>
          <AccordionContent className="text-sm text-muted-foreground space-y-2">
            <p>
              La Esfera de Bloch es una representación geométrica de los estados puros de un qubit en el espacio tridimensional.
            </p>
            <p>
              Cada punto en la superficie de la esfera representa un estado cuántico único, donde:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li><Badge variant="outline" className="mr-1">Polo norte</Badge> representa |0⟩</li>
              <li><Badge variant="outline" className="mr-1">Polo sur</Badge> representa |1⟩</li>
              <li><Badge variant="outline" className="mr-1">Ecuador</Badge> representa superposiciones |+⟩, |-⟩, |+i⟩, |-i⟩</li>
            </ul>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="quantum-gates">
          <AccordionTrigger className="text-sm">Compuertas Cuánticas</AccordionTrigger>
          <AccordionContent className="text-sm text-muted-foreground space-y-3">
            <div>
              <h5 className="font-medium text-foreground mb-1">Compuertas de Pauli:</h5>
              <ul className="space-y-1 ml-2">
                <li><Badge variant="outline" className="mr-2">X</Badge> Rotación π alrededor del eje X (bit flip)</li>
                <li><Badge variant="outline" className="mr-2">Y</Badge> Rotación π alrededor del eje Y</li>
                <li><Badge variant="outline" className="mr-2">Z</Badge> Rotación π alrededor del eje Z (phase flip)</li>
              </ul>
            </div>
            
            <div>
              <h5 className="font-medium text-foreground mb-1">Otras compuertas:</h5>
              <ul className="space-y-1 ml-2">
                <li><Badge variant="outline" className="mr-2">H</Badge> Hadamard - Crea superposición |0⟩ → |+⟩</li>
                <li><Badge variant="outline" className="mr-2">S</Badge> Phase gate - Rotación π/2 alrededor de Z</li>
                <li><Badge variant="outline" className="mr-2">T</Badge> π/8 gate - Rotación π/4 alrededor de Z</li>
              </ul>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="superposition">
          <AccordionTrigger className="text-sm">Superposición Cuántica</AccordionTrigger>
          <AccordionContent className="text-sm text-muted-foreground space-y-2">
            <p>
              La superposición permite que un qubit exista en una combinación de estados |0⟩ y |1⟩ simultáneamente.
            </p>
            <div className="math-formula">
              |ψ⟩ = α|0⟩ + β|1⟩
            </div>
            <p>
              Donde α y β son amplitudes complejas que satisfacen |α|² + |β|² = 1.
            </p>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="measurement">
          <AccordionTrigger className="text-sm">Medición Cuántica</AccordionTrigger>
          <AccordionContent className="text-sm text-muted-foreground space-y-2">
            <p>
              Al medir un qubit, el estado colapsa a |0⟩ o |1⟩ con probabilidades:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>P(|0⟩) = |α|² - Probabilidad de medir 0</li>
              <li>P(|1⟩) = |β|² - Probabilidad de medir 1</li>
            </ul>
            <p>
              La fase relativa φ afecta las probabilidades en mediciones en bases diferentes.
            </p>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="coordinates">
          <AccordionTrigger className="text-sm">Sistema de Coordenadas</AccordionTrigger>
          <AccordionContent className="text-sm text-muted-foreground space-y-2">
            <p>
              La posición en la esfera se describe mediante ángulos esféricos:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li><Badge variant="outline" className="mr-1">θ (theta)</Badge> Ángulo polar (0 a π)</li>
              <li><Badge variant="outline" className="mr-1">φ (phi)</Badge> Ángulo azimutal (-π a π)</li>
            </ul>
            <div className="math-formula mt-2">
              |ψ⟩ = cos(θ/2)|0⟩ + e^(iφ)sin(θ/2)|1⟩
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </Card>
  );
}