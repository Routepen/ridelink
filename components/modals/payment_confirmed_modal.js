import React, { Component } from 'react'


class PaymentConfirmedModal extends Component {

  constructor(props) {
    super(props);

    this.state = {
      route: this.props.route
    };
  }

  render() {
    return <div className="modal fade" id="paymentConfirmed" tabIndex="-1" role="dialog" aria-labelledby="paymentConfirmed">
      <div className="modal-dialog" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <button type="button" className="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
            <h4 className="modal-title">Payment Accepted</h4>
          </div>
          <div className="modal-body">
            {"Thanks for paying your initial deposit. Message " + this.state.route.driver.facebook.name.split(' ')[0] + " to hammer out any details such as pick up location, bagage space, etc."}
          </div>
          <div className="modal-footer">
            <input type="submit" className="btn btn-primary" data-dismiss="modal" value="Done"/>
          </div>
        </div>
      </div>
    </div>
  }

}

export default PaymentConfirmedModal
