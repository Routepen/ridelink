import React, { Component } from 'react'


class Navbar extends Component {

  constructor(props) {
    super(props);


  }

  linksWhenLoggedIn() {
    return <ul className="nav navbar-nav navbar-right">
      <li>
        <a href="/route/new" className="btn newroute btn-md"><span className="glyphicon glyphicon-plus" id="newride"></span> Create Route</a>
      </li>
      <li><a href="/route/mine" className="btn newroute btn-md">My Routes</a></li>
      <li><a href="/auth/logout" data-size="xlarge" className="btn "><span className="fa fa-facebook"></span> Logout</a></li>
    </ul>
  }

  linksWhenLoggedOut() {
    return <ul className="nav navbar-nav navbar-right">
      <li>
        <a href="/route/new" className="btn newroute btn-md"><span className="glyphicon glyphicon-plus" id="newride"></span> Create Route</a>
      </li>
      <li>
        <a href={"/auth/facebook?redirect=" + encodeURIComponent(window.location.href) } data-size="xlarge" className="loginbtn btn "><span className="fa fa-facebook"></span> Login Facebook</a>
      </li>
    </ul>
  }

  render() {
    let links = null;
    if (this.props.user) {
      links = this.linksWhenLoggedIn();
    }
    else {
      links = this.linksWhenLoggedOut();
    }

    return <nav className="navbar navbar-default navbar-fixed-top">
        <div className="container">
            <div className="navbar-header">
                <button type="button" className="navbar-toggle collapsed" data-toggle="collapse" data-target="#navbar" aria-expanded="false" aria-controls="navbar">
                    <span className="sr-only">Toggle navigation</span>
                    <span className="icon-bar"></span>
                    <span className="icon-bar"></span>
                    <span className="icon-bar"></span>
                </button>
                <a className="navbar-brand" href="/">Routepen</a>
            </div>
            <div id="navbar" className="navbar-collapse collapse">
              {links}
            </div>
        </div>
    </nav>
  }
}


export default Navbar
