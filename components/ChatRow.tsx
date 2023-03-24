import { ChatBubbleLeftIcon, TrashIcon } from "@heroicons/react/24/outline";
import { collection, deleteDoc, doc } from "firebase/firestore";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useCollection } from "react-firebase-hooks/firestore";
import { db } from "../firebaseConfig";

type Props = {
  id: string;
};

export default function ChatRow({ id }: Props) {
  //   console.log(id);
  const router = useRouter();
  const pathname = usePathname();
  //   console.log(pathname);
  const { data: session } = useSession();
  const [active, setActive] = useState(false);
  //   console.log(active);

  const [messages] = useCollection(
    collection(db, "users", session?.user!.email!, "chats", id, "messages")
  );

  useEffect(() => {
    if (!pathname) return;
    setActive(pathname.includes(id));
  }, [pathname]);

  const removeChat = async () => {
    await deleteDoc(doc(db, "users", session?.user!.email!, "chats", id));
    router.replace("/");
  };
  return (
    <Link
      href={`/chat/${id}`}
      className={`flex items-center justify-between space-x-3 p-3 rounded-md hover:bg-gray-700/70 transition-all duration-250 ease-in 
      ${active && "bg-gray-700/50"}`}
    >
      <div className="flex space-x-4 w-72 md:w-60">
        <ChatBubbleLeftIcon className="h-6 w-6 text-white" />
        <p className="flex-1 truncate text-white">
          {messages?.docs[messages?.docs.length - 1]?.data().text || "New Chat"}
        </p>
      </div>
      <TrashIcon
        onClick={removeChat}
        className="h-6 w-6 text-gray-300 hover:text-red-700"
      />
    </Link>
  );
}
