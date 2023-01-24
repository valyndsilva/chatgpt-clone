import {
  BoltIcon,
  ExclamationTriangleIcon,
  SunIcon,
} from "@heroicons/react/24/outline";
import { PaperAirplaneIcon } from "@heroicons/react/24/solid";
import Image from "next/image";
import React, { useRef } from "react";
import ChatMessage1 from "./ChatMessage1";

import bot from "../public/assets/bot.svg";
import user from "../public/assets/user.svg";

type Props = {};

function ChatContainer1({}: Props) {
  const chatRef = useRef<any>();
  const formRef = useRef<any>();
  let loadInterval: any;

  function loader(element: any) {
    element.textContent = "";
    loadInterval = setInterval(() => {
      // Update the text content of the loading indicator
      element!.textContent += ".";
      // If the loading indicator has reached three dots, reset it
      if (element!.textContent === "....") {
        element!.textContent = "";
      }
    }, 300);
  }

  function typeText(element: any, text: string) {
    let index = 0;
    let interval = setInterval(() => {
      if (index < text.length) {
        element!.innerHTML += text.charAt(index);
        index++;
      } else {
        clearInterval(interval);
      }
    }, 20);
  }

  // generate unique ID for each message div of bot
  // necessary for typing text effect for that specific reply
  // without unique ID, typing text will work on every element
  function generateUniqueId() {
    const timestamp = Date.now();
    const randomNumber = Math.random();
    const hexadecimalString = randomNumber.toString(16);
    return `id-${timestamp}-${hexadecimalString}`;
  }

  function chatStripe(
    isAi: boolean,
    message: any,
    uniqueId: string | undefined
  ) {
    return <ChatMessage1 isAi={isAi} message={message} uniqueId={uniqueId} />;
    // return <ChatMessage isAi={isAi} message={message} uniqueId={uniqueId} />;
  }
  // The pre-wrap value allows the browser to wrap long lines of text onto multiple lines if necessary.

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();

    const data = new FormData(formRef.current);
    console.log(data);
    // bot's chatstripe
    const uniqueId = generateUniqueId();
    chatRef.current.innerHTML += chatStripe(true, " ", uniqueId);

    // user's chatstripe
    chatRef.current!.innerHTML += chatStripe(
      false,
      data.get("prompt"),
      uniqueId
    );
    // to clear the textarea input
    formRef.current!.reset();
    // to focus scroll to the bottom
    chatRef.current.scrollTop = chatRef.current.scrollHeight;
    // specific message div
    const messageDiv = document.getElementById(uniqueId);
    console.log(messageDiv);

    // messageDiv.innerHTML = "..."
    loader(messageDiv);

    const response = await fetch("https://codex-im0y.onrender.com/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: data.get("prompt"),
      }),
    });

    clearInterval(loadInterval);
    messageDiv!.innerHTML = " ";

    if (response.ok) {
      const data = await response.json();
      const parsedData = data.bot.trim(); // trims any trailing spaces/'\n'

      typeText(messageDiv, parsedData);
    } else {
      const err = await response.text();

      messageDiv!.innerHTML = "Something went wrong";
      alert(err);
    }
  };

  return (
    <div className="app flex flex-col w-[100vw] h-[100vh] bg-[#343541] items-center justify-between">
      {/* Chat Box */}
      <div
        ref={chatRef}
        className="chat-container text-white flex flex-col gap-3 flex-1 w-full h-full overflow-y-scroll overscroll-none scrollbar-hide pb-5 scroll-smooth"
      >
        <div className="flex flex-col items-center justify-center h-full">
          <h1 className="text-2xl">ChatGPT</h1>
          <div className="grid grid-cols-3 gap-6 m-5">
            <div className="col-span-1 text-center  space-y-4">
              <div className=" items-center justify-center flex flex-col">
                <SunIcon className="w-5 h-5" />
                <h2>Examples</h2>
              </div>
              <p className="bg-white/10 rounded-md p-2">
                "Explain quantum computing in simple terms"
              </p>
              <p className="bg-white/10 rounded-md p-2">
                "Got any creative ideas for a 10 year old's birthday?"
              </p>
              <p className="bg-white/10 rounded-md p-2">
                "How do I make a HTTP request in Javascript?"
              </p>
            </div>
            <div className="col-span-1 text-center  space-y-4">
              <div className=" items-center justify-center flex flex-col">
                <BoltIcon className="w-5 h-5" />
                <h2>Capabilities</h2>
              </div>
              <p className="bg-white/10 rounded-md p-2">
                "Explain quantum computing in simple terms"
              </p>
              <p className="bg-white/10 rounded-md p-2">
                "Got any creative ideas for a 10 year old's birthday?"
              </p>
              <p className="bg-white/10 rounded-md p-2">
                "How do I make a HTTP request in Javascript?"
              </p>
            </div>
            <div className="col-span-1 text-center  space-y-4">
              <div className=" items-center justify-center flex flex-col">
                <ExclamationTriangleIcon className="w-5 h-5" />
                <h2>Limitations</h2>
              </div>
              <p className="bg-white/10 rounded-md p-2">
                "Explain quantum computing in simple terms"
              </p>
              <p className="bg-white/10 rounded-md p-2">
                "Got any creative ideas for a 10 year old's birthday?"
              </p>
              <p className="bg-white/10 rounded-md p-2">
                "How do I make a HTTP request in Javascript?"
              </p>
            </div>
          </div>
        </div>
      </div>
      {/* Form */}
      <form
        ref={formRef}
        className="w-full max-w-[1280] my-0 mx-auto p-3 bg-[#40414F] flex gap-3 items-center"
        onSubmit={handleSubmit}
      >
        <input
          className="w-full text-white text-lg p-3 bg-transparent rounded-md border-none outline-none resize-none"
          name="prompt"
          // rows={1}
          // cols={1}
          placeholder="Ask ChatGPT anything..."
        ></input>
        <button
          type="submit"
          className="outline-none border-none cursor-pointer bg-transparent mr-5"
        />
        <PaperAirplaneIcon className="w-6 h-6 text-gray-400" />
      </form>
    </div>
  );
}

export default ChatContainer1;
