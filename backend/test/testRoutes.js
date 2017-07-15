const ENV = require('../helpers/env')

module.exports = function(app, User) {
	if(!ENV.isTest()) return;

	require("./createUser")(app, User);

	require("./login")(app, User);

	require("./deleteUser")(app, User);

	require("./isLoggedIn")(app);

}
