import { useState, type ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface DisclosureProps {
  title: string;
  children: ReactNode;
}

/** Bloque «Para profundizar»: matemática que no hace falta para seguir el hilo. */
export function Disclosure({ title, children }: DisclosureProps) {
  const [open, setOpen] = useState(false);
  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger asChild>
        <Button variant="ghost" size="sm" className="px-0 hover:bg-transparent [&[data-state=open]>svg]:rotate-180">
          <ChevronDown aria-hidden="true" className="transition-transform" />
          {title}
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="pt-2 text-sm space-y-2">{children}</CollapsibleContent>
    </Collapsible>
  );
}
