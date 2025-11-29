import { Injectable } from '@nestjs/common';

export interface TestSuite {
  id: string;
  name: string;
  tests: Test[];
  status: 'passed' | 'failed' | 'running';
  passedCount: number;
  failedCount: number;
}

export interface Test {
  id: string;
  name: string;
  status: 'passed' | 'failed' | 'skipped' | 'running';
  duration: number;
  error?: string;
  assertions: number;
}

@Injectable()
export class TestingService {
  private suites: Map<string, TestSuite> = new Map();
  private suiteCounter = 1;

  createTestSuite(name: string): TestSuite {
    const suite: TestSuite = {
      id: `suite_${this.suiteCounter++}`,
      name,
      tests: [],
      status: 'running',
      passedCount: 0,
      failedCount: 0,
    };

    this.suites.set(suite.id, suite);
    return suite;
  }

  addTest(suiteId: string, testName: string): Test {
    const suite = this.suites.get(suiteId);
    if (!suite) throw new Error('Suite not found');

    const test: Test = {
      id: `test_${Date.now()}`,
      name: testName,
      status: 'running',
      duration: 0,
      assertions: 0,
    };

    suite.tests.push(test);
    return test;
  }

  passTest(suiteId: string, testId: string, duration: number, assertions: number): void {
    const suite = this.suites.get(suiteId);
    if (!suite) return;

    const test = suite.tests.find((t) => t.id === testId);
    if (test) {
      test.status = 'passed';
      test.duration = duration;
      test.assertions = assertions;
      suite.passedCount++;
    }
  }

  failTest(suiteId: string, testId: string, error: string, duration: number): void {
    const suite = this.suites.get(suiteId);
    if (!suite) return;

    const test = suite.tests.find((t) => t.id === testId);
    if (test) {
      test.status = 'failed';
      test.error = error;
      test.duration = duration;
      suite.failedCount++;
    }
  }

  finalizeSuite(suiteId: string): TestSuite | undefined {
    const suite = this.suites.get(suiteId);
    if (!suite) return undefined;

    suite.status = suite.failedCount === 0 ? 'passed' : 'failed';
    return suite;
  }

  getSuite(suiteId: string): TestSuite | undefined {
    return this.suites.get(suiteId);
  }

  getAllSuites(): TestSuite[] {
    return Array.from(this.suites.values());
  }

  getTestSummary(): {
    totalSuites: number;
    passedSuites: number;
    failedSuites: number;
    totalTests: number;
    passedTests: number;
    failedTests: number;
  } {
    const suites = Array.from(this.suites.values());
    const totalTests = suites.reduce((sum, s) => sum + s.tests.length, 0);
    const passedTests = suites.reduce((sum, s) => sum + s.passedCount, 0);
    const failedTests = suites.reduce((sum, s) => sum + s.failedCount, 0);

    return {
      totalSuites: suites.length,
      passedSuites: suites.filter((s) => s.status === 'passed').length,
      failedSuites: suites.filter((s) => s.status === 'failed').length,
      totalTests,
      passedTests,
      failedTests,
    };
  }
}
