module.exports = function(recipientName, driversName, fbLink){
  return "<span>Hi " + recipientName  + ",</span><br/><br/>"+
    "<span>Congrats on fully confirming the ride with " + driversName  + ". Hope you enjoy your ride</span><br/><br/>" +
    "Click " + fbLink  + " to message them if you have any further questions.<br/><br/>"+
    "<span>Best</span><br/>"+
    "<span>Routepen Team</span>";
}
