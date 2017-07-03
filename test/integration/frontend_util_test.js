const webdriverio = require('webdriverio');
const expect = require('chai').expect;
const options = {
    desiredCapabilities: {
        browserName: 'firefox'
    }
};
const util = require('./frontend_util')

const BASE_URL = "http://localhost:5000"

describe('Frontend Util', function() {

  describe('user auth', function() {
    return; // comment out if tests are failing and you think
    // that the frontend_util is to balme

    it('should create, login, logout, delete user', function () {

      this.timeout(10 * 1000);

      util.useBrowser(browser);
      var user = util.createUser();
      util.login(user);
      expect(util.isLoggedIn()).to.equal(true);
      util.logout();
      expect(util.isLoggedIn()).to.equal(false);
      util.deleteUser(user);
      util.login(user);
      expect(util.isLoggedIn()).to.equal(false);
    });
  });
});
