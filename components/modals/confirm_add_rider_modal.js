import React, { Component } from 'react'


class ConfirmAddRiderModal extends Component {

  constructor(props) {
    super(props);

    this.state = {
      route: this.props.route,
      user: this.props.user
    };

    var me = this;
    props.eventEmitter.on('dropoffSet', address => {
      me.state.address = address;
    });
  }

  render() {
    return <div className="modal fade" id="confirmAddRider" tabIndex="-1" role="dialog" aria-labelledby="confirmAddRider">
      <div className="modal-dialog" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <button type="button" className="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
            <h4 className="modal-title" id="lessThanZeroSeatsTitle">Join Ride</h4>
          </div>
          <div className="modal-body">
            How much baggage will you have
            <div className="form-group">
              <select className="form-control" id="sel1">
                <option>None</option>
                <option>A small bag</option>
                <option>A large bag</option>
                <option>Two bags</option>
                <option>More than two bags</option>
              </select>
            </div>
          </div>
          <div className="modal-footer">
            <input id="joinButton" type="submit" className="btn btn-success" onClick={this.addOrUpdateRider.bind(this)} value="Join"/>
            <input type="submit" className="btn btn-danger" data-dismiss="modal" value="Cancel"/>
          </div>
        </div>
      </div>
    </div>
  }

  addOrUpdateRider() {
    if (!this.state.user) { return; }
    $("#joinButton").button("loading");

    var address = this.state.address;
    var rider = this.state.user;

    let data = {
      routeId: this.state.route._id,
      address: address,
      baggage: $('#sel1').val()
    };

    var me = this;
    $.post("/route/addrider", data, (data, text) => {
      var found = false;
      var userId = me.state.user._id;
      for (var i = 0; i < me.state.route.riders.length; i++) {
        if (me.state.route.riders[i]._id == userId) {
          found = true;
          break;
        }
      }
      console.log("found", found);
      if (found) {
        me.state.route.dropOffs[userId] = address;
      }
      else {
        me.state.route.riders.push(rider);
        me.state.route.dropOffs = me.state.route.dropOffs || {};
        me.state.route.dropOffs[userId] = address;
      }
      me.state.route.riderStatus = me.state.route.riderStatus || {};
      me.state.route.riderStatus[userId] = me.state.route.riderStatus[userId] || {};
      me.state.route.riderStatus[userId]['baggage'] = $('#sel1').val();

      $("#joinButton").button('reset');
      $('#confirmAddRider').modal('hide');
      console.log("set state", me.state);
      me.setState(me.state);
      me.props.eventEmitter.emit('rideRequested', rider, address);
    });
  }

}

export default ConfirmAddRiderModal
