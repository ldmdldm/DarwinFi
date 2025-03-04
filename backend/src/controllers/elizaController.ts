import { Request, Response } from 'express';
import ElizaService from '../services/ElizaService';
import { Strategy } from '../models/Strategy';

class ElizaController {
private elizaService: ElizaService;

constructor() {
    this.elizaService = new ElizaService();
}

/**
* Initialize a new conversation with Eliza
* @route POST /api/eliza/init
*/
public initConversation = async (req: Request, res: Response): Promise<void> => {
    try {
    const { userId } = req.body;
    
    if (!userId) {
        res.status(400).json({ success: false, message: 'User ID is required' });
        return;
    }
    
    const conversationId = await this.elizaService.initializeConversation(userId);
    
    res.status(200).json({
        success: true,
        data: { conversationId }
    });
    } catch (error) {
    console.error('Error initializing conversation:', error);
    res.status(500).json({
        success: false,
        message: 'Failed to initialize conversation',
        error: error instanceof Error ? error.message : 'Unknown error'
    });
    }
};

/**
* Send a message to Eliza
* @route POST /api/eliza/message
*/
public sendMessage = async (req: Request, res: Response): Promise<void> => {
    try {
    const { conversationId, message, context } = req.body;
    
    if (!conversationId || !message) {
        res.status(400).json({ 
        success: false, 
        message: 'Conversation ID and message are required' 
        });
        return;
    }
    
    const response = await this.elizaService.processMessage(conversationId, message, context);
    
    res.status(200).json({
        success: true,
        data: { response }
    });
    } catch (error) {
    console.error('Error processing message:', error);
    res.status(500).json({
        success: false,
        message: 'Failed to process message',
        error: error instanceof Error ? error.message : 'Unknown error'
    });
    }
};

/**
* Analyze a trading strategy using Eliza
* @route POST /api/eliza/analyze-strategy
*/
public analyzeStrategy = async (req: Request, res: Response): Promise<void> => {
    try {
    const { strategy } = req.body;
    
    if (!strategy) {
        res.status(400).json({ success: false, message: 'Strategy is required' });
        return;
    }
    
    const analysis = await this.elizaService.analyzeStrategy(strategy);
    
    res.status(200).json({
        success: true,
        data: { analysis }
    });
    } catch (error) {
    console.error('Error analyzing strategy:', error);
    res.status(500).json({
        success: false,
        message: 'Failed to analyze strategy',
        error: error instanceof Error ? error.message : 'Unknown error'
    });
    }
};

/**
* Generate an optimized trading strategy using natural language description
* @route POST /api/eliza/generate-strategy
*/
public generateStrategy = async (req: Request, res: Response): Promise<void> => {
    try {
    const { description, marketConditions, riskTolerance } = req.body;
    
    if (!description) {
        res.status(400).json({ success: false, message: 'Strategy description is required' });
        return;
    }
    
    const strategy = await this.elizaService.generateStrategy(
        description,
        marketConditions,
        riskTolerance
    );
    
    res.status(200).json({
        success: true,
        data: { strategy }
    });
    } catch (error) {
    console.error('Error generating strategy:', error);
    res.status(500).json({
        success: false,
        message: 'Failed to generate strategy',
        error: error instanceof Error ? error.message : 'Unknown error'
    });
    }
};

/**
* Get Eliza's suggestions for improving a trading strategy
* @route POST /api/eliza/optimize-strategy
*/
public optimizeStrategy = async (req: Request, res: Response): Promise<void> => {
    try {
    const { strategy, optimizationGoals } = req.body;
    
    if (!strategy) {
        res.status(400).json({ success: false, message: 'Strategy is required' });
        return;
    }
    
    const optimizedStrategy = await this.elizaService.optimizeStrategy(
        strategy,
        optimizationGoals
    );
    
    res.status(200).json({
        success: true,
        data: { optimizedStrategy }
    });
    } catch (error) {
    console.error('Error optimizing strategy:', error);
    res.status(500).json({
        success: false,
        message: 'Failed to optimize strategy',
        error: error instanceof Error ? error.message : 'Unknown error'
    });
    }
};
}

export default ElizaController;

