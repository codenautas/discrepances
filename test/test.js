"use strict";

var assert = require('self-explain').assert;
var expect = require('expect.js');
var discrepances = require('../lib/discrepances.js');

describe("discrepances", function(){
    [
        {obj:4  , structure:{typeof: "number"}, expect: null},
        {obj:"4", structure:{typeof: "number"}, expect: 'typeof "4" !== "number"'}
    ].forEach(function(fixture){
        it("controls discrepances via fixture: "+JSON.stringify(fixture), function(){
            eval(assert(discrepances(fixture.obj, fixture.structure) === fixture.expect));
            expect(discrepances(fixture.obj, fixture.structure)).to.eql(fixture.expect);
        });
    });
});