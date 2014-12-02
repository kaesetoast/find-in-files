'use strict';

var chai = require('chai'),
    findInFiles = require('../index'),
    stringOne = 'dolor sit amet',
    stringTwo = 'Träumen';

chai.should();

describe('find some test strings', function () {
    it('should find stringOne in fileOne exactly one time', function (done) {
        findInFiles.find(stringOne, '.', '.txt$')
        .then(function(result) {
            result['test/fileOne.txt'].count.should.equal(1);
            done();
        });
    });

    it('should find stringTwo in fileTwo exactly one time', function (done) {
        findInFiles.find(stringTwo, '.', '.txt$')
        .then(function(result) {
            result['test/fileTwo.txt'].count.should.equal(1);
            done();
        })
        .catch(function(result) {
            console.log(result);
        });
    });
});
