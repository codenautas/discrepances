<!--multilang v0 es:LEEME.md en:README.md -->
# discrepances
<!--lang:es-->
Muestra las diferencias entre distintos valores de distintos tipos

<!--lang:en--]
Shows differences between different values

[!--lang:*-->

<!--lang:es-->
## Uso
<!--lang:en--]
## Use
[!--lang:*-->

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
<!--lang:es-->
Detecta discrepancias entre los objetos a y b. 

Devuelve un objeto descriptivo con estructura similar a los objetos a y b 
donde solo están las "ramas diferentes y la descrpición de su diferencia".

Si no hay discrepancias devuelve `null`.
<!--lang:en--]
(see spanish)
[!--lang:*-->

## discrepances.flatten(a,b[, opts])
<!--lang:es-->
Detecta discrepancias entre los objetos a y b. 

Devuelve un objeto descriptivo simple 
que tiene en las claves una descripción del camino a la diferencia
y en el valor la descripción de la diferencia.

Si no hay discrepancias devuelve `null`.
<!--lang:en--]
(see spanish)
[!--lang:*-->

## discrepances.showAndThrow(a, b[, opts])
<!--lang:es-->
Controla que no haya discrepancias entre los objetos a y b,
si la hay lanza una excepción y muestra las discrepancias en un `console.log`

Está diseñado para usar dentro de los test automáticos (ej: con `mocha`);
<!--lang:en--]
(see spanish)
[!--lang:*-->

```js
var discrepances = require('discrepances');

var a={x:1, y:2, z:[3], d:4,  e:[{j:3, k:4, m:['a', 'b']}]}; 
var b={x:1, y:2, z:[3], d:44, e:[{j:3, k:4, m:['a']     }]};

it("compares a with b", function(){
    discrepances.showAndThrow(a,b,{showContext:'this message'})
});
```

<!--lang:es-->
# Instalación
<!--lang:en--]
# Install
[!--lang:*-->
```sh
$ npm install discrepances
```

<!-- cucardas -->
![extending](https://img.shields.io/badge/stability-extending-orange.svg)
[![npm-version](https://img.shields.io/npm/v/discrepances.svg)](https://npmjs.org/package/discrepances)
[![downloads](https://img.shields.io/npm/dm/discrepances.svg)](https://npmjs.org/package/discrepances)
[![build](https://img.shields.io/travis/codenautas/discrepances/master.svg)](https://travis-ci.org/codenautas/discrepances)
[![coverage](https://img.shields.io/coveralls/codenautas/discrepances/master.svg)](https://coveralls.io/r/codenautas/discrepances)
[![climate](https://img.shields.io/codeclimate/github/codenautas/discrepances.svg)](https://codeclimate.com/github/codenautas/discrepances)
[![dependencies](https://img.shields.io/david/codenautas/discrepances.svg)](https://david-dm.org/codenautas/discrepances)
[![qa-control](http://codenautas.com/github/codenautas/discrepances.svg)](http://codenautas.com/github/codenautas/discrepances)


<!--multilang buttons-->

idioma: ![castellano](https://raw.githubusercontent.com/codenautas/multilang/master/img/lang-es.png)
también disponible en:
[![inglés](https://raw.githubusercontent.com/codenautas/multilang/master/img/lang-en.png)](README.md)

<!--lang:es-->
## Licencia
<!--lang:en--]
## License
[!--lang:*-->

[MIT](LICENSE)

