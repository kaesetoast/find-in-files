'use strict';

var find = require('find'),
    fs = require('fs'),
    Q = require('q'),
    path = require('path');

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

function getFileFilter(fileFilter) {
    if (typeof fileFilter === 'string') {
        fileFilter = new RegExp(fileFilter);
    } else if (typeof fileFilter === 'undefined') {
        fileFilter = new RegExp('.');
    }
    return fileFilter;
}

function getRegEx(pattern, regex, caseSensitivity) {
    var flags, term, grabLineRegEx

    if (typeof pattern === 'object' && pattern.flags) {
        term = pattern.term
        flags = pattern.flags
    } else {
        term = pattern
        caseSensitivity ? flags = 'g' : flags = 'gi';
    }

    grabLineRegEx = "(.*" + term + ".*)"

    if (regex === 'line') {
        return new RegExp(grabLineRegEx, flags)
    }

    return new RegExp(term, flags);
}

function getMatchedFiles(pattern, files, caseSensitivity) {
    var matchedFiles = []
    for (var i = files.length - 1; i >= 0; i--) {
        matchedFiles.push(readFile(files[i])
            .then(searchFile({
                regex: getRegEx(pattern, undefined, caseSensitivity),
                lineRegEx: getRegEx(pattern, 'line', caseSensitivity),
                filename: files[i]
            })));
    }

    return matchedFiles;
}

function getResults(content) {
    var results = {}

    for (var i = 0; i < content.length; i++) {
        var fileMatch = content[i].value;
        if (fileMatch && fileMatch.match !== null) {
            results[fileMatch.filename] = {
                matches: fileMatch.match,
                count: fileMatch.match.length,
                line: fileMatch.lines
            };
        }
    }

    return results;
}

exports.find = function(pattern, directory, fileFilter, caseSensitivity = true) {
    var deferred = Q.defer()
    find
    .file(getFileFilter(fileFilter), directory, function(files) {
        Q.allSettled(getMatchedFiles(pattern, files, caseSensitivity))
        .then(function (content) {
            deferred.resolve(getResults(content));
        })
        .done();
    })
    .error(function (err){
        deferred.reject(err)
    });
    return deferred.promise;
};

exports.findSync = function(pattern, directory, fileFilter, caseSensitivity = true) {
    var deferred = Q.defer();
    var files;
    try {
        files = find.fileSync(getFileFilter(fileFilter), directory);
        Q.allSettled(getMatchedFiles(pattern, files, caseSensitivity))
        .then(function (content) {
            deferred.resolve(getResults(content));
        })
        .done();
    } catch (err) {
        deferred.reject(err)
    }
    return deferred.promise;
};
