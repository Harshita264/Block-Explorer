import React, {useState} from 'react';
import Navigation from './components/Navigation';
import BlockExplorer from './components/BlockExplorer';
import AccountLookup from './components/AccountLookup';
import NFTTools from './components/NFTTools';
import TransferHistory from './components/TransferHistory';
import './App.css';

function App() {
  const [currentPage, setCurrentPage] = useState('blocks');
  const [selectedBlock, setSelectedBlock] = useState(null);
  const [selectedTx, setSelectedTx] = useState(null);

  const renderPage = () => {
    switch (currentPage) {
      case 'blocks':
        return(
          <BlockExplorer 
          selectedBlock = {selectedBlock}
          setSelectedBlock = {setSelectedBlock}
          selectedTx = {setSelectedTx}
          setSelectedTx = {setSelectedTx}
          />
        );

        case 'accounts':
          return <AccountLookup />;
          case 'nft':
            return <NFTTools />
            case 'transfers':
              return <TransferHistory />;
              default:
                return <BlockExplorer />;
    }
  };

  return (
    <div className = "min-h-screen bg-gray-100">
      <Navigation currentPage = {currentPage} setCurrentPage={setCurrentPage}/>
      <div className = "max-w-7xl mx-auto px-4">
        {renderPage()}
      </div>
    </div>
  );
}
export default App;