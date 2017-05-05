module.exports = function(app, Route, User) {

app.post('/route/removeriderentirely', function(req, res) {
  //TODO if it is a cancel request do that in mass, if it is a confirmedRider do that in mass
    if (!req.user) {
      return res.end("please log in ");
    }

    var removingId = req.body.userId;

    var data = {
        '_id':{ $in: req.body.routeIds}
    }

    Route.find(data, function(err, routes) {
      for(var k = 0; k < routes.length; k++){

        if(routes[k].driver.toString() == req.body.userId.toString()){
          var outdate = new Date(1900, 01, 01)
          routes[k].date = outdate.toISOString();
          console.log("Inside: ", outdate);
        }
        else{
            for(var i = 0; i < routes.length; i++){
              if ( !((routes[k].riders.indexOf(req.user._id.toString()) > -1) || (routes[k].confirmedRiders.indexOf(req.user._id.toString())) > -1)) {
                console.log("hacking");
                return res.end("failure");
              }
            }

            for (var i = 0; i < routes[k].confirmedRiders.length; i++) {
              var rider = routes[k].confirmedRiders[i];
              if (rider.toString() == removingId) {
                console.log("removing confirmed rider on routes", routes[k]._id);
                routes[i].confirmedRiders.splice(i, 1);
                break;
              }
            }


            for (var i = 0; i < routes[k].riders.length; i++) {
              var rider = routes[k].riders[i];
              if (rider.toString() == removingId) {
                console.log("removing regular rider on routes", routes[k]._id);
                routes[k].riders.splice(i, 1);
                break;
              }
            }

            delete routes[k].dropOffs[req.user._id];
            delete routes[k].pickUps[req.user._id];


            if (routes[k].riderStatus[removingId]) {
              delete routes[k].riderStatus[removingId];
            }

            routes[k].markModified('dropOffs');
            routes[k].markModified('pickUps');
            routes[k].markModified('riderStatus');
        }


        routes[k].save(function(err){
          if (err) { console.log(err); return res.end(err.toString()); }
        });
      }
    });

    User.findById(removingId, function(err, riderUser) {
        var index = riderUser.routes.length;
        for(var i = 0; i < index; i++){
          console.log(typeof riderUser.routes[i], riderUser.routes[i]);
            console.log("BITCH" , req.body.routeIds.indexOf(riderUser.routes[i].toString()) > -1);
            if(req.body.routeIds.indexOf(riderUser.routes[i].toString()) > -1){
              riderUser.routes.splice(i, 1);
              index--;
              i--;
            }
        }

        //riderUser is not actually changing to its original array

        console.log("FROM USER", riderUser.routes);
        riderUser.markModified('routes');

        riderUser.save(function(err){
          if (err) { console.log(err); return res.end(err.toString()); }
          res.end("deleted user's route entry");
        });

    });

  });
}
