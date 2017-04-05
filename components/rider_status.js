import React, { Component } from 'react'
import DropoffInput from "./dropoff_input"

class RiderStatus extends Component {

  constructor(props) {
    super(props);

    this.state = {
      user: this.props.user,
      route: this.props.route,
      markers: this.props.markers,
      isDriver: this.props.isDriver,
      isRider: this.props.isRider,
      isConfirmedRider: this.props.isConfirmedRider
    };

    let me = this;
    this.props.eventEmitter.on("rideRequested", () => {
      me.state.isRider = true;
      me.setState(me.state);
    });

    this.props.eventEmitter.on("seatsChanged", () => {
      me.forceUpdate();
    });
  }


  render() {

    let style = {};
    if (this.state.route.confirmedRiders.length < this.state.route.seats) {
      style.display = "none";
    }

    let rideIsFull = <div id="rideIsFull" style={style}>
      <button className="info btn" style={{backgroundColor:"black", color:"white"}}>Ride is FULL</button>
      <br/><br/>
    </div>


    let lineBreaks = <span>
        <br/><br/>
        <hr style={{height: "3px", backgroundColor: "gray"}}/>
      </span>



    let status = <div></div>;
    if (this.state.user) {
      if (!this.state.isDriver) {
        if (this.state.isConfirmedRider) {
          var driversName = this.state.route.driver.facebook.name.split(' ')[0];
          status = <div>{"You've got a ride with " + driversName}</div>
          {lineBreaks}
        }
        else if (this.state.isRider) {
          var driversName = this.state.route.driver.facebook.name.split(' ')[0];
          status = <div>
            <div>{"You've requested a ride with " + driversName}</div>
            {lineBreaks}
          </div>
        }
        else {
          status = <div>
            <DropoffInput
              routeId={this.state.route._id}
              markers={this.state.markers}
              eventEmitter={this.props.eventEmitter}/>
              {lineBreaks}
          </div>
        }
      }
    }
    else {
      status = <div>
        <a href={"/auth/facebook?redirect=" + encodeURIComponent('/route?id=' + (this.state.route.shortId || this.state.route._id))}>
          Login to Facebook to {this.state.route.confirmedRiders.length >= this.state.route.seats ? "join the waitlist" : "request a ride"}
        </a>
        <br/><br/>
      </div>
    }

    console.log('returning asfd');
    return <div>{rideIsFull}{status}</div>

  }
}


export default RiderStatus
