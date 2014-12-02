find-in-files [![Build Status](https://travis-ci.org/kaesetoast/find-in-files.svg?branch=master)](https://travis-ci.org/kaesetoast/find-in-files) [![Coverage Status](https://img.shields.io/coveralls/kaesetoast/find-in-files.svg)](https://coveralls.io/r/kaesetoast/find-in-files)
=============

A simple tool to search text patterns across multiple files

## Installation
find-in-files is a node module available via npm. You can install it with
```
$ npm install --save find-in-files
```

## Usage
The module exposes a simple find function that expects three parameters.

```JavaScript
find(pattern, directory, fileFilter)
```

#### pattern [string]
The string you want to search for.

#### directory [string]
The directory you want to search in.

#### fileFilter [regex] \(optional)
A regex you can pass in to only search in files matching the filter.

```JavaScript
var findInFiles = require('find-in-files');
```

The find function returns a promise which will recieve the results object. The results object contains the matches and a count of matches per file.

```JavaScript
{
    'fileOne.txt': {
        matches: ['found string'],
        count: 1
    }
}
```

## Example

```JavaScript
findInFiles.find('I'm Brian, and so's my wife!', '.', '.txt$')
    .then(function(results) {
        for (var result in results) {
            var res = results[result];
            console.log(
                'found "' + res.matches[0] + '" ' + res.count
                + ' times in "' + result + '"'
            );
        }
    });
```

## License

MIT © [Philipp Nowinski](http://philippnowinski.de)
