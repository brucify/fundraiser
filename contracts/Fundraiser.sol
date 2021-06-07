// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../node_modules/@openzeppelin/contracts/access/Ownable.sol";

contract Fundraiser is Ownable {
    string public name;
    string public url;
    string public imageURL;
    string public description;
    address payable public beneficiary;

    constructor ( string memory _name
                , string memory _url
                , string memory _imageURL
                , string memory _description
                , address payable _beneficiary
                , address _owner
                ) {
        name        = _name;
        url         = _url;
        imageURL    = _imageURL;
        description = _description;
        beneficiary = _beneficiary;
        transferOwnership(_owner);
    }
}