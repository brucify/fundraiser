// SPDX-License-Identifier: MIT
pragma solidity >=0.6.2 <0.9.0;

import "./Fundraiser.sol";

contract FundraiserFactory {
    Fundraiser[] private _fundraisers;

    event fundraiserCreated(Fundraiser indexed fundraiser, address indexed owner);

    function fundraisersCount() public view returns(uint256) {
        return _fundraisers.length;
    }

    function createFundraiser( string memory name
                             , string memory url
                             , string memory imageURL
                             , string memory description
                             , address payable beneficiary
                             ) public {
        Fundraiser f = new Fundraiser( name
                                     , url
                                     , imageURL
                                     , description
                                     , beneficiary
                                     , msg.sender
                                     );
        _fundraisers.push(f);
        emit fundraiserCreated(f, msg.sender);
    }

    function fundraisers(uint256 limit, uint256 offset) public view returns(Fundraiser[] memory collection) {
        require(offset <= fundraisersCount(), "offset out of bounds");
        uint256 size = fundraisersCount() -  offset;
        size = size < limit ? size : limit;
        size = size <= 20 ? size : 20;
        collection = new Fundraiser[](size);

        for(uint256 i=0; i < size; i++) {
            collection[i] = _fundraisers[i + offset];
        }
        return collection;
    }
}