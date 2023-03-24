import React, { useContext } from "react";
import {
  ArrowRightOnRectangleIcon,
  BoltIcon,
  ChevronDownIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  SunIcon,
} from "@heroicons/react/24/outline";
import { ChatContext } from "../context/ChatContext";
import { useRouter } from "next/navigation";
import {
  addDoc,
  collection,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebaseConfig";
import { signIn, signOut, useSession } from "next-auth/react";
import Image from "next/image";
import ChatRow from "./ChatRow";
import { useCollection } from "react-firebase-hooks/firestore";
type Props = {};

function Intro({}: Props) {
  const { setPrompt } = useContext(ChatContext);
  const router = useRouter();
  const { data: session } = useSession();

  const createNewChat = async () => {
    const doc = await addDoc(
      collection(db, "users", session?.user!.email!, "chats"),
      {
        userId: session?.user!.email!,
        userName: session?.user!.name!,
        createdAt: serverTimestamp(),
      }
    );
    router.push(`/chat/${doc.id}`);
  };

  const onExampleClick = (exampleQuestion: string) => {
    setPrompt(exampleQuestion);
    createNewChat();
  };

  const [chats, loading, error] = useCollection(
    session &&
      query(
        collection(db, "users", session?.user!.email!, "chats"),
        orderBy("createdAt", "asc")
      )
  );

  return (
    <div className="flex flex-col items-center justify-center h-2/3 md:h-full">
      <h1 className="text-2xl">ChatGPT</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 m-5">
        <div className="col-span-1 text-center space-y-4">
          <div className=" items-center justify-center flex flex-col">
            <SunIcon className="w-5 h-5" />
            <h2>Examples</h2>
          </div>
          <p
            className="bg-gray-700/50 rounded-md p-2 cursor-pointer hover:bg-gray-700"
            onClick={() =>
              onExampleClick("Explain quantum computing in simple terms")
            }
          >
            "Explain quantum computing in simple terms"
          </p>
          <p
            className="bg-gray-700/50 rounded-md p-2 cursor-pointer hover:bg-gray-700"
            onClick={() =>
              setPrompt("Got any creative ideas for a 10 year old's birthday?")
            }
          >
            "Got any creative ideas for a 10 year old's birthday?"
          </p>
          <p
            className="bg-gray-700/50 rounded-md p-2 cursor-pointer hover:bg-gray-700"
            onClick={() =>
              setPrompt("How do I make a HTTP request in Javascript?")
            }
          >
            "How do I make a HTTP request in Javascript?"
          </p>
        </div>
        <div className="hidden md:grid col-span-1 text-center  space-y-4">
          <div className=" items-center justify-center flex flex-col">
            <BoltIcon className="w-5 h-5" />
            <h2>Capabilities</h2>
          </div>
          <p className="bg-gray-700/50 rounded-md p-2">
            Remembers what user said earlier in the conversation
          </p>
          <p className="bg-gray-700/50 rounded-md p-2">
            Allows user to provide follow-up corrections
          </p>
          <p className="bg-gray-700/50 rounded-md p-2">
            Trained to decline inappropriate requests
          </p>
        </div>
        <div className="hidden md:grid col-span-1 text-center  space-y-4">
          <div className=" items-center justify-center flex flex-col">
            <ExclamationTriangleIcon className="w-5 h-5" />
            <h2>Limitations</h2>
          </div>
          <p className="bg-gray-700/50 rounded-md p-2">
            May occasionally generate incorrect information
          </p>
          <p className="bg-gray-700/50 rounded-md p-2">
            May occasionally produce harmful instructions or biased content
          </p>
          <p className="bg-gray-700/50 rounded-md p-2">
            Limited knowledge of world and events after 2021
          </p>
        </div>
      </div>
      <div className="w-full fixed bottom-0">
        {/* Chats History */}
        <div className="md:hidden w-full border-t border-gray-700">
          {/* Accordion */}
          <div id="accordion">
            {/* Chats History Tab */}
            <div className="rounded-none border border-t-0 border-l-0 border-r-0 border-gray-700">
              <h2 className="mb-0" id="flush-headingOne">
                <button
                  className="group relative flex w-full items-center rounded-none border-0  py-4 px-5 text-left text-base transition [overflow-anchor:none] hover:z-[2] focus:z-[3] focus:outline-none text-white  [&:not([data-te-collapse-collapsed])]:text-white [&:not([data-te-collapse-collapsed])]:[box-shadow:inset_0_-1px_0_rgba(75,85,99)]"
                  type="button"
                  data-te-collapse-init
                  data-te-target="#flush-collapseOne"
                  aria-expanded="false"
                  aria-controls="flush-collapseOne"
                >
                  Chats History
                  <span className="ml-auto -mr-1 h-5 w-5  shrink-0 rotate-[-180deg] fill-[#336dec] transition-transform duration-200 ease-in-out group-[[data-te-collapse-collapsed]]:mr-0 group-[[data-te-collapse-collapsed]]:rotate-0 group-[[data-te-collapse-collapsed]]:fill-[#212529] motion-reduce:transition-none dark:fill-blue-300 dark:group-[[data-te-collapse-collapsed]]:fill-white">
                    <ChevronDownIcon className="w-6 h-6" />
                  </span>
                </button>
              </h2>
              <div
                id="flush-collapseOne"
                className="!visible border-0 bg-[#212529]"
                data-te-collapse-item
                data-te-collapse-show
                aria-labelledby="flush-headingOne"
                data-te-parent="#accordionFlushExample"
              >
                <div className="py-4 px-3">
                  {chats?.empty && (
                    <>
                      <p className="text-center text-white">
                        No chats available.
                      </p>
                    </>
                  )}
                  {loading && (
                    <div className="animate-pulse text-center text-white">
                      <p>Loading Chats...</p>
                    </div>
                  )}
                  {chats?.docs.map((chat) => (
                    <ChatRow key={chat.id} id={chat.id} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* New Chats and Login Buttons */}
        <div className="md:hidden w-full border-t border-gray-700">
          <div className="flex text-white m-2 flex-1">
            <button
              onClick={createNewChat}
              disabled={!session}
              className={`w-1/2 m-2 border border-gray-600 rounded-lg flex items-center space-x-3 p-3 hover:bg-gray-700/70 transition-all duration-250 ease-in ${
                !session &&
                "from-gray-300 to-gray-500 text-gray-300 cursor-not-allowed"
              }`}
            >
              <PlusIcon className="w-4 h-4" />{" "}
              <span className="text-sm">New chat</span>
            </button>

            <button
              className="w-1/2 m-2 border border-gray-600 rounded-lg flex flex-1 items-center space-x-3 p-3 hover:bg-white/10"
              onClick={!session ? () => signIn() : () => signOut()}
            >
              {session ? (
                <div className="flex items-center space-x-4">
                  <Image
                    src={session.user?.image!}
                    alt={session.user?.name!}
                    width={32}
                    height={32}
                    className="h-8 w-8 rounded-full cursor-pointer mx-auto"
                  />
                  <span className="text-sm">Log out</span>{" "}
                </div>
              ) : (
                <>
                  <span className="text-sm">Log In</span>
                  <ArrowRightOnRectangleIcon className="w-4 h-4" />{" "}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Intro;
