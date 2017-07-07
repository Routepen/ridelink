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
    });

    it("can't find bad location", function() {
      browser.refresh();
      expect(browser.hasFocus("#destination-input")).to.equal(true);

      browser.keys("sdfjaslkfj\uE007"); // last key is enter

      browser.executeAsync(function(done) {
        setTimeout(done, 1000);
      });

      expect(browser.isVisible("#changeRouteButton")).to.equal(false);
      expect(browser.isVisible("#acceptRouteButton")).to.equal(false);

      expect($("#destination-error").getText()).to.equal("Couldn't find sdfjaslkfj");
    });

    it("autocompletes", function() {
      browser.refresh();
      browser.keys("San F");


      browser.executeAsync(function(done) {
        setTimeout(done, 1000);
      });

      browser.keys("\uE015\uE007"); // down arrow and enter

      browser.waitForVisible("#changeRouteButton");
      browser.waitForVisible("#acceptRouteButton");
      expect(browser.isVisible("#mapInstructions")).to.equal(false);
      expect(browser.isVisible("#resetMapButton")).to.equal(false);

      distance = util.getMapDistance();
      expect(distance).to.exist;
      expect(distance).to.be.above(5000); // from sb to sf
    });

    it("works if destination wasn't autocompleted", function() {
      browser.refresh();
      browser.keys("San Fransisco\uE007");

      browser.waitForVisible("#changeRouteButton");
      browser.waitForVisible("#acceptRouteButton");
      expect(browser.isVisible("#mapInstructions")).to.equal(false);
      expect(browser.isVisible("#resetMapButton")).to.equal(false);

      distance = util.getMapDistance();
      expect(distance).to.exist;
      expect(distance).to.be.above(5000); // from sb to sf

    });

    it('adds a stop', function() {
      $('#changeRouteButton').click();

      browser.waitForVisible("#mapInstructions");
      expect($('#mapInstructions').getText()).to.equal("Click anywhere to add a stop");

      // click
      const size = browser.getElementSize("#map");
      expect(size.width).to.exist;
      expect(size.height).to.exist;

      browser.leftClick("#map", size.width * .55, size.height * .4); // rando place on map


      util.waitFor(
      function() {
        return util.getMapDistance();
      },
      function(newDistance) {
        if (isNaN(newDistance)) { return false; }
        return newDistance != distance;
      });

      expect($('#mapInstructions').getText()).to.equal("Drag the marker to change it");
    });



    it("resets the map", function() {

      expect($("#resetMapButton").isVisible()).to.equal(true);
      expect($("#acceptRouteButton").isVisible()).to.equal(true);
      expect($("#changeRouteButton").isVisible()).to.equal(false);

      $("#resetMapButton").click();
      expect($("#resetMapButton").isVisible()).to.equal(true);
      expect($("#acceptRouteButton").isVisible()).to.equal(true);
      expect($("#changeRouteButton").isVisible()).to.equal(false);
      util.waitFor(
      function() {
        return util.getMapDistance();
      },
      function(newDistance) {
        if (isNaN(newDistance)) { return false; }
        return newDistance == distance; //expect newDistance to go back to the old one
      });

    });

    it('adds a stop again', function() {
      const size = browser.getElementSize("#map");
      expect(size.width).to.exist;
      expect(size.height).to.exist;

      browser.leftClick("#map", size.width * .6, size.height/2);

      util.waitFor(
      function() {
        return util.getMapDistance();
      },
      function(newDistance) {
        if (isNaN(newDistance)) { return false; }
        return newDistance != distance;
      });

      $("#acceptRouteButton").click();

      expect($("#editRouteButton").isVisible()).to.equal(true);
      expect($("#num-seats").hasFocus()).to.equal(true);
    });

    var date, seats = 3, charge = 30, time = "9:00 AM", finalDistance;

    it("fills out the info", function() {
      $('#num-seats').setValue("" + seats);
      $('#charge').setValue("$" + charge);
      $('#date').click();
      browser.waitForVisible("a.ui-state-default");
      $('a.ui-state-default').click();
      date = $('#date').getValue();

      $('#time').setValue(time);
      const currentURL = browser.getUrl();
      $('#create-route-button').click();

      finalDistance = util.getMapDistance();

      browser.waitForVisible("#email-input");
      expect(browser.hasFocus("#email-input")).to.equal(true);

      browser.keys("fakeemail@fakedomain.com");
      $("#submitEmailButton").click();

      browser.waitUntil(function () {
       return browser.getUrl() !== currentURL
      }, 5000, 'expected url to be different after 5s');

    });

    it("should have the same values", function() {
      const dist = util.getMapDistance();
      expect(dist).to.equal(finalDistance);
    });


  });
});
