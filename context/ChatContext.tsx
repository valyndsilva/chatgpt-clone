import React, { createContext, ReactNode, useEffect, useState } from "react";
// import uuid from "uuid";
import { v4 } from "uuid";
interface ChatProviderProps {
  children: ReactNode;
}

interface Chat {
  input: string;
  setInput: (input: string) => void;
  chatLog: ChatLog[];
  setChatLog: (chatLog: any) => void;
  models: Model[];
  setModels: any;
  currentModel: string;
  setCurrentModel: (currentModel: string) => void;
  temperature: string;
  setTemperature: (temperature: string) => void;
  uniqueId: any;
  setUniqueId: (uniqueId: any) => void;
  // generateUniqueId: (isAi?: boolean) => string;
}

export const ChatContext = createContext<Chat>({} as Chat);

export function ChatProvider({ children }: ChatProviderProps) {
  const [models, setModels] = useState([]);
  const [currentModel, setCurrentModel] = useState("text-davinci-002");
  const [input, setInput] = useState("");
  const [temperature, setTemperature] = useState("0.7");
  const [uniqueId, setUniqueId] = useState("");
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
  // const [chatLog, setChatLog] = useState([
  //   {
  //     user: "gpt",
  //     message: "How can I help you today?",
  //   },
  // ]);
  const [chatLog, setChatLog] = useState([]);
 

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
        uniqueId,
        setUniqueId,
        // generateUniqueId,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export default ChatProvider;
