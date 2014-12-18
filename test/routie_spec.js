describe('routie::', function() {

  describe('test', function () {
    it('can run tests', function() {
      expect(true).toBe(true);
    });
  });

  describe('noConflict', function () {
    it('can handle conflicts in browser', function() {
      var r = routie.noConflict();
      expect(typeof window.routie).toBe('undefined');
      window.routie = r;
    });
  });

  describe('router', function () {

    afterEach(function(done) {
      routie.removeAll();
        window.location.hash = '';
        setTimeout(done, 20);
    });

    it('root route', function(done) {
      window.location.hash = '';
      //should be called right away since there is no hash
      routie('', function() {
        done();
      });
    });

    it('basic route', function(done) {
      routie('test', function() {
        done();
      });
      window.location.hash = 'test';
    });

    it('pass in object', function(done) {
      routie({
        'test2': function() {
          done();
        }
      });
      window.location.hash = 'test2';
    });

    it('calling the same route more than once', function(done) {
      var runCount = 0;
      routie('test8', function() {
        runCount++;
      });
      routie('test8', function() {
        expect(runCount).toBe(1);
        done();
      });
      window.location.hash = 'test8';
    });

    it('trigger hash', function(done) {
      routie('test3');
      setTimeout(function() {
        expect(window.location.hash).toEqual('#test3');
        done();
      }, 20);
    });

    it('remove route', function(done) {
      var check = false;
      var test9 = function() {
        check = true;
      };
      routie('test9', test9);
      routie.remove('test9', test9);
      window.location.hash = 'test9';
      setTimeout(function() {
        expect(check).toBe(false);
        done();
      }, 20);
    });

    it('remove all routes', function(done) {
      var check = false;
      var test9 = function() {
        check = true;
      };
      var test20 = function() {
        check = true;
      };
      routie('test9', test9);
      routie('test20', test20);
      routie.removeAll();
      window.location.hash = 'test9';
      setTimeout(function() {
        window.location.hash = 'test20';
      }, 20);
      setTimeout(function() {
        expect(check).toBe(false);
        done();
      }, 40);
    });

    it('regex support', function(done) {

      routie('test4/:name', function(name) {
        expect(name).toBe('bob');
        expect(this.params.name).toBe('bob');
        done();
      });

      routie('test4/bob');
    });

    it('route with dash', function(done) {
      routie('test-:name', function(name) {
        expect(name).toBe('bob');
        done();
      });
      routie('test-bob');
    });

    it('optional param support', function(done) {

      routie('test5/:name?', function(name) {
        expect(name).toBe(undefined);
        expect(this.params.name).toBe(undefined);
        done();
      });

      routie('test5/');
    });

    it('wildcard', function(done) {
      routie('test7/*', function() {
        done();
      });
      routie('test7/123/123asd');
    });

    it('catch all', function(done) {
      routie('*', function() {
        done();
      });
      routie('test6');
    });

    it('this set with data about the route', function(done) {
      routie('test', function() {
        expect(this.path).toBe('test');
        done();
      });
      routie('test');
    });

    it('double fire bug', function(done) {
      var called = 0;
      routie({
        'splash1': function() {
          routie('splash2');
        },
        'splash2': function() {
          called++;
        }
      });
      routie('splash1');

      setTimeout(function() {
        expect(called).toBe(1);
        done();
      }, 100);
    });

    it('only first route is run', function(done) {
      var count = 0;
      routie({
        'test*': function() {
          count++;
        },
        'test10': function() {
          count++;
        }
      });
      routie('test10');
      setTimeout(function() {
        expect(count).toBe(1);
        done();
      }, 100);
    });

    it('fallback not called if something else matches', function(done) {
      var count = 0;
      routie({
        '': function() {
          //root
        },
        'test11': function() {
          count++;
        },
        '*': function() {
          count++;
        }
      });
      routie('test11');
      setTimeout(function() {
        expect(count).toBe(1);
        done();
      }, 100);
    });

    it('fallback called if nothing else matches', function(done) {
      var count = 0;
      routie({
        '': function() {
          //root
        },
        'test11': function() {
          count++;
        },
        '*': function() {
          count++;
        }
      });
      routie('test12');
      setTimeout(function() {
        expect(count).toBe(1);
        done();
      }, 100);
    });


    xit('route object passed as this', function(done) {
      routie('*', function() {
        expect(this.route).toBe('test7');
        done();
      });
      routie('test7');
    });

  });

  describe('named routes', function() {

    afterEach(function(done) {
      routie.removeAll();
      window.location.hash = '';
      setTimeout(done, 20);
    });

    it('allow for named routes', function() {
      routie('namedRoute name/', function() {});

      expect(routie.lookup('namedRoute')).toBe('name/');
    });

    it('routes should still work the same', function(done) {

      routie('namedRoute url/name2/', done);
      routie('url/name2/');

    });

    it('allow for named routes with params', function() {
      routie({
        'namedRoute name2/:param': function() { }
      });

      expect(routie.lookup('namedRoute', { param: 'test' })).toBe('name2/test');
    });

    it('allow for named routes with optional params', function() {
      routie({
        'namedRoute name2/:param?': function() { }
      });

      expect(routie.lookup('namedRoute')).toBe('name2/');
    });

    it('allow for named routes with optional params', function() {
      routie({
        'namedRoute name2/:param?': function() { }
      });

      expect(routie.lookup('namedRoute', { param: 'test' })).toBe('name2/test');
    });

    it('error if param not passed in', function() {
      routie({
        'namedRoute name2/:param': function() {
        }
      });

      expect(function() {
        routie.lookup('namedRoute')
      }).toThrowError("missing parameters for url: name2/:param");
    });

    it('this contains named route', function(done) {
      routie('namedRoute test/:param', function() {
        expect(this.name).toBe('namedRoute');
        expect(this.params.param).toBe('bob');
        done();
      });
      routie('test/bob');
    });

  });

  describe('navigate', function() {

    it('call routie.navigate to change hash', function(done) {
      //same as routie('nav-test');
      routie.navigate('nav-test');
      setTimeout(function() {
        expect(window.location.hash).toBe('#nav-test');
        done();
      }, 20);
    });

    it('pass in {silent: true} to not trigger route', function(done) {

      var called = 0;

      routie('silent-test', function() {
        called++;
      });

      routie.navigate('silent-test', { silent: true });

      setTimeout(function() {
        expect(called).toBe(0);
        expect(window.location.hash).toBe('#silent-test');
        done();
      }, 20);

    });

  });


});
