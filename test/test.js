'use strict';

var chai = require('chai'),
    findInFiles = require('../index');

chai.should();

describe('find some test strings', function () {
    it('should find stringOne in fileOne exactly one time', function (done) {
        findInFiles.find('dolor sit amet', '.', '.txt$')
        .then(function(result) {
            result['test/fileOne.txt'].count.should.equal(1);
            done();
        });
    });
});