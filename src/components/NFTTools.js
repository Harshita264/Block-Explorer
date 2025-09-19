import React, { useState } from 'react';
import { alchemy } from '../config/alchemy';

function NFTTools() {
  const [contractAddress, setContractAddress] = useState('');
  const [tokenId, setTokenId] = useState('');
  const [nftData, setNftData] = useState(null);
  const [floorPrice, setFloorPrice] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const lookupNFT = async () => {
    if (!contractAddress || !tokenId) {
      setError('Please enter both contract address and token ID');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      const metadata = await alchemy.nft.getNftMetadata(contractAddress, tokenId);
      setNftData(metadata);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching NFT:', error);
      setError('Could not fetch NFT metadata. Please check the contract address and token ID.');
      setLoading(false);
    }
  };

  const getFloorPrice = async () => {
    if (!contractAddress) {
      setError('Please enter a contract address');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      const floorPrice = await alchemy.nft.getFloorPrice(contractAddress);
      setFloorPrice(floorPrice);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching floor price:', error);
      setError('Could not fetch floor price. This might not be a valid NFT collection.');
      setLoading(false);
    }
  };

  const clearResults = () => {
    setNftData(null);
    setFloorPrice(null);
    setError('');
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-6">NFT Metadata Lookup</h2>
        
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-bold mb-2">Contract Address:</label>
            <input
              type="text"
              value={contractAddress}
              onChange={(e) => setContractAddress(e.target.value)}
              placeholder="0x..."
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
          <div>
            <label className="block text-sm font-bold mb-2">Token ID:</label>
            <input
              type="text"
              value={tokenId}
              onChange={(e) => setTokenId(e.target.value)}
              placeholder="1"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
        </div>

        <div className="flex gap-2 mb-4">
          <button
            onClick={lookupNFT}
            disabled={loading || !contractAddress || !tokenId}
            className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Get NFT Metadata'}
          </button>
          <button
            onClick={getFloorPrice}
            disabled={loading || !contractAddress}
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Get Floor Price'}
          </button>
          <button
            onClick={clearResults}
            className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
          >
            Clear Results
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {nftData && (
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <h3 className="font-bold text-lg mb-2">{nftData.title || 'Untitled NFT'}</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                {nftData.media?.[0]?.gateway && (
                  <img
                    src={nftData.media[0].gateway}
                    alt={nftData.title}
                    className="w-full h-64 object-cover rounded"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                )}
              </div>
              <div>
                <p className="mb-2"><strong>Token Type:</strong> {nftData.tokenType}</p>
                <p className="mb-2"><strong>Contract:</strong> <span className="font-mono text-sm break-all">{nftData.contract?.address}</span></p>
                <p className="mb-2"><strong>Token ID:</strong> {nftData.tokenId}</p>
                <p className="mb-2"><strong>Description:</strong> {nftData.description ? nftData.description.substring(0, 200) + (nftData.description.length > 200 ? '...' : '') : 'No description available'}</p>
              </div>
            </div>
          </div>
        )}

        {floorPrice && (
          <div className="bg-blue-50 rounded-lg p-4 mb-4">
            <h3 className="font-bold text-lg mb-2">Floor Price Information</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p><strong>OpenSea:</strong> {floorPrice.openSea?.floorPrice || 'N/A'} {floorPrice.openSea?.priceCurrency || 'ETH'}</p>
                <p><strong>LooksRare:</strong> {floorPrice.looksRare?.floorPrice || 'N/A'} {floorPrice.looksRare?.priceCurrency || 'ETH'}</p>
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 text-sm text-gray-600">
          <h3 className="font-bold mb-2">Try these example NFTs:</h3>
          <button
            onClick={() => {
              setContractAddress('0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D');
              setTokenId('1');
            }}
            className="block text-blue-500 hover:underline mb-1"
          >
            🐒 Bored Ape Yacht Club #1
          </button>
          <button
            onClick={() => {
              setContractAddress('0x60E4d786628Fea6478F785A6d7e704777c86a7c6');
              setTokenId('1');
            }}
            className="block text-blue-500 hover:underline mb-1"
          >
            🧬 Mutant Ape Yacht Club #1
          </button>
          <button
            onClick={() => {
              setContractAddress('0x57f1887a8BF19b14fC0dF6Fd9B2acc9Af147eA85');
              setTokenId('1');
            }}
            className="block text-blue-500 hover:underline"
          >
            🌐 ENS Domain #1
          </button>
        </div>
      </div>
    </div>
  );
}

export default NFTTools;