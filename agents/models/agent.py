import uuid
import random
import copy
from typing import Dict, List, Optional, Tuple, Any


class Agent:
    """
    Base Agent class for the DarwinFi evolutionary system.
    
    This class represents a financial agent with a specific trading strategy
    that can evolve over time through genetic operations (mutation, crossover).
    """
    
    def __init__(
        self, 
        strategy_params: Dict[str, Any], 
        generation: int = 0,
        parent_ids: Optional[List[str]] = None
    ):
        """
        Initialize a new Agent with strategy parameters.
        
        Args:
            strategy_params: Dictionary of parameters that define the agent's strategy
            generation: The generation number this agent belongs to
            parent_ids: List of parent agent IDs if this agent was created through crossover
        """
        self.id = str(uuid.uuid4())
        self.strategy_params = strategy_params
        self.generation = generation
        self.parent_ids = parent_ids or []
        
        # Performance metrics
        self.metrics = {
            "total_return": 0.0,
            "sharpe_ratio": 0.0,
            "max_drawdown": 0.0,
            "win_rate": 0.0,
            "avg_profit_loss": 0.0,
            "trades_executed": 0
        }
        
        # Genetic properties
        self.fitness_score = 0.0
        self.mutation_rate = 0.05  # Default mutation rate
        self.is_elite = False      # Flag for elite agents that are preserved
        
        # Lifecycle tracking
        self.creation_timestamp = None
        self.last_evaluation_timestamp = None
        self.active = True
    
    def mutate(self, mutation_rate: Optional[float] = None) -> None:
        """
        Apply random mutations to the agent's strategy parameters.
        
        Args:
            mutation_rate: Probability of each parameter being mutated
        """
        rate = mutation_rate if mutation_rate is not None else self.mutation_rate
        
        for key in self.strategy_params:
            # Apply mutation with probability = mutation_rate
            if random.random() < rate:
                param_value = self.strategy_params[key]
                
                # Handle different parameter types
                if isinstance(param_value, bool):
                    # Flip boolean values
                    self.strategy_params[key] = not param_value
                elif isinstance(param_value, int):
                    # Adjust integers by ±10%
                    adjustment = max(1, int(abs(param_value) * 0.1))
                    self.strategy_params[key] = param_value + random.randint(-adjustment, adjustment)
                elif isinstance(param_value, float):
                    # Adjust floats by ±10%
                    adjustment = abs(param_value) * 0.1
                    self.strategy_params[key] = param_value + random.uniform(-adjustment, adjustment)
    
    @classmethod
    def crossover(cls, agent1: 'Agent', agent2: 'Agent') -> 'Agent':
        """
        Create a new agent by combining strategy parameters from two parent agents.
        
        Args:
            agent1: First parent agent
            agent2: Second parent agent
            
        Returns:
            A new Agent instance with combined strategy parameters
        """
        # Create a new parameter set by selecting from either parent
        new_params = {}
        all_keys = set(agent1.strategy_params.keys()) | set(agent2.strategy_params.keys())
        
        for key in all_keys:
            # Randomly select parameter from either parent
            if key in agent1.strategy_params and key in agent2.strategy_params:
                # If both parents have the parameter, randomly select one or average them
                if random.random() < 0.5:
                    new_params[key] = agent1.strategy_params[key]
                else:
                    new_params[key] = agent2.strategy_params[key]
            elif key in agent1.strategy_params:
                new_params[key] = agent1.strategy_params[key]
            else:
                new_params[key] = agent2.strategy_params[key]
        
        # Create a child agent with the new parameters
        child = cls(
            strategy_params=new_params,
            generation=max(agent1.generation, agent2.generation) + 1,
            parent_ids=[agent1.id, agent2.id]
        )
        
        # Child inherits average mutation rate from parents
        child.mutation_rate = (agent1.mutation_rate + agent2.mutation_rate) / 2
        
        return child
    
    def evaluate(self, market_data: Dict[str, Any]) -> float:
        """
        Evaluate the agent's performance on given market data and update fitness score.
        
        Args:
            market_data: Dictionary containing market data for evaluation
            
        Returns:
            The calculated fitness score
        """
        # This is a placeholder that should be overridden by subclasses
        # with specific evaluation logic for the strategy
        
        # Update last evaluation timestamp
        import time
        self.last_evaluation_timestamp = time.time()
        
        # Return default fitness score
        return self.fitness_score
    
    def calculate_fitness(self) -> float:
        """
        Calculate fitness score based on the agent's performance metrics.
        
        Returns:
            Calculated fitness score
        """
        # Placeholder for fitness calculation - should be implemented by subclasses
        # based on their specific performance criteria
        
        # Simple example: weight different metrics to produce a single fitness score
        weights = {
            "total_return": 0.4,
            "sharpe_ratio": 0.3,
            "max_drawdown": 0.1,
            "win_rate": 0.1,
            "avg_profit_loss": 0.1
        }
        
        # Normalized calculation (placeholder)
        self.fitness_score = (
            self.metrics["total_return"] * weights["total_return"] +
            self.metrics["sharpe_ratio"] * weights["sharpe_ratio"] -
            self.metrics["max_drawdown"] * weights["max_drawdown"] +
            self.metrics["win_rate"] * weights["win_rate"] +
            self.metrics["avg_profit_loss"] * weights["avg_profit_loss"]
        )
        
        return self.fitness_score
    
    def clone(self) -> 'Agent':
        """
        Create a deep copy of this agent.
        
        Returns:
            A new Agent instance with the same attributes
        """
        clone = copy.deepcopy(self)
        clone.id = str(uuid.uuid4())  # Assign a new unique ID
        return clone
    
    def __str__(self) -> str:
        """String representation of the agent."""
        return (f"Agent(id={self.id}, generation={self.generation}, "
            f"fitness={self.fitness_score:.4f})")
    
    def to_dict(self) -> Dict[str, Any]:
        """
        Convert agent to a dictionary representation for serialization.
        
        Returns:
            Dictionary representation of the agent
        """
        return {
            "id": self.id,
            "generation": self.generation,
            "parent_ids": self.parent_ids,
            "strategy_params": self.strategy_params,
            "metrics": self.metrics,
            "fitness_score": self.fitness_score,
            "mutation_rate": self.mutation_rate,
            "is_elite": self.is_elite,
            "active": self.active
        }
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'Agent':
        """
        Create an agent from a dictionary representation.
        
        Args:
            data: Dictionary containing agent data
            
        Returns:
            A new Agent instance
        """
        agent = cls(
            strategy_params=data["strategy_params"],
            generation=data["generation"],
            parent_ids=data["parent_ids"]
        )
        
        agent.id = data["id"]
        agent.metrics = data["metrics"]
        agent.fitness_score = data["fitness_score"]
        agent.mutation_rate = data["mutation_rate"]
        agent.is_elite = data["is_elite"]
        agent.active = data["active"]
        
        return agent

