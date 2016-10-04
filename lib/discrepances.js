"use strict";
/*jshint eqnull:true */
/*jshint node:true */

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

discrepances = function discrepances(a, b){
    if(a === b){
        return null;
    }
    var typeA = getType(a);
    var typeB = getType(b);
    //console.log("typeA", typeA, "typeB", typeB)
    if(typeA === typeB) {
        if(typeA==='object' || typeB==='object') {
            var classA = getClass(a);
            var classB = getClass(b);
            //console.log("classA", classA, "classB", classB)
            if(classA !== classB) {
                return {classes:[classA,classB], values:[a,b]};
            } else {
                var rv = {};
                if(classA==='Array') {
                    var res=[];
                    var max = Math.min(a.length, b.length);
                    for(var i_ab=0; i_ab<max; ++i_ab){
                        compare(res, a, b, i_ab);
                    }
                    res.forEach(function(r,index) {
                        if(r) { rv[index] = r; }
                    });
                    if(a.length !== b.length) {
                        rv.length = discrepances(a.length,b.length);
                    }
                    return rv.length ? {array:rv} : null;
                } else if(classA==='Object') {
                    function setIfDiff(obj, key, val) { if(val) { obj[key] = val; } }
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
        if(typeA === 'number') {
            return {difference:a-b, values:[a,b]};
        }
    } else {
        return {types:[typeA,typeB], values:[a,b]}
    }
}

return discrepances;

});