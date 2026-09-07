import './globals.css';
import '@puckeditor/core/puck.css';

export const metadata={title:'LP Studio V1',description:'AI landing page studio for Marketing'};

export default function RootLayout({children}:{children:React.ReactNode}){
  return <html lang="vi"><body>{children}</body></html>;
}
