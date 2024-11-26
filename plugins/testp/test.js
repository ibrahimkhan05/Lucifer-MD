exports.run = {
    usage: ['session'],
    category: 'test',
    async: async (m, { client, text, body }) => {
       // import { gpt } from "gpti";
const { gpt } = require("gpti");

let data = await gpt.web({
    prompt: "Are you familiar with the movie Wonka released in 2023?",
    markdown: false
});

console.log(data);

    },
    error: false
};
