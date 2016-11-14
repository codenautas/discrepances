"use strict";

(function codenautasModuleDefinition(root, name, factory) {
    /* global define */
    /* istanbul ignore next */
    if(typeof root.globalModuleName !== 'string'){
        root.globalModuleName = name;
    }
    /* istanbul ignore next */
    if(typeof exports === 'object' && typeof module === 'object'){
        module.exports = factory();
    }else if(typeof define === 'function' && define.amd){
        define(factory);
    }else if(typeof exports === 'object'){
        exports[root.globalModuleName] = factory();
    }else{
        root[root.globalModuleName] = factory();
    }
    root.globalModuleName = null;
})(/*jshint -W040 */this, 'discrepances', function() {
/*jshint +W040 */

/*jshint -W004 */
var discrepances = {};
/*jshint +W004 */

/*eslint global-require: 0*/
var bestGlobals = require('best-globals');

var datetime = bestGlobals.datetime;
var timeInterval = bestGlobals.timeInterval;
var constructorName = bestGlobals.constructorName;
var changing = bestGlobals.changing;

function getType(variable) {
    if(null === variable) { return 'null'; }    
    return typeof variable;
}

function getClassOnlyForSomeOfBuiltIns(variable, opts) {
    if(variable instanceof Date) { return 'Date'; }
    if(variable instanceof RegExp) { return 'RegExp'; }
    if(variable instanceof Array) { return 'Array'; }
    if(variable instanceof Object) { return 'Object'; }
    /*eslint-disable no-proto */
    if(getType(variable)==='object' && ! variable.__proto__) { // jshint ignore:line
        return opts.duckTyping?'Object':'#null__proto__';
    }
    /*eslint-enable no-proto */
    throw new Error('undetected class type:' + typeof variable);
}

function timeStr(dt) { return datetime(dt).toYmdHmsM().substr(11); }

function compareStrings(a,b) {
    var pos=-1, i, j;
    for(i=0; i<Math.min(a.length,b.length); ++i) {
        if(a[i] !== b[i]) {
           pos = i;
           break;
        }
    }
    for(j=b.length-1, i=a.length-1; i>=0; --j,--i) {
        if(a[i] !== b[j]) { break; }
    }
    return {
        differences:[a.substring(pos, i+2), b.substring(pos, j+2), {pos:pos}],
        values:[a,b]
    };
}

function objectWithProp(key, val) {
    var obj = {};
    obj[key] = val;
    return obj;
}

function compareArrayElem(resultArray, a, b, index, opts) {
    var diff = discrepances(a[index], b[index], opts);
    resultArray.push(diff ? objectWithProp(index, diff) : null);
}

function compareArrays(a, b, opts) {
    var rv = {};
    var res=[];
    var max = Math.min(a.length, b.length);
    for(var i_ab=0; i_ab<max; ++i_ab){ compareArrayElem(res, a, b, i_ab, opts); }
    if(a.length !== b.length) { rv.length = discrepances(a.length,b.length,opts); }
    res.forEach(function(r,index) {
        if(r && (index in r)) {
            rv[index] = r[index];
        }
    });
    if(rv.length) {
        return {array:rv};
    } else {
        /*jshint forin: false */
        /*eslint-disable guard-for-in */
        for(var p in rv) {
            return {array:objectWithProp(p,rv[p])};
        }
        /*jshint forin: true */
        /*eslint-enable guard-for-in */
    }
    return null;
}

function compareDates(a, b) {
    var res = [];
    var timesDiffer = timeStr(a) !== timeStr(b);
    var msDiff = a.getTime()-b.getTime();
    var showTimeDiff = Math.abs(msDiff) <= 359999000; // 99 * 60 * 60 * 1000 + 59 * 60 * 1000 + 59 * 1000;
    if(datetime(a).toYmd() !== datetime(b).toYmd()) {
        var aas = datetime(a).toYmdHmsM();
        var bbs = datetime(b).toYmdHmsM();
        res.push(aas.slice(0, 10));
        if(timesDiffer) {
            res.push(' ');
            res.push(aas.substr(11, a.getMilliseconds()?12:8));
        }
        res.push(' != ');
        res.push(bbs.slice(0, 10));
        if(timesDiffer) {
            res.push(' ');
            res.push(bbs.substr(11, b.getMilliseconds()?12:8));
        }
        if(showTimeDiff && timesDiffer) { res.push(' => '); }
    }
    if(timesDiffer && showTimeDiff) {
        res.push(timeInterval(msDiff).toHms());
        var ms = Math.floor(Math.abs(msDiff) % 1000);
        if(ms>0) { res.push('.'+ms); }
    }
    return {difference:res.join(''), values:[a,b]};
}

function setPropertyIf(object, key, value, optionalCond) {
    if(optionalCond || value) { object[key] = value; }
}

function compareObjects(a, b, opts) {
    var rv = {};
    var aKeys = Object.keys(a);
    var bKeys = Object.keys(b);
    if(opts.unordered) {
        aKeys.forEach(function(key) { 
            setPropertyIf(rv, key, !(key in b) ? {onlyLeft:a[key]} : discrepances(a[key], b[key], opts));
        });
        bKeys.forEach(function(key) {
            setPropertyIf(rv, key, !(key in a) ? {onlyRight:b[key]} : discrepances(a[key], b[key], opts));
        });
    } else {
        var diffs = [];
        aKeys.forEach(function(key,index) {
            var dif = {pos:index};
            var bKey = bKeys[index];
            var compKey = b[bKey];
            if(key !== bKey) {
                dif.keys = [key, bKey];
            } else {
                compKey = b[key];
            }
            setPropertyIf(dif, 'values', discrepances(a[key], compKey, opts));
            if(dif.keys || dif.values) { diffs.push(dif); }
        });
        setPropertyIf(rv, 'differences', diffs, diffs.length);
    }
    return Object.keys(rv).length ?  {object:rv} : null;
}

function compareClasses(classType, a, b, opts) {
    switch(classType) {
        case 'Array': return compareArrays(a, b, opts);
        case 'Date': return compareDates(a, b);
        case 'Object': return compareObjects(a, b, opts);
    }
}

function compareFunctions(a, b, opts) {
    var as = a.toString();
    var bs = b.toString();
    if(as === bs) { return null; }
    return compareStrings(as, bs);
}

var defaultOpts = {
    unordered:true,
    duckTyping:false,
    autoTypeCast:false
};

function DiscrepancesTester(tester){
    this.test = tester;
    this.message = bestGlobals.functionName(tester);
}

function getName(type, variable, clase) {
    return type==='object' && variable.constructor ? constructorName(variable):clase;
}

function isNotContainerType(classType) {
    return ! classType.match(/^(array|object)$/i);
}

discrepances = function discrepances(a, b, opts){
    opts = changing(defaultOpts, opts||{});
    if(a === b){ return null; }
    /*eslint-disable eqeqeq */
    if(opts.autoTypeCast && a == b){ return null; }
    /*eslint-enable eqeqeq */
    if(b instanceof DiscrepancesTester){
        return b.test(a)?null:{fail: b.message};
    }
    var typeA = getType(a);
    var typeB = getType(b);
    if(typeA === typeB) {
        if(typeA === 'number') { return {difference:a-b, values:[a,b]}; }
        if(typeA === 'string') { return compareStrings(a, b); }
        if(typeA === 'boolean') { return {values:[a, b]}; }
        if(typeA === 'function') { return compareFunctions(a, b, opts); }
        if(typeA==='object' && typeB==='object') {
            var classA = getClassOnlyForSomeOfBuiltIns(a, opts);
            var classB = getClassOnlyForSomeOfBuiltIns(b, opts);
            var nameA = getName(typeA,a,classA);
            var nameB = getName(typeB,b,classB);
            if(classA !== classB) {
                var r = {classes:[nameA,nameB]};
                if(isNotContainerType(classA) && isNotContainerType(classB)) {
                    r.values=[a,b];
                }
                return r;
            } else if(!opts.duckTyping && a.constructor !== b.constructor) {
                return {classes:[nameA,nameB]};
            } else {
                return compareClasses(classA, a, b, opts);  
            }
        }
    } else {
        var r2={types:[typeA,typeB]};
        if(isNotContainerType(typeA) && isNotContainerType(typeB)) {
            r2.values = [a,b];
        }
        return r2;
    }
};

discrepances.test = function discrepancesTest(tester){
    return new DiscrepancesTester(tester);
};

return discrepances;

});