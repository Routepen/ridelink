import React, { Component } from 'react'
import Heading from "./heading"
import TextDisplay from "./text_display"
import Stops from "./stops"
import Table from "./rider_table"
import DropoffInput from "./dropoff_input"


class RouteInfo extends Component {

  constructor(props) {
    super(props);

    this.state = {
      route: this.props.route,
      user: this.props.user,
      markers: this.props.markers
    };
  }

  keyPressed(e) {
    if (e.keyCode == 13) { return false; }
  }

  render() {
    let src = '';
    if (this.state.route.driver.facebook.photos &&
       this.state.route.driver.facebook.photos.length > 0 &&
       this.state.route.driver.facebook.photos[0].value) {
          src = this.state.route.driver.facebook.photos[0].value;
    }

    console.log(this.state);

    var isDriver = this.state.user &&
      this.state.route.driver._id == this.state.user._id;
    var loggedIn = !!this.state.user;

    let actionable = '';
    if (loggedIn) {
      if (!isDriver) {
        actionable = <DropoffInput
          routeId={this.state.route._id}
          markers={this.state.markers}
          eventEmitter={this.props.eventEmitter}/>
      }
    }
    else {
      actionable = <a href={"/auth/facebook?redirect=" + encodeURIComponent('/route?id=' + (this.state.route.shortId || this.state.route._id))}>
        Login to Facebook to {this.state.route.confirmedRiders.length >= this.state.route.seats ? "join the waitlist" : "request a ride"}
      </a>
    }

    return <div>
          <Heading
            driver={this.state.route.driver}
            user={this.state.user}
            route={this.state.route}
            isDriver={isDriver}
            eventEmitter={this.props.eventEmitter}/>

          {actionable}

          <TextDisplay text={this.state.route.origin} editable={isDriver} icon={"my_location"} />
          <Stops stops={this.state.route.stops} isDriver={isDriver}/>
          <TextDisplay text={this.state.route.destination} editable={isDriver} icon={"place"}/>

          <br/>

          <TextDisplay text={this.state.route.seats} editable={isDriver} icon={"event_seat"} />
          <TextDisplay text={this.state.route.date} editable={isDriver} icon={"event"} />
          <TextDisplay text={this.state.route.time} editable={isDriver} icon={"access_time"}/>
          <TextDisplay text={this.state.route.inconvenience} editable={isDriver} icon={"attach_money"}/>
          <br/><br/>
          <Table
            riders={this.state.route.riders}
            confirmedRiders={this.state.route.confirmedRiders}
            seats={this.state.route.seats}/>

      </div>

  }


  componentDidMount() {

  }
}


export default RouteInfo
