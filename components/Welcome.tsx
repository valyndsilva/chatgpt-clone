import Image from "next/image";
import React from "react";
import { signIn } from "next-auth/react";
type Props = {};

function Welcome({}: Props) {
  return (
    <div className=" md:bg-transparent flex flex-col lg:flex-row  space-y-2 md:space-y-6 items-center justify-center w-full h-full">
      <div className="lg:hidden flex-col items-center justify-center">
        <Image
          src="/assets/chatgpt-logo.png"
          width={150}
          height={150}
          className="rounded-full"
          alt="chatgpt image"
        />
      </div>
      <div className=" w-full p-5 space-y-8 flex flex-col items-center justify-center">
        <h2 className="text-xl lg:text-3xl font-semibold">
          Welcome to ChatGPT!
        </h2>
        <p className="max-w-[350px] text-md font-medium leading-7 text-center">
          ChatGPT: Optimizing Language Models for Dialogue interacts in a
          conversational way. The dialogue format makes it possible for ChatGPT
          to answer followup questions, admit its mistakes, challenge incorrect
          premises, and reject inappropriate requests.
        </p>
        <button
          onClick={() => signIn("google")}
          className={`flex items-center p-4 rounded-lg border border-gray-700 bg-[#19A67E] hover:bg-white/10 transition-all duration-250 ease-in`}
        >
          Try ChatGPT
        </button>
      </div>
      <div className="hidden w-full lg:inline-flex flex-col items-center justify-center">
        <Image
          className="rounded-full"
          src="/assets/chatgpt-logo.png"
          width={300}
          height={300}
          alt="chatgpt image"
        />
      </div>
    </div>
  );
}

export default Welcome;
