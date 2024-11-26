exports.run = {
    usage: ['session'],
    category: 'test',
    async: async (m, { client, text, body }) => {
       // import { gpt } from "gpti";
       const { gpt } = require("gpti");

       let history = [
           {
               "role": "user",
               "content": "Hello! How are you? Could you tell me your name?"
           }
       ];
       
       let data = await gpt.v3({
           messages: history,
           markdown: false,
           stream: false
       });
       
       console.log(data);

    },
    error: false
};
