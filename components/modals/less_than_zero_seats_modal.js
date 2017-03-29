import React, { Component } from 'react'


class LessThanZeroSeatsModal extends Component {

  constructor(props) {
    super(props);

    this.state = {
      route: this.props.route
    };
  }

  render() {
    return <div className="modal fade" id="lessThanZeroSeats" tabIndex="-1" role="dialog" aria-labelledby="lessThanZeroSeats">
      <div className="modal-dialog" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <button type="button" className="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
            <h4 className="modal-title" id="lessThanZeroSeatsTitle">
              {"You've already confirmed "}
              <span id="numConfirmedRiders">{this.state.route.confirmedRiders.length}</span>
              {" riders"}
            </h4>
          </div>
          <div className="modal-body">
            If you can no longer take some riders, please let them know ASAP.
          </div>
          <div className="modal-footer">
            <input type="submit" className="btn btn-primary" data-dismiss="modal" value="Done"/>
          </div>
        </div>
      </div>
    </div>
  }

}

export default LessThanZeroSeatsModal
