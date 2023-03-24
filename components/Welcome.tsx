import Image from "next/image";
import React from "react";
import { signIn } from "next-auth/react";
type Props = {};

function Welcome({}: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 space-y-2 md:space-y-6 items-center justify-center w-full h-full">
      <div className="col-span-1 md:col-span-1 w-full p-5 space-y-8 flex flex-col items-center justify-center">
        <h2 className="text-lg md:text-3xl font-semibold">
          Welcome to ChatGPT!
        </h2>
        <p className="max-w-[350px] text-md font-medium leading-7 tracking-wider text-center">
          ChatGPT: Optimizing Language Models for Dialogue interacts in a
          conversational way. The dialogue format makes it possible for ChatGPT
          to answer followup questions, admit its mistakes, challenge incorrect
          premises, and reject inappropriate requests.
        </p>
        <button
          onClick={() => signIn("google")}
          className={`flex items-center p-4 rounded-lg bg-[#842984] hover:bg-white/10 transition-all duration-250 ease-in`}
        >
          Try ChatGPT
        </button>
      </div>
      <div className="hidden md:col-span-1 w-full md:inline-flex flex-col items-center justify-center">
        <Image
          src="/chatgpt.jpg"
          width={300}
          height={300}
          alt="chatgpt image"
        />
      </div>
    </div>
  );
}

export default Welcome;
