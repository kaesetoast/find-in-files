'use strict';

var find = require('find'),
    fs = require('fs'),
    Q = require('q'),
    deferred = Q.defer();

function readFile(filename) {
    return Q.nfcall(fs.readFile, filename, 'utf-8');
}

function searchFile(data) {
    return function(content) {
        var match = content.match(data.regex);
        return {
            filename: data.filename,
            match: match
        };
    };
}

exports.find = function (pattern, directory, fileFilter) {
    var regex = new RegExp(pattern, 'g'),
        matchedFiles = [],
        results = [];
    if (typeof fileFilter === 'string') {
        fileFilter = new RegExp(fileFilter);
    }
    find.file(fileFilter, directory, function(files) {
        for (var i = files.length - 1; i >= 0; i--) {
            matchedFiles.push(readFile(files[i])
            .then(searchFile({regex: regex, filename: files[i]})));
        }
        Q.allSettled(matchedFiles)
        .then(function(content) {
            for (var i = 0; i < content.length; i++) {
                var fileMatch = content[i].value;
                if (fileMatch.match !== null) {
                    results[fileMatch.filename] = {
                        matches: fileMatch.match,
                        count: fileMatch.match.length
                    };
                }
            }
            deferred.resolve(results);
        });
    });
    return deferred.promise;
};