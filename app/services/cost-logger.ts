// Cost logger using localStorage for persistence
// Vercel Queue is not available in the current plan

export interface CostLogEntry {
  id: string;
  timestamp: number;
  provider: string;
  model: string;
  promptTokens: number;
  completionTokens: number;
  cost: number;
  activeCpuMs?: number;
  prompt?: string;
}

class CostLogger {
  private storageKey = 'ai-triage-cost-log';

  // Log cost entry to localStorage
  async log(entry: Omit<CostLogEntry, 'id' | 'timestamp'>): Promise<void> {
    const logEntry: CostLogEntry = {
      ...entry,
      id: crypto.randomUUID(),
      timestamp: Date.now()
    };

    this.saveToLocalStorage(logEntry);
  }

  private saveToLocalStorage(entry: CostLogEntry): void {
    if (typeof window === 'undefined') return;
    
    const existing = this.getFromLocalStorage();
    const updated = [...existing, entry];
    
    // Keep only last 1000 entries to prevent localStorage overflow
    const trimmed = updated.slice(-1000);
    
    localStorage.setItem(this.storageKey, JSON.stringify(trimmed));
  }

  getFromLocalStorage(): CostLogEntry[] {
    if (typeof window === 'undefined') return [];
    
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Failed to parse cost log from localStorage:', error);
      return [];
    }
  }

  getTotalCost(): number {
    const entries = this.getFromLocalStorage();
    return entries.reduce((total, entry) => total + entry.cost, 0);
  }

  getEntriesByProvider(): Record<string, CostLogEntry[]> {
    const entries = this.getFromLocalStorage();
    return entries.reduce((acc, entry) => {
      if (!acc[entry.provider]) {
        acc[entry.provider] = [];
      }
      acc[entry.provider].push(entry);
      return acc;
    }, {} as Record<string, CostLogEntry[]>);
  }

  getCostByProvider(): Record<string, number> {
    const entriesByProvider = this.getEntriesByProvider();
    const costByProvider: Record<string, number> = {};
    
    for (const [provider, entries] of Object.entries(entriesByProvider)) {
      costByProvider[provider] = entries.reduce((sum, entry) => sum + entry.cost, 0);
    }
    
    return costByProvider;
  }

  exportToCSV(): string {
    const entries = this.getFromLocalStorage();
    if (entries.length === 0) return '';
    
    const headers = [
      'Timestamp',
      'Provider',
      'Model',
      'Prompt Tokens',
      'Completion Tokens',
      'Cost ($)',
      'Active CPU (ms)',
      'Prompt'
    ].join(',');
    
    const rows = entries.map(entry => [
      new Date(entry.timestamp).toISOString(),
      entry.provider,
      entry.model,
      entry.promptTokens,
      entry.completionTokens,
      entry.cost.toFixed(6),
      entry.activeCpuMs || '',
      `"${(entry.prompt || '').replace(/"/g, '""')}"`
    ].join(','));
    
    return [headers, ...rows].join('\n');
  }

  clear(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.storageKey);
    }
  }
}

// Export singleton instance
export const costLogger = new CostLogger();