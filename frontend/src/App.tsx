import React from 'react';
import logo from './logo.svg';
import './App.css';
import UsersList from './Users';

function App() {
  return (
    <div className="App">
      <UsersList/>
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          alert au google oups
        </a>
      </header>
    </div>
  );
}

export default App;
