'use strict';

var chai = require('chai'),
    findInFiles = require('../index'),
    stringOne = 'dolor sit amet',
    stringTwo = 'Träumen',
    stringThree = 'This is in both files',
    stringFour = 'This is duplicate';

chai.should();

describe('find some test strings', function () {
    it('should find stringOne only in fileOne exactly one time', function (done) {
        findInFiles.find(stringOne, '.', '.txt$')
        .then(function(result) {
            result['test/fileOne.txt'].count.should.equal(1);
            result.should.not.have.property('test/fileTwo.txt');
            done();
        });
    });

    it('should find stringTwo only in fileTwo exactly one time', function (done) {
        findInFiles.find(stringTwo, '.', '.txt$')
        .then(function(result) {
            result['test/fileTwo.txt'].count.should.equal(1);
            result.should.not.have.property('test/fileOne.txt');
            done();
        });
    });

    it('should find stringThree in both files exactly one time', function (done) {
        findInFiles.find(stringThree, '.', '.txt$')
        .then(function(result) {
            result['test/fileOne.txt'].count.should.equal(1);
            result['test/fileTwo.txt'].count.should.equal(1);
            done();
        });
    });

    it('should find stringFour 2 times in fileOne and 3 times in fileTwo', function (done) {
        findInFiles.find(stringFour, '.', '.txt$')
        .then(function(result) {
            result['test/fileOne.txt'].count.should.equal(2);
            result['test/fileTwo.txt'].count.should.equal(3);
            done();
        });
    });
});
