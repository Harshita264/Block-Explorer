import React, { useState, useEffect } from 'react';
import { alchemy, formatEther, formatTimestamp, truncateHash } from '../config/alchemy';

function BlockExplorer({ selectedBlock, setSelectedBlock, selectedTx, setSelectedTx }) {
  const [currentBlockNumber, setCurrentBlockNumber] = useState(null);
  const [recentBlocks, setRecentBlocks] = useState([]);
  const [blockData, setBlockData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [txReceipt, setTxReceipt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [txLoading, setTxLoading] = useState(false);

  useEffect(() => {
    async function getRecentBlocks() {
      try {
        setLoading(true);
        const currentBlock = await alchemy.core.getBlockNumber();
        setCurrentBlockNumber(currentBlock);
        
        // Get last 10 blocks
        const blocks = [];
        for (let i = 0; i < 10; i++) {
          const block = await alchemy.core.getBlock(currentBlock - i);
          blocks.push(block);
        }
        setRecentBlocks(blocks);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching blocks:', error);
        setLoading(false);
      }
    }

    getRecentBlocks();
  }, []);

  const loadBlockDetails = async (blockNumber) => {
    try {
      setLoading(true);
      setSelectedBlock(blockNumber);
      
      const block = await alchemy.core.getBlock(blockNumber);
      setBlockData(block);

      const blockWithTx = await alchemy.core.getBlockWithTransactions(blockNumber);
      setTransactions(blockWithTx.transactions);
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching block details:', error);
      setLoading(false);
    }
  };

  const getTransactionDetails = async (txHash) => {
    try {
      setTxLoading(true);
      setSelectedTx(txHash);
      
      const receipt = await alchemy.core.getTransactionReceipt(txHash);
      setTxReceipt(receipt);
      setTxLoading(false);
    } catch (error) {
      console.error('Error fetching transaction receipt:', error);
      setTxLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center text-xl">Loading blockchain data...</div>;
  }

  return (
    <div className="space-y-8">
      {!selectedBlock ? (
        <>
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-4">Current Block: #{currentBlockNumber}</h2>
            <p className="text-gray-600 mb-4">Click on any block below to explore its transactions</p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-4">Recent Blocks</h2>
            <div className="grid gap-4">
              {recentBlocks.map((block) => (
                <div
                  key={block.number}
                  onClick={() => loadBlockDetails(block.number)}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-blue-50 cursor-pointer transition-colors"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-semibold">Block #{block.number}</h3>
                      <p className="text-sm text-gray-600">Hash: {truncateHash(block.hash, 16)}</p>
                      <p className="text-sm text-gray-600">Miner: {truncateHash(block.miner, 16)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">{block.transactions?.length || 0} transactions</p>
                      <p className="text-sm text-gray-600">{formatTimestamp(block.timestamp)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Block #{selectedBlock} Details</h2>
              <button
                onClick={() => {setSelectedBlock(null); setBlockData(null); setTransactions([]); setTxReceipt(null);}}
                className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
              >
                ← Back to Blocks
              </button>
            </div>
            
            {blockData && (
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="mb-2"><strong>Hash:</strong> <span className="font-mono text-sm break-all">{blockData.hash}</span></p>
                  <p className="mb-2"><strong>Parent Hash:</strong> <span className="font-mono text-sm break-all">{blockData.parentHash}</span></p>
                  <p className="mb-2"><strong>Miner:</strong> <span className="font-mono text-sm">{blockData.miner}</span></p>
                  <p className="mb-2"><strong>Timestamp:</strong> {formatTimestamp(blockData.timestamp)}</p>
                </div>
                <div>
                  <p className="mb-2"><strong>Gas Used:</strong> {blockData.gasUsed?._hex ? parseInt(blockData.gasUsed._hex, 16).toLocaleString() : 'N/A'}</p>
                  <p className="mb-2"><strong>Gas Limit:</strong> {blockData.gasLimit?._hex ? parseInt(blockData.gasLimit._hex, 16).toLocaleString() : 'N/A'}</p>
                  <p className="mb-2"><strong>Difficulty:</strong> {blockData.difficulty?._hex ? parseInt(blockData.difficulty._hex, 16).toLocaleString() : 'N/A'}</p>
                  <p className="mb-2"><strong>Transaction Count:</strong> {transactions.length}</p>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-4">Transactions ({transactions.length})</h2>
            
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left">Hash</th>
                    <th className="px-4 py-2 text-left">From</th>
                    <th className="px-4 py-2 text-left">To</th>
                    <th className="px-4 py-2 text-left">Value (ETH)</th>
                    <th className="px-4 py-2 text-left">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.slice(0, 20).map((tx, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-2 font-mono text-sm">{truncateHash(tx.hash)}</td>
                      <td className="px-4 py-2 font-mono text-sm">{truncateHash(tx.from)}</td>
                      <td className="px-4 py-2 font-mono text-sm">{truncateHash(tx.to)}</td>
                      <td className="px-4 py-2">{formatEther(tx.value)} ETH</td>
                      <td className="px-4 py-2">
                        <button
                          onClick={() => getTransactionDetails(tx.hash)}
                          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded text-sm"
                          disabled={txLoading && selectedTx === tx.hash}
                        >
                          {txLoading && selectedTx === tx.hash ? 'Loading...' : 'Details'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {txReceipt && (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Transaction Receipt</h2>
                <button
                  onClick={() => {setTxReceipt(null); setSelectedTx(null);}}
                  className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                >
                  Close Details
                </button>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="mb-2"><strong>Hash:</strong> <span className="font-mono text-sm break-all">{txReceipt.transactionHash}</span></p>
                  <p className="mb-2"><strong>Block:</strong> {txReceipt.blockNumber}</p>
                  <p className="mb-2"><strong>From:</strong> <span className="font-mono text-sm">{txReceipt.from}</span></p>
                  <p className="mb-2"><strong>To:</strong> <span className="font-mono text-sm">{txReceipt.to}</span></p>
                  <p className="mb-2"><strong>Status:</strong>
                    <span className={`ml-2 px-2 py-1 rounded text-sm ${
                      txReceipt.status === 1 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {txReceipt.status === 1 ? 'Success' : 'Failed'}
                    </span>
                  </p>
                </div>
                <div>
                  <p className="mb-2"><strong>Gas Used:</strong> {txReceipt.gasUsed?._hex ? parseInt(txReceipt.gasUsed._hex, 16).toLocaleString() : 'N/A'}</p>
                  <p className="mb-2"><strong>Gas Price:</strong> {txReceipt.effectiveGasPrice?._hex ? (parseInt(txReceipt.effectiveGasPrice._hex, 16) / 1e9).toFixed(2) + ' Gwei' : 'N/A'}</p>
                  <p className="mb-2"><strong>Transaction Index:</strong> {txReceipt.transactionIndex}</p>
                  <p className="mb-2"><strong>Contract Address:</strong> {txReceipt.contractAddress || 'N/A'}</p>
                  <p className="mb-2"><strong>Logs:</strong> {txReceipt.logs?.length || 0}</p>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default BlockExplorer;