import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './redux/store';
import Dashboard from './components/Dashboard';
import StrategyExplorer from './components/StrategyExplorer';
import PerformanceTracker from './components/PerformanceTracker';
import './App.css';

function App() {
return (
    <Provider store={store}>
    <Router>
        <div className="app-container">
        <header className="app-header">
            <h1>DarwinFi</h1>
            <nav className="main-nav">
            <ul>
                <li><Link to="/">Dashboard</Link></li>
                <li><Link to="/strategies">Strategy Explorer</Link></li>
                <li><Link to="/performance">Performance Tracker</Link></li>
            </ul>
            </nav>
        </header>
        
        <main className="app-content">
            <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/strategies" element={<StrategyExplorer />} />
            <Route path="/performance" element={<PerformanceTracker />} />
            </Routes>
        </main>
        
        <footer className="app-footer">
            <p>DarwinFi &copy; 2025 - Evolutionary Yield Optimization</p>
        </footer>
        </div>
    </Router>
    </Provider>
);
}

export default App;

