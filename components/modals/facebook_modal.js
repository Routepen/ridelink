import React, { Component } from 'react'


class FacebookModal extends Component {

  constructor(props) {
    super(props);

    this.state = {
      route: this.props.route
    };
  }

  render() {
    var days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
    return <div className="modal fade" id="facebookModal" tabIndex="-1" role="dialog" aria-labelledby="facebookModal">
      <div className="modal-dialog" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <button type="button" className="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
            <h4 className="modal-title">We made an example Facebook post just for you! Feel free to copy and paste it :) </h4>
              <hr/>
          </div>
          <div className="modal-body">
            <div contentEditable="true" id="contentEditableMessageDiv">
              <div>
                {
                  "Driving to " +
                  this.state.route.destination +
                  " on " +
                  days[this.state.route.date.getDay()] +
                  " " +
                  (this.state.route.date.getMonth() + 1) +
                  "/" +
                  this.state.route.date.getDate() +
                  " around " +
                  this.state.route.time +
                  ". " +
                  this.state.route.seats +
                  " spots available, $" +
                  this.state.inconvenience +
                  "per seat."
                }
              </div>
              <br/>
              <div>To all interested riders, enter your drop-off location in the link below and I'll confirm you if I see a fit! Otherwise you'll be added to the waitlist. PM me if you have any questions!</div>
              <br/>
              <a id="selfLink"></a>
            </div>

          </div>
            <hr/>
          <div className="modal-footer">
            <input type="submit" className="btn btn-primary" data-dismiss="modal" value="Done"/>
          </div>
        </div>
      </div>
    </div>
  }

}

export default FacebookModal
