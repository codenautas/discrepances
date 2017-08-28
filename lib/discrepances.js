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
var changing = bestGlobals.changing;

function constructorName(object, opts){
    var name = bestGlobals.constructorName(object);
    return name==='anonymous' && !(opts||{}).distinguishAnonymous ? 'Object' : name;
}

function getType(variable) {
    if(null === variable) { return 'null'; }    
    return typeof variable;
}

function getClassOnlyForSomeOfBuiltIns(variable, opts) {
    if(variable instanceof Date  ) { return 'Date';   }
    if(variable instanceof RegExp) { return 'RegExp'; }
    if(variable instanceof Array ) { return 'Array';  }
    if(variable instanceof Error ) { return 'Error';  }
    if(variable instanceof Object) { return 'Object'; }
    /*eslint-disable no-proto */
    if(getType(variable)==='object' && ! variable.__proto__) { // jshint ignore:line
        return opts.duckTyping?'Object':'#null__proto__';
    }
    /*eslint-enable no-proto */
    throw new Error('undetected class type:' + typeof variable);
}

function timeStr(dt) { return datetime.ms(dt).toYmdHmsM().substr(11); }

function compareStrings(a,b) {
    var pos=-1, i, j;
    var pos=0;
    var rPos=0;
    while(pos<Math.min(a.length,b.length) && a[pos]==b[pos]) pos++;
    while(rPos>pos-Math.min(a.length,b.length) && a[a.length+rPos-1] == b[b.length+rPos-1]) rPos--;
    var answer={
        differences:[a.substring(pos, a.length+rPos), b.substring(pos, b.length+rPos), {pos:pos}],
        values:[a,b]
    };
    if(rPos){
        answer.differences[2].rPos = rPos;
    }
    return answer;
}

function objectWithProp(key, val) {
    var obj = {};
    obj[key] = val;
    return obj;
}

function compareArrayElem(resultArray, a, b, index, opts) {
    var diff = nestedObject(a[index], b[index], opts);
    resultArray.push(diff ? objectWithProp(index, diff) : null);
}

function compareArrays(a, b, opts) {
    var rv = {};
    var res=[];
    var max = Math.min(a.length, b.length);
    for(var i_ab=0; i_ab<max; ++i_ab){ compareArrayElem(res, a, b, i_ab, opts); }
    if(a.length !== b.length) { rv.length = nestedObject(a.length,b.length,opts); }
    res.forEach(function(r,index) {
        if(r && (index in r)) {
            rv[index] = r[index];
        }
    });
    if(rv.length) {
        return {array:rv};
    } else {
        var diffs={};
        /*jshint forin: false */
        /*eslint-disable guard-for-in */
        for(var p in rv) { diffs[p] = rv[p]; }
        /*jshint forin: true */
        /*eslint-enable guard-for-in */
        if(Object.keys(diffs).length) { return {array:diffs}; }
    }
    return null;
}

function compareDates(a, b) {
    if(a.getTime()===b.getTime()){
        var co = compareObjects(a,b,{unordered:true});
        if(co){
            return {date:co.object};
        }
        return null;
    }
    var res = [];
    var timesDiffer = timeStr(a) !== timeStr(b);
    var msDiff = a.getTime()-b.getTime();
    var showTimeDiff = Math.abs(msDiff) <= 359999000; // 99 * 60 * 60 * 1000 + 59 * 60 * 1000 + 59 * 1000;
    if(datetime.ms(a).toYmd() !== datetime.ms(b).toYmd()) {
        // aas[0]=ymd, aas[1]=hmsm
        var aas = datetime.ms(a).toYmdHmsM().split(' ');
        var bbs = datetime.ms(b).toYmdHmsM().split(' ');
        res.push(aas[0]);
        if(timesDiffer) {
            res.push(' ');
            res.push(aas[1].substr(0, a.getMilliseconds()?12:8));
        }
        res.push(' != ');
        res.push(bbs[0]);
        if(timesDiffer) {
            res.push(' ');
            res.push(bbs[1].substr(0, b.getMilliseconds()?12:8));
        }
        if(showTimeDiff && timesDiffer) { res.push(' => '); }
    }
    if(timesDiffer && showTimeDiff) {
        res.push(timeInterval({ms:msDiff}).toHms());
        var ms = Math.floor(Math.abs(msDiff) % 1000);
        if(ms>0) { res.push('.'+ms); }
    }
    return {difference:res.join(''), values:[a,b]};
}

function setPropertyIf(object, key, value, optionalCond) {
    if(optionalCond || value) { object[key] = value; }
}

function compareObjects(a, b, opts, hiddenAttrs) {
    var rv = {};
    var isOfClassError = !!hiddenAttrs;
    hiddenAttrs=hiddenAttrs||[];
    var aKeys = hiddenAttrs.concat(Object.keys(a));
    var bKeys = hiddenAttrs.concat(Object.keys(b));
    if(opts.unordered) {
        aKeys.forEach(function(key) { 
            setPropertyIf(rv, key, !(key in b) && !isOfClassError ? {onlyLeft:a[key]} : nestedObject(a[key], b[key], opts));
        });
        bKeys.forEach(function(key) {
            setPropertyIf(rv, key, !(key in a) && !isOfClassError ? {onlyRight:b[key]} : nestedObject(a[key], b[key], opts));
        });
        return Object.keys(rv).length ? (isOfClassError ? {error:rv} : {object:rv}) : null;
    } else {
        var diffs = {};
        aKeys.forEach(function(key,index) {
            var dif = {};
            var bKey = bKeys[index];
            var compKey = b[bKey];
            if(key !== bKey) {
                dif.keys = [key, bKey];
            } else {
                compKey = b[key];
            }
            setPropertyIf(dif, 'values', nestedObject(a[key], compKey, opts));
            if(dif.keys || dif.values) { diffs[index] = dif; }
        });
        // setPropertyIf(rv, 'differences', diffs, diffs.length);
        return Object.keys(diffs).length ?  {ord_object:diffs} : null;
    }
}

function compareClasses(classType, a, b, opts) {
    switch(classType) {
        case 'Array': return compareArrays(a, b, opts);
        case 'Date': return compareDates(a, b);
        case 'Object': return compareObjects(a, b, opts);
        case 'Error': return compareObjects(a, b, opts, ['message','fileName','lineNumber','name']);
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

function getName(type, variable, clase, opts) {
    return type==='object' && variable.constructor ? constructorName(variable, opts):clase;
}

function isNotContainerType(classType) {
    return ! classType.match(/^(array|object)$/i);
}

function compare(typeOfObjects, keyA, keyB, valA, valB) {
    var r={};
    r[typeOfObjects] = [keyA,keyB];
    if(isNotContainerType(keyA) && isNotContainerType(keyB)) {
        r.values = [valA,valB];
    }
    return r;
}

function nestedObject(a, b, opts){
    opts = changing(defaultOpts, opts||{});
    if(a === b){ return null; }
    /*eslint-disable eqeqeq */
    if(opts.autoTypeCast && a == b){ return null; }
    /*eslint-enable eqeqeq */
    if(b instanceof DiscrepancesTester){ return b.test(a)?null:{fail: b.message}; }
    var typeA = getType(a);
    var typeB = getType(b);
    if(typeA === typeB) {
        switch(typeA) {
            case 'number': return {difference:a-b, values:[a,b]};
            case 'string': return compareStrings(a, b);
            case 'boolean': return {values:[a, b]};
            case 'function': return compareFunctions(a, b, opts);
        }
        var classA = getClassOnlyForSomeOfBuiltIns(a, opts);
        var classB = getClassOnlyForSomeOfBuiltIns(b, opts);
        var nameA = getName(typeA,a,classA,opts);
        var nameB = getName(typeB,b,classB,opts);
        if(classA !== classB) {
            return compare('classes',nameA,nameB,a,b);
        } else if(!opts.duckTyping && nameA !== nameB /*&& a.constructor !== b.constructor*/) {
            return {classes:[nameA,nameB]};
        } else {
            return compareClasses(classA, a, b, opts);  
        }
    } else {
        return compare('types',typeA,typeB,a,b);
    }
}

function keying(falto, object, prefix){
    var isContainer=false;
    [{
        name:'array',
        left:"[",
        right:"]"
    },{
        name:'object',
        left:".",
        right:""
    },{
        name:'error',
        left:".",
        right:""
    },{
        name:'ord_object',
        left:"{",
        right:"}"
    }].forEach(function(container){
        if(object && container.name in object){
            var innerObject=object[container.name];
            for(var attr in innerObject){
                if(innerObject.hasOwnProperty(attr)){
                    keying(falto, innerObject[attr], prefix+container.left+attr+container.right);
                }
            }
            isContainer=true;
        }
    });
    if(!isContainer){
        if(object!=null){
            falto[prefix]=object;
        }
    }
}

discrepances = function discrepances(){
    var message="DEPRECATED! Discrepances is no more a function. Use discprepances.showAndThrow or discrepances.nestedObject";
    console.log(message);
    throw new Error(message);
};

discrepances.flatten = function flatten(a, b, opts){
    var nested = nestedObject(a, b, opts);
    var falto={};
    keying(falto, nested, "");
    return falto;
};

discrepances.showAndThrow = function showAndThrow(a, b, opts){
    var keyDiffs = discrepances.flatten(a, b, opts);
    var firstError;
    for(var attr in keyDiffs){
        if(keyDiffs.hasOwnProperty(attr)){
            if(!firstError){
                try{
                    firstError=attr+":"+JSON.stringify(keyDiffs[attr]);
                }catch(err){
                    firstError=attr+":"+keyDiffs[attr];
                }
            }
            console.log(attr, keyDiffs[attr]);
        }
    }
    if(firstError){
        throw new Error("discrepances in "+firstError);
    }
};

discrepances.nestedObject = nestedObject;

discrepances.test = function discrepancesTest(tester){
    return new DiscrepancesTester(tester);
};

return discrepances;

});