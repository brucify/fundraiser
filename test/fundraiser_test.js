const FundraiserContract = artifacts.require("Fundraiser");

contract("Fundraiser", accounts => {
    let fundraiser;
    const name          = "Beneficiary name";
    const url           = "beneficiary.org";
    const imageURL      = "https://beneficiary.org/image.png";
    const description   = "Beneficiary description";
    const beneficiary   = accounts[1];
    const owner         = accounts[0];

    describe("initialization", () => {
        beforeEach(async() => {
            fundraiser = await FundraiserContract.new( name
                                                     , url
                                                     , imageURL
                                                     , description
                                                     , beneficiary
                                                     , owner
                                                     );
        });

        it("gets the beneficiary name", async() => {
            const actual = await fundraiser.name();
            assert.equal(actual, name, "names should match");
        });

        it("gets the beneficiary url", async() => {
            const actual = await fundraiser.url();
            assert.equal(actual, url, "url should match");
        });

        it("gets the beneficiary image url", async() => {
            const actual = await fundraiser.imageURL();
            assert.equal(actual, imageURL, "image url should match");
        });

        it("gets the beneficiary description", async() => {
            const actual = await fundraiser.description();
            assert.equal(actual, description, "description should match");
        });

        it("gets the beneficiary address", async() => {
            const actual = await fundraiser.beneficiary();
            assert.equal(actual, beneficiary, "beneficiary address should match");
        });

        it("gets the owner address", async() => {
            const actual = await fundraiser.owner();
            assert.equal(actual, owner, "owner address should match");
        });

    });

    describe("setBeneficiary", () => {
        const newBeneficiary = accounts[2];

        it("updates beneficiary when called by owner account", async() => {
            await fundraiser.setBeneficiary(newBeneficiary, {from: owner});
            const actual = await fundraiser.beneficiary();
            assert.equal(actual, newBeneficiary, "New beneficiary should match");
        });

        it("updates beneficiary when called by a non-owner account", async() => {
            try {
                await fundraiser.setBeneficiary(newBeneficiary, {from: accounts[3]});
                assert.fail("Withdraw was not restricted to owners")
            } catch (error) {
                const expectedError = "Ownable: caller is not the owner";
                const actualError = error.reason;
                assert.equal(actualError, expectedError, "Error reason should match");
            }
        });

    });
});