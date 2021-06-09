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
                assert.equal(error.reason, "Ownable: caller is not the owner", "Error reason text should match");
            }
        });
    });

    describe("making donations", () => {
        const value = web3.utils.toWei('0.0289');
        const donor = accounts[2];

        it("increases myDonationsCount", async() => {
            const count0 = await fundraiser.myDonationsCount({from: donor});
            await fundraiser.donate({from: donor, value});
            const count1 = await fundraiser.myDonationsCount({from: donor});

            assert.equal(count1 - count0, 1, "myDonationsCount should increment by 1");
        });

        it("includes donation in myDonations", async() => {
            await fundraiser.donate({from: donor, value: value});
            const {values, dates} = await fundraiser.myDonations({from: donor});
            assert.equal(value, values[0], "values should match");
            assert(dates[0], "date should be present");
        });

        it("increases the totalDonantions amount", async() => {
            const total0 = await fundraiser.totalDonations();
            await fundraiser.donate({from: donor, value: value});
            const total1 = await fundraiser.totalDonations();

            assert.equal(total1 - total0, value, "Diff should match");
        });

        it("increases the donationsCount", async() => {
            const count0 = await fundraiser.donationsCount();
            await fundraiser.donate({from: donor, value: value});
            const count1 = await fundraiser.donationsCount();

            assert.equal(count1 - count0, 1, "donationsCount should increment by 1");
        });

        it("emits the DonationReceived event", async() => {
            const tx = await fundraiser.donate({from: donor, value: value});
            assert.equal(tx.logs[0].event, "DonationsReceived", "event name should match");
            assert.equal(tx.logs[0].args.value, value, "value field should match");
        });
    });

    describe("withdrawing funds", () => {
        beforeEach(async () => {
            await fundraiser.setBeneficiary(beneficiary, {from: owner}); // reset beneficiary address
            await fundraiser.donate({from: accounts[2], value: web3.utils.toWei('0.2')});
        });

        describe("access controls", () => {
            it("throws an error when called from a non-owner account", async() => {
                try {
                    await fundraiser.withdraw({from: accounts[3]});
                    assert.fail("withdraw from non-ownser should not be allowed")
                } catch (error) {
                    assert.equal(error.reason, "Ownable: caller is not the owner", "error reason should match");
                }
            });

            it("permits the owner account to call the function", async() => {
                try {
                    await fundraiser.withdraw({from: owner});
                    assert(true, "no errors were thrown")
                } catch (error) {
                    assert.fail("should not have thrown an error")
                }
            });
        });

        it("transfers balance to beneficiary", async() => {
            const contractBalance0 = await web3.eth.getBalance(fundraiser.address);
            const beneficiaryBalance0 = await web3.eth.getBalance(beneficiary);

            await fundraiser.withdraw({from: owner});

            const contractBalance1 = await web3.eth.getBalance(fundraiser.address);
            const beneficiaryBalance1 = await web3.eth.getBalance(beneficiary);

            assert.equal(contractBalance1, 0, "contract balance should be 0");
            assert.equal(beneficiaryBalance1-beneficiaryBalance0, contractBalance0, "beneficiary should have received all contract balance");
        });

        it("emits withdraw event", async() => {
            const balance0 = await web3.eth.getBalance(beneficiary);
            const tx = await fundraiser.withdraw({from: owner});
            const balance1 = await web3.eth.getBalance(beneficiary);
            const amount = await web3.eth.getBalance(fundraiser.address);

            assert.equal(amount, 0, "Remaining amount should be 0");
            assert.equal(tx.logs[0].event, "Withdraw", "event name should match");
            assert.equal(tx.logs[0].args.amount, balance1-balance0, "value field should match");
        });
    });
});