import React from 'react'
import { render } from 'react-dom'
import App from './components/App'
import NewRoute from './components/new_route'
import Route from './components/route'

if (document.getElementById('App')) {
  render(
    <App/>,
    document.getElementById('App')
  );
}
else if (document.getElementById('newRoute')) {
  render(
    <NewRoute/>,
    document.getElementById('newRoute')
  );
}
else if (document.getElementById('route')){
  render(
    <Route/>,
    document.getElementById('route')
  );
}
