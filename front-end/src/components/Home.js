import React, { Component } from "react";
import { Form, Button } from 'semantic-ui-react';
import 'semantic-ui-css/semantic.min.css';

export class Home extends Component {

  state = {
    address: ''
  }

  constructor(props) {
    super(props);
    this.onChange = this.onChange.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
  }

  render() {
    return(
      <div>
        <h1>Crowdfunding application</h1>
        <Form>
          <Form.Input 
            label='Contract Address'
            type='text'
            value={this.state.address}
            onChange={this.onChange}
          />
          <Button type='submit' onClick={this.onSubmit}>Submit</Button>
        </Form>
      </div>
    )
  }

  onChange(event) {
    this.setState({address: event.target.value});
  }

  onSubmit(event) {
    event.preventDefault();
    this.props.history.push(`/campaigns/${this.state.address}`);
  }
}