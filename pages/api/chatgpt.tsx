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
  const { message, currentModel, temperature } = req.body;
  // console.log("message:", message);
  // console.log("currentModel:", currentModel);

  const response = await openai.createCompletion({
    // model: "text-davinci-003",
    model: `${currentModel}`,
    // prompt: `I'm ok.`,
    prompt: `${message}`,
    // temperature: 0.7,
    temperature: Number(`${temperature}`), // Higher values means the model will take more risks.
    max_tokens: 256, // The maximum number of tokens to generate in the completion. Most models have a context length of 2048 tokens (except for the newest models, which support 4096).
    top_p: 1, // alternative to sampling with temperature, called nucleus sampling
    frequency_penalty: 0, // Number between -2.0 and 2.0. Positive values penalize new tokens based on their existing frequency in the text so far, decreasing the model's likelihood to repeat the same line verbatim.
    presence_penalty: 0, // Number between -2.0 and 2.0. Positive values penalize new tokens based on whether they appear in the text so far, increasing the model's likelihood to talk about new topics.
  });
  const suggestion: any = response.data?.choices?.[0].text;
  // console.log(suggestion);
  if (suggestion === undefined) throw new Error("No suggestion found");

  // res.status(200).json({ suggestion: suggestion });
  res.status(200).json({ suggestion });
}
