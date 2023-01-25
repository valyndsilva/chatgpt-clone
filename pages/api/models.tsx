import type { NextApiRequest, NextApiResponse } from "next";
import { configuration } from "../../utils/constants";
import { OpenAIApi } from "openai";

type Data = {
  models: any;
};

const openai = new OpenAIApi(configuration);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const response = await openai.listEngines();
  //   console.log({ response });
  //   console.log(response.data.data);

  if (response === undefined) throw new Error("No engines found");

  res.status(200).json({ models: response.data.data });
}
