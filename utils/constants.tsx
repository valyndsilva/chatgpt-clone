import { Configuration, OpenAIApi } from "openai";

// Requesting organization
export const configuration = new Configuration({
  organization: process.env.OPENAI_ORG_ID,
  apiKey: process.env.OPENAI_API_KEY,
});


const openai = new OpenAIApi(configuration);

export default openai;
