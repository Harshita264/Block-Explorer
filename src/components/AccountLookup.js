import React, { useState} from 'react';
import {alchemy, formatBalance} from '../config/alchemy';

function AccountLookup() {
    const [address, setAddress] = useState('');
    const [balance, setBalance] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const lookupBalance = async () => {
        if(!address) return;

        try {
            setLoading(true);
            setError('');

            const balance = await alchemy.core.getBalance(address);
            setBalance(balance);
            setLoading(false);
        } catch(error){
            console.error('Error fetching balance:', error);
            setError('Invalid address or network error');
            setLoading(false);
        }
    };
    const handleKeyPress = (e) => {
        if(e.key === 'Enter'){
            lookupBalance();
        }
    };

     return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-6">Account Balance Lookup</h2>
      
      <div className="mb-4">
        <label className="block text-sm font-bold mb-2">Ethereum Address:</label>
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
            onClick={lookupBalance}
            disabled={loading || !address}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded disabled:opacity-50"
          >
            {loading ? 'Looking up...' : 'Lookup'}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {balance !== null && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          <h3 className="font-bold">Balance:</h3>
          <p className="text-2xl font-mono">{formatBalance(balance)} ETH</p>
          <p className="text-sm mt-2">Address: <span className="font-mono break-all">{address}</span></p>
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

export default AccountLookup;