// require("dotenv").config();
// import express from "express";
// import Anthropic from "@anthropic-ai/sdk";
// import { BASE_PROMPT, getSystemPrompt } from "./prompts";
// import { ContentBlock, TextBlock } from "@anthropic-ai/sdk/resources";
// import {basePrompt as nodeBasePrompt} from "./defaults/node";
// import {basePrompt as reactBasePrompt} from "./defaults/react";


// const anthropic = new Anthropic();
// const app = express();

// app.use(express.json())

// app.post("/template", async (req, res) => {
//     const prompt = req.body.prompt;
    
//     const response = await anthropic.messages.create({
//         messages: [{
//             role: 'user', content: prompt
//         }],
//         model: 'claude-3-5-sonnet-20241022',
//         max_tokens: 200,
//         system: "Return either node or react based on what do you think this project should be. Only return a single word either 'node' or 'react'. Do not return anything extra"
//     })

//     const answer = (response.content[0] as TextBlock).text; // react or node
//     if (answer == "react") {
//         res.json({
//             prompts: [BASE_PROMPT, `Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${reactBasePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`],
//             uiPrompts: [reactBasePrompt]
//         })
//         return;
//     }

//     if (answer === "node") {
//         res.json({
//             prompts: [`Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${reactBasePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`],
//             uiPrompts: [nodeBasePrompt]
//         })
//         return;
//     }

//     res.status(403).json({message: "You cant access this"})
//     return;

// })

// app.post("/chat", async (req, res) => {
//     const messages = req.body.messages;
//     const response = await anthropic.messages.create({
//         messages: messages,
//         model: 'claude-3-5-sonnet-20241022',
//         max_tokens: 8000,
//         system: getSystemPrompt()
//     })

//     console.log(response);

//     res.json({
//         response: (response.content[0] as TextBlock)?.text
//     });
// })

// app.listen(3000);


require("dotenv").config();
import express, { Request, Response } from "express";
import cors from "cors";
import { BASE_PROMPT, getSystemPrompt } from "./prompts";
import { basePrompt as nodeBasePrompt } from "./defaults/node";
import { basePrompt as reactBasePrompt } from "./defaults/react";


const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

function extractAllCodeBlocks(markdown: string): string {
  // Regex to match all code blocks regardless of language
  const regex = /```[a-zA-Z]*\n([\s\S]*?)```/g;

  // Extract all matches and return only the raw code content
  const matches = [...markdown.matchAll(regex)];
  return matches.map(match => match[1].trim()).join("\n\n");
}

app.post("/template", async (req, res) => {
  try {
    var inputPrompt = req.body.prompt;
    var prompt = `Analyze the following project description and determine if it aligns more with a 'node' or 'react' project: ${inputPrompt}. Respond with only one word: 'node' or 'react'.`;
    const result = await model.generateContent(prompt);
    
    // const answer = await result.response.text();
    const answer = await result.response.text().trim();
    console.log(answer);
    
    if (answer === "react") {
      res.json({
        prompts: [
          BASE_PROMPT,
          `Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${reactBasePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`,
        ],
        uiPrompts: [reactBasePrompt],
      });
    } else if (answer === "node") {
      res.json({
        prompts: [
          `Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${nodeBasePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`,
        ],
        uiPrompts: [nodeBasePrompt],
      });
    } else {
      res.status(400).json({ message: "Unable to determine project type." });
    }
  } catch (error) {
    console.error("Error generating content:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});


app.post(
  "/chat",
  async (req, res) => {
    try {
      const messages: { role: string; content: string }[] = req.body.messages;
      if (!Array.isArray(messages) || messages.some((msg) => !msg.role || !msg.content)) {
        res.status(400).json({
          message: "Invalid input: 'messages' must be an array of objects with 'role' and 'content' properties.",
        });
        return;
      }
      
      const conversation = messages.map((msg) => `${msg.role}: ${msg.content}`).join("\n");
      
      // const result = await model.generateContent({
      //   prompt: `${getSystemPrompt()}\n\n${conversation}`,
      //   generationConfig: {
      //     maxOutputTokens: 8000,
      //     temperature: 0.7,
      //   }
      // });


      const result = await model.generateContent(`${getSystemPrompt()}\n\n${conversation}`);
      var promptResponse = await result.response.text();
      var extractedCodePromptResponse = extractAllCodeBlocks(promptResponse);
      console.log(extractedCodePromptResponse);
      console.log(result);
      res.json({
        response: extractedCodePromptResponse  || "No response generated.",
      });
    } catch (error) {
      console.error("Error in /chat endpoint:", error);
      res.status(500).json({
        message: "Internal server error. Please try again later.",
      });
    }
  }
);

app.listen(4000, () => {
  console.log("Server is running on http://localhost:4000");
});










// require("dotenv").config();

// const groqApiKey = process.env.GROQ_API_KEY;

// import express from "express";
// import Groq from "groq-sdk";
// import { BASE_PROMPT, getSystemPrompt } from "./prompts";
// import { basePrompt as reactBasePrompt } from "./defaults/react";
// import { basePrompt as nodeBasePrompt } from "./defaults/node";

// // initialization
// const groq = new Groq({ apiKey: groqApiKey });
// const app = express();

// app.use(express.json());

// // route to get the template based on the user prompt project type
// app.post("/template", async (req, res) => {
//   const prompt = req.body.prompt;
//   const chatCompletion = await groq.chat.completions.create({
//     messages: [
//       {
//         role: "system",
//         content:
//           "Return either a react or node based on what you think this project should be. Only return the single word 'react' or 'node' in your response.",
//       },
//       { role: "user", content: prompt }, // prompt from user body
//     ],
//     model: "llama3-8b-8192",
//   });

//   // getting the answer from the LLM what is tech stack of the project
//   const answer = chatCompletion.choices[0].message.content;
//   if (answer == "react" || answer == "React") {
//     // base prompt to go to llm models
//     // ui prompt to go to ui to create files
//     res.json({
//       prompts: [
//         BASE_PROMPT,
//         `Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${reactBasePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`,
//       ],
//       uiPrompt: [reactBasePrompt],
//     });
//   } else if (answer == "node" || answer == "Node") {
//     res.json({
//       prompts: [
//         `Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${nodeBasePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`,
//       ],
//       uiPrompt: [nodeBasePrompt],
//     });
//   } else {
//     res.status(403).json({
//       error:
//         "Invalid response from LLM as template is not supported or wrong response from LLM",
//     });
//   }
// });

// // route to get the chat response from the LLM to generate the actual ui code according to the user prompt
// app.post("/chat", async (req, res) => {
//   const messages = req.body.messages;
//   const response = await groq.chat.completions.create({
//     messages: [
//       {
//         role: "system",
//         content: getSystemPrompt(),
//       },
//       { role: "user", content: JSON.stringify(messages) },
//     ],
//     model: "llama3-8b-8192",
//     stream: true,
//   });

//   // ? This is optional part , creating it just for the sake of streaming otherwise it is not needed.
//   let result = "";
//   for await (const chunk of response) {
//     result += chunk.choices[0]?.delta?.content || ""; // to write the response to the console without a new line
//   }


//   console.log(result);
//   res.json({
//     response: result,
//   });
// });

// app.listen(4000, () => {
//   console.log("Server is running on port 4000");
// });

// //! This is for testing the LLM model and prompts and is not used in the production.
// // // to create a chat completion
// // async function main() {
// //   const chatCompletion = await groq.chat.completions.create({
// //     //system prompt is for the llm to know the constraints and capabilities and identify himself
// //     //user prompt is for the user to ask the llm to do something
// //     messages: [
// //       { role: "system", content: getSystemPrompt() },
// //       { role: "user", content: BASE_PROMPT }, //Base prompt -> for all the prompts to go
// //       {
// //         role: "user",
// //         content: `Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${reactBasePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`,
// //       }, // Base prompt to specify the file structure to go with user prompt
// //       { role: "user", content: "write the todo app in react" }, // user specified prompt
// //     ],
// //     model: "llama3-8b-8192",
// //     temperature: 0, // controls randomness
// //     // max_tokens: 1024, // max number of tokens in the response
// //     top_p: 1, // controls randomness
// //     stream: true, // to stream the response
// //     stop: null,
// //   });

// //   // to stream the response
// //   for await (const chunk of chatCompletion) {
// //     process.stdout.write(chunk.choices[0]?.delta?.content || ""); // to write the response to the console without a new line
// //   }
// // }

// // main();
