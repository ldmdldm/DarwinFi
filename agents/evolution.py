import random
import numpy as np
import logging
from typing import List, Dict, Any, Tuple, Callable, Optional
from dataclasses import dataclass, field
from datetime import datetime

from agents.models.agent import Agent

logger = logging.getLogger(__name__)


@dataclass
class EvolutionHistory:
    """Track the performance and statistics across generations"""
    generation_stats: List[Dict[str, Any]] = field(default_factory=list)
    best_agent_history: List[Agent] = field(default_factory=list)
    start_time: datetime = field(default_factory=datetime.now)
    
    def add_generation(self, generation: int, population: List[Agent], 
                    best_fitness: float, avg_fitness: float, 
                    diversity_metric: float) -> None:
        """Record statistics for a completed generation"""
        stats = {
            "generation": generation,
            "timestamp": datetime.now(),
            "best_fitness": best_fitness,
            "average_fitness": avg_fitness,
            "population_size": len(population),
            "diversity_metric": diversity_metric,
            "elapsed_time": (datetime.now() - self.start_time).total_seconds()
        }
        self.generation_stats.append(stats)
        
        # Track the best agent from this generation
        best_agent = max(population, key=lambda x: x.fitness)
        self.best_agent_history.append(best_agent.clone())
        
    def get_last_generation_stats(self) -> Dict[str, Any]:
        """Return the statistics of the most recent generation"""
        if not self.generation_stats:
            return {}
        return self.generation_stats[-1]
    
    def get_best_agent_ever(self) -> Optional[Agent]:
        """Return the best agent across all generations"""
        if not self.best_agent_history:
            return None
        return max(self.best_agent_history, key=lambda x: x.fitness)


class EvolutionEngine:
    """Genetic algorithm engine for evolving trading strategies"""
    
    def __init__(self, 
                population_size: int = 100,
                tournament_size: int = 5,
                crossover_rate: float = 0.7,
                mutation_rate: float = 0.1,
                elitism_count: int = 2,
                fitness_function: Callable[[Agent], float] = None):
        """
        Initialize the evolution engine.
        
        Args:
            population_size: Number of agents in each generation
            tournament_size: Number of agents competing in tournament selection
            crossover_rate: Probability of crossover occurring
            mutation_rate: Probability of mutation occurring
            elitism_count: Number of top agents to carry over unchanged
            fitness_function: Function to evaluate agent fitness
        """
        self.population_size = population_size
        self.tournament_size = tournament_size
        self.crossover_rate = crossover_rate
        self.mutation_rate = mutation_rate
        self.elitism_count = elitism_count
        self.fitness_function = fitness_function
        self.population: List[Agent] = []
        self.history = EvolutionHistory()
        self.current_generation = 0
    
    def initialize_population(self, agent_factory: Callable[[], Agent]) -> None:
        """
        Create the initial population of agents.
        
        Args:
            agent_factory: Function that creates a new random agent
        """
        self.population = [agent_factory() for _ in range(self.population_size)]
        self.current_generation = 0
        self.history = EvolutionHistory()
        
        # Reset evolution history
        logger.info(f"Initialized population with {self.population_size} agents")
    
    def evaluate_population(self) -> None:
        """Evaluate the fitness of each agent in the population"""
        if not self.fitness_function:
            raise ValueError("Fitness function is not defined")
            
        for agent in self.population:
            if agent.fitness is None:  # Only evaluate if not already evaluated
                agent.fitness = self.fitness_function(agent)
        
        # Log some stats about the evaluation
        fitnesses = [agent.fitness for agent in self.population]
        logger.info(f"Population evaluation - Avg fitness: {np.mean(fitnesses):.4f}, "
                    f"Best: {np.max(fitnesses):.4f}, Worst: {np.min(fitnesses):.4f}")
    
    def tournament_selection(self) -> Agent:
        """
        Select an agent from the population using tournament selection.
        
        Returns:
            The selected agent
        """
        tournament = random.sample(self.population, self.tournament_size)
        return max(tournament, key=lambda agent: agent.fitness)
    
    def create_next_generation(self) -> None:
        """Create the next generation through selection, crossover, and mutation"""
        # Ensure the population is evaluated
        self.evaluate_population()
        
        # Sort population by fitness (descending)
        sorted_population = sorted(self.population, key=lambda x: x.fitness, reverse=True)
        new_population = []
        
        # Elitism: directly carry over the best agents
        elites = sorted_population[:self.elitism_count]
        new_population.extend([elite.clone() for elite in elites])
        
        # Create the rest of the population through selection, crossover, and mutation
        while len(new_population) < self.population_size:
            # Select parents
            parent1 = self.tournament_selection()
            parent2 = self.tournament_selection()
            
            # Create offspring
            if random.random() < self.crossover_rate:
                offspring = parent1.crossover(parent2)
            else:
                # If no crossover, clone one of the parents
                offspring = parent1.clone() if random.random() < 0.5 else parent2.clone()
            
            # Apply mutation with some probability
            if random.random() < self.mutation_rate:
                offspring.mutate()
            
            # Add to new population
            new_population.append(offspring)
        
        # Ensure new population size is correct
        if len(new_population) > self.population_size:
            new_population = new_population[:self.population_size]
        
        # Update population and generation counter
        self.population = new_population
        self.current_generation += 1
        
        # Calculate and record statistics for this generation
        self._record_generation_stats()
        
        logger.info(f"Created generation {self.current_generation}")
    
    def _record_generation_stats(self) -> None:
        """Record statistics for the current generation"""
        fitnesses = [agent.fitness for agent in self.population if agent.fitness is not None]
        if not fitnesses:
            logger.warning("No fitness values available to record generation stats")
            return
        
        best_fitness = max(fitnesses)
        avg_fitness = sum(fitnesses) / len(fitnesses)
        
        # Calculate a simple diversity metric (standard deviation of fitness)
        diversity = np.std(fitnesses) if len(fitnesses) > 1 else 0
        
        self.history.add_generation(
            generation=self.current_generation,
            population=self.population,
            best_fitness=best_fitness,
            avg_fitness=avg_fitness,
            diversity_metric=diversity
        )
    
    def evolve(self, generations: int) -> EvolutionHistory:
        """
        Evolve the population for a specified number of generations.
        
        Args:
            generations: Number of generations to evolve
            
        Returns:
            The evolution history containing statistics and best agents
        """
        for _ in range(generations):
            self.create_next_generation()
        
        return self.history
    
    def get_best_agent(self) -> Agent:
        """
        Get the best agent from the current population.
        
        Returns:
            The agent with the highest fitness
        """
        if not self.population:
            raise ValueError("Population is empty")
            
        # Ensure all agents have been evaluated
        self.evaluate_population()
        
        return max(self.population, key=lambda agent: agent.fitness)
    
    def get_diversity_metrics(self) -> Dict[str, float]:
        """
        Calculate various diversity metrics for the current population.
        
        Returns:
            Dictionary of diversity metrics
        """
        if not self.population or len(self.population) < 2:
            return {"fitness_std": 0, "fitness_range": 0}
        
        fitnesses = [agent.fitness for agent in self.population if agent.fitness is not None]
        
        return {
            "fitness_std": np.std(fitnesses),
            "fitness_range": max(fitnesses) - min(fitnesses),
            "fitness_mean": np.mean(fitnesses),
            "fitness_median": np.median(fitnesses)
        }

