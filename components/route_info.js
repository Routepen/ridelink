import React, { Component } from 'react'
import Heading from "./heading"
import TextDisplay from "./text_display"
import SeatsDisplay from "./seats_display"
import DateDisplay from "./date_display"
import TimeDisplay from "./time_display"
import LocationDisplay from "./location_display"
import Stops from "./stops"
import Table from "./rider_table"
import DropoffInput from "./dropoff_input"
import RiderStatus from "./rider_status"


class RouteInfo extends Component {

  constructor(props) {
    super(props);

    this.state = {
      isDriver: this.props.isDriver,
      isRider: this.props.isRider,
      confirmedRider: this.props.confirmedRider,
      route: this.props.route,
      user: this.props.user,
      markers: this.props.markers
    };
  }

  render() {
    let src = '';
    if (this.state.route.driver.facebook.photos &&
       this.state.route.driver.facebook.photos.length > 0 &&
       this.state.route.driver.facebook.photos[0].value) {
          src = this.state.route.driver.facebook.photos[0].value;
    }

    console.log(this.state);

    var isDriver = this.state.isDriver;
    var isRider = this.state.isRider;
    var isConfirmedRider = this.state.confirmedRider;
    var loggedIn = !!this.state.user;

    return <div>
          <Heading
            driver={this.state.route.driver}
            user={this.state.user}
            route={this.state.route}
            isDriver={isDriver}
            eventEmitter={this.props.eventEmitter}/>

          <RiderStatus
            user={this.state.user}
            route={this.state.route}
            markers={this.state.markers}
            isDriver={this.state.isDriver}
            isRider={this.state.isRider}
            isConfirmedRider={this.state.isConfirmedRider}
            eventEmitter={this.props.eventEmitter} />


          <LocationDisplay
            eventEmitter={this.props.eventEmitter}
            value="origin"
            route={this.state.route}
            editable={isDriver}
            icon={"my_location"}
            iconClickable={false}
            locationChanged={this.locationChanged.bind(this)}
            page={"view"}/>


          <Stops
            eventEmitter={this.props.eventEmitter}
            route={this.state.route}
            isDriver={isDriver}
            stopsUpdated={this.props.routeChanged}
            page="view"/>

          <LocationDisplay
            eventEmitter={this.props.eventEmitter}
            value="destination"
            route={this.state.route}
            editable={isDriver}
            icon={"place"}
            iconClickable={false}
            locationChanged={this.locationChanged.bind(this)}
            page={"view"}/>

          <br/>

          <SeatsDisplay
            route={this.state.route}
            editable={isDriver}
            icon={"event_seat"}
            eventEmitter={this.props.eventEmitter} />

          <DateDisplay date={this.state.route.date} editable={isDriver} icon={"event"}       eventEmitter={this.props.eventEmitter}/>
          <TimeDisplay time={this.state.route.time} editable={isDriver} icon={"access_time"} eventEmitter={this.props.eventEmitter}/>

          <TextDisplay text={this.state.route.inconvenience} editable={false} icon={"attach_money"}/>


          <br/><br/>
          <Table
            ref={"table"}
            user={this.state.user}
            routeId={this.state.route._id}
            isDriver={this.state.isDriver}
            route={this.state.route}
            seats={this.state.route.seats}
            eventEmitter={this.props.eventEmitter} />

      </div>

  }

  keyPressed(e) {
    if (e.keyCode == 13) { return false; }
  }

  tableShouldChange() {
    this.refs.table.forceUpdate();
  }

  locationChanged() {
    this.props.routeChanged();
  }

  componentDidMount() {

  }
}


export default RouteInfo
