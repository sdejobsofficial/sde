import QueryProvider from "@/providers/query-provider";
import "./globals.css";
import { Nunito } from "next/font/google";
import { Toaster } from "react-hot-toast";
import { Metadata } from "next";
import { ThemeProvider } from "@/components/theme-provider";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SDE Jobs & Internships",
  description:
    "Discover and apply for software engineering jobs and internships. Connect with top companies, showcase your skills, and accelerate your career with SDE Jobs & Internships.",
  icons: {
    icon: "/icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${nunito.variable} antialiased`}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        {" "}
        <QueryProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <Toaster />
            {children}
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
