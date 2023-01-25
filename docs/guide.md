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
      className={`wrapper chat-log w-full  ${
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
        <div className="message flex-1 text-[#dcdcdc] text-xl max-w-[100%]  whitespace-pre-wrap">
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

The app should work as expected.
Try an example: Create a sitemap for a coffee shop website.

## Add Feature to Select OpenAI Models:

### Create new api routes pages/api/models.tsx:

```
import type { NextApiRequest, NextApiResponse } from "next";
import { configuration } from "../../utils/constants";
import { OpenAIApi } from "openai";

type Data = {
  models: any;
};

const openai = new OpenAIApi(configuration);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const response = await openai.listEngines();
  console.log({ response });
  console.log(response.data.data);

  if (response === undefined) throw new Error("No engines found");

  res.status(200).json({ models: response.data.data });
}

```

### Update context/ChatContext.tsx:

Add a state for models and currentModel.

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
  models: Model[];
  setModels: any;
  currentModel: string;
  setCurrentModel: (currentModel: string) => void;
}

export const ChatContext = createContext<Chat>({} as Chat);

export function ChatProvider({ children }: ChatProviderProps) {
  const [models, setModels] = useState([]);
  const [currentModel, setCurrentModel] = useState("ada");
  const [input, setInput] = useState("");
  const [chatLog, setChatLog] = useState([
    {
      user: "gpt",
      message: "How can I help you today?",
    },
  ]);
  return (
    <ChatContext.Provider
      value={{
        input,
        setInput,
        chatLog,
        setChatLog,
        models,
        setModels,
        currentModel,
        setCurrentModel,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export default ChatProvider;


```

### Update components/Sidebar.tsx:

```
import React, { useContext, useEffect } from "react";
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
  const { setChatLog, models, setModels, currentModel, setCurrentModel } =
    useContext(ChatContext);

  const clearChat = () => {
    setChatLog([]);
  };
  const getEngines = async () => {
    const response = await fetch("/api/models");
    const data = await response.json();
    // console.log(data.models);
    setModels(data.models);
  };
  // Run once on app load
  useEffect(() => {
    getEngines();
  }, []);

  return (
    <aside className="sidemenu w-80 text-white bg-[#202123] text-left flex flex-col justify-between">
      <div>
        <div
          className="sidemenu-btn m-2 border border-gray-700 rounded-lg"
          onClick={clearChat}
        >
          <button className="flex w-full items-center space-x-3 p-3 hover:bg-white/10 transition-all duration-250 ease-in">
            <PlusIcon className="w-4 h-4" />{" "}
            <span className="text-sm">New chat</span>
          </button>
        </div>
        <div className="models m-2">
          <select
            value={currentModel}
            onChange={(e) => setCurrentModel(e.target.value)}
            className="appearance-none w-full p-3 text-sm text-white bg-[#202123] border border-gray-700 rounded-lg transition ease-in-out m-0 focus:text-white focus:bg-[#202123] focus:border focus:outline-none"
          >

            {models &&
              models?.map((model) => (
                <option key={model.id} value={model.id}>
                  {model.id}
                </option>
              ))}
          </select>
        </div>
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

### Update components/ChatContainer.tsx:

Pass the currentModel into the handleSubmit function in the response body.

```
import {
  BoltIcon,
  ExclamationTriangleIcon,
  SunIcon,
} from "@heroicons/react/24/outline";
import { PaperAirplaneIcon } from "@heroicons/react/24/solid";
import React, { useContext } from "react";
import { ChatContext } from "../context/ChatContext";
import ChatMessage from "./ChatMessage";

type Props = {};

function ChatContainer({}: Props) {

  const { input, setInput, chatLog, setChatLog, currentModel } =
    useContext(ChatContext);

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    console.log("submit");
    const newChatLog = [...chatLog, { user: "me", message: `${input}` }];
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

```

### Update pages/api/chatgpt.tsx:

Pull the currentModel from the req.body and use it as the model in the response:

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
  const { message, currentModel } = req.body;
  // console.log("message:", message);

  const response = await openai.createCompletion({
    // model: "text-davinci-003",
    model: `${currentModel}`,
    // prompt: `I'm ok.`,
    prompt: `${message}`,
    temperature: 0.7,
    max_tokens: 256,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
  });
  const suggestion = response.data?.choices?.[0].text;
  // console.log(suggestion);

  if (suggestion === undefined) throw new Error("No suggestion found");

  // res.status(200).json({ suggestion: suggestion });
  res.status(200).json({ suggestion });
}

```

Test by selecting a model:
Example: text-davinci-002
create a sitemap for a coffee shop website

## Add Feature to Set Temperature Range:

### Update context/ChatContext.tsx:

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
  models: Model[];
  setModels: any;
  currentModel: string;
  setCurrentModel: (currentModel: string) => void;
  temperature:  string;
  setTemperature: (temperature:  string) => void;
}

export const ChatContext = createContext<Chat>({} as Chat);

export function ChatProvider({ children }: ChatProviderProps) {
  const [models, setModels] = useState([]);
  const [currentModel, setCurrentModel] = useState("ada");
  const [input, setInput] = useState("");
  const [temperature, setTemperature] = useState("0.7");

  // const [chatLog, setChatLog] = useState([
  //   {
  //     user: "gpt",
  //     message: "How can I help you today?",
  //   },
  //   {
  //     user: "me",
  //     message: "I want to use chatGPT today.",
  //   },
  // ]);
  const [chatLog, setChatLog] = useState([
    {
      user: "gpt",
      message: "How can I help you today?",
    },
  ]);
  return (
    <ChatContext.Provider
      value={{
        input,
        setInput,
        chatLog,
        setChatLog,
        models,
        setModels,
        currentModel,
        setCurrentModel,
        temperature,
        setTemperature,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export default ChatProvider;


```

### Update components/Sidebar.tsx:

```
import React, { useContext, useEffect } from "react";
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
  const {
    setChatLog,
    models,
    setModels,
    currentModel,
    setCurrentModel,
    temperature,
    setTemperature,
  } = useContext(ChatContext);

  const clearChat = () => {
    setChatLog([]);
  };
  const getEngines = async () => {
    const response = await fetch("/api/models");
    const data = await response.json();
    // console.log(data.models);
    setModels(data.models);
  };
  // Run once on app load
  useEffect(() => {
    getEngines();
  }, []);

  return (
    <aside className="sidemenu w-80 text-white bg-[#202123] text-left flex flex-col justify-between">
      <div>
        {/* New Chat */}
        <div
          className="sidemenu-btn m-2 border border-gray-700 rounded-lg"
          onClick={clearChat}
        >
          <button className="flex w-full items-center space-x-3 p-3 hover:bg-white/10 transition-all duration-250 ease-in">
            <PlusIcon className="w-4 h-4" />{" "}
            <span className="text-sm">New chat</span>
          </button>
        </div>
        {/* Select a Model */}
        <div className="models m-2 space-y-2">
          <h4 className="p-1 text-md">Model</h4>
          <select
            onChange={(e) => setCurrentModel(e.target.value)}
            value={currentModel}
            className=" w-full p-3 m-0 text-sm text-white bg-[#202123] border border-gray-700 rounded-lg transition ease-in-out focus:text-white focus:bg-[#202123] focus:border focus:outline-none"
          >
            {models &&
              models?.map((model) => (
                <option key={model.id} value={model.id}>
                  {model.id}
                </option>
              ))}
          </select>
          <button
            className="flex w-full items-center space-x-3 p-3 rounded-lg bg-white/30 hover:bg-white/10 transition-all duration-250 ease-in"
            onClick={() => setCurrentModel("text-davinci-002")}
          >
            <span className="text-sm">Smart - Davinci</span>
          </button>
          <button
            className="flex w-full items-center space-x-3 p-3 rounded-lg bg-white/30 hover:bg-white/10 transition-all duration-250 ease-in"
            onClick={() => setCurrentModel("code-cushman-001")}
          >
            <span className="text-sm">Code - Cushman</span>
          </button>
          <p className="text-xs p-1">
            The model parameter controls the engine used to generate the
            response. Davinci produces the best results.
          </p>
        </div>
        {/* Select Temperature Parameter */}
        <div className="temperature m-2 space-y-2">
          <div className="flex w-full items-center justify-between">
            <h4 className="p-1 text-md">Temperature</h4>{" "}
            <span className="text-sm p-3 border border-gray-700 rounded-lg">
              {temperature}
            </span>
          </div>
          <div className="rounded-lg shadow-lg max-w-[300px]">
            <div className="py-2 px-4">
              <input
                className="w-full accent-indigo-600 cursor-pointer"
                type="range"
                name="temperature"
                value={temperature}
                min="0.1"
                max="1"
                onChange={(e) => setTemperature(e.target.value)}
                step="0.1"
              />
              <div className="-mt-2 flex w-full justify-between">
                <span className="text-sm text-gray-600">0</span>
                <span className="text-sm text-gray-600">1</span>
              </div>
            </div>
          </div>
          <button
            className="flex w-full items-center space-x-3 p-3 rounded-lg bg-white/30 hover:bg-white/10 transition-all duration-250 ease-in"
            onClick={() => setTemperature("0")}
          >
            <span className="text-sm">0 - Deterministic & Repetitive</span>
          </button>
          <button
            className="flex w-full items-center space-x-3 p-3 rounded-lg bg-white/30 hover:bg-white/10 transition-all duration-250 ease-in"
            onClick={() => setTemperature("0.5")}
          >
            <span className="text-sm">0.5 - Balanced</span>
          </button>
          <button
            className="flex w-full items-center space-x-3 p-3 rounded-lg bg-white/30 hover:bg-white/10 transition-all duration-250 ease-in"
            onClick={() => setTemperature("1")}
          >
            <span className="text-sm">1 - Creative</span>
          </button>
          <p className="text-xs p-1">
            The temperature parameter controls the randomness of the model. 0 is
            the most deterministic, 1 is the most creative.
          </p>
        </div>
      </div>
      <div className="sidemenu-btn m-2  border-t py-2">
        <button
          className="flex w-full items-center space-x-3 p-3 rounded-md hover:bg-white/10"
          onClick={clearChat}
        >
          <TrashIcon className="w-4 h-4" />{" "}
          <span className="text-sm">Clear conversations</span>
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

### Update components/ChatContainer.tsx:

Pass the temperature into the handleSubmit function in the response body.

```
import {
  BoltIcon,
  ExclamationTriangleIcon,
  SunIcon,
} from "@heroicons/react/24/outline";
import { PaperAirplaneIcon } from "@heroicons/react/24/solid";
import React, { useContext } from "react";
import { ChatContext } from "../context/ChatContext";
import ChatMessage from "./ChatMessage";

type Props = {};

function ChatContainer({}: Props) {

  const { input, setInput, chatLog, setChatLog, currentModel, temperature } =
    useContext(ChatContext);

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    console.log("submit");
    const newChatLog = [...chatLog, { user: "me", message: `${input}` }];
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
    setChatLog([...newChatLog, { user: "gpt", message: `${data.suggestion}` }]);
  };

  return (
    <div className="app flex flex-col w-[100vw] h-[100vh] bg-[#343541] items-center justify-between">
      {/* Chat Box */}
      <div className="chat-container text-white flex flex-col gap-3 flex-1 w-full h-full overflow-y-scroll overscroll-none scrollbar-hide pb-5 scroll-smooth">
        {chatLog.length ? (
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

### Update pages/api/chatgpt.tsx:

Pull the temperature from the req.body and use it as the temperature in the response:

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
  const { message, currentModel, temperature } = req.body;
  // console.log("message:", message);
  console.log("currentModel:", currentModel);

  const response = await openai.createCompletion({
    // model: "text-davinci-003",
    model: `${currentModel}`,
    // prompt: `I'm ok.`,
    prompt: `${message}`,
    // temperature: 0.7,
    temperature: Number(`${temperature}`),
    max_tokens: 256,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
  });
  const suggestion = response.data?.choices?.[0].text;
  // console.log(suggestion);

  if (suggestion === undefined) throw new Error("No suggestion found");

  // res.status(200).json({ suggestion: suggestion });
  res.status(200).json({ suggestion });
}

```

## Add Unique Id to ChatMessage.tsx:

### Install UUID:

```
npm install uuid
```

### Update components/ChatContainer.tsx:

Update with uuid and also add scrollToBottom

```
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
      <p className="text-gray-400 text-sm my-2">
        ChatGPT Jan 9 Version. Free Research Preview. Our goal is to make AI
        systems more natural and safe to interact with. Your feedback will help
        us improve.
      </p>
    </div>
  );
}

export default ChatContainer;

```

### Update components/ChatMessage.tsx:

```
import React, { useContext } from "react";
import { ChatContext } from "../context/ChatContext";

type Props = {
  message: any;
};

function ChatMessage({ message }: Props) {
  // const { uniqueId } = useContext(ChatContext);
  // console.log({ uniqueId });

  // console.log("messageID:", message.messageId);
  // const messageId = message.messageId;

  return (
    <div
      className={`wrapper chat-log w-full  ${
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
        <div
          className="message flex-1 text-[#dcdcdc] text-xl max-w-[100%]  whitespace-pre-wrap"
          id={`${message.messageId}`}
        >
          {message.message}
        </div>
      </div>
    </div>
  );
}

export default ChatMessage;

```

## Testing:
By default Model:"text-davinci-002" and Temperature:"0.7".
You can select a model of your choice and set the temperature.

Test example: Hi. Can you create a sitemap for a coffee shop website and also create some copy for each page?
