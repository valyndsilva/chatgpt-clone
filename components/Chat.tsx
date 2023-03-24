import { ArrowDownCircleIcon } from "@heroicons/react/24/outline";
import { collection, orderBy, query } from "firebase/firestore";
import { useSession } from "next-auth/react";
import React, { useEffect, useRef } from "react";
import { useCollection } from "react-firebase-hooks/firestore";
import { db } from "../firebaseConfig";
import Message from "./Message";

type Props = {
  chatId: any;
};

export default function Chat({ chatId }: Props) {
  const { data: session } = useSession();
  const userEmail = session?.user!.email!;
  const [messages] = useCollection(
    session &&
      query(
        collection(db, "users", userEmail, "chats", chatId, "messages"),
        orderBy("createdAt", "asc")
      )
  );

  const messagesEndRef = useRef<any>();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto oerflow-x-hidden">
      {messages?.empty && (
        <>
          <p className="mt-10 text-center text-white">
            Ask ChatGPT a question below to get started!
          </p>
          <ArrowDownCircleIcon className="h-10 w-10 mx-auto mt-5 text-white animate-bounce" />
        </>
      )}
      {messages?.docs.map((message) => (
        <Message key={message.id} message={message.data()} />
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
}
