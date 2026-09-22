export const metadata = {
  title: 'Resideterra Controlled Publishing',
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }) {
  return <html lang="en"><body>{children}</body></html>;
}
