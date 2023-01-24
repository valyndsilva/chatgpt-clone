import "../styles/globals.css";
import type { AppProps } from "next/app";
import { ChatProvider } from "../context/ChatContext";
function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ChatProvider>
      <Component {...pageProps} />
    </ChatProvider>
  );
}

export default MyApp;
