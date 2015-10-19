/* jshint -W098, -W117 */

/**
 * Formats given data for rendering.
 */

// Export based on environment.
if ( typeof module !== "undefined" && typeof module.exports !== "undefined" ) {
    module.exports = exports;

    var _ = require( "underscore" );
} else {
    if ( typeof define === "function" && define.amd ) {
        define([ "underscore" ], function( _ ) {
            return exports;
        });

        var exports = {};
    } else {
        window.exports = exports;
    }
}

/**
 * Zips given properties into the given object.
 *
 * @param {object} The default object. Accepts an empty object.
 * @param {array|object} The array or object to map to new object.
 * @param {fn} The function to set new object.
 * @return {object} The new object: default object plus mapped values.
 */
exports.loop = function( source, properties, callback ) {
    Object.keys( properties ).forEach(function( key ) {
        if ( !callback ) {
            // Extend properties object.
            source[ key ] = properties[ key ];
        } else {
            // Execute callback to create new object.
            source = callback( source, key, properties[ key ] );
        }
    });

    return source;
};

/**
 * Gets the given property from the object and moves it to the end.
 *
 * I acknowledge it isn't wise to depend on the order of an object's properties
 * --- looping through an array of keys may be more appropriate for most cases
 * --- but I also can't deny this has been useful when performance outweighs
 * the risk of properties falling out of order. That said, I've never had
 * this method fail me.
 *
 * @param {string} The name of the property to reorganize.
 * @param {object} The object, with the given property, to reorganize.
 * @return {object} The reorganized object.
 */
exports.prioritize = function( obj, key ) {
    var // Save the value.
        value = obj[ key ],
        // Clone the object without the given key.
        sorted = _.omit( obj, key );

    // Add the key-value pair to the cloned object.
    sorted[ key ] = value;

    // Return the object with the new order.
    return sorted;
};

/**
 * Converts given array-like object into true array.
 *
 * @param {array} Array-like object called arguments
 * @return {array} The given object as an array.
 */
exports.array = function( args ) {
    return Array.prototype.slice.call( args );
};

/**
 * Formats money as USD.
 *
 * @param {int} The dollar amount, calculated from MicroUSDs.
 * @param {int} The decimal places to keep.
 * @return {string} The given dollar amount formatted to USDs &
 * rounded to the given decimal place.
 */
exports.money = function( amount, decimals ) {
    // Validate.
    if ( typeof amount !== "number" ) { return amount; }

    // Set the decimal places to keep.
    decimals = decimals || 0;

    // Set decimal places; Set commas every 3 digits.
    amount = amount.toFixed( decimals );
    amount = this.setCommas( amount );

    // Prepend dollar symbol.
    amount = "$" + amount;

    return amount;
};
/**
 * Formats digits to have a comma every third place.
 */
exports.setCommas = function( digits ) {
    var type = typeof digits,
        invalidType = ( type !== "number" && type !== "string" );

    // Validate.
    if ( isNaN( digits ) || invalidType || digits.length === 0 ) {
        return false;
    }

    digits = digits.toString().replace( /(\d)(?=(\d\d\d)+(?!\d))/g, "$1," );

    return digits;
};

/**
 * Uses value's type property to affix the corresponding symbol.
 */
exports.symbolize = function( obj, decimals ) {
    var $this = this;

    // Validate.
    if ( ( !obj.value && obj.value !== 0 ) || !obj.type ) {
        return obj;
    }

    // Append symbol to value based on type.
    switch( obj.type ) {
        case "MicroUSD":
            if ( obj.value === "< $1" ) {
                return obj.value;
            }

            if ( _.isNaN( obj.value ) || obj.value === "Infinity" ) {
                obj.value = 0;
            }

            return $this.money( obj.value, decimals );
        case "Percentage":
            return Math.round( obj.value ) + "%";
        default:
            return obj.value;
    }
};

/**
 * Formats
 */
exports.camelCase = function( phrase ) {
    // Validate.
    if ( !phrase || $.type( phrase ) !== "string" ) {
        return phrase;
    }

    var firstWord = "";

    // Capitalize every word in the phrase.
    phrase = this.capitalize( phrase );

    // Get each word.
    phrase = phrase.split( /\s+/ );

    // Set the first word to lowercase.
    firstWord = phrase.shift().toLowerCase();

    // Replace the first word in the phrase w/ its formatted version.
    phrase.unshift( firstWord );

    // Remove the whitespace.
    phrase = phrase.join( "" );

    return phrase;
};

/**
 * Append a delimiter to the given phrase.
 */
exports.delimit = function( phrase, i, length ) {
    var delimiter = ", ";

    // Append delimiter on all but last item in list.
    if ( length !== ( i + 1 ) ) {
        phrase += delimiter;
    }

    return phrase;
};

/**
 * Append a delimiter to the given phrase.
 */
exports.list = function( word, isObject ) {
    var $this = this,
        phrase = "",
        length = 0,
        list = [];

    // Loops through each value to construct a comma-delimited list.
    _.each( word, function( w, i ) {
        if ( isObject ) {
            // Get array of properties to learn index of current word.
            list = Object.keys( word );

            // Get number of items in the list.
            length = list.length;

            // Get index of current word using array of properties.
            i = _.indexOf( list, w );
        } else {
            // Get number of items in the list.
            length = word.length;
        }

        // Append word to list.
        phrase += $this.titleCase( w );

        // Append delimiter on all but last item in list.
        phrase = $this.delimit( phrase, i, length );
    });

    return phrase;
};

/**
 * Format given word with title casing.
 * If and apostrophe exists before the current character
 * of the String, return it so it doesn't capitalize the
 * character. Else capitalize the character.
 */
exports.titleCase = function( word ) {
    return word.replace( /([a-z])([A-Z])/g, "$1 $2" )
        .replace( /\b[a-z]|[\W]/g, function( letter, i ) {
            if( word.charAt( i - 1 ).match( /'/g ) ) {
                return letter;
            } else {
                return letter.toUpperCase();
            }
    });
};

/**
 * Formats given string into a space-delimited phrase with title case.
 *
 * Digests arrays and objects, forming them into a list.
 *
 * @param {str} The word to be formatted.
 * @param {arr} An array of words not to be formatted.
 * @param {obj} Map of words to their expected output.
 */
exports.capitalize = function( word, blacklist, map ) {
    var phrase = "",
        validTypes = [ "array", "object", "string" ],
        isValid = _.contains( validTypes, $.type( word ) ),
        isObject = _.isObject( word ) && !_.isArray( word );

    // Validate input's value and type.
    if ( !isValid || ( blacklist && _.contains( blacklist, word ) ) ) {
        return word;
    }

    if ( _.contains( Object.keys( map ), word ) ) {
        return map[ word ];
    }

    if ( _.isArray( word ) || isObject ) {
        // Loops through each value to construct a comma-delimited list.
        phrase = this.list( word, isObject );
    } else {
        // Format word or phrase.
        phrase = this.titleCase( word );
    }

    return phrase;
};

/**
 * Unformats a given value.
 */
exports.unformat = {
    date: function( key ) {
        return new Date( key.replace( /\s/g, "" ) );
    },
    // Remove white space.
    publisher: function( key ) {
        return key.replace( /\s/g, "" );
    },
    // Remove non-numerical chars before set type to number.
    nums: function( key ) {
        if ( !key ) {
            key = 0;
        }
        return Number( key.toString().replace( /\$|\%|\,|\s/g, "" ) );
    },
    // Get width from size string.
    // @todo Review
    size: function( key ) {
        return key.split( "x" )[ 0 ];
    }
};

/**
 * Removes formatting set on a column's value.
 *
 * @param {object} The object to be unformatted.
 * @param {string} The column name.
 * @param {arr} Array of names identifying columns with numerical values.
 * @return {array|object|string} The column's raw value.
 */
exports.unformatCol = function( key, param, numbers ) {
    key = typeof key[ param ] === "object" ? key[ param ].value : key[ param ];

    if ( numbers && $.inArray( param, numbers ) > -1 ) {
        param = "nums";
    }

    return this.unformat[ param ]( key );
};
