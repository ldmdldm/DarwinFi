import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchDashboardData } from '../redux/dashboardSlice';

const Dashboard = () => {
const dispatch = useDispatch();
const { 
    portfolioValue, 
    totalYield, 
    activatedStrategies, 
    strategyStatistics, 
    recentTransactions, 
    isLoading, 
    error 
} = useSelector((state) => state.dashboard);

useEffect(() => {
    dispatch(fetchDashboardData());
}, [dispatch]);

if (isLoading) {
    return <div className="dashboard-loading">Loading dashboard data...</div>;
}

if (error) {
    return <div className="dashboard-error">Error loading dashboard: {error}</div>;
}

return (
    <div className="content">
        <div className="content__header">
            <h1 className="content__title">DarwinFi Dashboard</h1>
            <p className="content__subtitle">Your portfolio at a glance</p>
        </div>
        
        {/* Portfolio Overview Section */}
        <section className="dashboard-section">
            <div className="card__header">
                <h2 className="card__title">Portfolio Overview</h2>
            </div>
            <div className="dashboard-grid">
        <div className="card">
            <div className="card__header">
                <h3 className="card__title">Total Value</h3>
            </div>
            <p className="dashboard-value">${portfolioValue.total.toLocaleString()}</p>
            <p className="dashboard-change" style={{ color: portfolioValue.change >= 0 ? 'var(--success-color)' : 'var(--danger-color)' }}>
                {portfolioValue.change >= 0 ? '↑' : '↓'} {Math.abs(portfolioValue.change).toFixed(2)}%
            </p>
        </div>
        <div className="card">
            <div className="card__header">
                <h3 className="card__title">Total Yield</h3>
            </div>
            <p className="dashboard-value">${totalYield.amount.toLocaleString()}</p>
            <p className="dashboard-subtitle">APY: {totalYield.apy.toFixed(2)}%</p>
        </div>
        <div className="card">
            <div className="card__header">
                <h3 className="card__title">Active Strategies</h3>
            </div>
            <p className="dashboard-value">{activatedStrategies.count}</p>
            <p className="dashboard-subtitle">Generation: {activatedStrategies.generation}</p>
        </div>
        </div>
    </section>
    
    {/* Strategy Statistics Section */}
    <section className="dashboard-section">
        <div className="card">
            <div className="card__header">
                <h2 className="card__title">Strategy Statistics</h2>
            </div>
            <div className="strategy-table">
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
                <tr style={{ borderBottom: 'var(--border-width) solid var(--border-color)' }}>
                    <th style={{ padding: 'var(--spacing-md)', textAlign: 'left' }}>Strategy</th>
                    <th style={{ padding: 'var(--spacing-md)', textAlign: 'center' }}>Generation</th>
                    <th style={{ padding: 'var(--spacing-md)', textAlign: 'right' }}>Performance</th>
                    <th style={{ padding: 'var(--spacing-md)', textAlign: 'center' }}>Risk Score</th>
                    <th style={{ padding: 'var(--spacing-md)', textAlign: 'center' }}>Status</th>
                </tr>
            </thead>
            <tbody>
            {strategyStatistics.map((strategy) => (
                <tr key={strategy.id} style={{ borderBottom: 'var(--border-width) solid var(--border-color)' }}>
                    <td style={{ padding: 'var(--spacing-md)', textAlign: '
                <td style={{ color: strategy.performance >= 0 ? 'var(--success-color)' : 'var(--danger-color)' }}>
                    {strategy.performance >= 0 ? '+' : ''}{strategy.performance.toFixed(2)}%
                </td>
                <td style={{ padding: 'var(--spacing-md)', textAlign: 'center' }}>
                    <div style={{ 
                        width: '100%', 
                        height: '8px', 
                        backgroundColor: 'var(--border-color)', 
                        borderRadius: '4px',
                        overflow: 'hidden',
                        margin: '0 0 var(--spacing-xs)'
                    }}>
                        <div 
                            style={{ 
                                height: '100%', 
                                width: `${strategy.riskScore * 10}%`, 
                                backgroundColor: getRiskColor(strategy.riskScore),
                                borderRadius: '4px'
                            }}
                        ></div>
                    </div>
                    {strategy.riskScore}/10
                </td>
                <td>
                    <span style={{ 
                        padding: 'var(--spacing-xs) var(--spacing-sm)',
                        borderRadius: 'var(--border-radius-sm)',
                        backgroundColor: strategy.status === 'Active' ? 'rgba(40, 167, 69, 0.1)' : 
                                        strategy.status === 'Pending' ? 'rgba(255, 193, 7, 0.1)' : 
                                        'rgba(220, 53, 69, 0.1)',
                        color: strategy.status === 'Active' ? 'var(--success-color)' : 
                                strategy.status === 'Pending' ? 'var(--warning-color)' : 
                                'var(--danger-color)',
                        fontWeight: 'var(--font-weight-medium)',
                        fontSize: '0.875rem'
                    }}>
                        {strategy.status}
                    </span>
                </td>
                </tr>
            ))}
            </tbody>
        </table>
        </div>
    </div>
</section>

{/* Recent Transactions Section */}
<section className="dashboard-section">
    <div className="card">
        <div className="card__header">
            <h2 className="card__title">Recent Transactions</h2>
        </div>
        <div className="transaction-list">
        {recentTransactions.map((transaction) => (
            <div key={transaction.id} style={{ 
                display: 'flex', 
                alignItems: 'center', 
                padding: 'var(--spacing-md)',
                borderBottom: 'var(--border-width) solid var(--border-color)'
            }}>
                <div style={{ 
                    width: '40px', 
                    height: '40px', 
                    borderRadius: '50%', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    backgroundColor: transaction.type === 'Deposit' ? 'rgba(40, 167, 69, 0.1)' : 
                                    transaction.type === 'Withdrawal' ? 'rgba(220, 53, 69, 0.1)' : 
                                    'rgba(23, 162, 184, 0.1)',
                    color: transaction.type === 'Deposit' ? 'var(--success-color)' : 
                            transaction.type === 'Withdrawal' ? 'var(--danger-color)' : 
                            'var(--info-color)',
                    fontSize: '1.2rem',
                    marginRight: 'var(--spacing-md)'
                }}>
                    {transaction.type === 'Deposit' ? '↓' : 
                    transaction.type === 'Withdrawal' ? '↑' : '↔'}
                </div>
                <div style={{ flex: 1 }}>
                    <h4 style={{ margin: '0 0 var(--spacing-xs)', fontWeight: 'var(--font-weight-medium)' }}>
                        {transaction.type}: {transaction.strategy}
                    </h4>
                    <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                        {new Date(transaction.timestamp).toLocaleString()}
                    </p>
                </div>
                <div>
                    <p style={{ 
                        margin: 0, 
                        fontWeight: 'var(--font-weight-medium)',
                        color: transaction.type === 'Deposit' ? 'var(--success-color)' : 
                                transaction.type === 'Withdrawal' ? 'var(--danger-color)' : 
                                'var(--text-primary)'
                    }}>
                        {transaction.type === 'Deposit' ? '+' : 
                        transaction.type === 'Withdrawal' ? '-' : ''}
                        ${transaction.amount.toLocaleString()}
                    </p>
                </div>
            </div>
        ))}
        </div>
    </div>
</section>
</div>
);
};

// Helper function to determine risk color
const getRiskColor = (riskScore) => {
if (riskScore < 3) return '#4CAF50'; // Low risk - green
if (riskScore < 7) return '#FFC107'; // Medium risk - yellow
return '#F44336'; // High risk - red
};

export default Dashboard;

