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

function getType(variable) {
    if(null === variable) { return 'null'; }
    return typeof variable;
}

function getClass(variable) {
    if(variable instanceof Date) { return 'Date'; }
    if(variable instanceof RegExp) { return 'RegExp'; }
    if(variable instanceof Array) { return 'Array'; }
    if(variable instanceof Object) { return 'Object'; }
    throw new Error('undetected class type');
}

function compare(resultArray, a, b, index) {
    var diff = discrepances(a[index], b[index]);
    resultArray.push(diff || null);
}

function setIfDiff(obj, key, val) { if(val) { obj[key] = val; } }

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
    return {difference:{left:a.substring(pos, i+2), right:b.substring(pos, j+2), pos:pos}};
}

function compareArrays(resultObject, a, b) {
    var res=[];
    var max = Math.min(a.length, b.length);
    for(var i_ab=0; i_ab<max; ++i_ab){ compare(res, a, b, i_ab); }
    if(a.length !== b.length) { resultObject.length = discrepances(a.length,b.length); }
    res.forEach(function(r,index) { if(r) { resultObject[index] = r; } });
}

function compareDates(resultObject, a, b) {
    var timesDiffer = timeStr(a) !== timeStr(b);
    var msDiff = a.getTime()-b.getTime();
    var showTimeDiff = Math.abs(msDiff) <= 359999000; // 99 * 60 * 60 * 1000 + 59 * 60 * 1000 + 59 * 1000;
    if(datetime(a).toYmd() !== datetime(b).toYmd()) {
        var aas = datetime(a).toYmdHmsM();
        var bbs = datetime(b).toYmdHmsM();
        var left=[], right=[];
        left.push(aas.slice(0, 10));
        if(timesDiffer) {
            left.push(' ');
            left.push(aas.substr(11, a.getMilliseconds()?12:8));
        }
        right.push(bbs.slice(0, 10));
        if(timesDiffer) {
            right.push(' ');
            right.push(bbs.substr(11, b.getMilliseconds()?12:8));
        }
        resultObject.left = left.join('');
        resultObject.right = right.join('');
    }
    if(timesDiffer && showTimeDiff) {
        var diff=[];
        diff.push(timeInterval(msDiff).toHms());
        var ms = Math.floor(Math.abs(msDiff) % 1000);
        if(ms>0) { diff.push('.'+ms); }
        resultObject.diff = diff.join('');
    }
}

discrepances = function discrepances(a, b){
    if(a === b){
        return null;
    }
    var typeA = getType(a);
    var typeB = getType(b);
    if(typeA === typeB) {
        if(typeA === 'number') { return {difference:a-b, values:[a,b]}; }
        if(typeA === 'string') {
            return compareStrings(a, b);
        }
        if(typeA==='object' && typeB==='object') {
            var classA = getClass(a);
            var classB = getClass(b);
            if(classA !== classB) {
                return {classes:[classA,classB], values:[a,b]};
            } else {
                var rv = {};
                if(classA==='Array') {
                    compareArrays(rv, a, b);
                    return rv.length ? {array:rv} : null;
                } else if(classA==='Date') {
                    compareDates(rv, a, b);
                    return Object.keys(rv).length ?  {difference:rv, values:[a,b]} : null;
                } else if(classA==='Object') {
                    Object.keys(a).forEach(function(key) {
                        setIfDiff(rv, key, !(key in b) ? {onlyLeft:a[key]} : discrepances(a[key], b[key]));
                    });
                    Object.keys(b).forEach(function(key) {
                        setIfDiff(rv, key, !(key in a) ? {onlyRight:b[key]} : discrepances(a[key], b[key]));
                    });
                    return Object.keys(rv).length ?  {object:rv} : null;
                }
            }
        }
    } else {
        return {types:[typeA,typeB], values:[a,b]};
    }
};

return discrepances;

});