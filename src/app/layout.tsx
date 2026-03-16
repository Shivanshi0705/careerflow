import "./globals.css";
import Navbar from "@/components/Navbar";
import RouteGuard from "@/components/RouteGuard";

export const metadata = {
  title: "CareerFlow",
  description: "Internship and career application tracker",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-black text-white">
        <RouteGuard>
          <Navbar />
          <main className="mx-auto max-w-7xl px-6 py-8">{children}</main>
        </RouteGuard>
      </body>
    </html>
  );
}