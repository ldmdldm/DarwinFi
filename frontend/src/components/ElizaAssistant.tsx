import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { 
Box, 
TextField, 
Button, 
Typography, 
Paper, 
Divider,
CircularProgress,
Card,
CardContent,
IconButton,
Chip,
Grid,
Dialog,
DialogTitle,
DialogContent,
DialogActions,
FormControl,
InputLabel,
Select,
MenuItem
} from '@mui/material';
import { 
Send as SendIcon, 
PlayArrow as PlayArrowIcon, 
Save as SaveIcon,
Edit as EditIcon,
Delete as DeleteIcon,
Refresh as RefreshIcon,
Timeline as TimelineIcon 
} from '@mui/icons-material';

interface Message {
id: string;
sender: 'user' | 'assistant';
content: string;
timestamp: Date;
}

interface Strategy {
id: string;
name: string;
description: string;
parameters: Record<string, any>;
code: string;
performance?: {
    backtest?: {
    returns: number;
    sharpeRatio: number;
    maxDrawdown: number;
    winRate: number;
    };
    live?: {
    returns: number;
    sharpeRatio: number;
    trades: number;
    };
};
status: 'draft' | 'backtested' | 'optimized' | 'deployed';
}

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

const ElizaAssistant: React.FC = () => {
const [messages, setMessages] = useState<Message[]>([
    {
    id: '1',
    sender: 'assistant',
    content: 'Hello! I\'m Eliza, your trading strategy assistant. Tell me what kind of strategy you\'d like to create or optimize.',
    timestamp: new Date()
    }
]);
const [input, setInput] = useState('');
const [isLoading, setIsLoading] = useState(false);
const [strategies, setStrategies] = useState<Strategy[]>([]);
const [selectedStrategy, setSelectedStrategy] = useState<Strategy | null>(null);
const [showOptimizeDialog, setShowOptimizeDialog] = useState(false);
const [optimizationOptions, setOptimizationOptions] = useState({
    objective: 'sharpeRatio',
    riskTolerance: 'medium',
    maxDrawdown: 25,
});

const messagesEndRef = useRef<null | HTMLDivElement>(null);

// Fetch existing strategies on component mount
useEffect(() => {
    fetchStrategies();
}, []);

// Auto-scroll to bottom of messages
useEffect(() => {
    scrollToBottom();
}, [messages]);

const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
};

const fetchStrategies = async () => {
    try {
    const response = await axios.get(`${API_BASE_URL}/api/strategies`);
    setStrategies(response.data);
    } catch (error) {
    console.error('Error fetching strategies:', error);
    }
};

const handleSendMessage = async () => {
    if (!input.trim()) return;
    
    // Add user message
    const userMessage: Message = {
    id: Date.now().toString(),
    sender: 'user',
    content: input,
    timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    try {
    // Call Eliza API
    const response = await axios.post(`${API_BASE_URL}/api/eliza/chat`, {
        message: input,
        selectedStrategyId: selectedStrategy?.id || null
    });
    
    // Add response message
    const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        content: response.data.response,
        timestamp: new Date()
    };
    
    setMessages(prev => [...prev, assistantMessage]);
    
    // If a strategy was generated, add it to the list
    if (response.data.strategy) {
        setStrategies(prev => [...prev, response.data.strategy]);
        setSelectedStrategy(response.data.strategy);
    }
    } catch (error) {
    console.error('Error communicating with Eliza:', error);
    
    // Add error message
    const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        content: 'Sorry, I encountered an error processing your request. Please try again.',
        timestamp: new Date()
    };
    
    setMessages(prev => [...prev, errorMessage]);
    } finally {
    setIsLoading(false);
    }
};

const handleOptimizeStrategy = async () => {
    if (!selectedStrategy) return;
    
    setIsLoading(true);
    
    try {
    const response = await axios.post(`${API_BASE_URL}/api/strategies/${selectedStrategy.id}/optimize`, optimizationOptions);
    
    // Update strategies list with optimized strategy
    setStrategies(prev => prev.map(s => 
        s.id === response.data.id ? response.data : s
    ));
    
    setSelectedStrategy(response.data);
    
    // Add confirmation message
    const optimizeMessage: Message = {
        id: Date.now().toString(),
        sender: 'assistant',
        content: `I've optimized the "${response.data.name}" strategy. The Sharpe ratio improved from ${selectedStrategy.performance?.backtest?.sharpeRatio.toFixed(2) || 'N/A'} to ${response.data.performance?.backtest?.sharpeRatio.toFixed(2)}. Would you like to deploy this strategy to the Injective blockchain?`,
        timestamp: new Date()
    };
    
    setMessages(prev => [...prev, optimizeMessage]);
    } catch (error) {
    console.error('Error optimizing strategy:', error);
    
    // Add error message
    const errorMessage: Message = {
        id: Date.now().toString(),
        sender: 'assistant',
        content: 'Sorry, I encountered an error while optimizing the strategy. Please try again.',
        timestamp: new Date()
    };
    
    setMessages(prev => [...prev, errorMessage]);
    } finally {
    setIsLoading(false);
    setShowOptimizeDialog(false);
    }
};

const handleDeployStrategy = async () => {
    if (!selectedStrategy) return;
    
    setIsLoading(true);
    
    try {
    const response = await axios.post(`${API_BASE_URL}/api/strategies/${selectedStrategy.id}/deploy`);
    
    // Update strategies list with deployed strategy
    setStrategies(prev => prev.map(s => 
        s.id === response.data.id ? response.data : s
    ));
    
    setSelectedStrategy(response.data);
    
    // Add confirmation message
    const deployMessage: Message = {
        id: Date.now().toString(),
        sender: 'assistant',
        content: `I've successfully deployed the "${response.data.name}" strategy to the Injective blockchain. You can now monitor its performance in real-time.`,
        timestamp: new Date()
    };
    
    setMessages(prev => [...prev, deployMessage]);
    } catch (error) {
    console.error('Error deploying strategy:', error);
    
    // Add error message
    const errorMessage: Message = {
        id: Date.now().toString(),
        sender: 'assistant',
        content: 'Sorry, I encountered an error while deploying the strategy. Please check your wallet connection and try again.',
        timestamp: new Date()
    };
    
    setMessages(prev => [...prev, errorMessage]);
    } finally {
    setIsLoading(false);
    }
};

const renderMessageContent = (message: Message) => {
    // Use different styling for user vs assistant messages
    return (
    <Box 
        sx={{
        backgroundColor: message.sender === 'user' ? '#e6f7ff' : '#f5f5f5',
        borderRadius: '10px',
        padding: 2,
        maxWidth: '80%',
        alignSelf: message.sender === 'user' ? 'flex-end' : 'flex-start',
        boxShadow: 1
        }}
    >
        <Typography variant="body1">{message.content}</Typography>
        <Typography variant="caption" sx={{ display: 'block', mt: 1, opacity: 0.6 }}>
        {message.timestamp.toLocaleTimeString()}
        </Typography>
    </Box>
    );
};

const renderStrategySummary = (strategy: Strategy) => {
    const isSelected = selectedStrategy && selectedStrategy.id === strategy.id;
    
    return (
    <Card 
        key={strategy.id} 
        sx={{ 
        mb: 2, 
        cursor: 'pointer',
        border: isSelected ? '2px solid #3f51b5' : '1px solid #e0e0e0'
        }}
        onClick={() => setSelectedStrategy(strategy)}
    >
        <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
            <Typography variant="h6">{strategy.name}</Typography>
            <Chip 
            label={strategy.status} 
            color={
                strategy.status === 'deployed' ? 'success' :
                strategy.status === 'optimized' ? 'primary' :
                strategy.status === 'backtested' ? 'info' : 'default'
            } 
            size="small"
            />
        </Box>
        <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            {strategy.description}
        </Typography>
        
        {strategy.performance && (
            <Box mb={2}>
            <Typography variant="subtitle2">Performance:</Typography>
            <Grid container spacing={2}>
                {strategy.performance.backtest && (
                <>
                    <Grid item xs={6}>
                    <Typography variant="body2">
                        Returns: {(strategy.performance.backtest.returns * 100).toFixed(2)}%
                    </Typography>
                    </Grid>
                    <Grid item xs={6}>
                    <Typography variant="body2">
                        Sharpe: {strategy.performance.backtest.sharpeRatio.toFixed(2)}
                    </Typography>
                    </Grid>
                </>
                )}
            </Grid>
            </Box>
        )}
        
        <Box display="flex" justifyContent="flex-end">
            <IconButton size="small" onClick={() => setShowOptimizeDialog(true)}>
            <RefreshIcon fontSize="small" />
            </IconButton>
            <IconButton size="small" onClick={handleDeployStrategy} disabled={strategy.status !== 'optimized'}>
            <PlayArrowIcon fontSize="small" />
            </IconButton>
            <IconButton size="small">
            <DeleteIcon fontSize="small" />
            </IconButton>
        </Box>
        </CardContent>
    </Card>
    );
};

return (
    <Box sx={{ display: 'flex', height: 'calc(100vh - 100px)' }}>
    {/* Strategies sidebar */}
    <Box
        sx={{
        width: '30%',
        p: 2,
        borderRight: '1px solid #e0e0e0',
        overflowY: 'auto'
        }}
    >
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Trading Strategies</Typography>
        <Button
            variant="outlined"
            size="small"
            startIcon={<RefreshIcon />}
            onClick={fetchStrategies}
        >
            Refresh
        </Button>
        </Box>
        
        {strategies.length === 0 ? (
        <Typography variant="body2" color="textSecondary" align="center" sx={{ my: 4 }}>
            No strategies yet. Ask Eliza to create one!
        </Typography>
        ) : (
        strategies.map(strategy => renderStrategySummary(strategy))
        )}
    </Box>
    
    {/* Chat area */}
    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Messages display */}
        <Box
        sx={{
            flex: 1,
            p: 2,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 2
        }}
        >
        {messages.map(message => (
            <Box
            key={message.id}
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: message.sender === 'user' ? 'flex-end' : 'flex-start',
            }}
            >
            {renderMessageContent(message)}
            </Box>
        ))}
        {isLoading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
            <CircularProgress size={24} />
            </Box>
        )}
        <div ref={messagesEndRef} />
        </Box>
        
        {/* Input area */}
        <Box
        sx={{
            p: 2,
            borderTop: '1px solid #e0e0e0',
            display: 'flex',
            alignItems: 'center'
        }}
        >
        <TextField
            fullWidth
            variant="outlined"
            placeholder="Describe a trading strategy or ask a question..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSendMessage()}
            disabled={isLoading}
            sx={{ mr: 1 }}
        />
        <Button
            variant="contained"
            color="primary"
            endIcon={<SendIcon />}
            onClick={handleSendMessage}
            disabled={isLoading || !input.trim()}
        >
            Send
        </Button>
        </Box>
    </Box>
    
    {/* Optimization Dialog */}
    <Dialog open={showOptimizeDialog} onClose={() => setShowOptimizeDialog(false)}>
        <DialogTitle>Optimize Strategy</DialogTitle>
        <DialogContent>
        <Typography variant="body2" paragraph>
            Set optimization parameters for {selectedStrategy?.name}
        </Typography>
        
        <FormControl fullWidth margin="normal">
            <InputLabel>Optimization Objective</InputLabel>
            <Select
            value={optimizationOptions.objective}
            onChange={(e) => setOptimizationOptions({
                ...

