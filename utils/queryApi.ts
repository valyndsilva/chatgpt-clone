import openai from "./constants";

const query = async (
  prompt: string,
  chatId: string,
  model: string,
  temperature: string
) => {
  const response = await openai
    .createCompletion({
      model,
      prompt,
      temperature: Number(`${temperature}`),
      max_tokens: 100,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
    })
    .then((response) => response.data.choices[0].text)
    .catch((err) => {
      `ChatGPT was unable to find an answer for that prompt. Error: ${err.message}`; // to avoid 429 error too many request to avoid rate limitations
    });
  return response;
};

export default query;
