const FundraiserFactoryContract = artifacts.require("FundraiserFactory");
const FundraiserContract = artifacts.require("Fundraiser");

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
        const owner = accounts[0];
        const tx = await fundraiserFactory.createFundraiser( name
                                                           , url
                                                           , imageURL
                                                           , description
                                                           , beneficiary
                                                           , {from: owner}
                                                           );
        assert.equal(tx.logs[0].event, "fundraiserCreated", "event name should match");
        assert.equal(tx.logs[0].args.owner, owner, "owner address should match");
    });
});

contract("FundraiserFactory: fundraiser", (accounts) => {
    async function createFundraiserFactory(fundraiserCount, accounts) {
        const factory = await FundraiserFactoryContract.new();
        await addFundraisers(factory, fundraiserCount, accounts);
        return factory;
    }

    async function addFundraisers(factory, count, accounts) {
        const name = "Beneficiary";
        const lowerCaseName = name.toLowerCase();
        const beneficiary = accounts[1];

        for(let i=0; i < count; i++){
            await factory.createFundraiser(
                `${name} ${i}`,
                `${lowerCaseName}${i}.com`,
                `${lowerCaseName}${i}.png`,
                `Description for ${name} ${i}`,
                beneficiary
            );
        }
    }

    describe("when fundraisers collection is empty", () => {
        it("returns an empty collection", async() => {
            const factory = await createFundraiserFactory(0, accounts);
            const fundraisers = await factory.fundraisers(10, 0);
            assert.equal(fundraisers.length, 0, "Collection shuold be empty");
        });
    });

    describe("varying limits", () => {
        let factory;
        beforeEach(async() => {
            factory = await createFundraiserFactory(30, accounts);
        });

        it("returns 10 results when limit requested is 10", async() => {
            const fundraisers = await factory.fundraisers(10, 0);
            assert.equal(fundraisers.length, 10, "results size should be 10");
        });

        it("returns 20 results when limit requested is 20", async() => {
            const fundraisers = await factory.fundraisers(20, 0);
            assert.equal(fundraisers.length, 20, "results size should be 20");
        });

        it("returns 20 results when limit requested is 30", async() => {
            const fundraisers = await factory.fundraisers(30, 0);
            assert.equal(fundraisers.length, 20, "max results size should be 20");
        });
    });

    describe("varying offset", () => {
        let factory;
        beforeEach(async() => {
            factory = await createFundraiserFactory(10, accounts);
        });

        it("returns the fundraiser with appropriate offset", async() => {
            const addrs         = await factory.fundraisers(1, 0);
            const fundraiser    = await FundraiserContract.at(addrs[0]);
            const name          = await fundraiser.name();
            assert.ok(await name.includes(0), `${name} did not include the offset`);
        });

        it("returns the fundraiser with appropriate offset", async() => {
            const addrs         = await factory.fundraisers(1, 7);
            const fundraiser    = await FundraiserContract.at(addrs[0]);
            const name          = await fundraiser.name();
            assert.ok(await name.includes(7), `${name} did not include the offset`);
        });
    });

    describe("boundary", () => {
        let factory;
        beforeEach(async() => {
            factory = await createFundraiserFactory(10, accounts);
        });

        it("raises out of bounds error", async() => {
            try {
                await factory.fundraisers(1, 11);
                assert.fail("should have raised an error");
            } catch (error) {
                assert.ok(error.message.includes("offset out of bounds"), `${error.message}`);
            }
        });

        it("adjusts return size to prevent out of bounds error", async() => {
            try {
                const fundraisers = await factory.fundraisers(10, 5);
                assert.equal(fundraisers.length, 5, "return length adjusted");
            } catch (error) {
                assert.fail("limit and offset exceed bounds");
            }
        });
    });
});