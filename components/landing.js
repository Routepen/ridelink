import React, { Component } from 'react'


class Landing extends Component {
  render() {
    return <div>
      <div style={{marginTop: "100px"}}></div>

      <div className="first-landing">
          <div className="container" >
              <div className="row" style={{marginTop: "0px"}}>
                  <div className="col-xs-12" style={{marginTop: "0px"}}>
                      <h1 > Drivers Paradise for Carpool.</h1>
                      <h4 className="about"> <b> Create your route</b> in seconds and well make your rideshare post come to life. Just share a link of your route through Facebook! Give riders a chance to join your waitlist if your ride’s full and earn <b> more </b> with our special riders feature. </h4>
                      <iframe width="1000" height="450" style={{marginTop: "0px", marginBottom: "150px"}}
                        src="https://www.youtube.com/embed/U1ysIfps7cQ?loop=1">
                      </iframe>

                  </div>

              </div>
          </div>
      </div>

      <section className="features">
          <h1>Features</h1>
          <div className="container">
              <h2> Routepen drivers make on average $40 on their trip back home!</h2>
              <br/>
              <div className="row">
                  <div className="feature col-xs-12 col-sm-6 col-md-6">
                      <img src="/images/landing-feature-payment.jpg" alt=""></img>
                      <h3>Coming soon: Preventing No-shows</h3>
                      <p>Preventing no-shows by having riders put up an initial deposit.</p>
                  </div>
                  <div className="feature feature-waitlist col-xs-12 col-sm-6 col-md-6">
                      <img src="images/landing-feature-map.jpg" alt=""></img>
                      <h3> More exposure and more convenient riders </h3>
                      <p>Riders can place their dropoff location anywhere on your editable route and we auto-rank the most convenient riders for you!
                      </p>
                  </div>
              </div>
          </div>
      </section>

      <section id="subscribe" className="subscribe">
          <div className="container">
              <div className="row">
                  <div className="col-md-6 col-md-offset-3">
                      <h2 className="title">For Riders</h2>
                      <p> Are you a rider interested in our new notifications feature? Receive instant notifications when a new shared ride is relevant to you.
                          Our smart algorithm finds rides on the way or to your location. Just turn it on when you're looking for rides. We're limiting this to 300 special riders, so sign up quick!</p>
                      <form id="emailsubscribe" action="/emailsubscribe" method="post" ref="emailsubscribe">
                          <input id="email" className="email" type="text" name= "email" placeholder="email"/>
                          <input id="submit" className="btn" type="submit" name= "SubmitButton" value="Subscribe"/>
                      </form>
                  </div>
              </div>
          </div>
      </section>

      <footer>
          <div id="policy">
            <div className="block" style={{paddingTop: "10px"}}><p>&#169; Routepen, LLC All rights reserved.</p></div>
          </div>
          <div id="social">
            <a href="#">
              <img src="/images/facebook.png"></img>
              <p style={{display: "inline"}}> Email: admin@routepen.com</p>
            </a>
          </div>
      </footer>
    </div>
  }
}


export default Landing;
