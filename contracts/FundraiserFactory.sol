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
}