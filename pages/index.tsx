import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import { useEffect, useState } from "react";
import { ChatContainer, Sidebar } from "../components";

const Home: NextPage = () => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  {
    !mounted && null;
  }
  return (
    <div>
      <Head>
        <title>ChatGPT Clone</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex box-border">
        <Sidebar />
        <ChatContainer />
      </main>
    </div>
  );
};

export default Home;
