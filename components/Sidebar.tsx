import React, { useContext, useEffect } from "react";
import {
  ArrowRightOnRectangleIcon,
  PlusIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { ChatContext } from "../context/ChatContext";
import { signIn, signOut } from "next-auth/react";
import { Session } from "next-auth";
type Props = {
  session: Session;
};

function Sidebar({ session }: Props) {
  const {
    setChatLog,
    models,
    setModels,
    currentModel,
    setCurrentModel,
    temperature,
    setTemperature,
  } = useContext(ChatContext);

  const clearChat = () => {
    setChatLog([]);
    localStorage.clear();
  };
  const getEngines = async () => {
    const response = await fetch("/api/models");
    const data = await response.json();
    // console.log(data.models);
    setModels(data.models);
  };
  // Run once on app load
  useEffect(() => {
    getEngines();
  }, []);

  // const { data: session } = useSession();
  // console.log(session);
  return (
    <aside className="sidemenu w-80 text-white bg-[#202123] text-left flex flex-col justify-between">
      <div>
        {/* New Chat */}
        <div
          className="sidemenu-btn m-2 border border-gray-700 rounded-lg"
          onClick={clearChat}
        >
          <button
            disabled={!session}
            className={`flex w-full items-center space-x-3 p-3 hover:bg-white/10 transition-all duration-250 ease-in ${
              !session &&
              "from-gray-300 to-gray-500 text-gray-300 cursor-not-allowed"
            }`}
          >
            <PlusIcon className="w-4 h-4" />{" "}
            <span className="text-sm">New chat</span>
          </button>
        </div>
        {/* Select a Model */}
        <div className="models m-2 space-y-2">
          <h4 className="p-1 text-md">Model</h4>
          <select
            disabled={!session}
            onChange={(e) => setCurrentModel(e.target.value)}
            value={currentModel}
            className={`w-full p-3 m-0 text-sm text-white bg-[#202123] border border-gray-700 rounded-lg transition ease-in-out focus:text-white focus:bg-[#202123] focus:border focus:outline-none ${
              !session &&
              "from-gray-300 to-gray-500 text-gray-300 cursor-not-allowed"
            }`}
          >
            {models &&
              models?.map((model) => (
                <option key={model.id} value={model.id}>
                  {model.id}
                </option>
              ))}
          </select>
          <button
            disabled={!session}
            className={`flex w-full items-center space-x-3 p-3 rounded-lg bg-white/30 hover:bg-white/10 transition-all duration-250 ease-in ${
              !session &&
              "from-gray-300 to-gray-500 border-gray-200 text-gray-300 cursor-not-allowed"
            }`}
            onClick={() => setCurrentModel("text-davinci-003")}
          >
            <span className="text-sm">Smart - Davinci</span>
          </button>
          <button
            disabled={!session}
            className={`flex w-full items-center space-x-3 p-3 rounded-lg bg-white/30 hover:bg-white/10 transition-all duration-250 ease-in ${
              !session &&
              "from-gray-300 to-gray-500 border-gray-200 text-gray-300 cursor-not-allowed"
            }`}
            onClick={() => setCurrentModel("code-cushman-001")}
          >
            <span className="text-sm">Code - Cushman</span>
          </button>
          <p className="text-xs p-1">
            The model parameter controls the engine used to generate the
            response. Davinci produces the best results.
          </p>
        </div>
        {/* Select Temperature Parameter */}
        <div className="temperature m-2 space-y-2">
          <div className="flex w-full items-center justify-between">
            <h4 className="p-1 text-md">Temperature</h4>{" "}
            <span className="text-sm p-3 border border-gray-700 rounded-lg">
              {temperature}
            </span>
          </div>
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
          <button
            disabled={!session}
            className={`flex w-full items-center space-x-3 p-3 rounded-lg bg-white/30 hover:bg-white/10 transition-all duration-250 ease-in ${
              !session &&
              "from-gray-300 to-gray-500 border-gray-200 text-gray-300 cursor-not-allowed"
            }`}
            onClick={() => setTemperature("0")}
          >
            <span className="text-sm">0 - Deterministic & Repetitive</span>
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
          <p className="text-xs p-1">
            The temperature parameter controls the randomness of the model. 0 is
            the most deterministic, 1 is the most creative.
          </p>
        </div>
      </div>
      <div className="sidemenu-btn m-2  border-t py-2">
        {session && (
          <button
            className="flex w-full items-center space-x-3 p-3 rounded-md hover:bg-white/10"
            onClick={clearChat}
          >
            <TrashIcon className="w-4 h-4" />{" "}
            <span className="text-sm">Clear conversations</span>
          </button>
        )}

        <button
          className="flex w-full items-center space-x-3 p-3 rounded-md hover:bg-white/10"
          onClick={!session ? () => signIn() : () => signOut()}
        >
          <ArrowRightOnRectangleIcon className="w-4 h-4" />{" "}
          {session ? (
            <span className="text-sm">Log out</span>
          ) : (
            <span className="text-sm">Log In</span>
          )}
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
