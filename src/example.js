var format = require( "./index.js" );

console.log( format.loop( { source: "hello" }, { custom: "world" } ) );

console.log( format.prioritize({ a: 1, b: 2 }, "a") );
