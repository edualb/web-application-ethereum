import React, { Component } from "react";
import { createContract } from './../ethereum/crowdfundingContract'
import web3  from "../ethereum/web3";
import { Table, Button, Input } from 'semantic-ui-react'

export class Campaign extends Component {
  ONGOING_STATE = '0';
  FAILED_STATE = '1';
  SUCCEEDED_STATE = '2';
  PAID_OUT_STATE = '3';

  state = {
    campaign: {
      name: 'N/A',
      targetAmount: 0,
      totalCollected: 0,
      campaignFinished: false,
      deadline: new Date(0),
      isBeneficiary: false,
      state: ''
    },
    contributionAmount: '0'
  }

  constructor(props) {
    super(props);
    this.onContribute = this.onContribute.bind(this);
  }

  async componentDidMount() {
    const currentCampaign = await this.getCampaign(this.getCampaignAddress());
    this.setState({
      campaign: currentCampaign
    })
  }

  getCampaignAddress() {
    return this.props.match.params.address;
  }

  async getCampaign(address) {
    const contract = createContract(address);

    const name = await contract.methods.name().call();
    const targetAmount = await contract.methods.targetAmount().call();
    const totalCollected = await contract.methods.totalCollected().call();
    const beforeDeadline = await contract.methods.beforeDeadline().call();
    const beneficiary = await contract.methods.beneficiary().call();
    const deadlineSeconds = await contract.methods.fundingDeadline().call();
    const state = await contract.methods.state().call();

    var deadlineDate = new Date(0);
    deadlineDate.setUTCSeconds(deadlineSeconds);

    const accounts = await web3.eth.getAccounts()
    const account = accounts[0];

    return {
      name: name,
      targetAmount: targetAmount,
      totalCollected: totalCollected,
      campaignFinished: !beforeDeadline,
      deadline: deadlineDate,
      isBeneficiary: beneficiary.toLowerCase() === account.toLowerCase(),
      state: state
    }
  }

  render() {
    return(
      <div>
        <Table celled padded color="teal" striped>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Name</Table.HeaderCell>
              <Table.HeaderCell>Value</Table.HeaderCell>
            </Table.Row>
          </Table.Header>

          <Table.Body>
            <Table.Row>
              <Table.Cell singleLine>
                Name
              </Table.Cell>
              <Table.Cell singleLine>
                {this.state.campaign.name}
              </Table.Cell>
            </Table.Row>

            <Table.Row>
              <Table.Cell singleLine>
                Target Amount
              </Table.Cell>
              <Table.Cell singleLine>
                {this.state.campaign.targetAmount}
              </Table.Cell>
            </Table.Row>

            <Table.Row>
              <Table.Cell singleLine>
                Total Collected
              </Table.Cell>
              <Table.Cell singleLine>
                {this.state.campaign.totalCollected}
              </Table.Cell>
            </Table.Row>

            <Table.Row>
              <Table.Cell singleLine>
                Campaign Finished
              </Table.Cell>
              <Table.Cell singleLine>
                {this.state.campaign.campaignFinished.toString()}
              </Table.Cell>
            </Table.Row>

            <Table.Row>
              <Table.Cell singleLine>
                Deadline
              </Table.Cell>
              <Table.Cell singleLine>
                {this.state.campaign.deadline.toDateString()}
              </Table.Cell>
            </Table.Row>

            <Table.Row>
              <Table.Cell singleLine>
                Is beneficiary
              </Table.Cell>
              <Table.Cell singleLine>
                {this.state.campaign.isBeneficiary.toString()}
              </Table.Cell>
            </Table.Row>

            <Table.Row>
              <Table.Cell singleLine>
                State
              </Table.Cell>
              <Table.Cell singleLine>
                {this.state.campaign.state}
              </Table.Cell>
            </Table.Row>

          </Table.Body>
        </Table>
        {this.campaignInteractionSection()}
      </div>
    );
  }

  campaignInteractionSection() {
    if (this.state.campaign.campaignFinished) {
      return this.postCampaignInterface();
    } else {
      return this.contributeInterface();
    }
  }

  postCampaignInterface() {
    if (this.state.campaign.state === this.ONGOING_STATE) {
      return <div>
        <Button type="submit" positive>Finish campaign</Button>
      </div>
    }
    if (this.state.campaign.state === this.SUCCEEDED_STATE
        && this.state.campaign.isBeneficiary === true) {
      return <div>
        <Button type="submit" negative>Collect funds</Button>
      </div>
    }
    if (this.state.campaign.state === this.FAILED_STATE) {
      return <div>
        <Button type="submit" negative>Refund</Button>
      </div>
      }
  }

  contributeInterface() {
    return <div>
      <Input 
        action={{
          color: 'teal',
          content: 'Contribute',
          onClick: this.onContribute
        }}
        actionPosition='left'
        label='ETH'
        labelPosition='right'
        placeholder='1'
        onChange={(e) => this.setState({contributionAmount: e.target.value})}
      />
    </div>
  }

  async onContribute(event) {
    const accounts = await web3.eth.getAccounts();
    const amount = web3.utils.toWei(
      this.state.contributionAmount,
      'ether'
    );
    const contract = createContract(this.getCampaignAddress());
    await contract.methods.contribute().send({
      from: accounts[0],
      value: amount
    });

    const campaign = this.state.campaign;
    campaign.totalCollected = Number.parseInt(campaign.totalCollected) + Number.parseInt(amount);

    this.setState({ campaign: campaign });
  }
}