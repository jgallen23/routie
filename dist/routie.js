/*!
  * Routie - A tiny javascript hash router 
  * v0.0.1
  * https://github.com/jgallen23/routie
  * copyright JGA 2012
  * MIT License
  */

(function(w) {

  var routes = [];

  var Route = function(path, fn) {
    this.path = path;
    this.fn = fn;
    this.keys = [];
    this.regex = pathToRegexp(this.path, this.keys, false, false);

    //check against current hash
    var hash = getHash();
    checkRoute(hash, this);
  }

  Route.prototype.match = function(path, params){
    var m = this.regex.exec(path);
  
    if (!m) return false;

    
    for (var i = 1, len = m.length; i < len; ++i) {
      var key = this.keys[i - 1];

      var val = ('string' == typeof m[i]) ? decodeURIComponent(m[i]) : m[i];

      //if (key) {
        //params[key.name] = (undefined !== params[key.name]) ? params[key.name] : val;
      //} else {
      params.push(val);
      //}
    }

    return true;
  };

  var pathToRegexp = function(path, keys, sensitive, strict) {
    if (path instanceof RegExp) return path;
    if (path instanceof Array) path = '(' + path.join('|') + ')';
    path = path
      .concat(strict ? '' : '/?')
      .replace(/\/\(/g, '(?:/')
      .replace(/\+/g, '__plus__')
      .replace(/(\/)?(\.)?:(\w+)(?:(\(.*?\)))?(\?)?/g, function(_, slash, format, key, capture, optional){
        keys.push({ name: key, optional: !! optional });
        slash = slash || '';
        return ''
          + (optional ? '' : slash)
          + '(?:'
          + (optional ? slash : '')
          + (format || '') + (capture || (format && '([^/.]+?)' || '([^/]+?)')) + ')'
          + (optional || '');
      })
      .replace(/([\/.])/g, '\\$1')
      .replace(/__plus__/g, '(.+)')
      .replace(/\*/g, '(.*)');
    return new RegExp('^' + path + '$', sensitive ? '' : 'i');
  };

  var routie = function(path, fn) {
    if (typeof fn == 'function') {
      routes.push(new Route(path, fn));
    } else if (typeof path == 'object') {
      for (var p in path) {
        routes.push(new Route(p, path[p]));
      }
    } else if (typeof fn === 'undefined') {
      window.location.hash = path;
    }
  }

  var getHash = function() {
    return window.location.hash.substring(1);
  }

  var checkRoute = function(hash, route) {
    var params = [];
    if (route.match(hash, params)) {
      route.fn.apply(route, params);
      return true;
    }
    return false;
  }

  var hashChanged = function() {
    var hash = getHash();
    for (var i = 0, c = routes.length; i < c; i++) {
      var route = routes[i];
      if (checkRoute(hash, route))
        return;
    }
  }

  if (w.addEventListener) {
    w.addEventListener('hashchange', hashChanged);
  } else {
    w.attachEvent('onhashchange', hashChanged);
  }

  w.routie = routie;
})(window);
