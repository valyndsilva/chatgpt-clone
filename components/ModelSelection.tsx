import useSWR from "swr";
import React from "react";
import Select from "react-select";
import { useSession } from "next-auth/react";

type Props = {};
const fetchModels = () => fetch(`/api/models`).then((res) => res.json());
export default function ModelSelection({}: Props) {
  const { data: models, isLoading } = useSWR("models", fetchModels);
  const { data: model, mutate: setModel } = useSWR("model", {
    fallbackData: "text-davinci-003",
  });
  const { data: session } = useSession();
  return (
    <div>
      <Select
        isDisabled={!session}
        options={models?.modelOptions}
        defaultValue={model}
        placeholder={model}
        className={`mt-2 text-[#434654] ${
          !session &&
          "from-gray-300 to-gray-500 border-gray-200 text-gray-300 cursor-not-allowed"
        }`}
        isSearchable
        isLoading={isLoading}
        menuPosition="fixed"
        classNames={{
          control: (state) => "bg-[#434654] border-[#434654]",
        }}
        onChange={(e) => setModel(e.value)}
      />
    </div>
  );
}
