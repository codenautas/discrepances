# discrepances
Shows differences between different values


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
    discrepances.showAndThrow(a,b,{context:'this message'})
});
```

# Install
```sh
$ npm install discrepances
```

![extending](https://img.shields.io/badge/stability-extending-orange.svg)
[![npm-version](https://img.shields.io/npm/v/discrepances.svg)](https://npmjs.org/package/discrepances)
[![downloads](https://img.shields.io/npm/dm/discrepances.svg)](https://npmjs.org/package/discrepances)
[![build](https://img.shields.io/travis/codenautas/discrepances/master.svg)](https://travis-ci.org/codenautas/discrepances)
[![coverage](https://img.shields.io/coveralls/codenautas/discrepances/master.svg)](https://coveralls.io/r/codenautas/discrepances)
[![climate](https://img.shields.io/codeclimate/github/codenautas/discrepances.svg)](https://codeclimate.com/github/codenautas/discrepances)
[![dependencies](https://img.shields.io/david/codenautas/discrepances.svg)](https://david-dm.org/codenautas/discrepances)
[![qa-control](http://codenautas.com/github/codenautas/discrepances.svg)](http://codenautas.com/github/codenautas/discrepances)



language: ![English](https://raw.githubusercontent.com/codenautas/multilang/master/img/lang-en.png)
also available in:
[![Spanish](https://raw.githubusercontent.com/codenautas/multilang/master/img/lang-es.png)](LEEME.md)

## License

[MIT](LICENSE)

