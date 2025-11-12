import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-background text-foreground">
      <h1 className="text-4xl font-bold mb-4">Sistema de Inventario</h1>
      <p className="text-xl text-muted-foreground mb-8">
        Proyecto en construcción con Next.js 16
      </p>
      <Button size="lg" variant="default">
        ¡Comenzar!
      </Button>
    </main>
  );
}
