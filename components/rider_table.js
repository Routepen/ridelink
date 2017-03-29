import React, { Component } from 'react'
import TextDisplay from './text_display'
import RiderStatusDisplay from './rider_status_display'


class RiderTable extends Component {

  constructor(props) {
    super(props);

    this.state = {
      user: this.props.user,
      routeId: this.props.routeId,
      isDriver: this.props.isDriver,
      route: this.props.route,
      seats: this.props.seats,
      isFull: this.props.route.confirmedRiders.length >= this.props.seats
    };
  }
  render() {

    let riders = [];
    var me = this;
    this.state.route.confirmedRiders.forEach((rider, i) => {
      var color = "green", title="confirmed";
      var status = "";

      if (me.state.route.riderStatus[rider._id].paid) {
        status="Paid";
      }
      else {
        if (me.state.route.requireInitialDeposit) {
          status="Awaiting payment";
        }
        else {
          status = "Confirmed";
        }
      }

      //onclick='javascript:mapHandler.userClicked(\"" + rider._id + "\"); return false;'
      riders.push(<tr key={i} className="riderElement" id={"rider" + rider._id}>
          <td>{ i+1 }</td>
          <td><a href='#'>{rider.facebook.name}</a></td>
          <td>{status}</td>
          <td>{me.state.route.riderStatus[rider._id].baggage}</td>
        </tr>
      );

    });

    this.state.route.riders.forEach((rider, i) => {
      var color = "green", title="confirmed";
      var status = "Ride Requsted";

      var className = "";
      if (me.state.isDriver) {
        className = "editableInput";
      }

      i += me.state.route.confirmedRiders.length;

      //onclick='javascript:mapHandler.userClicked(\"" + rider._id + "\"); return false;'
      riders.push(<tr key={i} className="riderElement" id={"rider" + rider._id}>
          <td>{ i + 1 }</td>
          <td><a href='#'>{rider.facebook.name}</a></td>
          <td>
            <RiderStatusDisplay
              text={status}
              editable={me.state.isDriver}
              riders={this.state.route.riders}
              riderId={rider._id}
              confirmedRiders={this.state.route.confirmedRiders}
              user={this.state.user}
              routeId={this.state.routeId}/>
          </td>
          <td></td>
          </tr>
      );

    });


    return <div>
      <div style={{fontSize: "24px"}}>Riders</div>
      <div id="tableDiv" className="container-fluid row">
          <table className="table table-striped table-hover">
              <thead>
              <tr>
                  <th>#</th>
                  <th> Rider </th>
                  <th> Status </th>
                  <th> Baggage </th>
              </tr>
              </thead>
              <tbody id="riderTable">
                {riders}
              </tbody>
          </table>
          <p style={{display: "none"}} id="tableMessage"></p>
      </div>
      <div style={{display: "none"}} id="waitListTable" className="container-fluid row">
        <div style={{fontSize: "24px"}}>Waitlist</div>
        <table className="table table-striped table-hover">
            <thead>
            <tr>
                <th>#</th>
                <th> Rider </th>
                <th> Status </th>
            </tr>
            </thead>
            <tbody id="waitlistRiderTable"></tbody>
        </table>
      </div>
    </div>

  }
}


export default RiderTable
