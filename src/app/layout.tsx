import './globals.css'
import type { AppProps } from 'next/app'
import Navbar from './Navbar'


export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
      <Navbar /> 
        {children}
      </body>
    </html>
  );
}