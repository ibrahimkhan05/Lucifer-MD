exports.run = {
    usage: ['session'],
    category: 'test',
    async: async (m, { client, text, body }) => {
       ;

        const { bing } = require("gpti");

        let history = [
            {
                role: "assistant",
                content: "Hello! How can I help you today? 😊"
            },
            {
                role: "user",
                content: "Hi, tell me the names of the movies released in 2023."
            },
            {
                role: "assistant",
                content: "Certainly! Here are some movies that were released in 2023:\n\n1.  **About My Father** [^1^](https://editorial.rottentomatoes.com/guide/best-movies-of-2023/)\n2.  **The Little Mermaid** [^1^](https://editorial.rottentomatoes.com/guide/best-movies-of-2023/)\n3.  **Fast X** [^1^](https://editorial.rottentomatoes.com/guide/best-movies-of-2023/)\n4.  **Spider-Man: Across the Spider-Verse** [^1^](https://editorial.rottentomatoes.com/guide/best-movies-of-2023/)\n5.  **The Machine** [^1^](https://editorial.rottentomatoes.com/guide/best-movies-of-2023/)\n6.  **Book Club: The Next Chapter** [^1^](https://editorial.rottentomatoes.com/guide/best-movies-of-2023/)\n7.  **Guardians of the Galaxy Vol. 3** [^1^](https://editorial.rottentomatoes.com/guide/best-movies-of-2023/)\n8.  **John Wick: Chapter 4** [^1^](https://editorial.rottentomatoes.com/guide/best-movies-of-2023/)\n9.  **Are You There God? It's Me, Margaret** [^1^](https://editorial.rottentomatoes.com/guide/best-movies-of-2023/)\n10.  **Evil Dead Rise** [^1^](https://editorial.rottentomatoes.com/guide/best-movies-of-2023/)\n11.  **The Super Mario Bros. Movie** [^1^](https://editorial.rottentomatoes.com/guide/best-movies-of-2023/)\n12.  **Love Again** [^1^](https://editorial.rottentomatoes.com/guide/best-movies-of-2023/)\n13.  **Kandahar** [^1^](https://editorial.rottentomatoes.com/guide/best-movies-of-2023/)\n14.  **Dungeons & Dragons: Honor Among Thieves** [^1^](https://editorial.rottentomatoes.com/guide/best-movies-of-2023/)\n15.  **Shin Kamen Rider** [^1^](https://editorial.rottentomatoes.com/guide/best-movies-of-2023/)\n16.  **Knights of the Zodiac** [^1^](https://editorial.rottentomatoes.com/guide/best-movies-of-2023/)\n17.  **The Pope's Exorcist** [^1^](https://editorial.rottentomatoes.com/guide/best-movies-of-2023/)\n18.  **Shazam! Fury of the Gods** [^1^](https://editorial.rottentomatoes.com/guide/best-movies-of-2023/)\n19.  **All That Breathes** [^1^](https://editorial.rottentomatoes.com/guide/best-movies-of-2023/)\n20.  **Sailor Moon Cosmos** [^1^](https://editorial.rottentomatoes.com/guide/best-movies-of-2023/)\n21.  **Hypnotic** [^1^](https://editorial.rottentomatoes.com/guide/best-movies-of-2023/)\n22.  **Sound of Freedom** [^1^](https://editorial.rottentomatoes.com/guide/best-movies-of-2023/)\n23.  **The Boogeyman** [^1^](https://editorial.rottentomatoes.com/guide/best-movies-of-2023/)\n24.  **Chicken Run: Dawn of the Nugget** [^1^](https://editorial.rottentomatoes.com/guide/best-movies-of-2023/)\n25.  **A Lot of Nothing** [^1^](https://editorial.rottentomatoes.com/guide/best-movies-of-2023/)\n26.  **Followers** [^1^](https://editorial.rottentomatoes.com/guide/best-movies-of-2023/)\n27.  **Big George Foreman** [^1^](https://editorial.rottentomatoes.com/guide/best-movies-of-2023/)\n28.  **Asterix & Obelix: The Middle Kingdom** [^1^](https://editorial.rottentomatoes.com/guide/best-movies-of-2023/)\n29.  **Ant-Man and the Wasp: Quantumania** [^1^](https://editorial.rottentomatoes.com/guide/best-movies-of-2023/)\n30.  **Transformers: Rise of the Beasts** [^1^](https://editorial.rottentomatoes.com/guide/best-movies-of-2023/)\n31.  **Follow Her** [^1^](https://editorial.rottentomatoes.com/guide/best-movies-of-2023/)\n32.  **Prom Pact** [^1^](https://editorial.rottentomatoes.com/guide/best-movies-of-2023/)\n33.  **God Is a Bullet** [^1^](https://editorial.rottentomatoes.com/guide/best-movies-of-2023/)\n34.  **Still: A Michael J. Fox Movie** [^1^](https://editorial.rottentomatoes.com/guide/best-movies-of-2023/)\n35.  **Nefarious** [^1^](https://editorial.rottentomatoes.com/guide/best-movies-of-2023/)\n36.  **Nanny Dearest** [^1^](https://editorial.rottentomatoes.com/guide/best-movies-of-2023/)\n37.  **Monica** [^1^](https://editorial.rottentomatoes.com/guide/best-movies-of-2023/)\n38.  **Wild Life** [^1^](https://editorial.rottentomatoes.com/guide/best-movies-of-2023/)\n39.  **Palm Trees and Power Lines** [^1^](https://editorial.rottentomatoes.com/guide/best-movies-of-2023/)\n40.  **What's Love Got to Do with It?** [^1^](https://editorial.rottentomatoes.com/guide/best-movies-of-2023/)\n41.  **Creed III** [^1^](https://editorial.rottentomatoes.com/guide/best-movies-of-2023/)\n42.  **One True Loves** [^1^](https://editorial.rottentomatoes.com/guide/best-movies-of-2023/)\n43.  **BlackBerry** [^1^](https://editorial.rottentomatoes.com/guide/best-movies-of-2023/)\n44.  **Suzume** [^1^](https://editorial.rottentomatoes.com/guide/best-movies-of-2023/)\n45.  **Rock Dog 3: Battle the Beat** [^1^](https://editorial.rottentomatoes.com/guide/best-movies-of-2023/)\n46.  **Gridman Universe** [^1^](https://editorial.rottentomatoes.com/guide/best-movies-of-2023/)\n47.  **Digimon Adventure 02: The Beginning** [^1^](https://editorial.rottentomatoes.com/guide/best-movies-of-2023/)\n48.  **Woman of the Photographs** [^1^](https://editorial.rottentomatoes.com/guide/best-movies-of-2023/)\n49.  **El Tonto** [^1^](https://editorial.rottentomatoes.com/guide/best-movies-of-2023/)\n50.  **Seriously Red** [^1^](https://editorial.rottentomatoes.com/guide/best-movies-of-2023/)\n\nI hope this helps! Let me know if you have any other questions."
            },
            {
                role: "user",
                content: "Can you tell me how many movies you've told me about?"
            }
        ];
        
        let data = await bing({
            messages: history,
            conversation_style: "Balanced",
            markdown: false,
            stream: false
        });
        
        console.log(data);

console.log(data);
    },
    error: false
};
