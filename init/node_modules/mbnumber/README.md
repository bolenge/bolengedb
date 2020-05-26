# Introduction
Module JavaScript qui gère les nombres, les entiers, les doubles, les floats et biens d'autres sous types de nombre

## Installation

`npm install --save mbnumber`

instanciation du module

```js
var mbn = require("mbnumber");

```

#### isIntValid
Vérifie si la valeur passée en paramètre est réellement un entier valide
```js
let value1 = "34";
let value2 = 65
let value3 = 12.87
let value4 = "34.65"

console.log(mbn.isIntValid(value1)) // true
console.log(mbn.isIntValid(value2)) // true
console.log(mbn.isIntValid(value3)) // false
console.log(mbn.isIntValid(value4)) // false
```