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

Another way of doing this is:

Create utils/constants.ts:

```
import { Configuration, OpenAIApi } from "openai";

// Requesting organization
const configuration = new Configuration({
  organization: process.env.OPENAI_ORG_ID,
  apiKey: process.env.OPENAI_API_KEY,
});


const openai = new OpenAIApi(configuration);

export default openai;


```

Next, create utils/queryApi.ts:

```
import openai from "./constants";

const query = async (
  prompt: string,
  chatId: string,
  currentModel: string,
  temperature: string
) => {
  const response = await openai
    .createCompletion({
      model: currentModel,
      prompt,
      temperature: Number(`${temperature}`),
      max_tokens: 100,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
    })
    .then((response) => response.data.choices[0].text)
    .catch((err) => {
      `ChatGPT was unable to find an answer for that prompt. Error: ${err.message}`; // to avoid 429 error too many request to avoid rate limitations
    });
  return response;
};

export default query;
```

To add a doc to firebase collection from server end you would need access to firebase admin.

Go to Project Settings > Service Accounts > Node.js > Generate a new private key (It downloads the file). Rename the file to serviceAccountKey.json.
Copy the file contents and go to https://www.textfixer.com/tools/remove-line-breaks.php > Paste > Remove Line Breaks > Copy

Got to .env.local and create FIREBASE_SERVICE_ACCOUNT_KEY=paste content here

And delete the serviceAccountKey.json or add it to gitignore.

```
npm install firebase-admin
```

Create firebaseAdmin.ts:

```
import admin from "firebase-admin";
import { getApps } from "firebase/app";

// const serviceAccount = require("./serviceAccountKey.json");
const serviceAccount = JSON.parse(
  process.env.FIREBASE_SERVICE_ACCOUNT_KEY as string
);

if (!getApps().length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: process.env.PROJECT_ID,
  });
}

const adminDb = admin.firestore();

export { adminDb };


```

Then create pages/api/chatgpt.tsx:

```
import type { NextApiRequest, NextApiResponse } from "next";
import { configuration } from "../../utils/constants";
import { OpenAIApi } from "openai";
import query from "../../utils/queryApi";
import admin from "firebase-admin";
import { adminDb } from "../../firebaseAdmin";
type Data = {
  suggestion: string;
};

const openai = new OpenAIApi(configuration);
// const response = await openai.listEngines();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {

  const { prompt, chatId, currentModel, temperature, session } = req.body;
  if (!prompt)
    return res.status(400).json({ suggestion: "Please enter a prompt" });

  if (!chatId)
    return res.status(400).json({ suggestion: "Please enter a valid chatId!" });

  // ChatGPT Query
  const response = await query(prompt, chatId, currentModel, temperature);
  // console.log("response:", response);

  // Need access to firebase Admin to add doc to messages collection from server end. Create firebaseAdmin.ts
  const message: Message = {
    text: response || "ChatGPT was unable to find an answer for that prompt",
    createdAt: admin.firestore.Timestamp.now(),
    user: {
      _id: "ChatGPT",
      name: "ChatGPT",
      avatar: "/public/images/chatgpt-logo.png",
    },
  };

  await adminDb
    .collection("users")
    .doc(session?.user?.email!)
    .collection("chats")
    .doc(chatId)
    .collection("message")
    .add(message);
  res.status(200).json({ suggestion: message.text });

}

```
Install useSWR forData Fetching the models and react-select:
```
npm i swr 
npm i --save react-select
```

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
        className={`chat-message p-3 w-full max-w-[1280px] my-0 mx-auto flex justify-center gap-3`}
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

Update the bot message to print with typing text animation.

```
import React, { useContext, useEffect, useState } from "react";
import { ChatContext } from "../context/ChatContext";
import BouncingDotsLoader from "./BouncingDotsLoader";

type Props = {
  message: any;
};

function ChatMessage({ message }: Props) {
  const { uniqueId } = useContext(ChatContext);
  console.log({ uniqueId });

  const AnimText = (content: string, delay: number) => {
    const [displayed, updateDisplay] = useState("");
    let animID: any;
    const typeLetter = () => {
      updateDisplay((prevText) => {
        if (content.length <= prevText.length) clearInterval(animID);
        return prevText.concat(content.charAt(prevText.length));
      });
    };

    useEffect(() => {
      updateDisplay(content.charAt(0)); // call once to avoid empty element flash
      animID = setInterval(typeLetter, delay);
      return () => {
        updateDisplay("");
        clearInterval(animID);
      };
    }, [content]); // this make sure it re-renders every time the content changes (return function resets display)

    return displayed; //
  };

  return (
    <div
      className={`wrapper chat-log w-full  ${
        message.user === "gpt" && "bg-white/10"
      }  `}
    >
      <div
        className={`chat-message p-3 w-full max-w-[1280px] my-0 mx-auto flex justify-center gap-3`}
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
          {/* {message.message} */}
          {/* {message.messageId === uniqueId ? "Bot Message" : "User Message"} */}
          {`${
            message.messageId === uniqueId
              ? AnimText(message.message, 20)
              : message.message
          }`}
        </div>
      </div>
    </div>
  );
}

export default ChatMessage;


```

## Persist chat using local storage:

### Update components/ChatContainer.tsx:

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
    localStorage.clear();
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
            onClick={() => setCurrentModel("text-davinci-003")}
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

## Implementing Authentication using Next-Auth:

### Install Next-Auth

```
npm install next-auth
```

### Generate NEXT SECRET to use as JWT_SECRET in .env.local:

openssl rand -base64 32

### Create pages/api/auth/[...nextauth].tsx:

```
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export default NextAuth({
  providers: [
    // OAuth authentication providers...
    GoogleProvider({
      clientId: process.env.GOOGLE_ID as string,
      clientSecret: process.env.GOOGLE_SECRET as string,
    }),
  ],
  secret: process.env.JWT_SECRET,
});

```

### Setup Firebase:

#### Install Firebase into your project:

```
npm install firebase
```

#### Setup Firebase Authentication:

Go to https://console.firebase.google.com/ Add new project: chatgpt-clone > Continue Project settings > </> (Click on the web icon to Add Firebase to your web app) Register app: chatgpt-clone > Register app

Next go to Build > Authentication > Get Started >Sign-in providers: Google > Choose Project support email > Save

##### Create firebaseConfig.ts in the root:

Copy the code provided by firebase to initialize Firebase and begin using the SDKs for the products you'd like to use.

```
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDdm8pNWZ03UGdqPGszfdzboy68HykA5zs",
  authDomain: "chatgpt-clone-cba9d.firebaseapp.com",
  projectId: "chatgpt-clone-cba9d",
  storageBucket: "chatgpt-clone-cba9d.appspot.com",
  messagingSenderId: "886038362633",
  appId: "1:886038362633:web:74819ee802b5a7568816d8",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

```

###### Update firebaseConfig.ts to reflect the NextJS setup:

```
// Import the functions you need from the SDKs you need
import { getApp, getApps, initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDdm8pNWZ03UGdqPGszfdzboy68HykA5zs",
  authDomain: "chatgpt-clone-cba9d.firebaseapp.com",
  projectId: "chatgpt-clone-cba9d",
  storageBucket: "chatgpt-clone-cba9d.appspot.com",
  messagingSenderId: "886038362633",
  appId: "1:886038362633:web:74819ee802b5a7568816d8",
};

// Initialize Firebase
// const app = initializeApp(firebaseConfig);
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };

```

#### Google Authentication

Go to Google Cloud Console -> Create New Project -> APIs & Services -> Setup OAuth consent screen and Create Credentials for OAuth Client ID

Add the Authorized JavaScript origins:
http://localhost:3000

Authorized redirect URIs:
Ex:http://localhost:3000/api/auth/callback/google

Copy the Client ID and Client Secret and paste into .env.local file.
GOOGLE_ID=
GOOGLE_SECRET=

#### Setup Firebase Firestore Database:

Firestore Database -> Get Started -> Start in Test mode -> Select loaction -> Enable

### Create a Realtime connection with Firestore:

https://www.npmjs.com/package/react-firebase-hooks

```
npm install react-firebase-hooks
```

Go to [Cloud Firestore Hooks](https://github.com/csfrequency/react-firebase-hooks/tree/09bf06b28c82b4c3c1beabb1b32a8007232ed045/firestore)

Update Sidebar.tsx:

```

```

### Update pages/\_app.tsx:

```
import "../styles/globals.css";
import type { AppProps } from "next/app";
import { ChatProvider } from "../context/ChatContext";
import { SessionProvider } from "next-auth/react";
import { Session } from "next-auth";
import { useEffect, useState } from "react";

function MyApp({
  Component,
  pageProps,
}: AppProps<{
  session: Session;
}>) {
  // To fix hydration UI mismatch issues, we need to wait until the component has mounted.
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  if (!mounted) return null;
  return (
    <SessionProvider session={pageProps.session}>
      <ChatProvider>
        <Component {...pageProps} />
      </ChatProvider>
    </SessionProvider>
  );
}

export default MyApp;

```

#### Usage Example:

```
import { useSession, signIn, signOut } from "next-auth/react"

export default function Component() {
  const { data: session } = useSession()
  if(session) {
    return <>
      Signed in as {session.user.email} <br/>
      <button onClick={() => signOut()}>Sign out</button>
    </>
  }
  return <>
    Not signed in <br/>
    <button onClick={() => signIn()}>Sign in</button>
  </>
}
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
import { useSession, signIn, signOut } from "next-auth/react";
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
    localStorage.clear();
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

  const { data: session } = useSession();
  console.log(session);
  return (
    <aside className="sidemenu w-80 text-white bg-[#202123] text-left flex flex-col justify-between">
      <div>
        {/* New Chat */}
        <div
          className="sidemenu-btn m-2 border border-gray-700 rounded-lg"
          onClick={clearChat}
        >
          <button
            disabled={!session}
            className={`flex w-full items-center space-x-3 p-3 hover:bg-white/10 transition-all duration-250 ease-in ${
              !session &&
              "from-gray-300 to-gray-500 text-gray-300 cursor-not-allowed"}`}
          >
            <PlusIcon className="w-4 h-4" />{" "}
            <span className="text-sm">New chat</span>
          </button>
        </div>
        {/* Select a Model */}
        <div className="models m-2 space-y-2">
          <h4 className="p-1 text-md">Model</h4>
          <select
            disabled={!session}
            onChange={(e) => setCurrentModel(e.target.value)}
            value={currentModel}
            className={`w-full p-3 m-0 text-sm text-white bg-[#202123] border border-gray-700 rounded-lg transition ease-in-out focus:text-white focus:bg-[#202123] focus:border focus:outline-none ${
              !session &&
              "from-gray-300 to-gray-500 text-gray-300 cursor-not-allowed"
            }`}
          >
            {models &&
              models?.map((model) => (
                <option key={model.id} value={model.id}>
                  {model.id}
                </option>
              ))}
          </select>
          <button
            disabled={!session}
            className={`flex w-full items-center space-x-3 p-3 rounded-lg bg-white/30 hover:bg-white/10 transition-all duration-250 ease-in ${
              !session &&
              "from-gray-300 to-gray-500 border-gray-200 text-gray-300 cursor-not-allowed"
            }`}
            onClick={() => setCurrentModel("text-davinci-003")}
          >
            <span className="text-sm">Smart - Davinci</span>
          </button>
          <button
            disabled={!session}
            className={`flex w-full items-center space-x-3 p-3 rounded-lg bg-white/30 hover:bg-white/10 transition-all duration-250 ease-in ${
              !session &&
              "from-gray-300 to-gray-500 border-gray-200 text-gray-300 cursor-not-allowed"
            }`}
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
                disabled={!session}
                className={`w-full accent-indigo-600 cursor-pointer ${
                  !session &&
                  "from-gray-300 to-gray-500 border-gray-200 text-gray-300 cursor-not-allowed"
                }`}
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
            disabled={!session}
            className={`flex w-full items-center space-x-3 p-3 rounded-lg bg-white/30 hover:bg-white/10 transition-all duration-250 ease-in ${
              !session &&
              "from-gray-300 to-gray-500 border-gray-200 text-gray-300 cursor-not-allowed"
            }`}
            onClick={() => setTemperature("0")}
          >
            <span className="text-sm">0 - Deterministic & Repetitive</span>
          </button>
          <button
            disabled={!session}
            className={`flex w-full items-center space-x-3 p-3 rounded-lg bg-white/30 hover:bg-white/10 transition-all duration-250 ease-in ${
              !session &&
              "from-gray-300 to-gray-500 border-gray-200 text-gray-300 cursor-not-allowed"
            }`}
            onClick={() => setTemperature("0.5")}
          >
            <span className="text-sm">0.5 - Balanced</span>
          </button>
          <button
            disabled={!session}
            className={`flex w-full items-center space-x-3 p-3 rounded-lg bg-white/30 hover:bg-white/10 transition-all duration-250 ease-in ${
              !session &&
              "from-gray-300 to-gray-500 border-gray-200 text-gray-300 cursor-not-allowed"
            }`}
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
        {session && (
          <button
            className="flex w-full items-center space-x-3 p-3 rounded-md hover:bg-white/10"
            onClick={clearChat}
          >
            <TrashIcon className="w-4 h-4" />{" "}
            <span className="text-sm">Clear conversations</span>
          </button>
        )}

        <button
          className="flex w-full items-center space-x-3 p-3 rounded-md hover:bg-white/10"
          onClick={!session ? () => signIn() : () => signOut()}
        >
          <ArrowRightOnRectangleIcon className="w-4 h-4" />{" "}
          {session ? (
            <span className="text-sm">Log out</span>
          ) : (
            <span className="text-sm">Log In</span>
          )}
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;

```

### Update components/Chatcontainer.tsx:

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
import { signIn, useSession } from "next-auth/react";
import Image from "next/image";

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
        {session && chatLog.length ? (
          <>
            {chatLog?.map((message: any, index: any) => (
              <ChatMessage key={index} message={message} />
            ))}
            <div ref={messagesEndRef} />
          </>
        ) : session ? (
          <div className="flex flex-col items-center justify-center h-full">
            <h1 className="text-2xl">ChatGPT</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 m-5">
              <div className="col-span-1 text-center  space-y-4">
                <div className=" items-center justify-center flex flex-col">
                  <SunIcon className="w-5 h-5" />
                  <h2>Examples</h2>
                </div>
                <p
                  className="bg-white/10 rounded-md p-2"
                  onClick={() =>
                    setInput("Explain quantum computing in simple terms")
                  }
                >
                  "Explain quantum computing in simple terms"
                </p>
                <p
                  className="bg-white/10 rounded-md p-2"
                  onClick={() =>
                    setInput(
                      "Got any creative ideas for a 10 year old's birthday?"
                    )
                  }
                >
                  "Got any creative ideas for a 10 year old's birthday?"
                </p>
                <p
                  className="bg-white/10 rounded-md p-2"
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
                  "May occasionally produce harmful instructions or biased
                  content"
                </p>
                <p className="bg-white/10 rounded-md p-2">
                  "Limited knowledge of world and events after 2021"
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 space-y-2 md:space-y-6 items-center justify-center w-full h-full">
            <div className="col-span-1 md:col-span-1 w-full p-5 space-y-8 flex flex-col items-center justify-center">
              <h2 className="text-lg md:text-3xl font-semibold">
                Welcome to ChatGPT!
              </h2>
              <p className="max-w-[350px] text-md font-medium leading-7 tracking-wider text-center">
                ChatGPT: Optimizing Language Models for Dialogue interacts in a
                conversational way. The dialogue format makes it possible for
                ChatGPT to answer followup questions, admit its mistakes,
                challenge incorrect premises, and reject inappropriate requests.
              </p>
              <button
                onClick={() => signIn()}
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
        )}
      </div>
      {/* Form */}
      <form
        ref={formRef}
        className="w-full max-w-[980px] my-0 mx-auto p-3 bg-[#40414F] flex items-center"
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
          onClick={handleSubmit}
          type="submit"
          className=" outline-none border-none cursor-pointer bg-transparent mr-5"
        >
        <PaperAirplaneIcon className="w-6 h-6 text-gray-400" />
        </button>
      </form>
      <p className="hidden md:inline-flex text-gray-400 text-sm my-2">
        ChatGPT Jan 9 Version. Free Research Preview. Our goal is to make AI
        systems more natural and safe to interact with. Your feedback will help
        us improve.
      </p>
    </div>
  );
}

export default ChatContainer;


```

## Cleanup components/ChatContainer:

### Create components/Welcome.tsx:

```
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
          onClick={() => signIn()}
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

```

### Create components/Intro.tsx:

```
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

```

### ### Update components/Chatcontainer.tsx:

```
import { PaperAirplaneIcon } from "@heroicons/react/24/solid";
import React, { useContext, useEffect, useRef, useState } from "react";
import { ChatContext } from "../context/ChatContext";
import ChatMessage from "./ChatMessage";
import { v4 } from "uuid";
import { useSession } from "next-auth/react";
import Welcome from "./Welcome";
import Intro from "./Intro";

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
        className="chat-container max-w-[980px] mt-5 text-white flex flex-col gap-3 flex-1 w-full h-full overflow-y-scroll overscroll-none scrollbar-hide pb-5 scroll-smooth"
      >
        {session && chatLog.length ? (
          <>
            {chatLog?.map((message: any, index: any) => (
              <ChatMessage key={index} message={message} />
            ))}
            <div ref={messagesEndRef} />
          </>
        ) : session ? (
          <Intro />
        ) : (
          <Welcome />
        )}
      </div>
      {/* Form */}

      <form
        ref={formRef}
        className="w-full max-w-[980px] my-0 mx-auto p-3 bg-[#40414F] flex items-center"
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
          onClick={handleSubmit}
          type="submit"
          className=" outline-none border-none cursor-pointer bg-transparent mr-5"
        >
          <PaperAirplaneIcon className="w-6 h-6 text-gray-400" />
        </button>
      </form>
      <p className="hidden md:inline-flex text-gray-400 text-sm my-2">
        ChatGPT Jan 9 Version. Free Research Preview. Our goal is to make AI
        systems more natural and safe to interact with. Your feedback will help
        us improve.
      </p>
    </div>
  );
}

export default ChatContainer;


```

## To avoid flickering use SSR for session:

When you refresh the page you might see a flicker between the Welcome.tsx and Intro.tsx components. This can be avoiided by using SSR for loading the session.

### Update pages/index.tsx:

```
import Head from "next/head";
import { useEffect, useState } from "react";
import { ChatContainer, Sidebar } from "../components";
import { getSession } from "next-auth/react";
import { Session } from "next-auth";
import { GetServerSideProps } from "next";
interface Props {
  session: Session;
}
const Home = ({ session }: Props) => {
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
         <Sidebar session={session} />
        {/* <ChatContainer uniqueUserId={uniqueUserId} uniqueAiId={uniqueAiId} /> */}
        {/* <ChatContainer uniqueId={uniqueId} /> */}
        <ChatContainer session={session} />
      </main>
    </div>
  );
};

export default Home;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context);

  return {
    props: {
      session,
    },
  };
};

```

### Update pages/components/ChatContainer.tsx:

```
import { PaperAirplaneIcon } from "@heroicons/react/24/solid";
import React, { useContext, useEffect, useRef } from "react";
import { ChatContext } from "../context/ChatContext";
import ChatMessage from "./ChatMessage";
import { v4 } from "uuid";
// import { useSession } from "next-auth/react";
import Welcome from "./Welcome";
import Intro from "./Intro";
import { Session } from "next-auth";

interface Props {
  session: Session;
}

function ChatContainer({ session }: Props) {
  const {
    input,
    setInput,
    chatLog,
    setChatLog,
    currentModel,
    temperature,
    setUniqueId,
  } = useContext(ChatContext);

  // const { data: session } = useSession();
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
        className="chat-container max-w-[980px] mt-5 text-white flex flex-col gap-3 flex-1 w-full h-full overflow-y-scroll overscroll-none scrollbar-hide pb-5 scroll-smooth"
      >
        {session && chatLog.length ? (
          <>
            {chatLog?.map((message: any, index: any) => (
              <ChatMessage key={index} message={message} />
            ))}
            <div ref={messagesEndRef} />
          </>
        ) : session ? (
          <Intro />
        ) : (
          <Welcome />
        )}
      </div>
      {/* Form */}

      <form
        ref={formRef}
        className="w-full max-w-[980px] my-0 mx-auto p-3 bg-[#40414F] flex items-center"
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
          onClick={handleSubmit}
          type="submit"
          className=" outline-none border-none cursor-pointer bg-transparent mr-5"
        >
          <PaperAirplaneIcon className="w-6 h-6 text-gray-400" />
        </button>
      </form>
      <p className="hidden md:inline-flex text-gray-400 text-sm my-2">
        ChatGPT Jan 9 Version. Free Research Preview. Our goal is to make AI
        systems more natural and safe to interact with. Your feedback will help
        us improve.
      </p>
    </div>
  );
}

export default ChatContainer;

```

### Update pages/components/Sidebar.tsx:

```
import React, { useContext, useEffect } from "react";
import {
  ArrowRightOnRectangleIcon,
  PlusIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { ChatContext } from "../context/ChatContext";
import { signIn, signOut } from "next-auth/react";
import { Session } from "next-auth";
type Props = {
  session: Session;
};

function Sidebar({ session }: Props) {
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
    localStorage.clear();
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

  // const { data: session } = useSession();
  // console.log(session);
  return (
    <aside className="sidemenu w-80 text-white bg-[#202123] text-left flex flex-col justify-between">
      <div>
        {/* New Chat */}
        <div
          className="sidemenu-btn m-2 border border-gray-700 rounded-lg"
          onClick={clearChat}
        >
          <button
            disabled={!session}
            className={`flex w-full items-center space-x-3 p-3 hover:bg-white/10 transition-all duration-250 ease-in ${
              !session &&
              "from-gray-300 to-gray-500 text-gray-300 cursor-not-allowed"
            }`}
          >
            <PlusIcon className="w-4 h-4" />{" "}
            <span className="text-sm">New chat</span>
          </button>
        </div>
        {/* Select a Model */}
        <div className="models m-2 space-y-2">
          <h4 className="p-1 text-md">Model</h4>
          <select
            disabled={!session}
            onChange={(e) => setCurrentModel(e.target.value)}
            value={currentModel}
            className={`w-full p-3 m-0 text-sm text-white bg-[#202123] border border-gray-700 rounded-lg transition ease-in-out focus:text-white focus:bg-[#202123] focus:border focus:outline-none ${
              !session &&
              "from-gray-300 to-gray-500 text-gray-300 cursor-not-allowed"
            }`}
          >
            {models &&
              models?.map((model) => (
                <option key={model.id} value={model.id}>
                  {model.id}
                </option>
              ))}
          </select>
          <button
            disabled={!session}
            className={`flex w-full items-center space-x-3 p-3 rounded-lg bg-white/30 hover:bg-white/10 transition-all duration-250 ease-in ${
              !session &&
              "from-gray-300 to-gray-500 border-gray-200 text-gray-300 cursor-not-allowed"
            }`}
            onClick={() => setCurrentModel("text-davinci-003")}
          >
            <span className="text-sm">Smart - Davinci</span>
          </button>
          <button
            disabled={!session}
            className={`flex w-full items-center space-x-3 p-3 rounded-lg bg-white/30 hover:bg-white/10 transition-all duration-250 ease-in ${
              !session &&
              "from-gray-300 to-gray-500 border-gray-200 text-gray-300 cursor-not-allowed"
            }`}
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
                disabled={!session}
                className={`w-full accent-indigo-600 cursor-pointer ${
                  !session &&
                  "from-gray-300 to-gray-500 border-gray-200 text-gray-300 cursor-not-allowed"
                }`}
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
            disabled={!session}
            className={`flex w-full items-center space-x-3 p-3 rounded-lg bg-white/30 hover:bg-white/10 transition-all duration-250 ease-in ${
              !session &&
              "from-gray-300 to-gray-500 border-gray-200 text-gray-300 cursor-not-allowed"
            }`}
            onClick={() => setTemperature("0")}
          >
            <span className="text-sm">0 - Deterministic & Repetitive</span>
          </button>
          <button
            disabled={!session}
            className={`flex w-full items-center space-x-3 p-3 rounded-lg bg-white/30 hover:bg-white/10 transition-all duration-250 ease-in ${
              !session &&
              "from-gray-300 to-gray-500 border-gray-200 text-gray-300 cursor-not-allowed"
            }`}
            onClick={() => setTemperature("0.5")}
          >
            <span className="text-sm">0.5 - Balanced</span>
          </button>
          <button
            disabled={!session}
            className={`flex w-full items-center space-x-3 p-3 rounded-lg bg-white/30 hover:bg-white/10 transition-all duration-250 ease-in ${
              !session &&
              "from-gray-300 to-gray-500 border-gray-200 text-gray-300 cursor-not-allowed"
            }`}
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
        {session && (
          <button
            className="flex w-full items-center space-x-3 p-3 rounded-md hover:bg-white/10"
            onClick={clearChat}
          >
            <TrashIcon className="w-4 h-4" />{" "}
            <span className="text-sm">Clear conversations</span>
          </button>
        )}

        <button
          className="flex w-full items-center space-x-3 p-3 rounded-md hover:bg-white/10"
          onClick={!session ? () => signIn() : () => signOut()}
        >
          <ArrowRightOnRectangleIcon className="w-4 h-4" />{" "}
          {session ? (
            <span className="text-sm">Log out</span>
          ) : (
            <span className="text-sm">Log In</span>
          )}
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;

```

### Setup Google Cloud Console:

Click on Log in and you get an error: Error 400: redirect_uri_mismatch You can't sign in to this app because it doesn't comply with Google's OAuth 2.0 policy. If you're the app developer, register the redirect URI in the Google Cloud Console. Request details: redirect_uri=http://localhost:3000/api/auth/callback/google

Go to https://console.cloud.google.com/ Create new project:chatgpt-clone > Create > Select Project > Dashboard > APIs and services > OAuth consent screen > User Type > External > Create App name:chatgpt, email:email, app Logo Developer contact information: email Save and Continue X 3 > Back to Dashboard

On the Dashboard click: Credentials > Create Credentials > Create OAuth Client ID > Web application NAme: chatgpt-clone Authorised JavaScript origins:http://localhost:3000 Authorised redirect URIs:http://localhost:3000/api/auth/callback/google Create Copy the Google Client ID and Secret and add it into your .env.local file.

#### Update your .env.local file:

```
OPENAI_API_KEY=...
OPENAI_ORG_ID=...
NEXTAUTH_URL=...
JWT_SECRET=...
GOOGLE_ID=...
GOOGLE_SECRET=...
```

Test the Login / Logout. It should work as expected.

## Add Env Variable to Vercel through Terminal:

```
npm install vercel
vercel login
vercel link
Choose your project to be linked to.
vercel add env
Enter the name and value of the variable
```

## Implementing Firebase Admin:

This allows a server to directly write into the firebase database.

## Testing Scenarios:

By default Model:"text-davinci-002" and Temperature:"0.7".
You can select a model of your choice and set the temperature.

Test example: Hi. Can you create a sitemap for a coffee shop website and also create some copy for each page?

### Shopping List:

Test example: I want to cook something with seafood today, can you give me 10 dishes as options?
Can I have a shopping list for the first two options?
What are the cooking steps to make seafood chowder?

### Javascript:

Test example: How do I make an HTTP request in Javascript?

### Tell Short Story:

Test example: Create a short story about a rabbit and cheetah.
Write the story again, but with the moral of the story being about friendship and patience

If an answer is too long ChatGPT stops in between. Just type "continue..." and it should carry on with th answer.

### Text Video Game:

Test example: You are a text video game where you give me options (A,B,C, D) as my choices. The scene is from the Matrix, I start with 100 health.

### Generate Legal and Copyright Templates:

Test example: create a copyright and privacy policy for a website about accounting I can use as a page

As someone who lives in UK, update these to be relevant for the regulations in this area

### Jokes and Humour:

Test examples:
Write a nerdy pun.
Give me another!
Write me a geeky joke.
Tell me a joke about a hat that would never stay on a rabbits head.
Pretend you are elon musk and you have bought twitter. What sort of joke would you say as elon musk?

### Cover Letter and Resumes:

Test examples:
Write a professional cover letter for a fron-end developer position at a company called Client Server for me, Valyn Silva, as someone who knows all the basics required for the job
Based on this cover letter, write a resume which includes list of skills, language etc for this position.

### Summarization an dKeyword Extraction:

The following is from the Privacy Act 1988, simplify it for me in a couple of sentences:
The Privacy Regulation 2013 relates to various provisions of the Privacy Act including:
the definition of various terms relevant to the credit reporting provisions in Part III A of the Privacy Act
permitted disclosures of credit information to a credit reporting body (see s 21D of the Privacy Act)

Pull out the 2 most important keywords fromm the above statement
Explain this Privacy Act like I'm a 6 year old.
Explain it in 20 words or less

### Blogging Articles and Editing:

Provide 10 blog topics for articles about web developement
Give me 5 variations on this topic title: 10 Top Tips for Creating an Engaging Website
Provide the outline of a blog article title: 10 Steps to Building a Captivating Website
Start the introduction for this article that is atleast 3 sentences long.

Rephrase the following sentence: []
Shorten / Lengthen the following sentence: ....
Fix the grammer in the following sentence:...
Translate the sentence into Portuguese.
Translate it back to English.
Create the subject line of the email newsletter based on the above.

### Summarize Text

Summarize this text: [text here]

### Generate Title:

Generate a title for the following: best headphone brands

### Respond to Text:

Respond to this message: [message here]

### Add Emotion:

Please make this sound [emotion]:[text here]

### Turn Text into Blog Post:

Write this in blog post form: [blog title or text here]
Write a three paragraph blog post on: [blog title or text here]

### Summarize Text to Bullet points:

Summarize this text in bullet point form: [text here]

### Compare and Contrast Text or Pros and Cons List:

Compare and contrast the following: [text here]

### Translate Text:

Write the following in [language]: [your text]

### Celebrity or Personality Styles:

Write the following the the style of [Celebrity name]: [text here]

### Create Analogies:

Create an analogy for [specific word or text]

### Create a List:

Please create a list of:[topic here]

### Generate Dialogue:

Write a [length] line dialogue between [subject1] and [subject2]

### Complex Concepts:

Explain the following concepts at a 5th grade level: [complex topic]

### Generate Recipe:

Provide a recipe for the following: [recipe name]
Provide a recipe for the following: [ingredient], [ingredient] and [ingredient]
I have [ingredients name]. What can I make with these?

### Solving Problems:

Solve the following problem: [problem]
Solve the following problem and provide an explaination: [problem]

### Problem Creation:

Generate a scenario of a problem faeturing: [subject matter]

### Create Code or Code Snippets:

Create [what you want the code to be used for] in [language]

### Create Jokes:

Write a joke based on: [joke topic]

### Create Poems:

Write an original poem about: [subject matter]

### Create Music:

Write a [intrument] chord progression in the style [musician name]
Write lyrics for the following beat: [music]

### Create Social Media Posts:

Please provide me [number] tweet ideas that pertain to:[topic]
