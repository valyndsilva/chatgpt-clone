import type { NextApiRequest, NextApiResponse } from "next";
import { configuration } from "../../utils/constants";
import { OpenAIApi } from "openai";

type Data = {
  suggestion: string;
};

const openai = new OpenAIApi(configuration);
// const response = await openai.listEngines();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const { message } = req.body;
  // console.log("message:", message);

  const response = await openai.createCompletion({
    model: "text-davinci-003",
    prompt: `${message}`,
    // prompt: `I'm ok.`,
    temperature: 0.7,
    max_tokens: 256,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
  });
  const suggestion = response.data?.choices?.[0].text;
  // console.log(suggestion);

  if (suggestion === undefined) throw new Error("No suggestion found");

  // res.status(200).json({ suggestion: suggestion });
  res.status(200).json({ suggestion });
}
