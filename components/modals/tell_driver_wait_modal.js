import React, { Component } from 'react'


class TellDriverWaitModal extends Component {

  constructor(props) {
    super(props);

    this.state = {
      route: this.props.route
    };
  }

  render() {

    let message = '';
    if (this.state.route.requireInitialDeposit) {
      message = <span>
        Thanks for adding <span id="addedRider"></span>. Sit tight while <span id="riderPronounHeShe"></span> pays <span id="riderPronounHisHer"></span> initial deposit. {"We'll"} let you know when he does!
      </span>
    }
    else {
      message = <span>
        Thanks for adding <span id="addedRider"></span>. Contact <span id="riderPronounHimHer"></span> to discuss details such as pickup loaction, bagage space etc.
      </span>
    }

    return <div className="modal fade" id="tellDriverToWait" tabIndex="-1" role="dialog" aria-labelledby="tellDriverToWait">
      <div className="modal-dialog" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <button type="button" className="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
            <h4 className="modal-title">Rider added</h4>
          </div>
          <div className="modal-body">
            {message}
          </div>
          <div className="modal-footer">
            <input type="submit" className="btn btn-primary" data-dismiss="modal" value="Done"/>
          </div>
        </div>
      </div>
    </div>
  }

}

export default TellDriverWaitModal
