import "../styles/globals.css";
import type { AppProps } from "next/app";
import { ChatProvider } from "../context/ChatContext";
import { SessionProvider } from "next-auth/react";
import { Session } from "next-auth";
import { useEffect, useState } from "react";
import { RootLayout } from "../components";

function MyApp({
  Component,
  pageProps,
}: AppProps<{
  session: Session;
}>) {
  // To fix hydration UI mismatch issues, we need to wait until the component has mounted.
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

   useEffect(() => {
     const use = async () => {
       (await import("tw-elements")).default;
     };
     use();
   }, []);
  if (!mounted) return null;
  return (
    <SessionProvider session={pageProps.session}>
      <ChatProvider>
        <RootLayout>
          <Component {...pageProps} />
        </RootLayout>
      </ChatProvider>
    </SessionProvider>
  );
}

export default MyApp;
