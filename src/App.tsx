import React from 'react';
import KanbanBoard from './components/KanbanBoard';
import './index.css'; // Ensure global styles are imported

function App() {
  return (
    // Remove padding/margins here if handled by KanbanBoard or specific sections
    <div className="App">
      <KanbanBoard />
    </div>
  );
}

export default App;
