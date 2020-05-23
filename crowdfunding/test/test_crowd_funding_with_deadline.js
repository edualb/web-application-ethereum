let CrowdFundingWithDeadline = artifacts.require('./TestCrowdFundingWithDeadline');
const truffleAssert = require('truffle-assertions');

/*
* https://ethereum.stackexchange.com/questions/67087/how-to-use-bignumbers-in-truffle-tests
* use toFixed() for BigNumber (Truffle 4.x / web3 1.x)
* use toString() for BN (Truffle 5.x / web3 1.x)
*/

contract('CrowdFundingWithDeadline', (accounts) => {
    let contract;
    let contractCreator = accounts[0];
    let beneficiary = accounts[1];

    const ONE_ETH = 1000000000000000000;

    const ONGOING_STATE = '0';
    const FAILED_STATE = '1';
    const SUCCEEDED_STATE = '2';
    const PAID_OUT_STATE = '3';

    beforeEach(async () => {
        contract = await CrowdFundingWithDeadline.new(
            'funding',
            1,
            10,
            beneficiary,
            {
                from: contractCreator,
                gas: 2000000
            }
        );
    });

    it('contract is initialized', async () => {
        let campaignName = await contract.name.call();
        expect(campaignName).to.equal('funding');

        let targetAmount = await contract.targetAmount.call();
        targetAmount = parseInt(targetAmount.toString());
        expect(targetAmount).to.equal(ONE_ETH);

        let fundingDeadline = await contract.fundingDeadline.call();
        fundingDeadline = parseInt(fundingDeadline.toString());
        expect(fundingDeadline).to.equal(600);
        
        let actualBeneficiary = await contract.beneficiary.call();
        expect(actualBeneficiary.toString()).to.equal(beneficiary.toString());

        let state = await contract.state.call()
        expect(state.valueOf().toString()).to.equal(ONGOING_STATE.toString());
    });

    it('funds are contributed', async () => {
        await contract.contribute({
            value: ONE_ETH,
            from: contractCreator
        })

        let contributed = await contract.amounts.call(contractCreator);
        contributed = parseInt(contributed.toString());
        expect(contributed).to.equal(ONE_ETH);

        let totalCollected = await contract.totalCollected.call();
        totalCollected = parseInt(totalCollected.toString());
        expect(totalCollected).to.equal(ONE_ETH);
    })

    it('cannot contribute after deadline', async () => {
        ERROR_MSG = 'Returned error: VM Exception while processing transaction: revert';
        try {
            await contract.setCurrentTime(601);
            await contract.sendTransaction({
                value: ONE_ETH,
                from: contractCreator
            });
            expect.fail();
        } catch(error) {
            expect(error.message).to.equal(ERROR_MSG);
        }
    })

    it('crowdfunding succeeded', async () => {
        await contract.contribute({
            value: ONE_ETH,
            from: contractCreator
        });
        await contract.setCurrentTime(601);
        await contract.finishCrowdFunding();
        let state = await contract.state.call();

        expect(state.valueOf().toString()).to.equal(SUCCEEDED_STATE);
    })

    it('crowdfunding failed', async () => {
        await contract.setCurrentTime(601);
        await contract.finishCrowdFunding();
        let state = await contract.state.call();

        expect(state.valueOf().toString()).to.equal(FAILED_STATE);
    })

    it('collected money paid out', async () => {
        await contract.contribute({
            value: ONE_ETH,
            from: contractCreator
        });
        await contract.setCurrentTime(601);
        await contract.finishCrowdFunding();

        let initAmount = await web3.eth.getBalance(beneficiary);
        await contract.collect({from: contractCreator});

        let newBalance = await web3.eth.getBalance(beneficiary);
        expect(newBalance - initAmount).to.equal(ONE_ETH);

        let fundingState = await contract.state.call();
        expect(fundingState.toString()).to.equal(PAID_OUT_STATE);
    })

    it('withdraw funds from the contract', async () => {
        await contract.contribute({value: ONE_ETH - 100, from: contractCreator});
        await contract.setCurrentTime(601);
        await contract.finishCrowdFunding();

        await contract.withdraw({from: contractCreator});
        let amount = await contract.amounts.call(contractCreator);
        expect(parseInt(amount.toString())).to.equal(0);
    })

    it('event is emitted', async () => {
        await contract.setCurrentTime(601);
        let result = await contract.finishCrowdFunding();

        truffleAssert.eventEmitted(result, 'CampaignFinnished', (event) => {
            return parseInt(event.totalCollected.toString()) === 0 && event.succeeded === false;;
        }, 'CampaignFinnished should be emitted with correct parameters')
    })
})