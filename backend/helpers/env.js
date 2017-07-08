const UnauthorizedError = require("../errors/unauthorizedError");

const ENVS = ["PROD", "DEV", "TEST"];

// PROD is prodcution
// DEV is like prodcution, except for changes like using a local db
// TEST mainly opens up the test endpoints to be used, which are basically
// like a backdoor for manipulating values. see backend/test/*.js for all the
// test endpoints

function getRealEnv() {
  let env = process.env.NODE_ENV || "PROD";

  if (env == "production") { env = "PROD"; } // for heroku

  var found = false;
  ENVS.forEach(function(e) { if (env == e) { found = true; }});

  if (!found) {
    throw new Error("Unsupported env " + env + ". Supported envs are " + ENVS.join(", "));
  }

  return env;
}

const realENV = getRealEnv();

module.exports = {

  fakeENV: realENV,

  setENV: function(newENV) {
    if (newENV == "TEST") {
      if (realENV == "TEST") {
        fakeENV = newENV;
      }
      else {
        throw new UnauthorizedError("Cannot set env to " + newENV + " while real env is " + realENV);
      }
    }

    else if (newENV == "DEV") {
      if (realENV == "TEST" || realENV == "DEV") {
        fakeENV = newENV;
      }
      else {
        throw new UnauthorizedError("Cannot set env to " + newENV + " while real env is " + realENV);
      }
    }

    else if (newENV == "PROD") {
      if (realENV == "TEST" || realENV == "DEV" || realENV == "PROD") { // always true
        fakeENV = newENV;
      }
      else {
        throw new UnauthorizedError("Cannot set env to " + newENV + " while real env is " + realENV);
      }
    }

    else {
      throw new Error("Unsupported env " + env + ". Supported envs are " + ENVS.join(", "));
    }

  },

  getENV: function() {
    return this.fakeENV;
  },

  isTest: function() {
    return this.fakeENV == "TEST";
  },

  isDev: function() {
    return this.fakeENV == "DEV" || this.isTest();
  },

  isProd: function() {
    return this.fakeENV == "PROD";
  },

  printMode: function() {
    console.log("We are running in " + this.fakeENV + " mode.");
  }
}
