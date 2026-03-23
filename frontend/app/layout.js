import "./globals.css";

export const metadata = {
  title: "AI Search Agent",
  description: "Powered by Groq + Llama 3",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}