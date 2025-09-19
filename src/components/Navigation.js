import React from 'react';

function Navigation({currentPage, setCurrentPage}) {
    const pages = [
        {id: 'blocks', name:'Block Explorer', icon: '🔗'},
        {id: 'accounts', name:'Account Lookup', icon: '👤'},
        {id: 'nft', name:'NFT Tools', icon: '🎨'},
        {id: 'transfers', name:'Transfer History', icon: '📊'},
    ];
     return (
    <nav className="bg-blue-600 text-white p-4 mb-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-4 text-center">Ethereum Block Explorer</h1>
        <div className="flex flex-wrap justify-center gap-4">
          {pages.map(page => (
            <button
              key={page.id}
              onClick={() => setCurrentPage(page.id)}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                currentPage === page.id
                  ? 'bg-white text-blue-600'
                  : 'bg-blue-700 hover:bg-blue-800'
              }`}
            >
              {page.icon} {page.name}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}

export default Navigation;