/**
 * Tests
 */

define(function( require ) {
    var registerSuite = require( "intern!object" );
    var assert = require( "intern/chai!assert" );
    var format = require( "../../src/index" );

    registerSuite({
        integrity: function() {
            assert.equal( typeof format, "object",
                "format should be an object." );

            assert.deepEqual( Object.keys( format ),
                [ "loop", "prioritize", "array", "money", "setCommas", "symbolize", "camelCase", "delimit", "list", "titleCase",
                "capitalize", "unformat", "unformatCol" ],
                "Format should have integrity." );
        },
        loop: function() {
            assert.deepEqual(
                format.loop({ greeting: "hello" }, { subject: "World" }),
                { greeting: "hello", subject: "World" },
                "Loop should combine objects." );

            assert.deepEqual(
                format.loop(
                    { greeting: "hello" },
                    { subject: "World" },
                    function( source, key, value ) {
                        source[ key ] = value;
                        return source;
                    }
                ),
                { greeting: "hello", subject: "World" },
                "Loop should execute a callback when provided." );
        },
        // prioritize: function() {
        //     assert.strictEqual( format.prioritize({ a: 1, b: 2 }, "a"),
        //         { a: 1, b: 2 }, "Prioritize should move the given key to" +
        //         " the end of the object." );
        // },
        array: function() {
            assert.notEqual( arguments, format.array( arguments ), "Array does not return the same object as `arguments`." );

            assert.strictEqual( format.array( arguments ) instanceof Array, true, "Array should format `arguments` into arrays." );
        }
    });
});
