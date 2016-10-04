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

discrepances = function discrepances(obj, def){
    var rta='';
    if(def && def.typeof && typeof obj !== def.typeof){
        rta+='typeof '+JSON.stringify(obj)+' !== '+JSON.stringify(def.typeof);
    }
    return rta || null;
}

return discrepances;

});