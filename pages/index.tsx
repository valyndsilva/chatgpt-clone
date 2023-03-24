import Head from "next/head";
import { useEffect, useState } from "react";
import { ChatContainer, Sidebar } from "../components";
import { getSession } from "next-auth/react";
import { Session } from "next-auth";
import { GetServerSideProps } from "next";
interface Props {
  session: Session;
}
const Home = ({ session }: Props) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  {
    !mounted && null;
  }
  return (
    <>
      <Head>
        <title>ChatGPT Clone</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex flex-col flex-1 items-center justify-center h-screen scroll-y-auto">
        <ChatContainer session={session} />
      </main>
    </>
  );
};

export default Home;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context);

  return {
    props: {
      session,
    },
  };
};
