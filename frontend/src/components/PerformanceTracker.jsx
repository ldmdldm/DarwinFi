import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
selectAllStrategies, 
selectCurrentStrategy,
selectEvolutionHistory 
} from '../redux/strategySlice';
import './PerformanceTracker.css';

// Mock data for visualization
const generatePerformanceData = () => {
return {
    dailyReturns: Array.from({ length: 30 }, (_, i) => ({
    date: new Date(Date.now() - (30 - i) * 86400000).toISOString().split('T')[0],
    return: ((Math.random() * 2) - 0.5).toFixed(4)
    })),
    cumulativeReturns: Array.from({ length: 30 }, (_, i) => ({
    date: new Date(Date.now() - (30 - i) * 86400000).toISOString().split('T')[0],
    value: (100 * (1 + 0.005) ** i).toFixed(2)
    })),
    riskMetrics: {
    sharpeRatio: (Math.random() * 2 + 1).toFixed(2),
    maxDrawdown: (Math.random() * 15).toFixed(2),
    volatility: (Math.random() * 10).toFixed(2),
    beta: (Math.random() * 0.5 + 0.5).toFixed(2),
    alpha: (Math.random() * 5).toFixed(2)
    },
    strategyDistribution: [
    { name: 'Liquidity Provision', value: 35 },
    { name: 'Yield Farming', value: 25 },
    { name: 'Arbitrage', value: 15 },
    { name: 'Lending', value: 15 },
    { name: 'Staking', value: 10 },
    ],
    evolutionMetrics: Array.from({ length: 10 }, (_, i) => ({
    generation: i + 1,
    avgReturn: (i * 0.8 + Math.random() * 2).toFixed(2),
    maxReturn: (i * 1.2 + Math.random() * 3).toFixed(2),
    minReturn: (i * 0.4 + Math.random() * 1).toFixed(2),
    diversityScore: (Math.random() * 0.2 + 0.7).toFixed(2)
    }))
};
};

const PerformanceTracker = () => {
const dispatch = useDispatch();
const allStrategies = useSelector(selectAllStrategies);
const currentStrategy = useSelector(selectCurrentStrategy);
const evolutionHistory = useSelector(selectEvolutionHistory);

const [timeframe, setTimeframe] = useState('month');
const [performanceData, setPerformanceData] = useState(null);
const [comparisonMode, setComparisonMode] = useState(false);
const [selectedStrategies, setSelectedStrategies] = useState([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
    // Simulate loading data
    setLoading(true);
    setTimeout(() => {
    setPerformanceData(generatePerformanceData());
    setLoading(false);
    }, 1000);
}, [timeframe]);

const handleTimeframeChange = (newTimeframe) => {
    setTimeframe(newTimeframe);
};

const toggleComparisonMode = () => {
    setComparisonMode(!comparisonMode);
    setSelectedStrategies([]);
};

const toggleStrategySelection = (strategyId) => {
    if (selectedStrategies.includes(strategyId)) {
    setSelectedStrategies(selectedStrategies.filter(id => id !== strategyId));
    } else {
    setSelectedStrategies([...selectedStrategies, strategyId]);
    }
};

if (loading) {
    return <div className="performance-tracker loading">Loading performance data...</div>;
}

return (
    <div className="performance-tracker">
    <div className="performance-header">
        <h2>Performance Analytics</h2>
        <div className="timeframe-selector">
        <button 
            className={timeframe === 'week' ? 'active' : ''} 
            onClick={() => handleTimeframeChange('week')}
        >
            Week
        </button>
        <button 
            className={timeframe === 'month' ? 'active' : ''} 
            onClick={() => handleTimeframeChange('month')}
        >
            Month
        </button>
        <button 
            className={timeframe === 'quarter' ? 'active' : ''} 
            onClick={() => handleTimeframeChange('quarter')}
        >
            Quarter
        </button>
        <button 
            className={timeframe === 'year' ? 'active' : ''} 
            onClick={() => handleTimeframeChange('year')}
        >
            Year
        </button>
        <button 
            className={timeframe === 'all' ? 'active' : ''} 
            onClick={() => handleTimeframeChange('all')}
        >
            All Time
        </button>
        </div>
        <button 
        className={`comparison-toggle ${comparisonMode ? 'active' : ''}`}
        onClick={toggleComparisonMode}
        >
        {comparisonMode ? 'Exit Comparison' : 'Compare Strategies'}
        </button>
    </div>

    {comparisonMode && (
        <div className="strategy-comparison-selector">
        <h3>Select Strategies to Compare</h3>
        <div className="strategy-selection-list">
            {allStrategies.map(strategy => (
            <div 
                key={strategy.id} 
                className={`strategy-selection-item ${selectedStrategies.includes(strategy.id) ? 'selected' : ''}`}
                onClick={() => toggleStrategySelection(strategy.id)}
            >
                <span className="strategy-name

