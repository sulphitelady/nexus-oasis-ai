import { useState, useEffect, useCallback } from 'react';

interface SavedRecommendation {
  strategyId: string;
  savedAt: string;
  scenario: string;
  expectedImpact: {
    co2Reduction: number;
    costSavings: number;
    efficiencyGain: number;
  };
}

interface ImplementedRecommendation {
  strategyId: string;
  implementedAt: string;
  scenario: string;
}

const SAVED_KEY = 'nexus-saved-recommendations';
const IMPLEMENTED_KEY = 'nexus-implemented-recommendations';

export function useSavedRecommendations(scenario: string) {
  const [savedItems, setSavedItems] = useState<Set<string>>(new Set());
  const [implementedItems, setImplementedItems] = useState<Set<string>>(new Set());

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(SAVED_KEY) || '[]') as SavedRecommendation[];
      const implemented = JSON.parse(localStorage.getItem(IMPLEMENTED_KEY) || '[]') as ImplementedRecommendation[];
      
      setSavedItems(new Set(saved.map(s => s.strategyId)));
      setImplementedItems(new Set(implemented.map(i => i.strategyId)));
    } catch (error) {
      console.error('Error loading saved recommendations:', error);
    }
  }, []);

  const saveRecommendation = useCallback((
    strategyId: string, 
    expectedImpact: SavedRecommendation['expectedImpact']
  ) => {
    const saved = JSON.parse(localStorage.getItem(SAVED_KEY) || '[]') as SavedRecommendation[];
    
    const existing = saved.find(s => s.strategyId === strategyId);
    if (!existing) {
      saved.push({
        strategyId,
        savedAt: new Date().toISOString(),
        scenario,
        expectedImpact
      });
      localStorage.setItem(SAVED_KEY, JSON.stringify(saved));
    }
    
    setSavedItems(prev => new Set([...prev, strategyId]));
  }, [scenario]);

  const unsaveRecommendation = useCallback((strategyId: string) => {
    const saved = JSON.parse(localStorage.getItem(SAVED_KEY) || '[]') as SavedRecommendation[];
    const filtered = saved.filter(s => s.strategyId !== strategyId);
    localStorage.setItem(SAVED_KEY, JSON.stringify(filtered));
    
    setSavedItems(prev => {
      const next = new Set(prev);
      next.delete(strategyId);
      return next;
    });
  }, []);

  const toggleSaved = useCallback((
    strategyId: string, 
    expectedImpact: SavedRecommendation['expectedImpact']
  ) => {
    if (savedItems.has(strategyId)) {
      unsaveRecommendation(strategyId);
      return false;
    } else {
      saveRecommendation(strategyId, expectedImpact);
      return true;
    }
  }, [savedItems, saveRecommendation, unsaveRecommendation]);

  const implementRecommendation = useCallback((strategyId: string) => {
    const implemented = JSON.parse(localStorage.getItem(IMPLEMENTED_KEY) || '[]') as ImplementedRecommendation[];
    
    const existing = implemented.find(i => i.strategyId === strategyId);
    if (!existing) {
      implemented.push({
        strategyId,
        implementedAt: new Date().toISOString(),
        scenario
      });
      localStorage.setItem(IMPLEMENTED_KEY, JSON.stringify(implemented));
    }
    
    setImplementedItems(prev => new Set([...prev, strategyId]));
  }, [scenario]);

  const unimplementRecommendation = useCallback((strategyId: string) => {
    const implemented = JSON.parse(localStorage.getItem(IMPLEMENTED_KEY) || '[]') as ImplementedRecommendation[];
    const filtered = implemented.filter(i => i.strategyId !== strategyId);
    localStorage.setItem(IMPLEMENTED_KEY, JSON.stringify(filtered));
    
    setImplementedItems(prev => {
      const next = new Set(prev);
      next.delete(strategyId);
      return next;
    });
  }, []);

  const toggleImplemented = useCallback((strategyId: string) => {
    if (implementedItems.has(strategyId)) {
      unimplementRecommendation(strategyId);
      return false;
    } else {
      implementRecommendation(strategyId);
      return true;
    }
  }, [implementedItems, implementRecommendation, unimplementRecommendation]);

  const getSavedRecommendations = useCallback(() => {
    try {
      return JSON.parse(localStorage.getItem(SAVED_KEY) || '[]') as SavedRecommendation[];
    } catch {
      return [];
    }
  }, []);

  const getImplementedRecommendations = useCallback(() => {
    try {
      return JSON.parse(localStorage.getItem(IMPLEMENTED_KEY) || '[]') as ImplementedRecommendation[];
    } catch {
      return [];
    }
  }, []);

  const clearAll = useCallback(() => {
    localStorage.removeItem(SAVED_KEY);
    localStorage.removeItem(IMPLEMENTED_KEY);
    setSavedItems(new Set());
    setImplementedItems(new Set());
  }, []);

  return {
    savedItems,
    implementedItems,
    saveRecommendation,
    unsaveRecommendation,
    toggleSaved,
    implementRecommendation,
    unimplementRecommendation,
    toggleImplemented,
    getSavedRecommendations,
    getImplementedRecommendations,
    clearAll,
    isSaved: (strategyId: string) => savedItems.has(strategyId),
    isImplemented: (strategyId: string) => implementedItems.has(strategyId)
  };
}
