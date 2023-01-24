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
