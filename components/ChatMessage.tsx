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
        <div className="message flex-1 text-[#dcdcdc] text-xl max-w-[100%] whitespace-pre-wrap">
          {message.message}
        </div>
      </div>
    </div>
  );
}

export default ChatMessage;
