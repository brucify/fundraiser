const FundraiserFactoryContract = artifacts.require("FundraiserFactory");

contract("FundraiserFactory: deployment", (accounts) => {
    it("has been deployed", async() => {
        assert(FundraiserFactoryContract.deployed(), "fundraiser factory was not deployed");
    });
});