// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title CopyTrade
 * @dev Records copy trade intentions on-chain for the Forecast Feed application
 * @notice Deployed on Base Sepolia - this records the intent to copy a trade
 */
contract CopyTrade {
    struct Trade {
        address copier;           // Who is copying
        address originalTrader;   // Who they're copying
        string marketId;          // Polymarket market ID
        string outcome;           // "Yes" or "No"
        string side;              // "BUY" or "SELL"
        uint256 amount;           // Amount in USD (scaled by 1e6)
        uint256 price;            // Price (scaled by 1e4, so 0.65 = 6500)
        uint256 timestamp;        // When the copy was recorded
        bytes32 originalTxHash;   // Original trade transaction hash
    }

    // All copy trades
    Trade[] public trades;
    
    // Mapping from copier to their trade indices
    mapping(address => uint256[]) private _userTrades;
    
    // Mapping from original trader to copies of their trades
    mapping(address => uint256[]) private _copiedTrades;

    event TradeCopied(
        uint256 indexed tradeId,
        address indexed copier,
        address indexed originalTrader,
        string marketId,
        string outcome,
        string side,
        uint256 amount,
        uint256 price
    );

    /**
     * @dev Record a copy trade
     * @param originalTrader Address of the trader being copied
     * @param marketId Polymarket market condition ID
     * @param outcome "Yes" or "No"
     * @param side "BUY" or "SELL"
     * @param amount Amount in USD (scaled by 1e6)
     * @param price Price (scaled by 1e4)
     * @param originalTxHash Transaction hash of the original trade
     */
    function copyTrade(
        address originalTrader,
        string calldata marketId,
        string calldata outcome,
        string calldata side,
        uint256 amount,
        uint256 price,
        bytes32 originalTxHash
    ) external returns (uint256) {
        require(originalTrader != address(0), "Invalid trader address");
        require(originalTrader != msg.sender, "Cannot copy your own trade");
        require(bytes(marketId).length > 0, "Invalid market ID");
        
        uint256 tradeId = trades.length;
        
        trades.push(Trade({
            copier: msg.sender,
            originalTrader: originalTrader,
            marketId: marketId,
            outcome: outcome,
            side: side,
            amount: amount,
            price: price,
            timestamp: block.timestamp,
            originalTxHash: originalTxHash
        }));
        
        _userTrades[msg.sender].push(tradeId);
        _copiedTrades[originalTrader].push(tradeId);
        
        emit TradeCopied(
            tradeId,
            msg.sender,
            originalTrader,
            marketId,
            outcome,
            side,
            amount,
            price
        );
        
        return tradeId;
    }

    /**
     * @dev Get all trades by a copier
     */
    function getUserTrades(address user) external view returns (uint256[] memory) {
        return _userTrades[user];
    }

    /**
     * @dev Get all copies of a trader's trades
     */
    function getCopiedTrades(address trader) external view returns (uint256[] memory) {
        return _copiedTrades[trader];
    }

    /**
     * @dev Get trade details
     */
    function getTrade(uint256 tradeId) external view returns (Trade memory) {
        require(tradeId < trades.length, "Trade does not exist");
        return trades[tradeId];
    }

    /**
     * @dev Get total number of copy trades
     */
    function getTotalTrades() external view returns (uint256) {
        return trades.length;
    }

    /**
     * @dev Get user's total copy trades count
     */
    function getUserTradeCount(address user) external view returns (uint256) {
        return _userTrades[user].length;
    }
}

