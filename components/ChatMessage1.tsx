import React from "react";
import bot from "../public/assets/bot.svg";
import user from "../public/assets/user.svg";

type Props = {
  isAi: boolean;
  message: any;
  uniqueId: string | undefined;
};

function ChatMessage({ isAi, message, uniqueId }: Props) {
  return (
    <div className={`wrapper chat-log w-full p-4 ${isAi && "ai bg-[#40414F]"}`}>
      <div
        className={`chat-message ${
          isAi && "bg-white/10"
        }  p-3 w-full max-w-[1280] my-0 mx-auto flex items-center gap-3`}
      >
        <div
          className={`profile avatar w-9 h-9 rounded-md bg-[#5436DA] flex justify-center items-center ${
            isAi && "bg-[#10a37f]"
          }`}
        >
          <img
            className="w-[60%] h-[60%] object-contain"
            src={`${isAi ? bot : user} `}
            alt={`${isAi ? "bot" : "user"}`}
          />
        </div>
        <div
          className="message flex-1 text-[#dcdcdc] text-xl max-w-[100%] whitespace-pre-wrap"
          id={`${uniqueId}`}
        >
          {message}
        </div>
      </div>
    </div>
  );
}

export default ChatMessage;
