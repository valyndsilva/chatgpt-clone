import React, { useContext } from "react";
import {
  ArrowRightOnRectangleIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import { ChatContext } from "../context/ChatContext";
import { signIn, signOut, useSession } from "next-auth/react";
import { ChevronDownIcon } from "@heroicons/react/24/solid";
import Image from "next/image";
import { useRouter } from "next/router";
import {
  addDoc,
  collection,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebaseConfig";
import { useCollection } from "react-firebase-hooks/firestore";
import ChatRow from "./ChatRow";
import ModelSelection from "./ModelSelection";
import useSWR from "swr";

type Props = {};

function Sidebar({}: Props) {
  const {
    temperature,
    setTemperature,
  } = useContext(ChatContext);

  const { data: model, mutate: setModel } = useSWR("model", {
    fallbackData: "text-davinci-003",
  });

  const { data: session } = useSession();
  // console.log(session);
  const router = useRouter();

  // Real-time listener to the chats records
  // const [chats, loading, error] = useCollection(
  //   session && collection(db, "users", session?.user!.email!, "chats"),
  // );
  const [chats, loading] = useCollection(
    session &&
      query(
        collection(db, "users", session?.user!.email!, "chats"),
        orderBy("createdAt", "asc")
      )
  );
  // console.log(chats);

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

  return (
    <aside className="sidemenu w-[10rem] md:w-80 h-screen overflow-y-auto text-white bg-[#202123] text-left flex flex-col justify-between">
      <div>
        {/* New Chat */}
        <div
          className="sidemenu-btn m-2 border border-gray-700 rounded-lg"
          // onClick={clearChat}
          onClick={createNewChat}
        >
          <button
            disabled={!session}
            className={`flex w-full items-center space-x-3 p-3 hover:bg-gray-700/70 transition-all duration-250 ease-in ${
              !session &&
              "from-gray-300 to-gray-500 text-gray-300 cursor-not-allowed"
            }`}
          >
            <PlusIcon className="w-4 h-4" />{" "}
            <span className="text-sm">New chat</span>
          </button>
        </div>

        <div id="accordion">
          {/* Chats History Tab */}
          <div className="rounded-none border border-t-0 border-l-0 border-r-0 border-gray-700">
            <h2 className="mb-0" id="flush-headingOne">
              <button
                className="group relative flex w-full items-center rounded-none border-0  py-4 px-5 text-left text-base transition [overflow-anchor:none] hover:z-[2] focus:z-[3] focus:outline-none text-white [&:not([data-te-collapse-collapsed])]:bg-[#202123]  [&:not([data-te-collapse-collapsed])]:text-white [&:not([data-te-collapse-collapsed])]:[box-shadow:inset_0_-1px_0_rgba(75,85,99)]"
                type="button"
                data-te-collapse-init
                data-te-target="#flush-collapseOne"
                aria-expanded="false"
                aria-controls="flush-collapseOne"
              >
                Chats History
                <span className="ml-auto -mr-1 h-5 w-5 shrink-0 rotate-[-180deg] fill-[#336dec] transition-transform duration-200 ease-in-out group-[[data-te-collapse-collapsed]]:mr-0 group-[[data-te-collapse-collapsed]]:rotate-0 group-[[data-te-collapse-collapsed]]:fill-[#212529] motion-reduce:transition-none dark:fill-blue-300 dark:group-[[data-te-collapse-collapsed]]:fill-white">
                  <ChevronDownIcon className="w-6 h-6" />
                </span>
              </button>
            </h2>
            <div
              id="flush-collapseOne"
              className="!visible border-0"
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
          {/* Model Tab */}
          <div className="rounded-none border border-l-0 border-r-0 border-t-0 border-gray-700">
            <h2 className="mb-0" id="flush-headingTwo">
              <button
                className="group relative flex w-full items-center rounded-none border-0  py-4 px-5 text-left text-base transition [overflow-anchor:none] hover:z-[2] focus:z-[3] focus:outline-none text-white [&:not([data-te-collapse-collapsed])]:bg-[#202123]  [&:not([data-te-collapse-collapsed])]:text-white [&:not([data-te-collapse-collapsed])]:[box-shadow:inset_0_-1px_0_rgba(75,85,99)]"
                type="button"
                data-te-collapse-init
                data-te-collapse-collapsed
                data-te-target="#flush-collapseTwo"
                aria-expanded="false"
                aria-controls="flush-collapseTwo"
              >
                Model
                <span className="ml-auto -mr-1 h-5 w-5 shrink-0 rotate-[-180deg] fill-[#336dec] transition-transform duration-200 ease-in-out group-[[data-te-collapse-collapsed]]:mr-0 group-[[data-te-collapse-collapsed]]:rotate-0 group-[[data-te-collapse-collapsed]]:fill-[#212529] motion-reduce:transition-none dark:fill-blue-300 dark:group-[[data-te-collapse-collapsed]]:fill-white">
                  <ChevronDownIcon className="w-6 h-6" />
                </span>
              </button>
            </h2>
            <div
              id="flush-collapseTwo"
              className="!visible hidden border-0"
              data-te-collapse-item
              aria-labelledby="flush-headingTwo"
              data-te-parent="#accordionFlushExample"
            >
              <div className="py-3 px-2">
                {/* Select a Model */}
                <div className="models m-2 space-y-2">
                  <p className="text-xs px-1 pb-2">
                    The model parameter controls the engine used to generate the
                    response. Davinci produces the best results.
                  </p>
                  <ModelSelection />
                  <button
                    disabled={!session}
                    className={`flex w-full items-center space-x-3 p-3 rounded-lg bg-white/30 hover:bg-white/10 transition-all duration-250 ease-in ${
                      !session &&
                      "from-gray-300 to-gray-500 border-gray-200 text-gray-300 cursor-not-allowed"
                    }`}
                    onClick={() => setModel("text-davinci-003")}
                  >
                    <span className="text-sm">Smart - Davinci</span>
                  </button>
                  <button
                    disabled={!session}
                    className={`flex w-full items-center space-x-3 p-3 rounded-lg bg-white/30 hover:bg-white/10 transition-all duration-250 ease-in ${
                      !session &&
                      "from-gray-300 to-gray-500 border-gray-200 text-gray-300 cursor-not-allowed"
                    }`}
                    onClick={() => setModel("code-cushman-001")}
                  >
                    <span className="text-sm">Code - Cushman</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
          {/* Temperature Tab */}
          <div className="rounded-none border border-l-0 border-r-0 border-t-0 border-gray-700">
            <h2 className="mb-0" id="flush-headingThree">
              <button
                className="group relative flex w-full items-center rounded-none border-0  py-4 px-5 text-left text-base transition [overflow-anchor:none] hover:z-[2] focus:z-[3] focus:outline-none text-white [&:not([data-te-collapse-collapsed])]:bg-[#202123]  [&:not([data-te-collapse-collapsed])]:text-white [&:not([data-te-collapse-collapsed])]:[box-shadow:inset_0_-1px_0_rgba(75,85,99)]"
                type="button"
                data-te-collapse-init
                data-te-collapse-collapsed
                data-te-target="#flush-collapseThree"
                aria-expanded="false"
                aria-controls="flush-collapseThree"
              >
                Temperature
                <span className="ml-auto -mr-1 h-5 w-5 shrink-0 rotate-[-180deg] fill-[#336dec] transition-transform duration-200 ease-in-out group-[[data-te-collapse-collapsed]]:mr-0 group-[[data-te-collapse-collapsed]]:rotate-0 group-[[data-te-collapse-collapsed]]:fill-[#212529] motion-reduce:transition-none dark:fill-blue-300 dark:group-[[data-te-collapse-collapsed]]:fill-white">
                  <ChevronDownIcon className="w-6 h-6" />
                </span>
              </button>
            </h2>
            <div
              id="flush-collapseThree"
              className="!visible hidden border-0"
              data-te-collapse-item
              aria-labelledby="flush-headingThree"
              data-te-parent="#accordionFlushExample"
            >
              <div className="py-3 px-2">
                {/* Select Temperature Parameter */}
                <div className="temperature m-2 space-y-2">
                  <p className="text-xs px-1 pb-2">
                    The temperature parameter controls the randomness of the
                    model. 0 is the most deterministic, 1 is the most creative.
                  </p>
                  <div className="flex w-full items-center justify-between">
                    <div className="rounded-lg shadow-lg max-w-[300px]">
                      <div className="py-2 px-4">
                        <input
                          disabled={!session}
                          className={`w-full accent-indigo-600 cursor-pointer ${
                            !session &&
                            "from-gray-300 to-gray-500 border-gray-200 text-gray-300 cursor-not-allowed"
                          }`}
                          type="range"
                          name="temperature"
                          value={temperature}
                          min="0.1"
                          max="1"
                          onChange={(e) => setTemperature(e.target.value)}
                          step="0.1"
                        />
                        <div className="-mt-2 flex w-full justify-between">
                          <span className="text-sm text-gray-600">0</span>
                          <span className="text-sm text-gray-600">1</span>
                        </div>
                      </div>
                    </div>
                    <span className="text-sm p-3 border border-gray-700 rounded-lg">
                      {temperature}
                    </span>
                  </div>
                  <button
                    disabled={!session}
                    className={`flex w-full items-center space-x-3 p-3 rounded-lg bg-white/30 hover:bg-white/10 transition-all duration-250 ease-in ${
                      !session &&
                      "from-gray-300 to-gray-500 border-gray-200 text-gray-300 cursor-not-allowed"
                    }`}
                    onClick={() => setTemperature("0")}
                  >
                    <span className="text-sm">
                      0 - Deterministic & Repetitive
                    </span>
                  </button>
                  <button
                    disabled={!session}
                    className={`flex w-full items-center space-x-3 p-3 rounded-lg bg-white/30 hover:bg-white/10 transition-all duration-250 ease-in ${
                      !session &&
                      "from-gray-300 to-gray-500 border-gray-200 text-gray-300 cursor-not-allowed"
                    }`}
                    onClick={() => setTemperature("0.5")}
                  >
                    <span className="text-sm">0.5 - Balanced</span>
                  </button>
                  <button
                    disabled={!session}
                    className={`flex w-full items-center space-x-3 p-3 rounded-lg bg-white/30 hover:bg-white/10 transition-all duration-250 ease-in ${
                      !session &&
                      "from-gray-300 to-gray-500 border-gray-200 text-gray-300 cursor-not-allowed"
                    }`}
                    onClick={() => setTemperature("1")}
                  >
                    <span className="text-sm">1 - Creative</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="sidemenu-btn m-2  border-t border-gray-700 py-2">
        <button
          className="w-full border border-gray-600 rounded-lg flex flex-1 items-center space-x-3 p-3 hover:bg-white/10"
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
            <ArrowRightOnRectangleIcon className="w-6 h-6 "/> <span className="text-sm">Log In</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
