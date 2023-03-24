import type { NextApiRequest, NextApiResponse } from "next";
// import  openai from "../../utils/constants";
import { OpenAIApi } from "openai";
import query from "../../utils/queryApi";
import admin from "firebase-admin";
import { adminDb } from "../../firebaseAdmin";
import { addDoc, collection } from "firebase/firestore";
type Data = {
  suggestion: string;
};

// const response = await openai.listEngines();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  // const { message, currentModel, temperature } = req.body;
  // console.log("message:", message);
  // console.log("currentModel:", currentModel);

  /////
  const { prompt, chatId, model, temperature, session } = req.body;
  // console.log("prompt:", prompt);
  // console.log("chatId:", chatId);
  // console.log("model:", model);
  // console.log("temperature:", temperature);
  // console.log("session:", session);
  const userEmail = session?.user?.email!;
  // console.log("userEmail:", userEmail);
  if (!prompt)
    return res.status(400).json({ suggestion: "Please enter a prompt" });

  if (!chatId)
    return res.status(400).json({ suggestion: "Please enter a valid chatId!" });

  // ChatGPT Query
  const response = await query(prompt, chatId, model, temperature);
  console.log({ response });
  // Need access to firebase Admin to add doc to messages collection from server end. Create firebaseAdmin.ts
  const message: Message = {
    text: response || "ChatGPT was unable to find an answer for that prompt",
    createdAt: admin.firestore.Timestamp.now(),
    user: {
      _id: "ChatGPT",
      name: "ChatGPT",
      avatar: "/assets/chatgpt-logo.png",
    },
  };
  // Add from backend i.e admin into firestore db.
  await adminDb
    .collection("users")
    .doc(userEmail)
    .collection("chats")
    .doc(chatId)
    .collection("messages")
    .add(message);

  res.status(200).json({ suggestion: message.text });
  ///////
  // const response = await openai.createCompletion({
  //   // model: "text-davinci-003",
  //   model: `${currentModel}`,
  //   // prompt: `I'm ok.`,
  //   prompt: `${message}`,
  //   // temperature: 0.7,
  //   temperature: Number(`${temperature}`), // Higher values means the model will take more risks.
  //   max_tokens: 256, // The maximum number of tokens to generate in the completion. Most models have a context length of 2048 tokens (except for the newest models, which support 4096).
  //   top_p: 1, // alternative to sampling with temperature, called nucleus sampling
  //   frequency_penalty: 0, // Number between -2.0 and 2.0. Positive values penalize new tokens based on their existing frequency in the text so far, decreasing the model's likelihood to repeat the same line verbatim.
  //   presence_penalty: 0, // Number between -2.0 and 2.0. Positive values penalize new tokens based on whether they appear in the text so far, increasing the model's likelihood to talk about new topics.
  // });
  // const suggestion: any = response.data?.choices?.[0].text;
  // // console.log(suggestion);
  // if (suggestion === undefined) throw new Error("No suggestion found");

  // // res.status(200).json({ suggestion: suggestion });
  // res.status(200).json({ suggestion });
}
