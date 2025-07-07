import { Inter } from "next/font/google";
import "./globals.css";
import { NavBar } from "@/components/NavBar";
import { AuthProvider } from "@/components/providers/AuthContext";
import { ToastProvider } from "@/components/ui/Toast";
import { Footer } from "@/components/Footer";
import PingBackend from "@/components/PingBackend";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "PortfolioHub - Create Your Professional Portfolio",
  description: "Build stunning portfolios with customizable templates.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <PingBackend />
        <ToastProvider>
          <AuthProvider>
            <NavBar />
            {children}
            <Footer />
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
