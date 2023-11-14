//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

// Useful for debugging. Remove when deploying to a live network.
import "forge-std/console.sol";
import "./PhatRollupAnchor.sol";

// Use openzeppelin to inherit battle-tested implementations (ERC20, ERC721, etc)
// import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * A smart contract that allows changing a state variable of the contract and tracking the changes
 * It also allows the owner to withdraw the Ether in the contract
 * @author BuidlGuidl
 */
contract YourContract is PhatRollupAnchor {
    // State Variables
    address public immutable owner;
    address public testSender;
    bool public premium = false;
    uint256 public totalCounter = 0;
    bool public lastTrustScore = false;
    address public lastTargetAddress = 0x0000000000000000000000000000000000000000;

    uint256 constant TYPE_RESPONSE = 0;
    uint256 constant TYPE_ERROR = 2;

    mapping(address => uint8) public userTrustScoreThresholds;
    mapping(uint256 => address) requests;
    uint256 nextRequest = 1;

    // Events: a way to emit log statements from smart contract that can be listened to by external parties
    event TestSenderUpdated(address _testSender, uint8 threshold);
    event TrustScoreRequested(address indexed requester, address target, uint8 threshold, bool premium, uint256 value);
    event ResponseReceived(uint256 reqId, address requester, address target, uint8 threshold, bool theGraphTrustScore);
    event ErrorReceived(uint256 reqId, address requester, address target, bool error);
    event TheGraphTrustScoreReceived(uint256 reqid, address requester, address target, uint8 threshold, bool theGraphTrustScore);

    // Constructor: Called once on contract deployment
    // Check packages/foundry/deploy/Deploy.s.sol
    constructor(address _owner) {
        owner = _owner;
        testSender = _owner;
        userTrustScoreThresholds[testSender] = 5;
        _grantRole(PhatRollupAnchor.ATTESTOR_ROLE, _owner);
    }

    // Modifier: used to define a set of rules that must be met before or after a function is executed
    // Check the withdraw() function
    modifier isOwner() {
        // msg.sender: predefined variable that represents address of the account that called the current function
        require(msg.sender == owner, "Not the Owner");
        _;
    }

    function getTargetTrustScore(address _target, uint8 threshold) public payable {
        // Print data to the anvil chain console. Remove when deploying to a live network.

        console.logString("Fetching target trust score...");
        if (threshold > 5 || threshold < 1) {
            threshold = 5;
        }

        address sender = testSender;
        uint256 id = nextRequest;
        userTrustScoreThresholds[sender] = threshold;
        totalCounter += 1;
        requests[id] = _target;
        _pushMessage(abi.encode(id, sender, _target, threshold));
        nextRequest += 1;

        // msg.value: built-in global variable that represents the amount of ether sent with the transaction
        if (msg.value > 0) {
            premium = true;
        } else {
            premium = false;
        }

        // emit: keyword used to trigger an event
        emit TrustScoreRequested(sender, _target, threshold, msg.value > 0, 0);
    }

    function setTestSender(address _testSender, uint8 threshold) public payable {
        testSender = _testSender;
        userTrustScoreThresholds[testSender] = threshold;
        emit TestSenderUpdated(_testSender, threshold);
    }

    /**
     * Function that allows the owner to withdraw all the Ether in the contract
     * The function can only be called by the owner of the contract as defined by the isOwner modifier
     */
    function withdraw() public isOwner {
        (bool success,) = owner.call{value: address(this).balance}("");
        require(success, "Failed to send Ether");
    }

    /**
     * Function that allows the contract to receive ETH
     */
    receive() external payable {}

    /**
     * Function gets API info off-chain to set counter to the retrieved number
     */
    function _onMessageReceived(bytes calldata action) internal override {
        // Optional to check length of action
        // require(action.length == 32 * 3, "cannot parse action");
        (uint256 respType, uint256 id, address requester, bool theGraphTrustScore) =
                            abi.decode(action, (uint256, uint256, address, bool));
        address target = requests[id];
        uint8 threshold = userTrustScoreThresholds[requester];
        if (respType == TYPE_RESPONSE) {
            emit ResponseReceived(id, requester, target, threshold, theGraphTrustScore);
            delete requests[id];
        } else if (respType == TYPE_ERROR) {
            emit ErrorReceived(id, requester, target, false);
            delete requests[id];
        }
        console.logString("Trust Score");
        emit TheGraphTrustScoreReceived(id, requester, target, threshold, theGraphTrustScore);
        lastTargetAddress = requests[id];
        lastTrustScore = theGraphTrustScore;
    }
}
