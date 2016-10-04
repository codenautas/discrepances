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

discrepances = function discrepances(a, b){
    if(a === b){
        return null;
    }
    var typeA = getType(a);
    var typeB = getType(b);
    if(typeA === typeB) {
        if(typeA === 'number') {
            return {difference:a-b, values:[a,b]};
        }
    } else {
        return {types:[typeA,typeB], values:[a,b]}
    }
    // var rta='';
    // if(def && def.typeof && typeof obj !== def.typeof){
    //    rta+='typeof '+JSON.stringify(obj)+' !== '+JSON.stringify(def.typeof);
    // }
    // return rta || null;
}

return discrepances;

});