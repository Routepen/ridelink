import React, { Component } from 'react'
import FacebookModal from "./modals/facebook_modal"
import SetupPaymentModal from "./modals/setup_payment_modal"
import TellDriverWaitModal from "./modals/tell_driver_wait_modal"
import PaymentConfirmedModal from "./modals/payment_confirmed_modal"
import LessThanZeroSeatsModal from "./modals/less_than_zero_seats_modal"
import ConfirmAddRiderModal from "./modals/confirm_add_rider_modal"


class Modals extends Component {

  constructor(props) {
    super(props);

    this.state = {
      route: this.props.route,
      user: this.props.user,
      toShow: this.props.toShow
    };
  }

  show() {
    if (this.state.toShow.length > 0) {
      var id = this.state.toShow[0];
      this.state.toShow.splice(0, 1);
      $('#' + id).modal('show');
    }
  }

  add(id) {
    this.state.toShow.push(id);
    this.show();
  }

  render() {
    return <div>
      <FacebookModal eventEmitter={this.props.eventEmitter} route={this.state.route}/>

      <SetupPaymentModal eventEmitter={this.props.eventEmitter} route={this.state.route}/>

      <TellDriverWaitModal eventEmitter={this.props.eventEmitter} route={this.state.route}/>

      <PaymentConfirmedModal eventEmitter={this.props.eventEmitter} route={this.state.route}/>

      <LessThanZeroSeatsModal eventEmitter={this.props.eventEmitter} route={this.state.route}/>

      <ConfirmAddRiderModal eventEmitter={this.props.eventEmitter} route={this.state.route} user={this.state.user}/>

    </div>

  }

  componentDidMount() {
    this.show();
  }
}


export default Modals
