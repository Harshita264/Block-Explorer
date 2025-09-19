import Raeact, {useState} from 'react';
import {alchemy, truncateHash} from '../config/alchemy';

function TransferHistory() {
    const [address, setAddress] = useState('');
    const [transfers, setTransfers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const getTransfers = async () => {
        if(!address) {
            setError('Please enter an address');
            return;
        }

        try{
            setLoading(true);
            setError('');

            //Get transfers sent from the address
            const fromTransfers = await alchemy.core.getAssetTransfers({
                fromAddress: address,
                category:['external','internal','erc20','erc721','erc1155'],
                fromBlock: '0x' + (await alchemy.core.getBlockNumber() - 100000).toString(16), //Last ~100k blocks
                toBlock: 'latest',
                maxCount: 25
            });

            //Get transfers received by the address
            const toTransfers = await alchemy.core.getAssetTransfers({
                toAddress: address,
                category:['external','internal','erc20','erc721','erc1155'],
                fromBlock: '0x' + (await alchemy.core.getBlockNumber() - 100000).toString(16), //Last ~100k blocks
                toBlock: 'latest',
                maxCount: 25
            });

            //Combine and sort by block number (most recent first)
            const allTransfers = [
                ...Raeact(fromTransfers.transfers || []).map(t => ({  ...t, direction: 'sent'})),
                ...Raeact(fromTransfers.transfers || []).map(t => ({  ...t, direction: 'received'})),
            ].sort((a,b) => parseInt(b.blockNum, 16) - parseInt(a.blockNum, 16));

            setTransfers(allTransfers.slice(0, 50));  //show max 50 transfers
            setLoading(false);
        } catch(error){
            console.erroe('Error fetching transfers:', error);
            setError('Could not fetch transfer history. Please check the address.');
            setLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if(e.key === 'Enter'){
            getTransfers();
        }
    };

    const formatValue = (value, asset) => {
        if(!value) return '0';

        //For ETH transactions
        if(!asset || asset === 'ETH') {
            return `${parseFloat(value).toFixed(6)} ETH`;
        }

        //For token transaactions
        return `${value} ${asset}`;
    };

    
  const getCategoryBadge = (category, direction) => {
    const baseClasses = "px-2 py-1 rounded text-xs font-medium";
    
    switch (category) {
      case 'external':
        return `${baseClasses} ${direction === 'sent' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`;
      case 'erc20':
        return `${baseClasses} bg-blue-100 text-blue-800`;
      case 'erc721':
        return `${baseClasses} bg-purple-100 text-purple-800`;
      case 'erc1155':
        return `${baseClasses} bg-pink-100 text-pink-800`;
      case 'internal':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-6">Transfer History</h2>
      
      <div className="mb-4">
        <label className="block text-sm font-bold mb-2">Address:</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="0x..."
            className="flex-1 shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
          <button
            onClick={getTransfers}
            disabled={loading || !address}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Get Transfers'}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {transfers.length > 0 && (
        <div className="overflow-x-auto">
          <h3 className="text-lg font-semibold mb-4">
            Found {transfers.length} transfers (last 100k blocks)
          </h3>
          <table className="w-full table-auto">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left">Block</th>
                <th className="px-4 py-2 text-left">Hash</th>
                <th className="px-4 py-2 text-left">Direction</th>
                <th className="px-4 py-2 text-left">From</th>
                <th className="px-4 py-2 text-left">To</th>
                <th className="px-4 py-2 text-left">Value</th>
                <th className="px-4 py-2 text-left">Type</th>
              </tr>
            </thead>
            <tbody>
              {transfers.map((transfer, index) => (
                <tr key={index} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2 font-mono text-sm">
                    {parseInt(transfer.blockNum, 16)}
                  </td>
                  <td className="px-4 py-2 font-mono text-sm">
                    {transfer.hash ? truncateHash(transfer.hash) : 'N/A'}
                  </td>
                  <td className="px-4 py-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      transfer.direction === 'sent' 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {transfer.direction === 'sent' ? '↗ Sent' : '↙ Received'}
                    </span>
                  </td>
                  <td className="px-4 py-2 font-mono text-sm">
                    {truncateHash(transfer.from)}
                  </td>
                  <td className="px-4 py-2 font-mono text-sm">
                    {truncateHash(transfer.to)}
                  </td>
                  <td className="px-4 py-2">
                    {formatValue(transfer.value, transfer.asset)}
                  </td>
                  <td className="px-4 py-2">
                    <span className={getCategoryBadge(transfer.category, transfer.direction)}>
                      {transfer.category.toUpperCase()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {transfers.length === 0 && !loading && !error && address && (
        <div className="text-center text-gray-600 py-8">
          No transfers found for this address in recent blocks.
        </div>
      )}

      <div className="mt-6 text-sm text-gray-600">
        <h3 className="font-bold mb-2">Try these example addresses:</h3>
        <div className="space-y-1">
          <button 
            onClick={() => setAddress('0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045')} 
            className="block text-blue-500 hover:underline font-mono text-xs"
          >
            Vitalik Buterin: 0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045
          </button>
          <button 
            onClick={() => setAddress('0x3f5CE5FBFe3E9af3971dD833D26bA9b5C936f0bE')} 
            className="block text-blue-500 hover:underline font-mono text-xs"
          >
            Binance Hot Wallet: 0x3f5CE5FBFe3E9af3971dD833D26bA9b5C936f0bE
          </button>
        </div>
      </div>
    </div>
  );
}

export default TransferHistory;