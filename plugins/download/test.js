const { spawn } = require("child_process");
const path = require("path");

exports.run = {
    usage: ["youtt"],
    use: "query",
    category: "generativeai",
    async: async (m, { client, isPrefix, text, Func, command }) => {
        const yts = require( 'yt-search' )
const r = await yts( 'superman theme' )

const videos = r.videos.slice( 0, 3 )
videos.forEach( function ( v ) {
	const views = String( v.views ).padStart( 10, ' ' )
	console.log( `${ views } | ${ v.title } (${ v.timestamp }) | ${ v.author.name }` )
} )

     
    },
    error: false,
    limit: true,
    premium: false,
    verified: true,
};
