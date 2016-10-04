"use strict";

var JSON4all = require('json4all');
var expect = require('expect.js');
var discrepances = require('../lib/discrepances.js');

describe("discrepances", function(){
    [
        {a:4                 , b:4                  , expected: null                                                                      },
        {a:4                 , b:5                  , expected: {difference:-1             , values:[4, 5]                               }},
        {a:"4"               , b:4                  , expected: {types:['string', 'number'], values:["4", 4]                             }},
        {a:null              , b:0                  , expected: {types:['null'  , 'number'], values:[null, 0]                            }},
        {skip:true, a:new Date()        , b:/a/                , expected: {class:['Date'  , 'RegExp'], values:[new Date(), /a/]                    }},
        {skip:true, a:new Date(2011,1,3), b:new Date(2011,1,4) , expected: {difference:'a definir', values:[new Date(2011,1,3), new Date(2011,1,4)] }},
        {skip:true, a:[1,2,3,4,5]       , b:[1,2,33,4,5,6]     , expected: {array:{length:discrepances(5,6), 2:discrepances(3,33)}                  }},
        {skip:true, a:{x:1, y:2}        , b:{y:3, z:{zz:3}}    , expected: {object:{x:{onlyLeft:1}, y:discrepances(2,3), z:{onlyRight:{zz:3}}}      }},
        {skip:true, a:{x:1, y:2, z:[3]} , b:{x:1, y:2, z:[3]}  , expected: null                                                                      },
    ].forEach(function(fixture){
        if(fixture.skip) {
            delete fixture.skip;
            it('skipped fixture: '+JSON.stringify(fixture));
            return true;
        }
        it("fixture: "+JSON.stringify(fixture), function(){
            expect(discrepances(fixture.a, fixture.b)).to.eql(fixture.expected);
            expect(JSON.stringify(discrepances(fixture.a, fixture.b))).to.eql(JSON.stringify(fixture.expected));
            expect(JSON4all.stringify(discrepances(fixture.a, fixture.b))).to.eql(JSON4all.stringify(fixture.expected));
        });
    });
});