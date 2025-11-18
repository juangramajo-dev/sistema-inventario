/**
 * Archivo: src/app/(auth)/layout.tsx
 *
 * ¡NUEVO! Este es el layout SÓLO para las páginas de login y register.
 * No tiene sidebar, solo centra el contenido.
 */

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // Centramos el contenido en la pantalla
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 p-4">
      {children}
    </div>
  );
}
