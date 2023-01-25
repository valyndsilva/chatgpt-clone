import {
  BoltIcon,
  ExclamationTriangleIcon,
  SunIcon,
} from "@heroicons/react/24/outline";
import { PaperAirplaneIcon } from "@heroicons/react/24/solid";
import React, { useContext, useEffect, useRef } from "react";
import { ChatContext } from "../context/ChatContext";
import ChatMessage from "./ChatMessage";
import { v4 } from "uuid";
import { useSession } from "next-auth/react";

interface Props {}

function ChatContainer({}: Props) {
  const {
    input,
    setInput,
    chatLog,
    setChatLog,
    currentModel,
    temperature,
    setUniqueId,
  } = useContext(ChatContext);

  const { data: session } = useSession();
  // console.log(session);

  const chatRef = useRef<any>();
  const formRef = useRef<any>();
  const messagesEndRef = useRef<any>();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatLog]);

  // handleSubmit functionality
  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    // console.log("handleSubmit triggered!");

    const uuId = v4();
    // console.log(uuId);

    const uniqueUserId = "USER_" + uuId;
    // console.log({ uniqueUserId });

    const newChatLog = [
      ...chatLog,
      { user: "me", messageId: `${uniqueUserId}`, message: `${input}` },
    ];
    // console.log({ newChatLog });
    setInput("");
    setChatLog(newChatLog);
    // console.log({ chatLog });
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
        currentModel,
        temperature,
      }),
    });
    const data = await response.json();
    // console.log(data.suggestion);
    const botMessage = data.suggestion.trim(); // trims any trailing spaces/'\n'

    const uniqueAiId = "AI_" + uuId;
    // console.log({ uniqueAiId });
    setUniqueId(uniqueAiId);

    setChatLog([
      ...newChatLog,
      {
        user: "gpt",
        messageId: `${uniqueAiId}`,
        message: `${botMessage}`,
      },
    ]); // trims any trailing spaces/'\n'
  };

  // Getting chatLog stored value from localStorage and loading it into React state
  useEffect(() => {
    const data: any = window.localStorage.getItem("chatLogs");
    if (data) setChatLog(JSON.parse(data));
  }, []);
  // Storing chatLog state in localStorage
  useEffect(() => {
    if (chatLog.length > 0)
      window.localStorage.setItem("chatLogs", JSON.stringify(chatLog));
  }, [chatLog]);

  return (
    <div className="app flex flex-col w-[100vw] h-[100vh] bg-[#343541] items-center justify-between">
      {/* Chat Box */}
      <div
        ref={chatRef}
        className="chat-container max-w-[980px] text-white flex flex-col gap-3 flex-1 w-full h-full overflow-y-scroll overscroll-none scrollbar-hide pb-5 scroll-smooth"
      >
        {chatLog.length ? (
          <>
            {chatLog?.map((message: any, index: any) => (
              <ChatMessage key={index} message={message} />
            ))}
            <div ref={messagesEndRef} />
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full">
            <h1 className="text-2xl">ChatGPT</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 m-5">
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
        ref={formRef}
        className="w-full max-w-[980px] my-0 mx-auto p-3 bg-[#40414F] flex gap-3 items-center"
        onSubmit={handleSubmit}
      >
        <input
          disabled={!session}
          className={`w-full text-white text-lg p-3 bg-transparent rounded-md border-none outline-none resize-none ${
            !session &&
            "from-gray-300 to-gray-500 text-gray-300 cursor-not-allowed"
          }`}
          name="prompt"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`${
            !session ? "Sign in to use ChatGPT" : "Ask ChatGPT anything..."
          }`}
        ></input>
        <button
          type="submit"
          className="outline-none border-none cursor-pointer bg-transparent mr-5"
        />
        <PaperAirplaneIcon className="w-6 h-6 text-gray-400" />
      </form>
      <p className="text-gray-400 text-sm my-2">
        ChatGPT Jan 9 Version. Free Research Preview. Our goal is to make AI
        systems more natural and safe to interact with. Your feedback will help
        us improve.
      </p>
    </div>
  );
}

export default ChatContainer;
