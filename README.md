#Routie

For those of use who can't exclude IE8, here is a very tiny (800 bytes gzipped) javascript library to handle hash routing.

##Usage

There are three ways to use routie.

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

##Dependancies

None

##Supports

Any modern browser and IE8+

##Tests

Run `make install`, then `make test`, then go to http://localhost:8000/test

## License 

(The MIT License)

Copyright (c) 2012 Greg Allen &lt;me@jga.me&gt;

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
