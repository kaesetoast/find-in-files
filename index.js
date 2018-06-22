'use strict'

const find = require('find'),
    fs = require('fs'),
    Q = require('q')

function readFile (filename) {
    return Q.nfcall(fs.readFile, filename, 'utf-8')
}

function searchFile (data) {
    return content => {
        return {
            filename: data.filename,
            match: content.match(data.regex),
            lines: content.match(data.lineRegEx)
        }
    }
}

function getFileFilter (fileFilter) {
    if (typeof fileFilter === 'string') {
        fileFilter = new RegExp(fileFilter)
    } else if (typeof fileFilter === 'undefined') {
        fileFilter = new RegExp('.')
    }
    return fileFilter
}

function getRegEx (pattern, regex) {
    let flags, term, grabLineRegEx

    if (typeof pattern === 'object' && pattern.flags) {
        term = pattern.term
        flags = pattern.flags
    } else {
        term = pattern
        flags = 'g'
    }

    grabLineRegEx = '(.*' + term + '.*)'

    if (regex === 'line') {
        return new RegExp(grabLineRegEx, flags)
    }

    return new RegExp(term, flags)
}

function getMatchedFiles (pattern, files) {
    let matchedFiles = []
    for (let i = files.length - 1; i >= 0; i--) {
        matchedFiles.push(readFile(files[i])
            .then(searchFile({
                regex: getRegEx(pattern),
                lineRegEx: getRegEx(pattern, 'line'),
                filename: files[i]
            })))
    }

    return matchedFiles
}

function getResults (content) {
    let results = {}

    for (let i = 0; i < content.length; i++) {
        let fileMatch = content[i].value
        if (fileMatch && fileMatch.match !== null) {
            results[fileMatch.filename] = {
                matches: fileMatch.match,
                count: fileMatch.match.length,
                line: fileMatch.lines
            }
        }
    }

    return results
}

exports.find = (pattern, directory, fileFilter) => {
    let deferred = Q.defer()
    find
        .file(getFileFilter(fileFilter), directory, files => {
            Q.allSettled(getMatchedFiles(pattern, files))
                .then(content => deferred.resolve(getResults(content)))
                .done()
        })
        .error(err => deferred.reject(err))
    return deferred.promise
}

exports.findInFiles = (pattern, files) => {
    let deferred = Q.defer()
    Q.allSettled(getMatchedFiles(pattern, files))
        .then(content => deferred.resolve(getResults(content)))
        .done()
    return deferred.promise
}

exports.findSync = (pattern, directory, fileFilter) => {
    let deferred = Q.defer()
    let files
    try {
        files = find.fileSync(getFileFilter(fileFilter), directory)
        Q.allSettled(getMatchedFiles(pattern, files))
            .then(function (content) {
                deferred.resolve(getResults(content))
            })
            .done()
    } catch (err) {
        deferred.reject(err)
    }
    return deferred.promise
}
