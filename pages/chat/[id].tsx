
import { useRouter } from "next/router";
import React from "react";
import { Chat, ChatInput } from "../../components";
type Props = {};

export default function ChatID({}: Props) {
  const router = useRouter();
  const { id } = router.query;
  // console.log(id);

  return (
    <div className="flex flex-col h-screen overflow-hidden flex-1">
      <Chat chatId={id}/>
      <ChatInput chatId={id}/>
    </div>
  );
}
