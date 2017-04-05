import React, { Component } from 'react'


class SetupPaymentModal extends Component {

  constructor(props) {
    super(props);

    this.state = {
      route: this.props.route
    };
  }

  render() {
    return <div className="modal fade" id="setUpPaymentModal" tabIndex="-1" role="dialog" aria-labelledby="setUpPaymentModal">
      <div className="modal-dialog" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <button type="button" className="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
            <h4 className="modal-title">Set up payment methods</h4>
          </div>
          <div className="modal-body">
            Stuff for setting up deposit
          </div>
          <div className="modal-footer">
            <input type="submit" className="btn btn-primary" data-dismiss="modal" value="Done"/>
          </div>
        </div>
      </div>
    </div>
  }

}

export default SetupPaymentModal
