const FundraiserFactoryContract = artifacts.require("FundraiserFactory");

contract("FundraiserFactory: deployment", (accounts) => {
    it("has been deployed", async() => {
        assert(FundraiserFactoryContract.deployed(), "fundraiser factory was not deployed");
    });
});

contract("FundraiserFactory: createFundraiser", (accounts) => {
    let fundraiserFactory;
    const name          = "Beneficiary Name";
    const url           = "beneficiaryname.org";
    const imageURL      = "https://beneficiaryname.org/image.png";
    const description   = "Beneficiary description";
    const beneficiary   = accounts[1];

    it("increments the fundraiserCount", async() => {
        fundraiserFactory = await FundraiserFactoryContract.deployed();
        const count0 = await fundraiserFactory.fundraisersCount();
        await fundraiserFactory.createFundraiser( name
                                                , url
                                                , imageURL
                                                , description
                                                , beneficiary
                                                );
        const count1 = await fundraiserFactory.fundraisersCount();
        assert.equal(count1-count0, 1, "fundraisersCount should increment by 1");
    });

    it("emits fundraiserCreated event", async() => {
        fundraiserFactory = await FundraiserFactoryContract.deployed();
        const tx = await fundraiserFactory.createFundraiser( name
                                                           , url
                                                           , imageURL
                                                           , description
                                                           , beneficiary
                                                           );
        assert.equal(tx.logs[0].event, "fundraiserCreated", "event name should match");
    });
});