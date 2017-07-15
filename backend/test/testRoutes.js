
module.exports = function(app, User) {
	if(process.env.NODE_ENV != "test") return;

	require("./createUser")(app, User);

	require("./login")(app, User);

	require("./deleteUser")(app, User);

	require("./isLoggedIn")(app);

}
