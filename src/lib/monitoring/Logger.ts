type Counters = Record<string, number>;

export class Logger {
  private counters: Counters;

  // Initialize the logger with a predefined list of counters
  constructor(initialCounters: string[]) {
    // Initialize counters with the provided names, all set to 0
    this.counters = initialCounters.reduce((acc, counterName) => {
      acc[counterName] = 0;
      return acc;
    }, {} as Counters);
  }

  // Currently, Logger.log just uses console.log
  log(message: string): void {
    console.log(message);
  }

  // Currently, Logger.warn just uses console.warn
  warn(message: string): void {
    console.warn(message);
  }

  // Currently, Logger.error just uses console.error
  error(message?: string, ...optionalParams: any[]): void {
    console.error(message, optionalParams);
  }

  // Method to increment a counter by name
  increment(counterName: string): void {
    if (this.counters.hasOwnProperty(counterName)) {
      this.counters[counterName]++;
      console.log(`Counter "${counterName}" incremented. New value: ${this.counters[counterName]}`);
    } else {
      console.warn(`Counter "${counterName}" is not defined.`);
    }
  }

  // Method to decrement a counter by name
  decrement(counterName: string): void {
    if (this.counters.hasOwnProperty(counterName) && this.counters[counterName] > 0) {
      this.counters[counterName]--;
      console.log(`Counter "${counterName}" decremented. New value: ${this.counters[counterName]}`);
    } else {
      console.warn(`Counter "${counterName}" is not defined or already at 0.`);
    }
  }

  // Method to get the value of a counter
  getCounterValue(counterName: string): number {
    if (this.counters.hasOwnProperty(counterName)) {
      return this.counters[counterName];
    } else {
      console.warn(`Counter "${counterName}" is not defined.`);
      return -1;
    }
  }

  // Method to reset a counter
  resetCounter(counterName: string): void {
    if (this.counters.hasOwnProperty(counterName)) {
      this.counters[counterName] = 0;
      console.log(`Counter "${counterName}" reset to 0.`);
    } else {
      console.warn(`Counter "${counterName}" is not defined.`);
    }
  }
}
