import React, { useContext } from "react";
import {
  BoltIcon,
  ExclamationTriangleIcon,
  SunIcon,
} from "@heroicons/react/24/outline";
import { ChatContext } from "../context/ChatContext";
type Props = {};

function Intro({}: Props) {
  const { setInput } = useContext(ChatContext);

  return (
    <div className="flex flex-col items-center justify-center h-full">
      <h1 className="text-2xl">ChatGPT</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 m-5">
        <div className="col-span-1 text-center  space-y-4">
          <div className=" items-center justify-center flex flex-col">
            <SunIcon className="w-5 h-5" />
            <h2>Examples</h2>
          </div>
          <p
            className="bg-white/10 rounded-md p-2 cursor-pointer hover:bg-gray-700"
            onClick={() =>
              setInput("Explain quantum computing in simple terms")
            }
          >
            "Explain quantum computing in simple terms"
          </p>
          <p
            className="bg-white/10 rounded-md p-2 cursor-pointer hover:bg-gray-700"
            onClick={() =>
              setInput("Got any creative ideas for a 10 year old's birthday?")
            }
          >
            "Got any creative ideas for a 10 year old's birthday?"
          </p>
          <p
            className="bg-white/10 rounded-md p-2 cursor-pointer hover:bg-gray-700"
            onClick={() =>
              setInput("How do I make a HTTP request in Javascript?")
            }
          >
            "How do I make a HTTP request in Javascript?"
          </p>
        </div>
        <div className="col-span-1 text-center  space-y-4">
          <div className=" items-center justify-center flex flex-col">
            <BoltIcon className="w-5 h-5" />
            <h2>Capabilities</h2>
          </div>
          <p className="bg-white/10 rounded-md p-2">
            "Remembers what user said earlier in the conversation"
          </p>
          <p className="bg-white/10 rounded-md p-2">
            "Allows user to provide follow-up corrections"
          </p>
          <p className="bg-white/10 rounded-md p-2">
            "Trained to decline inappropriate requests"
          </p>
        </div>
        <div className="col-span-1 text-center  space-y-4">
          <div className=" items-center justify-center flex flex-col">
            <ExclamationTriangleIcon className="w-5 h-5" />
            <h2>Limitations</h2>
          </div>
          <p className="bg-white/10 rounded-md p-2">
            "May occasionally generate incorrect information"
          </p>
          <p className="bg-white/10 rounded-md p-2">
            "May occasionally produce harmful instructions or biased content"
          </p>
          <p className="bg-white/10 rounded-md p-2">
            "Limited knowledge of world and events after 2021"
          </p>
        </div>
      </div>
    </div>
  );
}

export default Intro;
