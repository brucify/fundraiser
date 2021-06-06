const FundraiserContract = artifacts.require("Fundraiser");

contract("Fundraiser", accounts => {
    let fundraiser;
    const name = "Beneficiary name";
    const url = "beneficiary.org";
    const imageURL = "https://beneficiary.org/image.png";
    const description = "Beneficiary description";

    describe("initialization", () => {
        beforeEach(async() => {
            fundraiser = await FundraiserContract.new( name
                                                     , url
                                                     , imageURL
                                                     , description
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
        
    });
});