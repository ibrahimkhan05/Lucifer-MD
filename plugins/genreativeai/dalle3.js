const { spawn } = require("child_process");
const path = require("path");

exports.run = {
    usage: ["bingimg"],
    use: "query",
    category: "generativeai",
    async: async (m, { client, isPrefix, text, Func, command }) => {
        if (!text) {
            return client.reply(m.chat, Func.example(isPrefix, command, "a cat painting"), m);
        }

        m.reply("Generating images, please wait...");

        const scriptPath = path.join(__dirname, "generate_image.py"); // Path to Python script

        // Use spawn to handle long prompts properly
        const process = spawn("python3", [scriptPath, text]);

        let output = "";
        let errorOutput = "";

        process.stdout.on("data", (data) => {
            output += data.toString();
        });

        process.stderr.on("data", (data) => {
            errorOutput += data.toString();
        });

        process.on("close", (code) => {
            if (errorOutput) {
                return m.reply(`Error: ${errorOutput}`);
            }

            let data;
            try {
                // Parse JSON output from Python script
                data = JSON.parse(output);
            } catch (err) {
                return m.reply(`Failed to parse image data. Raw output: ${output}`);
            }

            if (data.error) {
                return m.reply(`Error: ${data.error}`);
            }

            if (!data.images || data.images.length === 0) {
                return client.reply(m.chat, "No images found.", m);
            }

            // Send the 1st, 3rd, 5th, and 7th images
            for (let i = 0; i < 4; i++) {
                const imageIndex = i * 2; // Select 1st, 3rd, 5th, and 7th images
                const imageUrl = data.images[imageIndex]?.url + ".jpg"; // Add .jpg extension

                if (imageUrl) {
                    setTimeout(() => {
                        client.sendMessage(m.chat, {
                            image: { url: imageUrl },
                            caption: `◦  *Prompt* : ${text}\n*Image:* ${i + 1} of 4`,
                        });
                    }, 2000 * i); // Add a delay between image sending
                }
            }
        });
    },
    error: false,
    limit: true,
    premium: false,
    verified: true,
};
