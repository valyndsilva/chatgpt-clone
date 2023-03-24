import React, { useRef } from "react";
import Welcome from "./Welcome";
import Intro from "./Intro";
import { Session } from "next-auth";

interface Props {
  session: Session;
}

function ChatContainer({ session }: Props) {
  const chatRef = useRef<any>();

  return (
    <div className="app flex flex-col w-full h-[100vh] bg-[#343541] items-center justify-between">
      {/* Chat Box */}
      <div
        ref={chatRef}
        className="chat-container max-w-[980px] mt-5 text-white flex flex-col gap-3 flex-1 w-full h-full overflow-y-scroll overscroll-none scrollbar-hide pb-5 scroll-smooth"
      >
        {session ? <Intro /> : <Welcome />}
      </div>

      <p className="hidden md:inline-flex text-gray-400 text-sm m-2">
        ChatGPT Jan 9 Version. Free Research Preview. Our goal is to make AI
        systems more natural and safe to interact with. Your feedback will help
        us improve.
      </p>
    </div>
  );
}

export default ChatContainer;
