const Promise = require("bluebird");
const request = require('request');

const BASE_URL = "http://localhost:5000"

var browser;

module.exports = {
  browser: null,

  useBrowser(b) {
    browser = b;
    browser.url(BASE_URL);
  },

  createUser: function() {
    browser.timeouts("script", 3*1000);
    var result = browser.executeAsync(function(request, url, done) {
      var xhr = new XMLHttpRequest();
      xhr.open("POST", url, true);
      xhr.onload = function (e) {
        if (xhr.readyState === 4) {
          done(xhr.responseText);
        }
      };
      xhr.onerror = function (e) {
        done(xhr.statusText);
      };
      xhr.send(null);
    }, request, BASE_URL + '/test/createUser');

    var user = JSON.parse(result.value)
    return user;
  },

  deleteUser: function(user) {
    browser.timeouts("script", 3*1000);

    browser.executeAsync(function(request, url, params, done) {
      var xhr = new XMLHttpRequest();
      xhr.open("POST", url, true);
      xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
      xhr.onload = function (e) {
        if (xhr.readyState === 4) {
          if (xhr.status == 200) {
            done(xhr.responseText);
          }
          else {
            done(new Error(xhr.status + " status code"));
          }
        }
      };
      xhr.onerror = function (e) {
        done(xhr.statusText);
      };
      xhr.send(JSON.stringify(params));
    }, request, BASE_URL + '/test/deleteUser', {id: user._id});

  },

  login: function(user) {
    browser.url(BASE_URL + '/test/login?id=' + user._id);
  },

  logout: function() {
    browser.url('/auth/logout');
  },

  isLoggedIn: function() {
    browser.url(BASE_URL + "/test/isLoggedIn");
    var text = browser.getHTML("#json");

    // <div id="json">The JSON</div>
    text = text.substring(text.indexOf('{'), text.indexOf('}') + 1);


    return JSON.parse(text).loggedIn;
  }

};
