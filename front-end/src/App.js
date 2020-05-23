import React, { Component } from 'react';
import './App.css';
import { Home } from './components/Home'
import { Campaign } from './components/Campaign'
import { NotFound } from './components/NotFound'
import { Menu, Container } from 'semantic-ui-react';
import 'semantic-ui-css/semantic.min.css';
import { 
  Router, 
  Switch, 
  Route
} from 'react-router-dom';
import history from './history';

class App extends Component {

  render() {
    return(
      <Router history={history}>
        <Container>
          <Menu secondary>
            <Menu.Item 
              name='home'
              onClick={this.navigateToHome}
            >
              Home
            </Menu.Item>
          </Menu>

          <Switch>
            <Route exact path='/' component={Home} />
            <Route exact path='/campaigns/:address' component={Campaign} />
            <Route component={NotFound} />
          </Switch>

        </Container>
      </Router>
    );
  }

  navigateToHome(e) {
    e.preventDefault();
    history.push('/');
  }
}

export default App;
