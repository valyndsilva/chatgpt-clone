import Head from "next/head";
import { useEffect, useState } from "react";
import { ChatContainer, Sidebar } from "../components";
import { v4 } from "uuid";
interface Props {
  // uniqueUserId: string;
  // uniqueAiId: string;
  uniqueId: string;
}
const Home = ({ uniqueId }: Props) => {
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
        {/* <ChatContainer uniqueUserId={uniqueUserId} uniqueAiId={uniqueAiId} /> */}
        {/* <ChatContainer uniqueId={uniqueId} /> */}
         <ChatContainer />
      </main>
    </div>
  );
};

export default Home;

export function getServerSideProps() {
  const generateUniqueId = () => {
    const uuId = v4();
    console.log(uuId);
    return uuId;
  };
  const uniqueId = generateUniqueId();

  // const generateUniqueId = (isAi: any = false) => {
  //   const uuId = v4();
  //   console.log(uuId);
  //   const prefix = isAi ? "AI_" : "USER_";
  //   const id = prefix + v4();
  //   console.log({ id });
  //   return id;
  // };

  // const uniqueUserId = generateUniqueId();
  // console.log(uniqueUserId);

  // const uniqueAiId = generateUniqueId(true);
  // console.log(uniqueAiId);
  return {
    props: {
      // uniqueUserId,
      // uniqueAiId,
      uniqueId,
    },
  };
}
