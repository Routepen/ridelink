var webdriverio = require('webdriverio');
var expect = require('chai').expect;
var options = {
    desiredCapabilities: {
        browserName: 'firefox'
    }
};

const util = require('./frontend_util')

const BASE_URL = "http://localhost:5000"

var distance;

describe('Front end', function() {
  describe('route creation', function() {
    it('should pass', function () {
      util.useBrowser(browser);
      var user = util.createUser();
      util.login(user);

      util.clickNewRoute();
      expect(browser.hasFocus("#destination-input")).to.equal(true);

      browser.keys("San F".split(''));


      browser.executeAsync(function(done) {
        setTimeout(done, 1000);
      });

      browser.keys("\uE015\uE007"); // down arrow and enter

      expect(browser.isVisible("#mapInstructions")).to.equal(false);
      browser.waitForVisible("#changeRouteButton");
      browser.waitForVisible("#acceptRouteButton");

      distance = util.getMapDistance();
      expect(distance).to.exist;
      expect(distance).to.be.above(5000); // from sb to sf

      $('#changeRouteButton').click();

      browser.waitForVisible("#mapInstructions");
      expect($('#mapInstructions').getText()).to.equal("Click anywhere to add a stop");

    });

    it('continued', function() {
      // click
      const size = browser.getElementSize("#map");
      expect(size.width).to.exist;
      expect(size.height).to.exist;

      browser.leftClick("#map", size.width/2, size.height/2);


      util.waitFor(
      function() {
        return util.getMapDistance();
      },
      function(newDistance) {
        if (isNaN(newDistance)) { return false; }
        return newDistance == distance;
      });


    })

  });
});
