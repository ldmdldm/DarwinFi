import React, { useState } from 'react';
import { Routes, Route, NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import './App.css';

// Placeholder components - would be imported from separate files
const Dashboard = () => <div className="dashboard-container">Dashboard Content</div>;
const StrategyExplorer = () => <div className="strategy-explorer-container">Strategy Explorer Content</div>;
const PerformanceTracker = () => <div className="performance-tracker-container">Performance Tracker Content</div>;
const Settings = () => <div className="settings-container">Settings Content</div>;

const App = () => {
const [sidebarOpen, setSidebarOpen] = useState(true);
const { walletConnected } = useSelector(state => state.dashboard);

const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
};

return (
    <div className="app-container">
    {/* Header */}
    <header className="app-header">
        <div className="logo-container">
        <span className="menu-toggle" onClick={toggleSidebar}>☰</span>
        <h1>DarwinFi</h1>
        </div>
        
        <div className="header-actions">
        {!walletConnected ? (
            <button className="connect-wallet-btn">Connect Wallet</button>
        ) : (
            <div className="wallet-info">
            <span className="wallet-balance">0.00 INJ</span>
            <span className="wallet-address">0x...123</span>
            </div>
        )}
        </div>
    </header>

    <div className="main-container">
        {/* Sidebar Navigation */}
        <aside className={`app-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <nav className="sidebar-nav">
            <NavLink to="/" className={({isActive}) => isActive ? 'nav-link active' : 'nav-link'}>
            Dashboard
            </NavLink>
            <NavLink to="/strategies" className={({isActive}) => isActive ? 'nav-link active' : 'nav-link'}>
            Strategy Explorer
            </NavLink>
            <NavLink to="/performance" className={({isActive}) => isActive ? 'nav-link active' : 'nav-link'}>
            Performance Tracking
            </NavLink>
            <NavLink to="/settings" className={({isActive}) => isActive ? 'nav-link active' : 'nav-link'}>
            Settings
            </NavLink>
        </nav>
        
        <div className="sidebar-footer">
            <p>DarwinFi v0.1.0</p>
            <p>Evolution in progress...</p>
        </div>
        </aside>

        {/* Main Content Area */}
        <main className="content-area">
        <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/strategies" element={<StrategyExplorer />} />
            <Route path="/performance" element={<PerformanceTracker />} />
            <Route path="/settings" element={<Settings />} />
        </Routes>
        </main>
    </div>
    </div>
);
};

export default App;

