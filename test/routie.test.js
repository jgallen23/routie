var assert = chai.assert;


suite('routie', function() {

  teardown(function(done) {
    window.location.hash = '';
    routie.removeAll();
    setTimeout(done, 100);
  });

  test('basic route', function(done) {
    routie('test', function() {
      done();
    });
    window.location.hash = 'test';
  });

  test('pass in object', function(done) {
    routie({
      'test2': function() {
        done();
      }
    });
    window.location.hash = 'test2';
  });

  test('calling the same route more than once', function(done) {
    var runCount = 0;
    routie('test8', function() {
      console.log('1');
      runCount++
    });
    routie('test8', function() {
      console.log('2');
      assert.equal(runCount, 1);
      done();
    });
    window.location.hash = 'test8';
  });

  test('trigger hash', function() {
    routie('test3');
    assert.equal(window.location.hash, '#test3');
  });

  test('remove route', function(done) {
    var check = false;
    var test9 = function() {
      check = true;
    }
    routie('test9', test9);
    routie.remove('test9', test9);
    window.location.hash = 'test9';
    setTimeout(function() {
      assert.equal(check, false);
      done();
    }, 100);
  });

  test('remove all routes', function(done) {
    var check = false;
    var test9 = function() {
      check = true;
    }
    var test10 = function() {
      check = true;
    }
    routie('test9', test9);
    routie('test10', test10);
    routie.removeAll();
    window.location.hash = 'test9';
    setTimeout(function() {
      window.location.hash = 'test10';
    }, 100);
    setTimeout(function() {
      assert.equal(check, false);
      done();
    }, 200);
  });

  test('regex support', function(done) {

    routie('test4/:name', function(name) {
      assert.equal(name, 'bob');
      done();
    });

    routie('test4/bob');
  });

  test('optional param support', function(done) {

    routie('test5/:name?', function(name) {
      assert.equal(name, undefined);
      done();
    });

    routie('test5/');
  });

  test('wildcard', function(done) {
    routie('test7/*', function() {
      done();
    });
    routie('test7/123/123asd');
  });

  test('catch all', function(done) {
    routie('*', function() {
      done();
    });
    routie('test6');
  });

  /*TODO
  test('route object passed as this', function(done) {
    routie('*', function() {
      console.log(this);
      assert.equal(this.route, 'test7');
      done();
    });
    routie('test7');
  });
  */


});
