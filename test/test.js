"use strict";

var JSON4all = require('json4all');
var expect = require('expect.js');
var discrepances = require('../lib/discrepances.js');

var fechaActual = new Date();

describe("discrepances", function(){
    [
        {a:4                     , b:4                  , expect: null                                                                      },
        {a:4                     , b:5                  , expect: {difference:-1             , values:[4, 5]                               }},
        {a:"4"                   , b:4                  , expect: {types:['string', 'number'], values:["4", 4]                             }},
        {a:null                  , b:0                  , expect: {types:['null'  , 'number'], values:[null, 0]                            }},
        {a:fechaActual           , b:/a/                , expect: {classes:['Date'  , 'RegExp'], values:[fechaActual, /a/]                    }},
        {a:[1,2,3,4,5]           , b:[1,2,33,4,5,6]     , expect: {array:{length:discrepances(5,6), 2:discrepances(3,33)}                  }},
        {a:[1,2,3,4,5]           , b:[1,2,3,4,5]        , expect: null                  },
        {a:{x:1, y:2}            , b:{y:3, z:{zz:3}}    , expect: {object:{x:{onlyLeft:1}, y:discrepances(2,3), z:{onlyRight:{zz:3}}}      }},
        {a:{x:1, y:2, z:[3]}     , b:{x:1, y:2, z:[3]}  , expect: null                                                                      },
        {a:"un string"           , b:"un string"        , expect: null                                                                      },
        {a:"un negro pez"        , b:"un blanco pez"    , expect: {difference: {left:'negro', right:'blanco', pos:3}}                        },
        {a:"un pez negro"        , b:"un pez blanco"    , expect: {difference: {left:'negro', right:'blanco', pos:7}}                        },
        {a:"negro el ocho"       , b:"rojo el ocho"     , expect: {difference: {left:'negro', right:'rojo', pos:0}}                        },
        {a:fechaActual           , b:fechaActual        , expect: null                        },
        //{skip:true, a:new Date(2011,1,3), b:new Date(2011,1,4) , expect: {difference:'a definir', values:[new Date(2011,1,3), new Date(2011,1,4)] }},
        {a: new Date(1992,11,5)  , b:new Date(1935,8,1) , expect: {difference: {left:'1992-12-05', right:'1935-09-01'}}                     },
        {skip:true, a: new Date(1992,11,5,10,0,0), b:new Date(1935,8,1,15,0,0)  , expect:'1992-12-05 10:00:00 != 1935-09-01 15:00:00'},
        {skip:true, a: new Date(1992,11,5,15,0,0), b:new Date(1992,11,5,10,10,0), expect:'04:50:00'},
        {skip:true, a: new Date(1992,11,5,0,0,0),  b:new Date(1992,11,6,15,25,0), expect:'1992-12-05 00:00:00 != 1992-12-06 15:25:00 => -39:25:00'},
        {skip:true, a: new Date(1992,11,5,0,0,0,100),  b:new Date(1992,11,6,15,25,0,200), expect:'1992-12-05 00:00:00.100 != 1992-12-06 15:25:00.200 => -39:25:00.100'},
        {skip:true, a: new Date(1462670136585+100250), b:new Date(1462670136585), expect:'00:01:40.250'},
    ].forEach(function(fixture){
        if(fixture.skip) {
            delete fixture.skip;
            it('skipped fixture: '+JSON.stringify(fixture));
            return true;
        }
        it("fixture: "+JSON.stringify(fixture), function(){
            // console.log("RES", JSON4all.stringify(discrepances(fixture.a, fixture.b)));
            // console.log("EXP", JSON4all.stringify(fixture.expect));
            expect(discrepances(fixture.a, fixture.b)).to.eql(fixture.expect);
            expect(JSON.stringify(discrepances(fixture.a, fixture.b))).to.eql(JSON.stringify(fixture.expect));
            expect(JSON4all.stringify(discrepances(fixture.a, fixture.b))).to.eql(JSON4all.stringify(fixture.expect));
        });
    });
});