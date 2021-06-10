// SPDX-License-Identifier: MIT
pragma solidity >=0.6.2 <0.9.0;

import "../node_modules/@openzeppelin/contracts/access/Ownable.sol";
import "../node_modules/@openzeppelin/contracts/utils/math/SafeMath.sol";

contract Fundraiser is Ownable {
    using SafeMath for uint256;

    struct Donation {
        uint256 value;
        uint256 date;
    }
    mapping(address => Donation[]) private _donations;

    uint256 public totalDonations;
    uint256 public donationsCount;
    string public name;
    string public url;
    string public imageURL;
    string public description;

    address payable public beneficiary;

    event DonationsReceived(address indexed donor, uint256 value);
    event Withdraw(uint256 amount);

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

    receive() external payable {
        totalDonations = totalDonations.add(msg.value);
        donationsCount++;
    }

    function setBeneficiary(address payable _beneficiary) public onlyOwner {
        beneficiary = _beneficiary;
    }

    function withdraw() public onlyOwner {
        uint256 balance = address(this).balance;
        beneficiary.transfer(balance);

        emit Withdraw(balance);
    }

    function donate() public payable {
        Donation memory donation = Donation({
            value: msg.value,
            date: block.timestamp
        });
        _donations[msg.sender].push(donation);
        totalDonations = totalDonations.add(msg.value);
        donationsCount++;

        emit DonationsReceived(msg.sender, msg.value);
    }

    function myDonations() public view returns( uint256[] memory values
                                              , uint256[] memory dates
                                              ) {
        uint256 count = myDonationsCount();
        values = new uint256[](count); // memory
        dates  = new uint256[](count); // memory

        for (uint256 i=0; i < count; i++) {
            Donation storage donation = _donations[msg.sender][i]; // already stored as state variable
            values[i] = donation.value;
            dates[i]  = donation.date;
        }

        return (values, dates);
    }

    function myDonationsCount() public view returns(uint256) {
        return _donations[msg.sender].length;
    }
}