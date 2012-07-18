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
      'test': function() {
        done();
      }
    });
    window.location.hash = 'test';
  });

  test('trigger hash', function() {
    routie('test');
    assert.equal(window.location.hash, '#test');
  });

  test('regex support', function(done) {

    routie('test/:name', function(name) {
      assert.equal(name, 'bob');
      done();
    });

    routie('test/bob');

  });


});
