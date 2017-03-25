"use strict";

var JSON4all = require('json4all');
var expect = require('expect.js');
var discrepances = require('../lib/discrepances.js');
var idiscrepances = discrepances.nestedObject;
var fdiscrepances = discrepances.flatten;
var showAndThrow = discrepances.showAndThrow;

var auditCopy = require('audit-copy');

var assert = require('assert');

var equalComparation = assert.deepStrictEqual || assert.deepEqual;

var date = require('best-globals').date;

var fechaActual = new Date();

function Example(ini){
    for(var name in ini){
        this[name]=ini[name];
    }
}
Example.prototype.protoFunction = function(){};

function anonymous(object){
    return new function(object){
        for(var name in object) this[name]=object[name];
    }(object);
}

var no = new NonObject(7);
no.__proto__=null;

function f1(a) { return a; }
function f2(a) { return a; }
function f3(b) { return b; }

function touchedDate(d){
    var date = new Date(d);
    date.touched = true;
    return date;
}

describe("discrepances", function(){
    // maximo numero de columnas: 128
    var fixtures = [
        {a:4                     , b:4                  , expect:null               ,expectDis:{}                            },
        {a:4                     , b:5                  , expect:{difference:-1             , values:[4, 5]}                 },
        {a:"4"                   , b:4                  , expect:{types:['string', 'number'], values:["4", 4]}               },
        {a:null                  , b:0                  , expect:{types:['null'  , 'number'], values:[null, 0]}              },
        {a:fechaActual           , b:/a/                , expect:{classes:['Date', 'RegExp'], values:[fechaActual, /a/]}     },
        {a:[1,2,3,4,5]           , b:[1,2,33,4,5,6]     , expect:{array:{length:idiscrepances(5,6), 2:idiscrepances(3,33)}}    },
        {a:[1,2,3,4,5]           , b:[1,2,3,4,5]        , expect:null                                                        },
        {a:{x:1, y:2}            , b:{y:3, z:{zz:3}}    ,
         expect:{object:{x:{onlyLeft:1}, y:idiscrepances(2,3), z:{onlyRight:{zz:3}}}}
        },
        {a:{x:1, y:2, z:[3]}     , b:{x:1, y:2, z:[3]}  , expect:null                                                        },
        {a:"un string"           , b:"un string"        , expect:null                                                        },
        {a:"un negro pez"        , b:"un blanco pez"    ,
         expect:{differences: ['negro', 'blanco', {pos:3}], values:["un negro pez", "un blanco pez"]}
        },
        {a:"un pez negro"        , b:"un pez blanco"    ,
         expect:{differences: ['negro', 'blanco', {pos:7}], values:["un pez negro", "un pez blanco"]}
        },
        {a:"negro el ocho"       , b:"rojo el ocho"     ,
         expect:{differences: ['negro', 'rojo'  , {pos:0}], values:["negro el ocho", "rojo el ocho"]}
        },
        {a:null                  , b:undefined          , expect:{types:['null', 'undefined'], values:[null, undefined]}     },
        {a:{a:7, b:[]}           , b:fechaActual        , expect:{classes:['Object', 'Date']}                                },
        {a:{a:7, b:[]}           , b:"one string"       , expect:{types:['object', 'string']}                                },
        {a:{x:1, y:2, z:[3], d:4,  e:[{j:3, k:4, m:['a', 'b']}]}, 
         b:{x:1, y:2, z:[3], d:44, e:[{j:3, k:4, m:['a']     }]}, 
         expect:{
            object: {
                d: { difference: -40, values: [4, 44]},
                e: { array:{0:{ object:{
                    m:{array:{length: idiscrepances(2,1)}}
                }}}}
            }
         },         
         expectDis:{
            '.d': { difference: -40, values: [4, 44]},
            '.e[0].m[length]': idiscrepances(2,1)
         }
        },
        {a:["one"]               , b:["one",2]          , expect:{array:{length:idiscrepances(1,2)}}                          },
        {a:undefined             , b:1                  , expect:{types:['undefined', 'number'], values:[undefined, 1]}      },
        {a:undefined             , b:false              , expect:{types:['undefined', 'boolean'], values:[undefined, false]} },
        {a:new Example({uno:1})  , b:new Example({uno:1})           , expect:null                                            },
        {a:new Example({uno:1})  , b:{uno:1}                        , expect:{classes:['Example', 'Object']}                 },
        {a:new Example({uno:1})  , b:[1,2]                          , expect:{classes:['Example', 'Array']}                  },
        {a:new Example({uno:1})  , b:new Example({uno:2})           , expect:{object:{"uno":idiscrepances(1,2)}}              },
        {a:{0:1, length:1}       , b:{0:1,1:2,length:2}             ,
         expect:{object:{length:idiscrepances(1,2), 1:{onlyRight:2}}}
        },
        {a:{last:'Simpson', name:'Bart'}   , b:{last:'Simpson', name:'Lisa'}  ,
         expect:{object:{"name":idiscrepances("Bart","Lisa")}}
        },
        {a:{name:'Hommer', last:'Simpson'} , b:{last:'Simpson', name:'Hommer'}, expect:null                                  },
        {a:{name:'Hommer', age:40}         , b:{name:'Hommer'}                , expect:{object:{"age":{"onlyLeft":40}}}      },
        {a:{name:'Hommer'}                 , b:{name:'Hommer', age:40}        , expect:{object:{"age":{"onlyRight":40}}}     },
        {a:{one:'un', two:'dos'}           , b:{two:'dos', one:'un'},
         expect:{
             ord_object:{
                 0:{keys:['one','two'], values:idiscrepances('un','dos')},
                 1:{keys:['two','one'], values:idiscrepances('dos','un')},
             }
         },
         opts:{unordered:false}
        },
        {a:{one:'un', two:'dos'}           ,b:{one:'un', zwei:'dos'}          ,
         expect:{
             ord_object:{
                 1:{keys:['two','zwei']},
             }
         },
         opts:{unordered:false}
        },
        {a:{one:'un', two:'dos', three:3, vier:4}   ,b:{one:'un', zwei:'dos', drei:3, vier:4}          ,
         expect:{
             ord_object:{
                 1:{keys:['two','zwei']},
                 2:{keys:['three','drei']},
             }
         },
         opts:{unordered:false}
        },
        {a:[{a:'A', b:'B', c:'C'}]         , b:[{a:'a', b:'B', c:'C'}]        ,
         expect:{array:{0:{object:{a:idiscrepances('A','a')} }}}
        },
        {a:[{a:'A', b:'B', c:'C'},1]         , b:[{a:'a', b:'B', c:'C'},2]    ,
         expect:{array:{0:{object:{a:idiscrepances('A','a')} },1:idiscrepances(1,2)}}
        },
        {a:{one:'un', two:'dos'}           , b:{one:'ein', zwei:'dos'}        ,
         expect:{
             ord_object:{
                 0:{values:idiscrepances('un','ein')},
                 1:{keys:['two','zwei']},
             }
         },
         opts:{unordered:false}
        },
        {a:{one:'un' , two:'dos' , cuatro:'cuatro', tres:'tres'},
         b:{one:'ein', zwei:'dos', cuatro:'cuatro', drei:'three'},
         expect:{
             ord_object:{
                 0:{values:idiscrepances('un','ein')},
                 1:{keys:['two','zwei']},
                 3:{keys:['tres','drei'], values:idiscrepances('tres','three')},
             }
         },
         opts:{unordered:false},
         expectDis:{
             "{0}":{values:idiscrepances('un','ein')},
             "{1}":{keys:['two','zwei']},
             "{3}":{keys:['tres','drei'], values:idiscrepances('tres','three')},
         }
        },
        {a:anonymous({z:7})                , b:anonymous({z:7})  , expect:null             , opts:{distinguishAnonymous:true}},
        {a:anonymous({z:7}), 
         b:{z:7}, 
         expect:{classes:['anonymous','Object']},
         opts:{distinguishAnonymous:true}
        },
        {a:anonymous({z:7})                , b:{z:7}             , expect:null                  },
        {a:new Example({uno:1})            , b:{uno:1}           , expect:null                  , opts:{duckTyping:true}     },
        {a:7                               , b:"7"               , expect:null                  , opts:{autoTypeCast:true}   },
        {a:7                               , b:"7"               , expect:idiscrepances(7, "7")  , opts:{autoTypeCast:false}  },
        {a:76                              , b:"76"              , expect:idiscrepances(76, "76"),                            },
        {a:{a:7}                           , b:no                , expect:null                  , opts:{duckTyping:true}     },
        {a:{a:7}                           , b:no                , expect:{classes:['Object', '#null__proto__']}             },
        {a:false                           , b:true              , expect:{values:[false, true]}                             },
        {a:undefined                       , b:undefined         , expect:null                                               },
        {a:f1                              , b:f1                , expect:null                                               },
        {a:function(a){}                   , b:function(a){}     , expect:null                                               },
        {a:f1                              , b:f2                , expect:idiscrepances(f1.toString(), f2.toString())         },
        {a:{a:'a', b:[]}, b:{a:'A', b:discrepances.test(Array.isArray)}, expect:{object:{a:idiscrepances('a', 'A')}}          },
        {a:{a:'a', b:'b'}, b:{a:'a', b:discrepances.test(Array.isArray)}, expect:{object:{b:{fail:'isArray'}}}               },
        {a:{a:'A',b:'B',c:'C'}             , b:{e:'E',f:'F',a:'A'},
         expect:{object:{'b':{'onlyLeft':'B'}, 'c':{'onlyLeft':'C'}, 'e':{'onlyRight':'E'}, 'f':{'onlyRight':'F'}}}
        },
        {a:new Date("2017-01-02")          , b:touchedDate("2017-01-02")  , expect:{date: {touched: {onlyRight: true}}}      },
    ];
    // esto es para evitar que values:[] tenga fechas distintas a 'a' y 'b'
    var dateFixtures = [
        {a:fechaActual                     , b:fechaActual                    , difference: null                             },
        {a:new Date(10511,1,3)             , b:new Date(10511,1,4)            , difference:'10511-02-03 != 10511-02-04'      },
        {a:new Date(511,1,3)               , b:new Date(511,1,4)              , difference:'511-02-03 != 511-02-04'          },
        {a:new Date(2011,1,3)              , b:new Date(2011,1,4)             , difference:'2011-02-03 != 2011-02-04'        },
        {a:new Date(1992,11,5)             , b:new Date(1935,8,1)             , difference:'1992-12-05 != 1935-09-01'        },
        {a:new Date(1992,11,5,10,0,0)      , b:new Date(1935,8,1,15,0,0)      ,
         difference:'1992-12-05 10:00:00 != 1935-09-01 15:00:00'
        },
        {a:new Date(1992,11,5,15,0,0)      , b:new Date(1992,11,5,10,10,0)    , difference:'04:50:00'                        },
        {a:new Date(1992,11,5,0,0,0)       , b:new Date(1992,11,6,15,25,0)    ,
         difference:'1992-12-05 00:00:00 != 1992-12-06 15:25:00 => -39:25:00'
        },
        {a:new Date(1992,11,5,0,0,0,100)   , b:new Date(1992,11,6,15,25,0,200),
         difference:'1992-12-05 00:00:00.100 != 1992-12-06 15:25:00.200 => -39:25:00.100'
        },
        {a:new Date(1462670136585+100250)  , b:new Date(1462670136585)        , difference:'00:01:40.250'},
        {a:new Date("2017-01-02")          , b:new Date("2017-01-02")         , difference:null          },
        {a:date.iso("2017-01-02")          , b:date.iso("2017-01-02")         , difference:null          },
    ];
    dateFixtures.forEach(function(fixture) {
        fixtures.push({
            isDate:true,
            skip: fixture.skip, a:fixture.a, b:fixture.b,
            expect:(fixture.difference ? {difference: fixture.difference, values:[fixture.a, fixture.b]} : null)
        });
    });
    fixtures.forEach(function(fixture){
        if(fixture.skip) {
            it('skipped: '+JSON.stringify(fixture.skip)+' '+JSON.stringify(fixture));
            delete fixture.skip;
            return true;
        }
        it("internal fixture: "+(fixture.isDate?'Date: ':'')+JSON.stringify(fixture), function(){
            var auditCopyFixture = auditCopy.inObject(fixture);
            var expJ = JSON.stringify(fixture.expect);
            var expJA = JSON4all.stringify(fixture.expect);
            var res = idiscrepances(fixture.a, fixture.b, fixture.opts);
            equalComparation(auditCopy.inObject(fixture),auditCopyFixture);
            var resJ = JSON.stringify(res);
            var resJA = JSON4all.stringify(res);
            if(resJA !== expJA) { console.log("RES", resJA); console.log("EXP", expJA); console.log(" JS", resJ); }
            expect(res).to.eql(fixture.expect);
            expect(resJ).to.eql(expJ);
            expect(resJA).to.eql(expJA);
        });
        if(fixture.expectDis){
            it("discrepances fixture: "+(fixture.isDate?'Date: ':'')+JSON.stringify(fixture), function(){
                var auditCopyFixture = auditCopy.inObject(fixture);
                var expJ = JSON.stringify(fixture.expectDis);
                var expJA = JSON4all.stringify(fixture.expectDis);
                var res = fdiscrepances(fixture.a, fixture.b, fixture.opts);
                equalComparation(auditCopy.inObject(fixture),auditCopyFixture);
                var resJ = JSON.stringify(res);
                var resJA = JSON4all.stringify(res);
                if(resJA !== expJA) { console.log("RES", resJA); console.log("EXP", expJA); console.log(" JS", resJ); }
                expect(res).to.eql(fixture.expectDis);
                expect(resJ).to.eql(expJ);
                expect(resJA).to.eql(expJA);
            });
        }
    });
});

describe("using in testing", function(){
    it("pass when objects don't have discrepances", function(){
        discrepances.showAndThrow({
            d: new Date(2010,10,10),
            r: /123/,
            s: "hello",
            n: 1.23456
        },{
            d: new Date(2010,10,10),
            r: /123/,
            s: "hello",
            n: 1.23456
        });
    });
    it("throw Exception when objects have discrepances", function(done){
        var d=new Date(2010,10,10);
        d.more='more info';
        try{
            discrepances.showAndThrow({
                d: d,
                r: /123/,
                s: "hello",
                n: 1.23456
            },{
                d: new Date(2010,10,10),
                r: /123/,
                s: "hello",
                n: 1.23456
            });
            done(new Error("Must throw error inside showAndThrow"));
        }catch(err){
            console.log(err);
            if(err.message.match(/discrepances in /)){
                done();
            }else{
                done(new Error("Must throw other Error showAndThrow. Not: "+err));
            }
        }
    });
});

function NonObject(a){
    this.a=a;
}
