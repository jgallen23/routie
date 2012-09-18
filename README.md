#Routie

Routie is a javascript hash routing library.  It is designed for scenarios when push state is not an option (IE8 support, static/Github pages, Phonegap, simple sites, etc). It is very tiny (800 bytes gzipped), and should be able to handle all your routing needs.

##Download

- [Development](https://raw.github.com/jgallen23/routie/master/dist/routie.js)
- [Production](https://raw.github.com/jgallen23/routie/master/dist/routie.min.js)
- [Source](https://github.com/jgallen23/routie)

##Usage

There are three ways to call routie:

Here is the most basic way:

```js
routie('users', function() {
	//this gets called when hash == #users
});
```

If you want to define multiple routes you can pass in an object like this:

```js
routie({
	'users': function() {

	},
	'about': function() {
	}
});
```

If you want to trigger a route manually, you can call routie like this:

```js
routie('users/bob');  //window.location.hash will be #users/bob
```

##Advanced

Routie also supports regex style routes, so you can do advanced routing like this:

```js
routie('users/:name', function(name) {
	//name == 'bob';
});
routie('users/bob');
```

optional params:
```js
routie('users/?:name', function(name) {
	//name == undefined
	//then
	//name == bob
});
routie('users/');
routie('users/bob');
```

wildcard:
```js
routie('users/*', function() {
});
routie('users/12312312');
```

catch all:
```js
routie('*', function() {
});
routie('anything');
```

##Dependencies

None

##Supports

Any modern browser and IE8+

##Tests

Run `make install`, then `make test`, then go to http://localhost:8000/test

