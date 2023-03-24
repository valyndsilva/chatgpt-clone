import React, { createContext, ReactNode, useEffect, useState } from "react";
// import uuid from "uuid";
import { v4 } from "uuid";
interface ChatProviderProps {
  children: ReactNode;
}

interface Chat {
  prompt: string;
  setPrompt: (input: string) => void;
  
  temperature: string;
  setTemperature: (temperature: string) => void;
}

export const ChatContext = createContext<Chat>({} as Chat);

export function ChatProvider({ children }: ChatProviderProps) {
  const [prompt, setPrompt] = useState("");
  const [temperature, setTemperature] = useState("0.7");


  return (
    <ChatContext.Provider
      value={{
        prompt,
        setPrompt,
        temperature,
        setTemperature,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export default ChatProvider;
