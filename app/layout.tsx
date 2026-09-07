import type { Metadata } from 'next';
import './globals.css';
import '@puckeditor/core/puck.css';

const siteUrl=process.env.NEXT_PUBLIC_SITE_URL;

export const metadata:Metadata={
  metadataBase:siteUrl?new URL(siteUrl):undefined,
  title:'LP Studio',
  description:'AI landing page studio for Marketing',
  robots:{index:false,follow:false}
};

export default function RootLayout({children}:{children:React.ReactNode}){
  return <html lang="vi"><body>{children}</body></html>;
}
