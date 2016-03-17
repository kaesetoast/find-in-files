'use strict';

var find = require('find'),
    fs = require('fs'),
    Q = require('q');

function readFile(filename) {
    return Q.nfcall(fs.readFile, filename, 'utf-8');
}

function searchFile(data) {
    return function(content) {

        var match = content.match(data.regex),
            linesMatch = content.match(data.lineRegEx)

        return {
            filename: data.filename,
            match: match,
            lines: linesMatch
        };
    };
}

exports.find = function(pattern, directory, fileFilter) {
    var flags, term, grabLineRegEx

    if (typeof pattern === 'object' && pattern.flags) {
        term = pattern.term
        flags = pattern.flags
    } else {
        term = pattern
        flags = 'g'
    }

    grabLineRegEx = "(.*" + term + ".*)"

    var regex = new RegExp(term, flags),
        lineRegEx = new RegExp(grabLineRegEx, flags),
        matchedFiles = [],
        results = [],
        deferred = Q.defer();
    if (typeof fileFilter === 'string') {
        fileFilter = new RegExp(fileFilter);
    } else if (typeof fileFilter === 'undefined') {
        fileFilter = new RegExp('.');
    }
    find.file(fileFilter, directory, function(files) {
        for (var i = files.length - 1; i >= 0; i--) {
            matchedFiles.push(readFile(files[i])
                .then(searchFile({
                    regex: regex,
                    lineRegEx: lineRegEx,
                    filename: files[i]
                })));
        }
        Q.allSettled(matchedFiles)
            .then(function(content) {
                for (var i = 0; i < content.length; i++) {
                    var fileMatch = content[i].value;
                    if (fileMatch.match !== null) {
                        results[fileMatch.filename] = {
                            matches: fileMatch.match,
                            count: fileMatch.match.length,
                            line: fileMatch.lines
                        };
                    }
                }
                deferred.resolve(results);
            });
    });
    return deferred.promise;
};
