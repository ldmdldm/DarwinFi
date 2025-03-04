import React, { useEffect, useState } from 'react';
import { BarChart3, Dna, LineChart, RefreshCw, TrendingUp, Zap, ChevronRight, Activity, Settings, PieChart, Clock, ArrowUpRight, ArrowDownRight, Info, AlertTriangle, Layers, Cpu } from 'lucide-react';
import { StrategyRegistry } from './core/StrategyRegistry';
import { StrategyFactory } from './core/StrategyFactory';
import { StrategyManager } from './core/StrategyManager';
import { MarketDataService } from './services/MarketDataService';
import { InjectiveService } from './services/InjectiveService';
import { MomentumStrategy } from './strategies/MomentumStrategy';
import { MeanReversionStrategy } from './strategies/MeanReversionStrategy';
import { v4 as uuidv4 } from 'uuid';

function App() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [evolutionStats, setEvolutionStats] = useState({
    evolutionGeneration: 0,
    lastEvolutionTime: null,
    activeStrategies: 0,
    totalStrategies: 0
  });
  const [activeStrategies, setActiveStrategies] = useState([]);
  const [marketData, setMarketData] = useState({
    markets: [
      {
        marketId: 'INJ/USDT',
        price: 100,
        volume24h: 1000000,
        change24h: 0,
        bid: 99,
        ask: 101
      },
      {
        marketId: 'BTC/USDT',
        price: 50000,
        volume24h: 5000000,
        change24h: 0,
        bid: 49900,
        ask: 50100
      }
    ]
  });
  const [isEvolving, setIsEvolving] = useState(false);
  const [manager, setManager] = useState(null);
  const [selectedTab, setSelectedTab] = useState('overview');
  const [strategyDetails, setStrategyDetails] = useState(null);
  const [systemHealth, setSystemHealth] = useState({
    status: 'optimal',
    cpuUsage: 32,
    memoryUsage: 45,
    lastUpdate: new Date()
  });

  useEffect(() => {
    const initializeSystem = async () => {
      try {
        console.log('Initializing DarwinFi system...');
        
        // Create services
        const marketDataService = new MarketDataService();
        const injectiveService = new InjectiveService();
        
        // Create core components
        const registry = new StrategyRegistry();
        const factory = new StrategyFactory(registry);
        const strategyManager = new StrategyManager(registry, factory, marketDataService, injectiveService);
        
        // Create initial strategies
        const momentum1 = new MomentumStrategy(uuidv4(), 'Fast Momentum', 'Short-term momentum strategy', {
          fastPeriod: 5,
          slowPeriod: 15
        });
        
        const momentum2 = new MomentumStrategy(uuidv4(), 'Medium Momentum', 'Medium-term momentum strategy', {
          fastPeriod: 10,
          slowPeriod: 30
        });
        
        const meanReversion1 = new MeanReversionStrategy(uuidv4(), 'RSI Reversion', 'RSI-based mean reversion strategy', {
          rsiPeriod: 14,
          oversoldThreshold: 30,
          overboughtThreshold: 70
        });
        
        const meanReversion2 = new MeanReversionStrategy(uuidv4(), 'Aggressive Reversion', 'Aggressive mean reversion strategy', {
          rsiPeriod: 7,
          oversoldThreshold: 20,
          overboughtThreshold: 80
        });
        
        // Register strategies
        registry.registerStrategy(momentum1);
        registry.registerStrategy(momentum2);
        registry.registerStrategy(meanReversion1);
        registry.registerStrategy(meanReversion2);
        
        console.log('Strategies registered');
        
        // Initialize strategies
        await momentum1.initialize();
        await momentum2.initialize();
        await meanReversion1.initialize();
        await meanReversion2.initialize();
        
        console.log('Strategies initialized');
        
        // Start the manager
        await strategyManager.start();
        setManager(strategyManager);
        
        console.log('Strategy manager started');
        
        // Set up periodic UI updates
        const uiUpdateInterval = setInterval(() => {
          try {
            const stats = strategyManager.getEvolutionStats();
            setEvolutionStats(stats || {
              evolutionGeneration: 0,
              lastEvolutionTime: null,
              activeStrategies: 0,
              totalStrategies: 0
            });
            
            const strategies = registry.getActiveStrategies() || [];
            // Add mock data for UI demonstration
            const enhancedStrategies = strategies.map(strategy => ({
              ...strategy,
              performanceScore: strategy.performanceScore || Math.random() * 0.8,
              riskScore: strategy.riskScore || Math.random() * 0.6,
              parameters: strategy.parameters || {
                period: Math.floor(Math.random() * 20) + 5,
                threshold: (Math.random() * 0.5 + 0.2).toFixed(2),
                stopLoss: (Math.random() * 0.05 + 0.02).toFixed(2),
                takeProfit: (Math.random() * 0.1 + 0.05).toFixed(2),
                marketId: Math.random() > 0.5 ? 'INJ/USDT' : 'BTC/USDT'
              }
            }));
            setActiveStrategies(enhancedStrategies);

            // Update system health
            setSystemHealth({
              status: Math.random() > 0.9 ? 'warning' : 'optimal',
              cpuUsage: Math.floor(25 + Math.random() * 30),
              memoryUsage: Math.floor(40 + Math.random() * 20),
              lastUpdate: new Date()
            });
          } catch (error) {
            console.error('Error updating UI:', error);
          }
        }, 2000);
        
        // Set up market data updates
        const marketDataInterval = setInterval(async () => {
          try {
            const data = await marketDataService.getCurrentMarketData();
            setMarketData(data || {
              markets: [
                {
                  marketId: 'INJ/USDT',
                  price: 100 + Math.random() * 10,
                  volume24h: 1000000 + Math.random() * 500000,
                  change24h: (Math.random() * 10) - 5,
                  bid: 99 + Math.random() * 10,
                  ask: 101 + Math.random() * 10
                },
                {
                  marketId: 'BTC/USDT',
                  price: 50000 + Math.random() * 1000,
                  volume24h: 5000000 + Math.random() * 1000000,
                  change24h: (Math.random() * 10) - 5,
                  bid: 49900 + Math.random() * 1000,
                  ask: 50100 + Math.random() * 1000
                }
              ]
            });
          } catch (error) {
            console.error('Error updating market data:', error);
          }
        }, 5000);
        
        // Trigger initial evolution
        setTimeout(async () => {
          try {
            setIsEvolving(true);
            await strategyManager.evaluateAllStrategies();
            await strategyManager.evolveStrategies();
          } catch (error) {
            console.error('Error during initial evolution:', error);
          } finally {
            setIsEvolving(false);
          }
        }, 1000);
        
        setIsInitialized(true);
        
        // Cleanup function
        return () => {
          clearInterval(uiUpdateInterval);
          clearInterval(marketDataInterval);
        };
      } catch (error) {
        console.error('Error initializing system:', error);
        // Still set initialized to true to show the UI instead of loading screen
        setIsInitialized(true);
      }
    };
    
    initializeSystem();
  }, []);

  const handleTriggerEvolution = async () => {
    if (!manager || isEvolving) return;
    
    setIsEvolving(true);
    try {
      await manager.evaluateAllStrategies();
      await manager.evolveStrategies();
    } catch (error) {
      console.error('Error during evolution:', error);
    } finally {
      setIsEvolving(false);
    }
  };

  const handleViewStrategyDetails = (strategy) => {
    console.log("Viewing strategy details:", strategy);
    setStrategyDetails(strategy);
    setSelectedTab('strategyDetails');
  };

  const renderOverviewTab = () => {
    return (
      <>
        {/* System Status */}
        <div className="mb-8 bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700 shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold flex items-center">
              <Activity className="w-5 h-5 mr-2 text-blue-400" />
              System Status
            </h2>
            <div className={`px-3 py-1 rounded-full text-sm flex items-center ${
              systemHealth.status === 'optimal' 
                ? 'bg-green-900/50 text-green-300 border border-green-700' 
                : 'bg-yellow-900/50 text-yellow-300 border border-yellow-700'
            }`}>
              {systemHealth.status === 'optimal' ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-green-400 mr-2"></span>
                  Optimal
                </>
              ) : (
                <>
                  <AlertTriangle className="w-3 h-3 mr-2" />
                  Warning
                </>
              )}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-gray-400 text-sm">Generation</h3>
                <Layers className="w-4 h-4 text-blue-400" />
              </div>
              <p className="text-3xl font-bold">{evolutionStats?.evolutionGeneration || 0}</p>
              <p className="text-xs text-gray-500 mt-1">Current evolution cycle</p>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-gray-400 text-sm">Active Strategies</h3>
                <Cpu className="w-4 h-4 text-purple-400" />
              </div>
              <p className="text-3xl font-bold">{evolutionStats?.activeStrategies || 0}</p>
              <p className="text-xs text-gray-500 mt-1">Trading strategies in use</p>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-gray-400 text-sm">CPU Usage</h3>
                <div className="w-4 h-4 flex items-center justify-center">
                  <div className="w-3 h-3 rounded-full border-2 border-blue-400 border-t-transparent animate-spin"></div>
                </div>
              </div>
              <p className="text-3xl font-bold">{systemHealth.cpuUsage}%</p>
              <div className="w-full bg-gray-700 rounded-full h-1 mt-2">
                <div 
                  className={`h-1 rounded-full ${systemHealth.cpuUsage > 70 ? 'bg-red-500' : 'bg-blue-500'}`}
                  style={{ width: `${systemHealth.cpuUsage}%` }}
                ></div>
              </div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-gray-400 text-sm">Last Evolution</h3>
                <Clock className="w-4 h-4 text-blue-400" />
              </div>
              <p className="text-xl font-bold">
                {evolutionStats?.lastEvolutionTime 
                  ? new Date(evolutionStats.lastEvolutionTime).toLocaleTimeString() 
                  : 'Never'}
              </p>
              <p className="text-xs text-gray-500 mt-1">Last genetic optimization</p>
            </div>
          </div>
        </div>
        
        {/* Market Data */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2 text-blue-400" />
            Market Data
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {marketData?.markets?.map((market) => (
              <div key={market.marketId} className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700 shadow-lg">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold">{market.marketId}</h3>
                  <span className={`px-3 py-1 rounded-full text-sm flex items-center ${
                    market.change24h >= 0 
                      ? 'bg-green-900/50 text-green-300 border border-green-700' 
                      : 'bg-red-900/50 text-red-300 border border-red-700'
                  }`}>
                    {market.change24h >= 0 ? (
                      <ArrowUpRight className="w-3 h-3 mr-1" />
                    ) : (
                      <ArrowDownRight className="w-3 h-3 mr-1" />
                    )}
                    {market.change24h >= 0 ? '+' : ''}{market.change24h.toFixed(2)}%
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Price</p>
                    <p className="text-2xl font-bold">${market.price.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm mb-1">24h Volume</p>
                    <p className="text-2xl font-bold">${(market.volume24h / 1000000).toFixed(2)}M</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Bid</p>
                    <p className="text-xl font-medium text-green-400">${market.bid.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Ask</p>
                    <p className="text-xl font-medium text-red-400">${market.ask.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Active Strategies */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-blue-400" />
              Active Strategies
            </h2>
            <div className="text-sm text-gray-400">
              {evolutionStats?.activeStrategies || 0} active / {evolutionStats?.totalStrategies || 0} total
            </div>
          </div>
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border border-gray-700 overflow-hidden shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-800/80 border-b border-gray-700">
                    <th className="text-left p-4 text-gray-400 font-medium">Strategy</th>
                    <th className="text-left p-4 text-gray-400 font-medium">Type</th>
                    <th className="text-left p-4 text-gray-400 font-medium">Performance</th>
                    <th className="text-left p-4 text-gray-400 font-medium">Risk</th>
                    <th className="text-left p-4 text-gray-400 font-medium">Allocation</th>
                    <th className="text-left p-4 text-gray-400 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {activeStrategies && activeStrategies.length > 0 ? (
                    activeStrategies.map((strategy, index) => (
                      <tr key={strategy.id} className={`border-b border-gray-700/50 hover:bg-gray-750`}>
                        <td className="p-4">
                          <div>
                            <p className="font-medium">{strategy.name}</p>
                            <p className="text-gray-400 text-sm">{strategy.description}</p>
                          </div>
                        </td>
                        <td className="p-4">
                          {strategy.parentIds && strategy.parentIds.length > 0 ? (
                            <span className="bg-purple-900/30 text-purple-300 px-3 py-1 rounded-full text-xs border border-purple-800">Evolved</span>
                          ) : (
                            <span className="bg-blue-900/30 text-blue-300 px-3 py-1 rounded-full text-xs border border-blue-800">Base</span>
                          )}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center">
                            <div className="w-24 bg-gray-700 rounded-full h-2 mr-2 overflow-hidden">
                              <div 
                                className="bg-gradient-to-r from-green-500 to-green-400 h-2 rounded-full" 
                                style={{ width: `${Math.min(100, (strategy.performanceScore || 0) * 100)}%` }}
                              ></div>
                            </div>
                            <span>{((strategy.performanceScore || 0) * 100).toFixed(1)}%</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center">
                            <div className="w-24 bg-gray-700 rounded-full h-2 mr-2 overflow-hidden">
                              <div 
                                className="bg-gradient-to-r from-blue-500 to-blue-400 h-2 rounded-full" 
                                style={{ width: `${Math.min(100, (strategy.riskScore || 0) * 100)}%` }}
                              ></div>
                            </div>
                            <span>{((strategy.riskScore || 0) * 100).toFixed(1)}%</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="font-medium">{((Math.random() * 20) + 1).toFixed(1)}%</span>
                        </td>
                        <td className="p-4">
                          <button 
                            onClick={() => handleViewStrategyDetails(strategy)}
                            className="bg-blue-600/80 hover:bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm flex items-center transition-colors"
                          >
                            <Info className="w-3.5 h-3.5 mr-1.5" />
                            Details
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-gray-400">
                        <div className="flex flex-col items-center">
                          <RefreshCw className="w-8 h-8 mb-3 text-gray-600 animate-spin" />
                          <p>No active strategies yet. Evolution in progress...</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </>
    );
  };

  const renderStrategyDetailsTab = () => {
    if (!strategyDetails) {
      return (
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700 shadow-lg">
          <p className="text-gray-400">No strategy selected. Please select a strategy from the overview page.</p>
          <button 
            onClick={() => setSelectedTab('overview')}
            className="mt-4 bg-blue-600/80 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm flex items-center transition-colors w-fit"
          >
            <ChevronRight className="w-4 h-4 mr-1 rotate-180" />
            Back to Overview
          </button>
        </div>
      );
    }

    // Generate some mock trade history
    const tradeHistory = Array.from({ length: 5 }, (_, i) => {
      const isProfit = Math.random() > 0.4;
      return {
        id: `trade-${i}`,
        date: new Date(Date.now() - (i * 24 * 60 * 60 * 1000)),
        market: Math.random() > 0.5 ? 'INJ/USDT' : 'BTC/USDT',
        direction: Math.random() > 0.5 ? 'Long' : 'Short',
        entryPrice: strategyDetails.name.includes('BTC') ? 50000 + (Math.random() * 2000) : 100 + (Math.random() * 10),
        exitPrice: strategyDetails.name.includes('BTC') ? 50000 + (Math.random() * 2000) : 100 + (Math.random() * 10),
        pnl: isProfit ? (Math.random() * 5).toFixed(2) : (-Math.random() * 3).toFixed(2),
        status: 'Closed'
      };
    });

    // Generate mock performance data
    const performanceData = {
      winRate: (Math.random() * 30 + 50).toFixed(1),
      profitFactor: (Math.random() * 1 + 1.2).toFixed(2),
      sharpeRatio: (Math.random() * 1 + 0.8).toFixed(2),
      maxDrawdown: (Math.random() * 15 + 5).toFixed(1),
      totalTrades: Math.floor(Math.random() * 100) + 50,
      profitableTrades: Math.floor(Math.random() * 50) + 30,
      averageWin: (Math.random() * 3 + 1).toFixed(2),
      averageLoss: (Math.random() * 2 + 0.5).toFixed(2),
    };

    return (
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-blue-400" />
            Strategy Details
          </h2>
          <button 
            onClick={() => setSelectedTab('overview')}
            className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg text-sm flex items-center transition-colors"
          >
            <ChevronRight className="w-4 h-4 mr-1 rotate-180" />
            Back to Overview
          </button>
        </div>

        {/* Strategy Info */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700 shadow-lg">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-xl font-bold mb-2">{strategyDetails.name}</h3>
              <p className="text-gray-400">{strategyDetails.description}</p>
            </div>
            <div className={`px-3 py-1 rounded-full text-sm flex items-center ${
              strategyDetails.parentIds && strategyDetails.parentIds.length > 0 
                ? 'bg-purple-900/30 text-purple-300 border border-purple-800' 
                : 'bg-blue-900/30 text-blue-300 border border-blue-800'
            }`}>
              {strategyDetails.parentIds && strategyDetails.parentIds.length > 0 ? 'Evolved' : 'Base'} Strategy
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <h4 className="text-gray-400 text-sm mb-1">Performance Score</h4>
              <div className="flex items-center">
                <div className="w-full bg-gray-700 rounded-full h-2 mr-2 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-green-500 to-green-400 h-2 rounded-full" 
                    style={{ width: `${Math.min(100, (strategyDetails.performanceScore || 0) * 100)}%` }}
                  ></div>
                </div>
                <span className="font-bold">{((strategyDetails.performanceScore || 0) * 100).toFixed(1)}%</span>
              </div>
            </div>
            <div>
              <h4 className="text-gray-400 text-sm mb-1">Risk Score</h4>
              <div className="flex items-center">
                <div className="w-full bg-gray-700 rounded-full h-2 mr-2 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-blue-400 h-2 rounded-full" 
                    style={{ width: `${Math.min(100, (strategyDetails.riskScore || 0) * 100)}%` }}
                  ></div>
                </div>
                <span className="font-bold">{((strategyDetails.riskScore || 0) * 100).toFixed(1)}%</span>
              </div>
            </div>
            <div>
              <h4 className="text-gray-400 text-sm mb-1">Capital Allocation</h4>
              <p className="text-xl font-bold">{((Math.random() * 20) + 1).toFixed(1)}%</p>
            </div>
          </div>

          <div className="border-t border-gray-700 pt-6">
            <h4 className="text-gray-400 text-sm uppercase mb-4">Strategy Parameters</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(strategyDetails.parameters || {}).map(([key, value]) => (
                <div key={key} className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                  <p className="text-gray-400 text-xs mb-1">{key}</p>
                  <p className="font-medium">{value.toString()}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700 shadow-lg">
          <h3 className="text-lg font-bold mb-6 flex items-center">
            <PieChart className="w-5 h-5 mr-2 text-blue-400" />
            Performance Metrics
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
              <p className="text-gray-400 text-sm mb-1">Win Rate</p>
              <p className="text-xl font-bold">{performanceData.winRate}%</p>
              <div className="w-full bg-gray-700 rounded-full h-1 mt-2">
                <div 
                  className="bg-green-500 h-1 rounded-full" 
                  style={{ width: `${performanceData.winRate}%` }}
                ></div>
              </div>
            </div>
            <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
              <p className="text-gray-400 text-sm mb-1">Profit Factor</p>
              <p className="text-xl font-bold">{performanceData.profitFactor}</p>
              <div className="w-full bg-gray-700 rounded-full h-1 mt-2">
                <div 
                  className="bg-blue-500 h-1 rounded-full" 
                  style={{ width: `${parseFloat(performanceData.profitFactor) * 50}%` }}
                ></div>
              </div>
            </div>
            <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
              <p className="text-gray-400 text-sm mb-1">Sharpe Ratio</p>
              <p className="text-xl font-bold">{performanceData.sharpeRatio}</p>
              <div className="w-full bg-gray-700 rounded-full h-1 mt-2">
                <div 
                  className="bg-purple-500 h-1 rounded-full" 
                  style={{ width: `${parseFloat(performanceData.sharpeRatio) * 60}%` }}
                ></div>
              </div>
            </div>
            <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
              <p className="text-gray-400 text-sm mb-1">Max Drawdown</p>
              <p className="text-xl font-bold text-red-400">{performanceData.maxDrawdown}%</p>
              <div className="w-full bg-gray-700 rounded-full h-1 mt-2">
                <div 
                  className="bg-red-500 h-1 rounded-full" 
                  style={{ width: `${parseFloat(performanceData.maxDrawdown) * 5}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-6">
            <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
              <p className="text-gray-400 text-sm mb-1">Total Trades</p>
              <p className="text-xl font-bold">{performanceData.totalTrades}</p>
            </div>
            <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
              <p className="text-gray-400 text-sm mb-1">Profitable Trades</p>
              <p className="text-xl font-bold text-green-400">{performanceData.profitableTrades}</p>
            </div>
            <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
              <p className="text-gray-400 text-sm mb-1">Average Win</p>
              <p className="text-xl font-bold text-green-400">+{performanceData.averageWin}%</p>
            </div>
            <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
              <p className="text-gray-400 text-sm mb-1">Average Loss</p>
              <p className="text-xl font-bold text-red-400">-{performanceData.averageLoss}%</p>
            </div>
          </div>
        </div>

        {/* Trade History */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border border-gray-700 overflow-hidden shadow-lg">
          <div className="p-4 border-b border-gray-700 flex justify-between items-center">
            <h3 className="text-lg font-bold flex items-center">
              <Activity className="w-5 h-5 mr-2 text-blue-400" />
              Recent Trades
            </h3>
            <button className="text-sm text-gray-400 hover:text-white transition-colors">
              View All
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-800/80">
                  <th className="text-left p-4 text-gray-400 font-medium">Date</th>
                  <th className="text-left p-4 text-gray-400 font-medium">Market</th>
                  <th className="text-left p-4 text-gray-400 font-medium">Direction</th>
                  <th className="text-left p-4 text-gray-400 font-medium">Entry Price</th>
                  <th className="text-left p-4 text-gray-400 font-medium">Exit Price</th>
                  <th className="text-left p-4 text-gray-400 font-medium">P&L</th>
                </tr>
              </thead>
              <tbody>
                {tradeHistory.map((trade) => (
                  <tr key={trade.id} className="border-t border-gray-700/50 hover:bg-gray-750">
                    <td className="p-4">{trade.date.toLocaleDateString()}</td>
                    <td className="p-4">{trade.market}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded-full text-xs ${
                        trade.direction === 'Long' 
                          ? 'bg-green-900/30 text-green-300 border border-green-800' 
                          : 'bg-red-900/30 text-red-300 border border-red-800'
                      }`}>
                        {trade.direction}
                      </span>
                    </td>
                    <td className="p-4">${trade.entryPrice.toFixed(2)}</td>
                    <td className="p-4">${trade.exitPrice.toFixed(2)}</td>
                    <td className={`p-4 font-medium ${parseFloat(trade.pnl) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {parseFloat(trade.pnl) >= 0 ? (
                        <span className="flex items-center">
                          <ArrowUpRight className="w-3.5 h-3.5 mr-1" />
                          +{trade.pnl}%
                        </span>
                      ) : (
                        <span className="flex items-center">
                          <ArrowDownRight className="w-3.5 h-3.5 mr-1" />
                          {trade.pnl}%
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-24 h-24 mx-auto mb-6">
            <Dna className="w-24 h-24 text-blue-500 absolute top-0 left-0" />
            <div className="w-24 h-24 rounded-full border-4 border-blue-500 border-t-transparent animate-spin absolute top-0 left-0"></div>
          </div>
          <h1 className="text-3xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
            Initializing DarwinFi
          </h1>
          <p className="text-gray-400 max-w-md">Setting up evolutionary trading system and preparing genetic algorithms...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <header className="bg-gray-800/80 backdrop-blur-sm border-b border-gray-700 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center">
            <div className="relative mr-3">
              <Dna className="w-8 h-8 text-blue-500" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-800"></div>
            </div>
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
              DarwinFi
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            {isEvolving ? (
              <div className="flex items-center text-yellow-400 bg-yellow-900/20 px-4 py-2 rounded-lg border border-yellow-800/50">
                <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                <span>Evolution in progress...</span>
              </div>
            ) : (
              <button 
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 px-4 py-2 rounded-lg flex items-center shadow-lg transition-all duration-200 hover:shadow-blue-900/30"
                onClick={handleTriggerEvolution}
              >
                <Zap className="w-5 h-5 mr-2" />
                <span>Trigger Evolution</span>
              </button>
            )}
            <button className="p-2 rounded-lg hover:bg-gray-700 transition-colors">
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>
      
      <nav className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700 sticky top-16 z-10">
        <div className="container mx-auto px-4">
          <div className="flex">
            <button 
              className={`px-6 py-3 font-medium transition-colors ${selectedTab === 'overview' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-white'}`}
              onClick={() => setSelectedTab('overview')}
            >
              Overview
            </button>
            <button 
              className={`px-6 py-3 font-medium transition-colors ${selectedTab === 'strategyDetails' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-white'}`}
              onClick={() => selectedTab === 'strategyDetails' ? null : setSelectedTab('overview')}
            >
              Strategy Details {strategyDetails ? `(${strategyDetails.name})` : ''}
            </button>
          </div>
        </div>
      </nav>
      
      <main className="container mx-auto px-4 py-6">
        {selectedTab === 'overview' && renderOverviewTab()}
        {selectedTab === 'strategyDetails' && renderStrategyDetailsTab()}
      </main>
    </div>
  );
}

export default App;