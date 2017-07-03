const Promise = require("bluebird");
const request = require('request');

const BASE_URL = "http://localhost:5000";

var browser;

function makeRequest(url, method, params, done) {
  var xhr = new XMLHttpRequest();
  xhr.open(method, url, true);
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
}

module.exports = {
  browser: null,

  useBrowser(b) {
    browser = b;
    browser.url(BASE_URL);
  },

  createUser: function() {
    browser.timeouts("script", 5*1000);
    var result = browser.executeAsync(makeRequest, BASE_URL + '/test/createUser', "POST", {
      user: {
        facebook: {
          name: "User McUserface"
        }
      }
    });

    var user = JSON.parse(result.value)
    return user;
  },

  deleteUser: function(user) {
    browser.timeouts("script", 5*1000);

    browser.executeAsync(makeRequest,
      BASE_URL + '/test/deleteUser', "POST", {id: user._id});

  },

  login: function(user) {
    browser.url(BASE_URL + '/test/login?id=' + user._id);
  },

  logout: function() {
    browser.url('/auth/logout');
  },

  isLoggedIn: function() {
    const url = browser.getUrl();
    browser.url(BASE_URL + "/test/isLoggedIn");
    var text = browser.getHTML("#json");

    // <div id="json">The JSON</div>
    text = text.substring(text.indexOf('{'), text.indexOf('}') + 1);

    browser.url(url);
    return JSON.parse(text).loggedIn;
  },

  clickNewRoute: function() {
    const link = $('#newRoute');
    link.click();
  },

  getMapDistance: function() {
    var result = browser.execute(function() {
      return mapHandler.getDistance();
    });

    return result.value;
  },

  waitFor: function (fn, doneWaiting) {
    var result = {value: false};

    while (!doneWaiting(result)) {
      result = fn();
      browser.executeAsync(function(done) { setTimeout(done, 500); }); //sleep 500ms
    }
  }
};
