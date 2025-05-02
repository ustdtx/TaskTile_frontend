import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-100">
        <div className="min-h-screen flex flex-col items-center justify-center">
          {children}
        </div>
      </body>
    </html>
  );
}
