var CrowdFundingWithDeadline = artifacts.require("./CrowdFundingWithDeadline.sol");

module.exports = (deployer) => {
    deployer.deploy(
        CrowdFundingWithDeadline,
        "Test campaign",
        1,
        200,
        "0xdA97D2d5e6dc84B24A4cf5219cfF174aF6306Fe5"
    )
}