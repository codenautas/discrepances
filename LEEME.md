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
    
console.log(JSON.stringify(discrepances(a, b)));

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
![designing](https://img.shields.io/badge/stability-designing-red.svg)
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

