import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Navbar } from "@/components/common/navbar";
import { AuthProvider } from "@/components/providers/auth-provider";
import "./globals.css";
import Footer from "@/components/common/footer";
import { Toaster } from "sonner";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Assignment - Creativeans",
  description: "A showcase of my work and projects, demonstrating my skills and experience in software development, data science, and more. Explore my portfolio to see the impact I've made in various industries and how I can help drive innovation and success in your organization.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} antialiased flex flex-col min-h-screen overflow-x-hidden`}
      >
        <AuthProvider>
          <Navbar />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
          <Toaster position="top-right" richColors />
        </AuthProvider>
      </body>
    </html>
  );
}
