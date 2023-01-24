## Install Tailwind CSS with Next.js:

npx create-next-app -e with-tailwindcss chatgpt-clone
cd chatgpt-clone
code .

## Install Hero Icons

npm install @heroicons/react

## Setup OpenAI:

### OpenAI API keys and Organization ID:

Go to https://beta.openai.com/account/api-keys > View API Keys > Create a new secret key > Copy the API key generated.

Go to https://beta.openai.com/account/org-settings > Copy the Organization ID

### Create a .env.local file

```
OPENAI_API_KEY=OPENAI API key goes here...
OPENAI_ORG_ID=Organization ID goes here...
```

### Install OpenAI:

Go to https://beta.openai.com/docs/introduction

```
npm install openai
```

### OpenAI Authentication:

Go to https://beta.openai.com/docs/api-reference/authentication and copy the code under "Example with the openai Node.js package:"

#### Create a utils/constants.ts file:

```
import { Configuration } from "openai";

// Requesting organization
export const configuration = new Configuration({
  organization: process.env.OPENAI_ORG_ID,
  apiKey: process.env.OPENAI_API_KEY,
});
```

#### Create pages/api/chatgpt.tsx

```
import type { NextApiRequest, NextApiResponse } from "next";
import { configuration } from "../../utils/constants";
import { OpenAIApi } from "openai";

type Data = {
  result: string;
};

const openai = new OpenAIApi(configuration);
// const response = await openai.listEngines();

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  res.status(200).json({ result: "some suggestion" });
}

```

### Create Completions in OpenAI:

Go to https://beta.openai.com/playground and enter an instruction or select a preset, and watch the API respond with a completion that attempts to match the context or pattern you provided. Click on view code and copy it.

OR

Go to https://beta.openai.com/docs/api-reference/completions and copy the example and add it in pages/api/chatgpt.tsx:

```
import type { NextApiRequest, NextApiResponse } from "next";
import { configuration } from "../../utils/constants";
import { OpenAIApi } from "openai";

type Data = {
  suggestion: string;
};

const openai = new OpenAIApi(configuration);
// const response = await openai.listEngines();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const response = await openai.createCompletion({
     model: "text-davinci-003",
    prompt: "Say this is a test",
    temperature: 0.7,
    max_tokens: 256,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
  });
  const suggestion = response.data?.choices?.[0].text;
  if (suggestion === undefined) throw new Error("No suggestion found");

  // res.status(200).json({ suggestion: suggestion });
  res.status(200).json({ suggestion });
}

```

Now test the api route by going to http://localhost:3000/api/chatgpt

You should see a suggestion result.

## Update pages/index.tsx:

```
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
```

## Create Sidebar.tsx:

```
import React from "react";
import {
  ArrowRightOnRectangleIcon,
  ArrowTopRightOnSquareIcon,
  ChatBubbleOvalLeftIcon,
  PlusIcon,
  SunIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
type Props = {};

function Sidebar({}: Props) {
  return (
    <aside className="sidemenu w-80 text-white bg-[#202123] text-left flex flex-col justify-between">
      <div className="sidemenu-btn m-2 border-[1px] border-gray-700 rounded-lg">
        <button className="flex w-full items-center space-x-3 p-3 hover:bg-white/10 transition-all duration-250 ease-in">
          <PlusIcon className="w-4 h-4" />{" "}
          <span className="text-sm">New chat</span>
        </button>
      </div>
      <div className="sidemenu-btn m-2  border-t py-2">
        <button className="flex w-full items-center space-x-3 p-3 rounded-md hover:bg-white/10">
          <TrashIcon className="w-4 h-4" />{" "}
          <span className="text-sm">Clear conversations</span>
        </button>
        <button className="flex w-full items-center space-x-3 p-3 rounded-md hover:bg-white/10">
          <SunIcon className="w-4 h-4" />{" "}
          <span className="text-sm">Light mode</span>
        </button>
        <button className="flex w-full items-center space-x-3 p-3 rounded-md hover:bg-white/10">
          <ChatBubbleOvalLeftIcon className="w-4 h-4" />{" "}
          <span className="text-sm">OpenAI Discord</span>
        </button>
        <button className="flex w-full items-center space-x-3 p-3 rounded-md hover:bg-white/10">
          <ArrowTopRightOnSquareIcon className="w-4 h-4" />{" "}
          <span className="text-sm">Updates & FAQ</span>
        </button>
        <button className="flex w-full items-center space-x-3 p-3 rounded-md hover:bg-white/10">
          <ArrowRightOnRectangleIcon className="w-4 h-4" />{" "}
          <span className="text-sm">Log out</span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;

```

## Create ChatMessage.tsx:

```
import React from "react";

type Props = {
  message: any;
};

function ChatMessage({ message }: Props) {
  return (
    <div
      className={`wrapper chat-log w-full py-4  ${
        message.user === "gpt" && "bg-white/10"
      }  `}
    >
      <div
        className={`chat-message p-3 w-full max-w-[1280px] my-0 mx-auto flex items-center justify-center gap-3`}
      >
        <div
          className={`profile avatar w-9 h-9 rounded-md bg-[#5436DA] flex justify-center items-center ${
            message.user === "gpt" && "bg-[#10a37f]"
          }`}
        >
          <img
            className="w-[60%] h-[60%] object-contain"
            src={`${
              message.user === "gpt"
                ? "../assets/bot.svg"
                : "../assets/user.svg"
            } `}
            alt={`${message.user === "gpt" ? "bot" : "user"}`}
          />
        </div>
        <div className="message flex-1 text-[#dcdcdc] text-xl max-w-[100%] whitespace-pre-wrap">
          {message.message}
        </div>
      </div>
    </div>
  );
}

export default ChatMessage;

```

## Create ChatContainer.tsx:

```
import {
  BoltIcon,
  ExclamationTriangleIcon,
  SunIcon,
} from "@heroicons/react/24/outline";
import { PaperAirplaneIcon } from "@heroicons/react/24/solid";
import React, { useState } from "react";
import ChatMessage from "./ChatMessage";

type Props = {};

function ChatContainer({}: Props) {
  const [input, setInput] = useState<any>("");
  const [chatLog, setChatLog] = useState<any>([
    {
      user: "gpt",
      message: "How can I help you today?",
    },
    {
      user: "me",
      message: "I want to use chatGPT today.",
    },
  ]);

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    console.log("submit");
    setChatLog([...chatLog, { user: "me", message: `${input}` }]);
    setInput("");

    //fetch response to the api combining the chat log array of messages and sending it as a message to localhost:3000 as a post
    const response = await fetch("/api/chatgpt", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: chatLog
          .map((message: { message: any }) => message.message)
          .join(""),
      }),
    });
    const data = await response.json();
    console.log(data);
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

```

## Update the pages/api/chatgpt.tsx:

Comment out the openAi response. Console.log the message object and just check if the api endpoint receives the message object we passed in the body in ChatContainer.tsx handleSubmit function by entering a message in the input and check the console.

```
import type { NextApiRequest, NextApiResponse } from "next";
import { configuration } from "../../utils/constants";
import { OpenAIApi } from "openai";

type Data = {
  suggestion: string;
};

const openai = new OpenAIApi(configuration);
// const response = await openai.listEngines();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const { message } = req.body;
  console.log("message:", message);

  // const response = await openai.createCompletion({
  //   model: "text-davinci-003",
  //   prompt: "Say this is a test",
  //   temperature: 0.7,
  //   max_tokens: 256,
  //   top_p: 1,
  //   frequency_penalty: 0,
  //   presence_penalty: 0,
  // });
  // const suggestion = response.data?.choices?.[0].text;
  // console.log(suggestion);

  // if (suggestion === undefined) throw new Error("No suggestion found");
  // res.status(200).json({ suggestion: suggestion });
  // res.status(200).json({ suggestion });

  res.status(200).json({ suggestion: message });
}

```

You should receive an output like this:

```
{
    "suggestion": "How can I help you today?I want to use chatGPT today."
}
```

## Update pages/api/chatgpt.tsx:

Update the openAI prompt in the response with the message object.

```
import type { NextApiRequest, NextApiResponse } from "next";
import { configuration } from "../../utils/constants";
import { OpenAIApi } from "openai";

type Data = {
  suggestion: string;
};

const openai = new OpenAIApi(configuration);
// const response = await openai.listEngines();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const { message } = req.body;
  console.log("message:", message);

  const response = await openai.createCompletion({
    model: "text-davinci-003",
    prompt: `${message}`,
    temperature: 0.7,
    max_tokens: 256,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
  });
  const suggestion = response.data?.choices?.[0].text;
  console.log(suggestion);

  if (suggestion === undefined) throw new Error("No suggestion found");

  // res.status(200).json({ suggestion: message });
  // res.status(200).json({ suggestion: suggestion });
  res.status(200).json({ suggestion });
}

```

## Update handleSubmit function in ChatContainer.tsx:

```

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    console.log("submit");
    const newChatLog = [...chatLog, { user: "me", message: `${input}` }];
    setInput("");
     setChatLog(newChatLog);
     console.log({ newChatLog });

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
    console.log(data);
      setChatLog([...newChatLog, { user: "gpt", message: `${data.suggestion}` }]);
  };
```

Now test the app by entering an input ex: what is chatgpt? You should receive a response.

## Implement React Context API:

### Create typings.d.ts in the root directory:

```
interface ChatLog {
  user: string;
  message: string;
}

```

### Create context/ChatContext.tsx:

```
import React, { createContext, ReactNode, useState } from "react";

interface ChatProviderProps {
  children: ReactNode;
}

interface Chat {
  input: string;
  setInput: (input: string) => void;
  chatLog: ChatLog[];
  setChatLog: (chatLog: ChatLog[]) => void;
}

export const ChatContext = createContext<Chat>({} as Chat);

export function ChatProvider({ children }: ChatProviderProps) {
  const [input, setInput] = useState("");
  const [chatLog, setChatLog] = useState([
    {
      user: "gpt",
      message: "How can I help you today?",
    },
    {
      user: "me",
      message: "I want to use chatGPT today.",
    },
  ]);
  return (
    <ChatContext.Provider
      value={{
        input,
        setInput,
        chatLog,
        setChatLog,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export default ChatProvider;

```

### Add ChatProvder in \_app.tsx to enable data sharing among all the components:

```
import "../styles/globals.css";
import type { AppProps } from "next/app";
import { ChatProvider } from "../context/ChatContext";
function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ChatProvider>
      <Component {...pageProps} />
    </ChatProvider>
  );
}

export default MyApp;

```

### Use the values created in Context in ChatContainer.tsx:

```
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
    console.log({ chatLog });
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
    console.log(data.suggestion);
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

```

### Use the values created in Context in components/Sidebar.tsx:

```
import React, { useContext } from "react";
import {
  ArrowRightOnRectangleIcon,
  ArrowTopRightOnSquareIcon,
  ChatBubbleOvalLeftIcon,
  PlusIcon,
  SunIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { ChatContext } from "../context/ChatContext";
type Props = {};

function Sidebar({}: Props) {
  const { setChatLog } = useContext(ChatContext);

  const clearChat = () => {
    setChatLog([]);
  };

  return (
    <aside className="sidemenu w-80 text-white bg-[#202123] text-left flex flex-col justify-between">
      <div
        className="sidemenu-btn m-2 border-[1px] border-gray-700 rounded-lg"
        onClick={clearChat}
      >
        <button className="flex w-full items-center space-x-3 p-3 hover:bg-white/10 transition-all duration-250 ease-in">
          <PlusIcon className="w-4 h-4" />{" "}
          <span className="text-sm">New chat</span>
        </button>
      </div>
      <div className="sidemenu-btn m-2  border-t py-2">
        <button className="flex w-full items-center space-x-3 p-3 rounded-md hover:bg-white/10">
          <TrashIcon className="w-4 h-4" />{" "}
          <span className="text-sm">Clear conversations</span>
        </button>
        <button className="flex w-full items-center space-x-3 p-3 rounded-md hover:bg-white/10">
          <SunIcon className="w-4 h-4" />{" "}
          <span className="text-sm">Light mode</span>
        </button>
        <button className="flex w-full items-center space-x-3 p-3 rounded-md hover:bg-white/10">
          <ChatBubbleOvalLeftIcon className="w-4 h-4" />{" "}
          <span className="text-sm">OpenAI Discord</span>
        </button>
        <button className="flex w-full items-center space-x-3 p-3 rounded-md hover:bg-white/10">
          <ArrowTopRightOnSquareIcon className="w-4 h-4" />{" "}
          <span className="text-sm">Updates & FAQ</span>
        </button>
        <button className="flex w-full items-center space-x-3 p-3 rounded-md hover:bg-white/10">
          <ArrowRightOnRectangleIcon className="w-4 h-4" />{" "}
          <span className="text-sm">Log out</span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;

```

create a sitemap for a coffee shop website
