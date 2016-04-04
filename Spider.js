var input, code, output, string;

String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};


function isInteger(str) {
    return /[0-9]+/g.test(str);
}
function deleteChar(index) {
    deleteChars(index, string.length);
}
function deleteChars(start, end) {
    string = string.slice(0, start) + string.slice(end + 1);
}
function replace(index, str) {
    replaceRange(index, string.length, str);
}
function replaceRange(start, end, str) {
    string = string.slice(0, start) + str + string.slice(end);
}
function deleteStartingAt(str, start) {
    deleteInRange(str, start, string.length);
}
function deleteInRange(str, start, end) {
    string = string.slice(0, start) + string.slice(start, end + 1).replaceAll(str, "") + string.slice(end + 1);
}
function removeDuplicates(duplicate) {
    for (var e = 0; e < string.length; e++) {
        for (var s = 0; s < string.length; s++) {
            if (string.slice(s, e + 1) == duplicate) {
                deleteStartingAt(duplicate, s + 1);
                return;
            }
        }
    }
}
function replaceStartingAt(find, replace, start) {
    replaceInRange(find, replace, start, string.length);
}
function replaceInRange(find, replace, start, end) {
    string = string.slice(0, start) + string.slice(start, end).replaceAll(find, replace) + string.slice(end);
}
function sequentialReplace(replace, finds) {
    var find = 0;
    for (var e = 0; e < string.length; e++) {
        for (var s = 0; s < string.length; s++) {
            if (string.slice(s, e + 1) == finds[find]) {
                replaceRange(s, e + 1, replace);
                find++;
            }
        }
    }
}



/*
Commands.
 */

// reverses the string
var REVERSE = {
    token: "o",
    run: function(args) {
        string = string.split("").reverse().join("");
    },
    args: false
};




// deletes all occurrences of a specified string
var DELETE = {
    token: "d",
    run: function(args) {
        string = string.replaceAll(args[0], "");
    },
    args: true
};




var DELETE_IN_RANGE = {
    token: "D",
    run: function(args) {
        var str = args[0];
        var start = parseInt(args[1]);
        if (args.length == 3) {
            var end = parseInt(args[2]);
            deleteInRange(str, start, end);
        } else if (args.length == 2)
            deleteStartingAt(str, start);
    },
    args: true
};




// deletes an index range
var DELETES_INDICES = {
    token: "i",
    run: function(args) {
        if (args.length == 2) {
            var start = parseInt(args[0]), end = parseInt(args[1]);
            deleteChars(start, end);
        } else if (args.length == 1) {
            var i = parseInt(args[0]);
            deleteChar(i);
        }
    },
    args: true
};



// replaces a given index range with another string
var REPLACE_RANGE = {
    token: "I",
    run: function(args) {
        if (args.length == 3) {
            var start = parseInt(args[0]), end = parseInt(args[1]), rep = args[2];
            replaceRange(start, end, rep);
        } else if (args.length == 2) {
            var i = parseInt(args[0]), rep = args[1];
            replace(i, rep);
        }
    },
    args: true
};



// replaces all occurrences of a specified string with another string
var REPLACE = {
    token: "r",
    run: function(args) {
        var find = args[0], replace = args[1];
        string = string.replaceAll(find, replace);
    },
    args: true
};


var REPLACE_IN_RANGE = {
    token: "R",
    run: function(args) {
        var find = args[0], replace = args[1], start = args[2];
        if (args.length == 4) {
            var end = args[3];
            replaceInRange(find, replace, start, end);
        } else if (args.length == 3) {
            replaceStartingAt(find, replace, start);
        }
    },
    args: true
};




// removes all occurrences of the given string except the first
var DELETE_DUPLICATES = {
    token: "m",
    run: function(args) {
        var duplicate = args[0];
        removeDuplicates(duplicate);
    },
    args: true
};



var SEQUENTIAL_REPLACE = {
    token: "s",
    run: function(args) {
        var replacement = args[0];
        var finds;
        if (args.length == 2)
            // assume every letter should be found
            finds = args[1].split("");
        else if (args.length > 2) {
            finds = new Array(args.length - 1);
            for (var i = 1; i < args.length; i++)
                finds[i - 1] = args[i];
        }
        sequentialReplace(replacement, finds);
    },
    args: true
};




var COMMANDS = [REVERSE, DELETE, DELETES_INDICES, REPLACE, REPLACE_RANGE, DELETE_DUPLICATES, DELETE_IN_RANGE, REPLACE_IN_RANGE, SEQUENTIAL_REPLACE];



function getCommand(name) {
    for (var i = 0; i < COMMANDS.length; i++)
        if (COMMANDS[i].token == name)
            return COMMANDS[i];
    return null;
}










function run() {
    input = document.getElementById("input").value;
    // ignore new lines
    code = document.getElementById("code").value.replace(/(\r\n|\n|\r)/gm,"");
    output = document.getElementById("output");
    output.value = input;
    // copy string
    string = input.substr(0, input.length);

    var insideArgs = false;
    var cmd = null;
    var args = "";
    for (var i = 0; i < code.length; i++) {
        var c = code.charAt(i);
        if (!insideArgs) {
            cmd = getCommand(c);
            if (cmd == null) {
                output.value = "[Error] Unknown command '" + c + "' at index " + i + "!";
                return;
            }
            if (!cmd.args)
                cmd.run(args);
            else
                insideArgs = true;
        } else {
            if (c == ']') {
                insideArgs = false;
                cmd.run(args.split(","));
                args = "";
            } else
                args += c;
        }
    }
    if (insideArgs)
        cmd.run(args.split(","));
    output.value = string;
}