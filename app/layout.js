export const metadata = {
  title: 'WattWheelz SEO Draft Generator v1.3',
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{margin:0,background:'#f4f6f8',color:'#111827'}}>{children}</body>
    </html>
  );
}
