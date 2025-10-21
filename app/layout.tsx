export const metadata = {
  title: "Imago",
  description: "Gestión de turnos y agendas",
  manifest: "/manifest.webmanifest",
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen">
        <div className="max-w-md mx-auto p-4">{children}</div>
      </body>
    </html>
  );
}
