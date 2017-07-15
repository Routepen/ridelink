module.exports = (app) => {
	const User = require('../../models/User');
	
	app.get('/testing2', function(req, res) {
	var newUser = new User({
		'facebook': {
			'link': 'https://www.facebook.com/app_scoped_user_id/1275391965875712/',
			'gender': 'male',
			'email': '',
			'name': 'Test User1',
			'token': 'EAAP9KxoqCucBAMF22hAWQD5cNryPVRSAsAVy0qIGgMMKH8AkIMiucu8HbJJHYTa1ZBjFnfGiVv1wnIqcjZAMHmIUuSEHJtsZAdeCmyDHwvZAxQOrJpMrOFh9fvZAxxqHFcZAzMlWHVWCPh9MBFSYGFNLGMEO5xzzqo0aa3TyRhOwZDZD',
			'id': '1275391965875713',
			'photos': [
				{
					'value': 'https://scontent.xx.fbcdn.net/v/t1.0-1/p50x50/12729183_959477910800454_5056109822890601521_n.jpg?oh=ce58e8e7a372cbc9e18bab4f24409c4d&oe=59661BB4'
				}
			]
		},
		'confirmedEmail': 'pmh192@gmail.com'
	});
	console.log(newUser);
	res.end("returned");
});

app.get('/test3', function(req, res) {
	User.findById('5959de157abd218b71f03a0c', function(err, user) {
		req.logIn(user, function(err) {
			if (err) { console.log(err); }
			return res.redirect('/');
		});
	});
});

app.get('/test32', function(req, res) {
	User.findById('58f6cbb094d39b315af7bf8e', function(err, user) {
		req.logIn(user, function(err) {
			if (err) { console.log(err); }
			return res.redirect('/');
		});
	});
});

}
