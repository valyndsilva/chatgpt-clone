import React, { useContext, useEffect, useState } from "react";
import { ChatContext } from "../context/ChatContext";

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
