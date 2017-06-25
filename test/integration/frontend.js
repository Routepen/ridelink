var webdriverio = require('webdriverio');
var expect = require('chai').expect;
var options = {
    desiredCapabilities: {
        browserName: 'firefox'
    }
};

var baseURL = process.env["BASE_URL"];

describe('End to End', function() {
  describe('localhost', function() {
    it('should be up', function () {
      browser.url('http://localhost:5000');
    });

  });
});
