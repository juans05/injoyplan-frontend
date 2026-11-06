import type { Metadata } from "next";
import "./globals.css";
import { jakarta } from "../../public/fonts";
import ClientLayout from "./clienteLayout";
import { SITE_URL } from "./utils/fetch";

const description = "Encuentra conciertos, teatro, ferias y experiencias. Filtra por fecha, distrito y precio y guarda tus planes favoritos.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "Injoyplan | Eventos y experiencias para disfrutar", template: "%s" },
  description,
  icons: { icon: '/svg/logo.svg' },
  openGraph: { title: "Injoyplan", description, siteName: "Injoyplan", locale: "es_PE", type: "website" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${jakarta.variable} ${jakarta.className} font-sans`}>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
