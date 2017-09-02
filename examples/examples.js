var discrepances = require('..');

var a={x:1, y:2, z:[3], d:4,  e:[{j:3, k:4, m:['a', 'b']}]}; 
var b={x:1, y:2, z:[3], d:44, e:[{j:3, k:4, m:['a']     }]};

var detectedDiscrepances = discrepances.nestedObject(a,b)
if(detectedDiscrepances){
    console.dir(detectedDiscrepances, {depth:9});
}
/*
{ 
  object:{ 
    d:{ difference: -40, values: [ 4, 44 ] },
    e:{ 
      array:{
        '0':{ 
          object:{ 
            m:{ 
              array:{ length:{ difference: 1, values: [ 2, 1 ] } } 
            } 
          }
        }
      }
    }
  }
}
*/
var detectedDiscrepances = discrepances.flatten(a,b)
if(detectedDiscrepances){
    console.log(detectedDiscrepances);
}
/*
{ 
  '.d': { difference: -40, values: [ 4, 44 ] },
  '.e[0].m[length]': { difference: 1, values: [ 2, 1 ] } 
}
*/

console.log('x',{a:undefined, b:null});
