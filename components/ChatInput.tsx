import { ChevronDownIcon, PaperAirplaneIcon } from "@heroicons/react/24/solid";
import {
  addDoc,
  collection,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";
import { signIn, signOut, useSession } from "next-auth/react";
import React, { useContext, useRef } from "react";
import { toast } from "react-hot-toast";
import { ChatContext } from "../context/ChatContext";
import { db } from "../firebaseConfig";
import useSWR from "swr";
import ModelSelection from "./ModelSelection";
import { useCollection } from "react-firebase-hooks/firestore";
import ChatRow from "./ChatRow";
import { PlusIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import { useRouter } from "next/navigation";

type Props = {
  chatId: any;
};

export default function ChatInput({ chatId }: Props) {
  // console.log({chatId});
  const { data: session } = useSession();
  const userEmail = session?.user?.email!;
  // console.log({ userEmail });
  // const [prompt, setPrompt] = useState<string>("");
  const { prompt, setPrompt, temperature, setTemperature } =
    useContext(ChatContext);

  const { data: model, mutate: setModel } = useSWR("model", {
    fallbackData: "text-davinci-003",
  });

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    console.log("handleSubmit triggered!");
    if (!prompt) return;
    const input = prompt.trim(); // remove whitespace at the end of the prompt.
    setPrompt("");

    const message: Message = {
      text: input,
      createdAt: serverTimestamp(),
      user: {
        _id: session?.user?.email!,
        name: session?.user?.name!,
        avatar:
          session?.user?.image ||
          `https://ui-avatars.com/api/?name=${session?.user?.name}`,
      },
    };

    // console.log(message);

    // Adding to firebase db first from the client sideconst query
    await addDoc(
      collection(db, "users", userEmail, "chats", chatId, "messages"),
      message
    );

    //Toast notification loading...
    const notification = toast.loading("ChatGPT is thinking...");

    await fetch("/api/chatgpt", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: input,
        chatId,
        model,
        temperature,
        session,
      }),
    }).then(() => {
      //Toast notification successful!
      toast.success("ChatGPT has responded!", { id: notification });
    });
  };

  const formRef = useRef<any>();

  // Real-time listener to the chats records
  // const [chats, loading, error] = useCollection(
  //   session && collection(db, "users", session?.user!.email!, "chats"),
  // );
  const [chats, loading, error] = useCollection(
    session &&
      query(
        collection(db, "users", session?.user!.email!, "chats"),
        orderBy("createdAt", "asc")
      )
  );
  // console.log(chats);

  const router = useRouter();
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
    <>
      <form
        ref={formRef}
        className="flex space-x-5 p-5 bg-[#40414F] items-center"
        onSubmit={handleSubmit}
      >
        <input
          disabled={!session}
          className={`flex-1 text-white text-lg p-3 bg-transparent rounded-md border-none outline-none resize-none ${
            !session &&
            "from-gray-300 to-gray-500 text-gray-300 cursor-not-allowed"
          }`}
          name="prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder={`${
            !session ? "Sign in to use ChatGPT" : "Ask ChatGPT anything..."
          }`}
        ></input>
        <button
          disabled={!session || !prompt}
          onClick={handleSubmit}
          type="submit"
          className="cursor-pointer bg-[#11A37F] hover:opacity-50 text-white font-bold px-4 py-2 rounded mr-5 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          <PaperAirplaneIcon className="w-6 h-6 " />
        </button>
      </form>
      <div className="md:hidden">
        {/* Accordion */}
        <div id="accordion">
          {/* Chats History Tab */}
          <div className="rounded-none border border-t-0 border-l-0 border-r-0 border-gray-700 bg-[#212529]">
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
          {/* Model Tab */}
          <div className="rounded-none border border-l-0 border-r-0 border-t-0 border-gray-700 bg-[#212529]">
            <h2 className="mb-0" id="flush-headingTwo">
              <button
                className="group relative flex w-full items-center rounded-none border-0  py-4 px-5 text-left text-base transition [overflow-anchor:none] hover:z-[2] focus:z-[3] focus:outline-none text-white  [&:not([data-te-collapse-collapsed])]:text-white [&:not([data-te-collapse-collapsed])]:[box-shadow:inset_0_-1px_0_rgba(75,85,99)]"
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
              className="!visible hidden border-0 bg-[#212529]"
              data-te-collapse-item
              aria-labelledby="flush-headingTwo"
              data-te-parent="#accordionFlushExample"
            >
              <div className="py-3 px-2">
                {/* Select a Model */}
                <div className="models m-2 space-y-2">
                  <p className="text-xs px-1 pb-2 text-gray-300">
                    The model parameter controls the engine used to generate the
                    response. Davinci produces the best results.
                  </p>
                  <ModelSelection />
                </div>
              </div>
            </div>
          </div>
          {/* Temperature Tab */}
          <div className="rounded-none border border-l-0 border-r-0 border-t-0 border-gray-700 bg-[#212529]">
            <h2 className="mb-0" id="flush-headingThree">
              <button
                className="group relative flex w-full items-center rounded-none border-0  py-4 px-5 text-left text-base transition [overflow-anchor:none] hover:z-[2] focus:z-[3] focus:outline-none text-white [&:not([data-te-collapse-collapsed])]:text-white [&:not([data-te-collapse-collapsed])]:[box-shadow:inset_0_-1px_0_rgba(75,85,99)]"
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
              className="!visible hidden border-0 bg-[#212529]"
              data-te-collapse-item
              aria-labelledby="flush-headingThree"
              data-te-parent="#accordionFlushExample"
            >
              <div className="py-3 px-2">
                {/* Select Temperature Parameter */}
                <div className="temperature m-2 space-y-2">
                  <p className="text-xs px-1 pb-2 text-gray-300">
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
                          <span className="text-sm text-white">0</span>
                          <span className="text-sm text-white">1</span>
                        </div>
                      </div>
                    </div>
                    <span className="text-sm p-3 border text-white border-gray-600 rounded-lg">
                      {temperature}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="md:hidden w-full border-t border-gray-700 bg-[#212529]">
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
              </>
            )}
          </button>
        </div>
      </div>
    </>
  );
}
