(function(w) {
  var currentRoute = null;
  var routes = [];
  var map = {};
  var reference = "routie";
  var oldReference = w[reference];

  var Route = function(path, name, unloadFunction) {
    this.name = name;
    this.path = path;
    this.keys = [];
    this.fns = [];
    this.params = {};
	  this.plainParams = [];
    this.regex = pathToRegexp(this.path, this.keys, false, false);
    this.unloadFunction = unloadFunction;
  };

  Route.prototype.addHandler = function(fn) {
    this.fns.push(fn);
  };
  
  Route.prototype.addUnload = function(fn){
	this.unloadFunction = fn;  
  };

  Route.prototype.removeHandler = function(fn) {
    for (var i = 0, c = this.fns.length; i < c; i++) {
      var f = this.fns[i];
      if (fn == f) {
        this.fns.splice(i, 1);
        return;
      }
    }
  };

  Route.prototype.run = function(params) {
	var that = this;
	window.onbeforeunload = null;
	if(that.unloadFunction !== null){
	  window.onbeforeunload = function(ev){return that.runUnload(that.plainParams)};
	}
	
	for (var i = 0, c = this.fns.length; i < c; i++) {
      this.fns[i].apply(this, params);
    }
  };
  
  Route.prototype.runHashUnload = function(params){
	if(this.unloadFunction === null){
	  return true;	
	} else {
	  var text = this.unloadFunction.apply(this, params);   
	  if(text !== null && text !== '' && text !== undefined && typeof text === "string"){
	    return confirm(text);	
	  }	else {
		return true;  
	  }
	}
  };
  
  Route.prototype.runUnload = function(params){
	return this.unloadFunction.apply(this, params);  
  };

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
	this.plainParams = params;
    return true;
  };

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
      .replace(/([\/.])/g, '\\$1')
      .replace(/__plus__/g, '(.+)')
      .replace(/\*/g, '(.*)');
    return new RegExp('^' + path + '$', sensitive ? '' : 'i');
  };

  var addHandler = function(path, fn, unloadDialogs) {
    var s = path.split(' ');
    var name = (s.length == 2) ? s[0] : null;
    path = (s.length == 2) ? s[1] : s[0];

    if (!map[path]) {
      map[path] = new Route(path, name, matchUnloadFunction(path, unloadDialogs));
      routes.push(map[path]);
    }
    map[path].addHandler(fn);
  };

  var matchUnloadFunction = function(path, unloadDialogs){
	var unloadFunction = null;
	
	if(!unloadDialogs){
	  return unloadFunction;	
	}
	
	if(unloadDialogs.hasOwnProperty(path)){
	  unloadFunction = 	unloadDialogs[path];
	}
	
	return unloadFunction;
  };

  var routie = function(path, fn, unload) {
    if (typeof fn == 'function') {
      addHandler(path, fn, unload);
      routie.reload();
    } else if (typeof path == 'object') {;
      for (var p in path) {
        addHandler(p, path[p], fn);
      }
      routie.reload();
    } else if (typeof fn === 'undefined') {
      routie.navigate(path);
    }
  };

  routie.lookup = function(name, obj) {
    for (var i = 0, c = routes.length; i < c; i++) {
      var route = routes[i];
      if (route.name == name) {
        return route.toURL(obj);
      }
    }
  };

  routie.remove = function(path, fn) {
    var route = map[path];
    if (!route)
      return;
    route.removeHandler(fn);
  };

  routie.removeAll = function() {
    map = {};
    routes = [];
  };

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

  routie.noConflict = function() {
    w[reference] = oldReference;
    return routie;
  };

  var getHash = function() {
    return window.location.hash.substring(1);
  };

  var checkRoute = function(hash, route) {
    var params = [];
    if (route.match(hash, params)) {
	  // runit is a parameter which flags wether the Route should run or not.
	  // when the hash of the currentRoute is the same as the window.hash then we don't have to run the route again	
      var runit = false;
	  if(!currentRoute){
		runit = true;  
	  } else {
		if(currentRoute.hash !== getHash()){ // avoid unload function execution when coming back from return false unload
		  runit = true;
		}
	  }
	
      if(runit){
		  currentRoute = route;
		  route.hash = hash;
		  route.run(params);
		  return true;
	  } else {
	      return false;  
	  }
    }
    return false;
  };

  var hashChanged = routie.reload = function() {
	if(currentRoute){
	  if(currentRoute.hash !== getHash()){ // avoid unload function execution when coming back from return false unload
		  if(!currentRoute.runHashUnload(currentRoute.plainParams)){
			window.location.replace('#' + currentRoute.toURL(currentRoute.params));
			return false;  
		  }
	  }
	}
	
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

  w[reference] = routie;
   
})(window);
