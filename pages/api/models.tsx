import type { NextApiRequest, NextApiResponse } from "next";
import openai from "../../utils/constants";

type Data = {
  // models: any;
  modelOptions: Option[];
};

type Option = {
  label: string;
  value: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const response = await openai.listModels();
  const models = response.data.data;
  if (models === undefined) throw new Error("No model engines found");

  const modelOptions = models.map((model) => ({
    label: model.id,
    value: model.id,
  }));

  // res.status(200).json({ models });

  res.status(200).json({ modelOptions });
}
