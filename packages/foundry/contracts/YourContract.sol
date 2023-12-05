// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import "./PhatRollupAnchor.sol";

contract YourContract is PhatRollupAnchor {
    event ResponseReceived(uint reqId, address target, uint256 score);
    event ErrorReceived(uint reqId, address target, uint256 errno);

    uint constant TYPE_RESPONSE = 0;
    uint constant TYPE_ERROR = 2;

    address public immutable owner;
    mapping(uint => address) requests;
    uint nextRequest = 1;
    mapping(address => uint256) public accountTrustScores;

    constructor(address phatAttestor) {
        owner = msg.sender;
        _grantRole(PhatRollupAnchor.ATTESTOR_ROLE, phatAttestor);
    }

    // Modifier: used to define a set of rules that must be met before or after a function is executed
    // Check the withdraw() function
    modifier isOwner() {
        // msg.sender: predefined variable that represents address of the account that called the current function
        require(msg.sender == owner, "Not the Owner");
        _;
    }

    function setAttestor(address phatAttestor) public {
        _grantRole(PhatRollupAnchor.ATTESTOR_ROLE, phatAttestor);
    }

    function request(address target) public {
        // assemble the request
        uint id = nextRequest;
        requests[id] = target;
        _pushMessage(abi.encode(id, target));
        nextRequest += 1;
    }

    // For test
    function malformedRequest(bytes calldata malformedData) public {
        uint id = nextRequest;
        requests[id] = 0x0000000000000000000000000000000000000000;
        _pushMessage(malformedData);
        nextRequest += 1;
    }

    function _onMessageReceived(bytes calldata action) internal override {
        // Optional to check length of action
        // require(action.length == 32 * 3, "cannot parse action");
        (uint respType, uint id, uint256 score) = abi.decode(
            action,
            (uint, uint, uint256)
        );
        address target = requests[id];
        if (respType == TYPE_RESPONSE) {
            emit ResponseReceived(id, target, score);
            accountTrustScores[target] = score;
            delete requests[id];
        } else if (respType == TYPE_ERROR) {
            emit ErrorReceived(id, target, score);
            delete requests[id];
        }
    }
}
