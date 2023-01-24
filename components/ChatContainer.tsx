import {
  BoltIcon,
  ExclamationTriangleIcon,
  SunIcon,
} from "@heroicons/react/24/outline";
import { PaperAirplaneIcon } from "@heroicons/react/24/solid";
import React, { useContext, useState } from "react";
import { ChatContext } from "../context/ChatContext";
import ChatMessage from "./ChatMessage";

type Props = {};

function ChatContainer({}: Props) {
  // const [input, setInput] = useState<any>("");
  // const [chatLog, setChatLog] = useState<any>([
  //   {
  //     user: "gpt",
  //     message: "How can I help you today?",
  //   },
  //   {
  //     user: "me",
  //     message: "I want to use chatGPT today.",
  //   },
  // ]);

  const { input, setInput, chatLog, setChatLog } = useContext(ChatContext);

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    console.log("submit");
    const newChatLog = [...chatLog, { user: "me", message: `${input}` }];
    setInput("");
    setChatLog(newChatLog);
    // console.log({ chatLog });
    // console.log({ newChatLog });
    const messages = newChatLog
      .map((message: { message: any }) => message.message)
      .join("\n");

    //fetch response to the api combining the chat log array of messages and sending it as a message to localhost:3000 as a post
    const response = await fetch("/api/chatgpt", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: messages,
      }),
    });
    const data = await response.json();
    // console.log(data.suggestion);
    setChatLog([...newChatLog, { user: "gpt", message: `${data.suggestion}` }]);
  };

  return (
    <div className="app flex flex-col w-[100vw] h-[100vh] bg-[#343541] items-center justify-between">
      {/* Chat Box */}
      <div className="chat-container text-white flex flex-col gap-3 flex-1 w-full h-full overflow-y-scroll overscroll-none scrollbar-hide pb-5 scroll-smooth">
        {chatLog ? (
          <>
            {chatLog?.map((message: any, index: any) => (
              <ChatMessage key={index} message={message} />
            ))}
          </>
        ) : (
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
                  "May occasionally produce harmful instructions or biased
                  content"
                </p>
                <p className="bg-white/10 rounded-md p-2">
                  "Limited knowledge of world and events after 2021"
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
      {/* Form */}
      <form
        className="w-full max-w-[1280] my-0 mx-auto p-3 bg-[#40414F] flex gap-3 items-center"
        onSubmit={handleSubmit}
      >
        <input
          className="w-full text-white text-lg p-3 bg-transparent rounded-md border-none outline-none resize-none"
          name="prompt"
          value={input}
          onChange={(e) => setInput(e.target.value)}
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

export default ChatContainer;
