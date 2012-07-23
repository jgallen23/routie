var assert = chai.assert;


suite('routie', function() {

  teardown(function(done) {
    window.location.hash = '';
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

  test('trigger hash', function() {
    routie('test3');
    assert.equal(window.location.hash, '#test3');
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
