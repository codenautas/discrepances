# discrepances
Shows differences between different values

[![build](https://github.com/codenautas/discrepances/actions/workflows/build-and-test.yml/badge.svg)](https://github.com/codenautas/discrepances/actions/workflows/build-and-test.yml)

[![npm-version](https://img.shields.io/npm/v/discrepances.svg)](https://npmjs.org/package/discrepances)
[![downloads](https://img.shields.io/npm/dm/discrepances.svg)](https://npmjs.org/package/discrepances)
[![build](https://github.com/codenautas/discrepances/actions/workflows/build-and-test.yml/badge.svg)](https://github.com/codenautas/discrepances/actions/workflows/build-and-test.yml)
[![coverage](https://img.shields.io/coveralls/codenautas/discrepances/master.svg)](https://coveralls.io/r/codenautas/discrepances)
[![qa-control](https://github.com/codenautas/discrepances/actions/workflows/qa-control.yml/badge.svg)](https://github.com/codenautas/discrepances/actions/workflows/qa-control.yml)


language: ![English](https://raw.githubusercontent.com/codenautas/multilang/master/img/lang-en.png)
also available in:
[![Spanish](https://raw.githubusercontent.com/codenautas/multilang/master/img/lang-es.png)](LEEME.md)

## Use

```js
var discrepances = require('discrepances');

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
```

# API

## discrepances.nestedObject(a,b[, opts])
(see spanish)

## discrepances.flatten(a,b[, opts])
(see spanish)

## discrepances.showAndThrow(a, b[, opts])
(see spanish)

```js
var discrepances = require('discrepances');

var a={x:1, y:2, z:[3], d:4,  e:[{j:3, k:4, m:['a', 'b']}]};
var b={x:1, y:2, z:[3], d:44, e:[{j:3, k:4, m:['a']     }]};

it("compares a with b", function(){
    discrepances.showAndThrow(a,b,{showContext:'this message'})
});
```

# Install
```sh
$ npm install discrepances
```

## License

[MIT](LICENSE)
