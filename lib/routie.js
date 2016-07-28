var Routie = function(w, isModule) {

  var routes = [];
  var map = {};
  var reference = "routie";
  var oldReference = w[reference];

  /**
   * Route type
   * @constructor
   *
   * Creates a Route object for general use
   * 
   * @param {String} path
   * @param {type}   name
   */
  var Route = function(path, name) {
    this.name = name;
    this.path = path;
    this.keys = [];
    this.fns = [];
    this.params = {};
    this.regex = pathToRegexp(this.path, this.keys, false, false);

  };

  /**
   * Adds a handler for "this" route
   * 
   * @param {Function} fn
   */
  Route.prototype.addHandler = function(fn) {
    this.fns.push(fn);
  };

/**
 * Removes specific handler for this route
 * 
 * @param  {Function} fn
 * @return {void}
 */
  Route.prototype.removeHandler = function(fn) {
    for (var i = 0, c = this.fns.length; i < c; i++) {
      var f = this.fns[i];
      if (fn == f) {
        this.fns.splice(i, 1);
        return;
      }
    }
  };

/**
 * Executes this route with specified params
 * 
 * @param  {Object} params
 * @return {void}
 */
  Route.prototype.run = function(params) {
    for (var i = 0, c = this.fns.length; i < c; i++) {
      this.fns[i].apply(this, params);
    }
  };

/**
 * Tests a path of this route and runs if it's successed
 * @param  {String} path
 * @param  {Object} params
 * @return {Bool}
 */
  Route.prototype.match = function(path, params){
    var m = this.regex.exec(path);

    if (!m) return false;


    for (var i = 1, len = m.length; i < len; ++i) {
      var key = this.keys[i - 1];

      var val = ('string' == typeof m[i]) ? decodeURIComponent(m[i]) : m[i];

      if (key) {
        this.params[key.name] = val;
      }
      params.push(val);
    }

    return true;
  };

/**
 * Creates a url path for this route with specified params
 * 
 * @param  {Object} params
 * @return {String}
 */
  Route.prototype.toURL = function(params) {
    var path = this.path;
    for (var param in params) {
      path = path.replace('/:'+param, '/'+params[param]);
    }
    path = path.replace(/\/:.*\?/g, '/').replace(/\?/g, '');
    if (path.indexOf(':') != -1) {
      throw new Error('missing parameters for url: '+path);
    }
    return path;
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
        return '' + (optional ? '' : slash) + '(?:' + (optional ? slash : '') + (format || '') + (capture || (format && '([^/.]+?)' || '([^/]+?)')) + ')' + (optional || '');
      })
      .replace(/([\/.])/g, '\[reference]')
      .replace(/__plus__/g, '(.+)')
      .replace(/\*/g, '(.*)');
    return new RegExp('^' + path + '$', sensitive ? '' : 'i');
  };

  var addHandler = function(path, fn) {
    var s = path.split(' ');
    var name = (s.length == 2) ? s[0] : null;
    path = (s.length == 2) ? s[1] : s[0];

    if (!map[path]) {
      map[path] = new Route(path, name);
      routes.push(map[path]);
    }
    map[path].addHandler(fn);
  };

  /*
 * This is the main constructor for routie object
 * Creates a route or navigates it if second parameter is empty
 * 
 * @param  {String}    path       name of to route to register or to navigate
 * @param  {Function}  fn         callback founction for this route
 * @returns {void}
 */
   var routie = function(path, fn) {
    if (typeof fn == 'function') {
      addHandler(path, fn);
      routie.reload();
    } else if (typeof path == 'object') {
      for (var p in path) {
        addHandler(p, path[p]);
      }
      routie.reload();
    } else if (typeof fn === 'undefined') {
      routie.navigate(path);
    }
  };

  /*
 * Builds a url for use in your templates.
 * 
 * @param  {String}    name       name of to route to generate
 * @param  {Object}    obj        route params
 * @returns {String}
 */
   routie.lookup = function(name, obj) {
    for (var i = 0, c = routes.length; i < c; i++) {
      var route = routes[i];
      if (route.name == name) {
        return route.toURL(obj);
      }
    }
  };

/**
 * Removes specified handlerfor specified path
 * Remeber that: one path can have multiple handlers/callbacks functions
 * you should specify exact object that refers handler
 * 
 * @param  {String}   path       target path to remove
 * @param  {Function} fn         handler function
 * @return {void}
 */
  routie.remove = function(path, fn) {
    var route = map[path];
    if (!route)
      return;
    route.removeHandler(fn);
  };

/**
 * Removes all handlers and routes
 * 
 * @return {void}
 */
  routie.removeAll = function() {
    map = {};
    routes = [];
  };

/**
 * Navigates current route to desired one
 * 
 * @param  {String} path        target path to navigate
 * @param  {Object} options     options for this navigate
 * @return {void}
 */
   routie.navigate = function(path, options) {
    options = options || {};
    var silent = options.silent || false;

    if (silent) {
      removeListener();
    }
    setTimeout(function() {
      window.location.hash = path;

      if (silent) {
        setTimeout(function() { 
          addListener();
        }, 1);
      }

    }, 1);
  };

/**
 * Creates a reference for prevent conflicts
 * @return {Object}
 */
  routie.noConflict = function() {
    w[reference] = oldReference;
    return routie;
  };

/**
 * Clears current hash (including # itself)
 * 
 * @return {void}
 */
  routie.clear = function() {
    var scrollV, scrollH, loc = window.location;
    if ("pushState" in history) { // modern browsers
      history.pushState("", document.title, loc.pathname + loc.search);
    }
    else { //oldies
      // Prevent scrolling by storing the page's current scroll offset
      scrollV = document.body.scrollTop;
      scrollH = document.body.scrollLeft;
      loc.hash = "";
      // Restore the scroll offset, should be flicker free
      document.body.scrollTop = scrollV;
      document.body.scrollLeft = scrollH;
    }
  };

  var getHash = function() {
    return window.location.hash.substring(1);
  };

  var checkRoute = function(hash, route) {
    var params = [];
    if (route.match(hash, params)) {
      route.run(params);
      return true;
    }
    return false;
  };

  var hashChanged = routie.reload = function() {
    var hash = getHash();
    for (var i = 0, c = routes.length; i < c; i++) {
      var route = routes[i];
      if (checkRoute(hash, route)) {
        return;
      }
    }
  };

  var addListener = function() {
    if (w.addEventListener) {
      w.addEventListener('hashchange', hashChanged, false);
    } else {
      w.attachEvent('onhashchange', hashChanged);
    }
  };

  var removeListener = function() {
    if (w.removeEventListener) {
      w.removeEventListener('hashchange', hashChanged);
    } else {
      w.detachEvent('onhashchange', hashChanged);
    }
  };
  addListener();

  if (isModule){
    return routie;
  } else {
    w[reference] = routie;
  }
   
};

if (typeof module == 'undefined'){
  Routie(window);
} else {
  module.exports = Routie(window,true);
}