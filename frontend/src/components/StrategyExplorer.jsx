import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
fetchStrategies, 
selectStrategy, 
updateFilter, 
updateSort,
selectAllStrategies,
selectSelectedStrategy,
selectFilterOptions,
selectSortOptions
} from '../redux/strategySlice';
import './StrategyExplorer.css';

const StrategyExplorer = () => {
const dispatch = useDispatch();
const strategies = useSelector(selectAllStrategies);
const selectedStrategy = useSelector(selectSelectedStrategy);
const filterOptions = useSelector(selectFilterOptions);
const sortOptions = useSelector(selectSortOptions);

// Local state for form controls
const [searchTerm, setSearchTerm] = useState('');

useEffect(() => {
    // Load strategies when component mounts
    dispatch(fetchStrategies());
}, [dispatch]);

// Handle filter change
const handleFilterChange = (e) => {
    const { name, value } = e.target;
    dispatch(updateFilter({ [name]: value }));
};

// Handle sort change
const handleSortChange = (e) => {
    const { value } = e.target;
    dispatch(updateSort(value));
};

// Handle strategy selection
const handleStrategySelect = (strategyId) => {
    dispatch(selectStrategy(strategyId));
};

// Handle search input
const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    dispatch(updateFilter({ name: e.target.value }));
};

return (
    <div className="strategy-explorer">
    <div className="strategy-explorer__controls">
        <h2>Strategy Explorer</h2>
        
        <div className="search-and-filters">
        <div className="search-bar">
            <input
            type="text"
            placeholder="Search strategies..."
            value={searchTerm}
            onChange={handleSearchChange}
            />
        </div>
        
        <div className="filters">
            <div className="filter-group">
            <label>Risk Level:</label>
            <select 
                name="riskLevel" 
                value={filterOptions.riskLevel || ""}
                onChange={handleFilterChange}
            >
                <option value="">All Risk Levels</option>
                <option value="low">Low Risk</option>
                <option value="medium">Medium Risk</option>
                <option value="high">High Risk</option>
            </select>
            </div>
            
            <div className="filter-group">
            <label>Status:</label>
            <select 
                name="status" 
                value={filterOptions.status || ""}
                onChange={handleFilterChange}
            >
                <option value="">All Statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="evolving">Evolving</option>
            </select>
            </div>
            
            <div className="filter-group">
            <label>Sort By:</label>
            <select
                value={sortOptions.sortBy || "performance"}
                onChange={handleSortChange}
            >
                <option value="performance">Performance</option>
                <option value="age">Age</option>
                <option value="risk">Risk Level</option>
                <option value="name">Name</option>
            </select>
            </div>
        </div>
        </div>
    </div>
    
    <div className="strategy-explorer__content">
        <div className="strategies-list">
        <h3>Available Strategies</h3>
        {strategies.length === 0 ? (
            <p>No strategies found.</p>
        ) : (
            <ul>
            {strategies.map(strategy => (
                <li 
                key={strategy.id}
                className={`strategy-item ${selectedStrategy?.id === strategy.id ? 'selected' : ''}`}
                onClick={() => handleStrategySelect(strategy.id)}
                >
                <div className="strategy-item__header">
                    <h4>{strategy.name}</h4>
                    <span className={`status status--${strategy.status}`}>
                    {strategy.status}
                    </span>
                </div>
                <div className="strategy-item__metrics">
                    <div className="metric">
                    <span className="metric-label">Performance:</span>
                    <span className="metric-value">{strategy.performance}%</span>
                    </div>
                    <div className="metric">
                    <span className="metric-label">Risk:</span>
                    <span className="metric-value">{strategy.riskLevel}</span>
                    </div>
                    <div className="metric">
                    <span className="metric-label">Generation:</span>
                    <span className="metric-value">{strategy.generation}</span>
                    </div>
                </div>
                </li>
            ))}
            </ul>
        )}
        </div>
        
        <div className="strategy-details">
        {!selectedStrategy ? (
            <div className="empty-state">
            <p>Select a strategy to view details</p>
            </div>
        ) : (
            <>
            <h3>Strategy Details</h3>
            <div className="strategy-details__header">
                <h4>{selectedStrategy.name}</h4>
                <span className={`status status--${selectedStrategy.status}`}>
                {selectedStrategy.status}
                </span>
            </div>
            
            <div className="strategy-details__section">
                <h5>Performance Metrics</h5>
                <div className="metrics-grid">
                <div className="metric-card">
                    <span className="metric-card__label">Total Return</span>
                    <span className="metric-card__value">{selectedStrategy.performance}%</span>
                </div>
                <div className="metric-card">
                    <span className="metric-card__label">Risk Level</span>
                    <span className="metric-card__value">{selectedStrategy.riskLevel}</span>
                </div>
                <div className="metric-card">
                    <span className="metric-card__label">Sharpe Ratio</span>
                    <span className="metric-card__value">{selectedStrategy.sharpeRatio}</span>
                </div>
                <div className="metric-card">
                    <span className="metric-card__label">Max Drawdown</span>
                    <span className="metric-card__value">{selectedStrategy.maxDrawdown}%</span>
                </div>
                </div>
            </div>
            
            <div className="strategy-details__section">
                <h5>Strategy Description</h5>
                <p>{selectedStrategy.description}</p>
            </div>
            
            <div className="strategy-details__section">
                <h5>Evolutionary History</h5>
                {selectedStrategy.evolutionHistory.length === 0 ? (
                <p>No evolutionary history available</p>
                ) : (
                <div className="evolution-timeline">
                    {selectedStrategy.evolutionHistory.map((event, index) => (
                    <div className="evolution-event" key={index}>
                        <div className="evolution-event__marker"></div>
                        <div className="evolution-event__content">
                        <div className="evolution-event__header">
                            <h6>Generation {event.generation}</h6>
                            <span className="evolution-event__date">{event.date}</span>
                        </div>
                        <p>{event.description}</p>
                        <div className="evolution-event__metrics">
                            <span>Performance: {event.performance}%</span>
                            <span>Changes: {event.changes}</span>
                        </div>
                        </div>
                    </div>
                    ))}
                </div>
                )}
            </div>
            
            <div className="strategy-details__section">
                <h5>Components</h5>
                <ul className="component-list">
                {selectedStrategy.components.map((component, index) => (
                    <li key={index} className="component-item">
                    <span className="component-item__name">{component.name}</span>
                    <span className="component-item__type">{component.type}</span>
                    <span className="component-item__weight">{component.weight}%</span>
                    </li>
                ))}
                </ul>
            </div>
            
            <div className="strategy-actions">
                <button className="btn btn-primary">Clone Strategy</button>
                <button className="btn btn-secondary">Analyze Performance</button>
                {selectedStrategy.status === 'active' ? (
                <button className="btn btn-danger">Deactivate</button>
                ) : (
                <button className="btn btn-success">Activate</button>
                )}
            </div>
            </>
        )}
        </div>
    </div>
    </div>
);
};

export default StrategyExplorer;

