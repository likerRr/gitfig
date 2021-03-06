![Build Status](https://img.shields.io/travis/likerRr/gitfig/master.svg)
[![XO code style](https://img.shields.io/badge/code_style-XO-5ed9c7.svg)](https://github.com/sindresorhus/xo)
![Dependencies](https://img.shields.io/david/likerRr/gitfig.svg)

# Git(con)fig

Resolves and returns git config as an object

## Install

```
$ npm install --save gitfig
```


## Usage

```js
const gitFig = require('gitfig');

gitFig();
//=> {name: 'Alexey Lizurchik', email: 'al.lizurchik@gmail.com'}
```


## API

### gitfig([@type|path])

#### @type

Possible values are 0 and 2. Can be accessed throw the constants in exported object: `LOCAL`, `HOME`.

Example:
 
```javascript
const gitFig = require('gitfig');

console.log(gitFig.LOCAL);
console.log(gitFig.HOME);
````

#### path

Type: string

Path for looking git config for. Works for both git repos (you don't need to add `.git` in path) and (custom) home path.

----

Asynchronously looks up for git config by cascade:
1. The local config is looked for
2. The home config is looked for

Returns promise which rejects if git config is not found.

Alternatively you can specify concrete place of look up:
```javascript
const gitFig = require('gitfig');

gitFig(); // cascade
gitFig(gitFig.LOCAL); // current working directory (from where script is called)
gitFig(gitFig.HOME); // current user's home path
gitFig('/var/www/mysite'); // looks for /var/www/mysite/.git/config or if failed - /var/www/mysite/.gitconfig
````

### gitfig.sync(@type)

Synchronous version (with the same lookup behaviour) which returns value rather then promise. 
Throws an error if git config is not found.

## License

MIT © [Alexey Lizurchik](https://github.com/likerRr)
