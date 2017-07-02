const webdriverio = require('webdriverio');
const expect = require('chai').expect;
const options = {
    desiredCapabilities: {
        browserName: 'firefox'
    }
};
const util = require('./frontend_util')

var baseURL = process.env["BASE_URL"];

describe('Frontend Util', function() {

  describe('user auth', function() {
    it('should create, login, logout, delete user', function (done) {
      this.timeout(10 * 1000);
      var userId;
      util.useBrowser(browser);
      var user = util.createUser();
      userId = user._id;
      util.login(user);
      util.logout()
      util.deleteUser(user);
      util.login(user);
      expect(util.isLoggedIn()).to.equal(false);
    });

  });
});
