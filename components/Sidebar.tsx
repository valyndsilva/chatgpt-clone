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
