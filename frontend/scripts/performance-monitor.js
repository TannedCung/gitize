#!/usr/bin/env node

/**
 * Performance monitoring script for AppFlowy UI System
 * Measures runtime performance, memory usage, and rendering metrics
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

class PerformanceMonitor {
  constructor() {
    this.browser = null;
    this.page = null;
    this.results = {
      timestamp: new Date().toISOString(),
      metrics: {},
      thresholds: {
        firstContentfulPaint: 1500, // 1.5s
        largestContentfulPaint: 2500, // 2.5s
        cumulativeLayoutShift: 0.1,
        firstInputDelay: 100, // 100ms
        timeToInteractive: 3000, // 3s
      },
    };
  }

  async start() {
    console.log('🚀 Starting performance monitoring...');

    try {
      await this.setupBrowser();
      await this.measurePageLoad();
      await this.measureComponentPerformance();
      await this.measureThemeSwitch();
      await this.measureMemoryUsage();
      await this.generateReport();

      console.log('✅ Performance monitoring complete!');
      return this.results;
    } catch (error) {
      console.error('❌ Performance monitoring failed:', error.message);
      throw error;
    } finally {
      await this.cleanup();
    }
  }

  async setupBrowser() {
    this.browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
      ],
    });

    this.page = await this.browser.newPage();

    // Set viewport for consistent measurements
    await this.page.setViewport({ width: 1920, height: 1080 });

    // Enable performance monitoring
    await this.page.setCacheEnabled(false);
    await this.page.coverage.startJSCoverage();
    await this.page.coverage.startCSSCoverage();
  }

  async measurePageLoad() {
    console.log('📊 Measuring page load performance...');

    // Navigate to the application
    const response = await this.page.goto('http://localhost:3000', {
      waitUntil: 'networkidle0',
    });

    // Collect Web Vitals
    const webVitals = await this.page.evaluate(() => {
      return new Promise(resolve => {
        const vitals = {};

        // First Contentful Paint
        new PerformanceObserver(list => {
          const entries = list.getEntries();
          entries.forEach(entry => {
            if (entry.name === 'first-contentful-paint') {
              vitals.firstContentfulPaint = entry.startTime;
            }
          });
        }).observe({ entryTypes: ['paint'] });

        // Largest Contentful Paint
        new PerformanceObserver(list => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          vitals.largestContentfulPaint = lastEntry.startTime;
        }).observe({ entryTypes: ['largest-contentful-paint'] });

        // Cumulative Layout Shift
        let clsValue = 0;
        new PerformanceObserver(list => {
          for (const entry of list.getEntries()) {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          }
          vitals.cumulativeLayoutShift = clsValue;
        }).observe({ entryTypes: ['layout-shift'] });

        // Time to Interactive (simplified)
        setTimeout(() => {
          vitals.timeToInteractive = performance.now();
          resolve(vitals);
        }, 100);
      });
    });

    this.results.metrics.pageLoad = {
      ...webVitals,
      responseTime: response.headers()['x-response-time'] || 'N/A',
      status: response.status(),
    };
  }

  async measureComponentPerformance() {
    console.log('🧩 Measuring component performance...');

    // Navigate to component demo page
    await this.page.goto('http://localhost:3000/demo', {
      waitUntil: 'networkidle0',
    });

    // Measure component rendering times
    const componentMetrics = await this.page.evaluate(() => {
      const metrics = {};

      // Measure Button rendering
      const buttonStart = performance.now();
      const buttons = document.querySelectorAll('button');
      const buttonEnd = performance.now();
      metrics.buttonRender = buttonEnd - buttonStart;
      metrics.buttonCount = buttons.length;

      // Measure TextField rendering
      const fieldStart = performance.now();
      const fields = document.querySelectorAll('input, textarea');
      const fieldEnd = performance.now();
      metrics.fieldRender = fieldEnd - fieldStart;
      metrics.fieldCount = fields.length;

      // Measure overall component tree
      const treeStart = performance.now();
      const allComponents = document.querySelectorAll('[data-component]');
      const treeEnd = performance.now();
      metrics.componentTreeRender = treeEnd - treeStart;
      metrics.totalComponents = allComponents.length;

      return metrics;
    });

    this.results.metrics.components = componentMetrics;
  }

  async measureThemeSwitch() {
    console.log('🎨 Measuring theme switch performance...');

    const themeMetrics = await this.page.evaluate(() => {
      return new Promise(resolve => {
        const metrics = {};
        let switchCount = 0;
        const maxSwitches = 5;
        const switchTimes = [];

        const performThemeSwitch = () => {
          const startTime = performance.now();

          // Find and click theme toggle
          const themeToggle =
            document.querySelector('[data-testid="theme-toggle"]') ||
            document.querySelector('button[aria-label*="theme"]') ||
            document.querySelector('.theme-toggle');

          if (themeToggle) {
            themeToggle.click();

            // Wait for transition to complete
            setTimeout(() => {
              const endTime = performance.now();
              switchTimes.push(endTime - startTime);
              switchCount++;

              if (switchCount < maxSwitches) {
                performThemeSwitch();
              } else {
                metrics.averageSwitchTime =
                  switchTimes.reduce((a, b) => a + b, 0) / switchTimes.length;
                metrics.minSwitchTime = Math.min(...switchTimes);
                metrics.maxSwitchTime = Math.max(...switchTimes);
                metrics.totalSwitches = switchCount;
                resolve(metrics);
              }
            }, 300); // Wait for transition duration
          } else {
            metrics.error = 'Theme toggle not found';
            resolve(metrics);
          }
        };

        performThemeSwitch();
      });
    });

    this.results.metrics.themeSwitch = themeMetrics;
  }

  async measureMemoryUsage() {
    console.log('💾 Measuring memory usage...');

    // Get initial memory metrics
    const initialMetrics = await this.page.metrics();

    // Perform memory-intensive operations
    await this.page.evaluate(() => {
      // Create and destroy many components
      const container = document.createElement('div');
      document.body.appendChild(container);

      for (let i = 0; i < 1000; i++) {
        const button = document.createElement('button');
        button.textContent = `Button ${i}`;
        button.className = 'btn btn-primary';
        container.appendChild(button);
      }

      // Clean up
      setTimeout(() => {
        document.body.removeChild(container);
      }, 100);
    });

    // Wait for cleanup
    await this.page.waitForTimeout(200);

    // Get final memory metrics
    const finalMetrics = await this.page.metrics();

    this.results.metrics.memory = {
      initial: {
        jsHeapUsedSize: initialMetrics.JSHeapUsedSize,
        jsHeapTotalSize: initialMetrics.JSHeapTotalSize,
      },
      final: {
        jsHeapUsedSize: finalMetrics.JSHeapUsedSize,
        jsHeapTotalSize: finalMetrics.JSHeapTotalSize,
      },
      difference: {
        jsHeapUsedSize:
          finalMetrics.JSHeapUsedSize - initialMetrics.JSHeapUsedSize,
        jsHeapTotalSize:
          finalMetrics.JSHeapTotalSize - initialMetrics.JSHeapTotalSize,
      },
    };
  }

  async generateReport() {
    console.log('📋 Generating performance report...');

    // Get code coverage
    const jsCoverage = await this.page.coverage.stopJSCoverage();
    const cssCoverage = await this.page.coverage.stopCSSCoverage();

    // Calculate coverage percentages
    const jsCoveragePercent = this.calculateCoverage(jsCoverage);
    const cssCoveragePercent = this.calculateCoverage(cssCoverage);

    const report = {
      ...this.results,
      coverage: {
        javascript: jsCoveragePercent,
        css: cssCoveragePercent,
      },
      analysis: {
        status: this.getPerformanceStatus(),
        recommendations: this.getPerformanceRecommendations(),
        score: this.calculatePerformanceScore(),
      },
    };

    // Write report to file
    const reportPath = path.join(process.cwd(), 'performance-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    // Print summary
    this.printPerformanceSummary(report);

    return report;
  }

  getPerformanceStatus() {
    const metrics = this.results.metrics;
    const thresholds = this.results.thresholds;

    const issues = [];

    if (
      metrics.pageLoad?.firstContentfulPaint > thresholds.firstContentfulPaint
    ) {
      issues.push('First Contentful Paint too slow');
    }

    if (
      metrics.pageLoad?.largestContentfulPaint >
      thresholds.largestContentfulPaint
    ) {
      issues.push('Largest Contentful Paint too slow');
    }

    if (
      metrics.pageLoad?.cumulativeLayoutShift > thresholds.cumulativeLayoutShift
    ) {
      issues.push('Cumulative Layout Shift too high');
    }

    if (metrics.themeSwitch?.averageSwitchTime > 500) {
      issues.push('Theme switching too slow');
    }

    return issues.length === 0
      ? 'GOOD'
      : issues.length <= 2
        ? 'WARNING'
        : 'ERROR';
  }

  getPerformanceRecommendations() {
    const recommendations = [];
    const metrics = this.results.metrics;

    if (
      metrics.pageLoad?.firstContentfulPaint >
      this.results.thresholds.firstContentfulPaint
    ) {
      recommendations.push({
        type: 'loading',
        message: 'First Contentful Paint is slow',
        action: 'Optimize critical CSS and reduce render-blocking resources',
      });
    }

    if (metrics.themeSwitch?.averageSwitchTime > 300) {
      recommendations.push({
        type: 'theme',
        message: 'Theme switching is slow',
        action: 'Optimize CSS transitions and reduce DOM updates',
      });
    }

    if (metrics.memory?.difference.jsHeapUsedSize > 5 * 1024 * 1024) {
      recommendations.push({
        type: 'memory',
        message: 'High memory usage detected',
        action: 'Check for memory leaks and optimize component cleanup',
      });
    }

    return recommendations;
  }

  calculatePerformanceScore() {
    const metrics = this.results.metrics;
    const thresholds = this.results.thresholds;

    let score = 100;

    // Deduct points for slow metrics
    if (
      metrics.pageLoad?.firstContentfulPaint > thresholds.firstContentfulPaint
    ) {
      score -= 20;
    }

    if (
      metrics.pageLoad?.largestContentfulPaint >
      thresholds.largestContentfulPaint
    ) {
      score -= 20;
    }

    if (
      metrics.pageLoad?.cumulativeLayoutShift > thresholds.cumulativeLayoutShift
    ) {
      score -= 15;
    }

    if (metrics.themeSwitch?.averageSwitchTime > 300) {
      score -= 15;
    }

    return Math.max(0, score);
  }

  calculateCoverage(coverage) {
    let totalBytes = 0;
    let usedBytes = 0;

    coverage.forEach(entry => {
      totalBytes += entry.text.length;
      entry.ranges.forEach(range => {
        usedBytes += range.end - range.start - 1;
      });
    });

    return totalBytes > 0 ? (usedBytes / totalBytes) * 100 : 0;
  }

  printPerformanceSummary(report) {
    console.log('\n🚀 Performance Summary');
    console.log('='.repeat(50));

    const status = report.analysis.status;
    const statusIcon =
      status === 'GOOD' ? '✅' : status === 'WARNING' ? '⚠️' : '❌';

    console.log(`${statusIcon} Overall Status: ${status}`);
    console.log(`📊 Performance Score: ${report.analysis.score}/100`);

    if (report.metrics.pageLoad) {
      console.log(
        `🎨 First Contentful Paint: ${report.metrics.pageLoad.firstContentfulPaint?.toFixed(2)}ms`
      );
      console.log(
        `🖼️  Largest Contentful Paint: ${report.metrics.pageLoad.largestContentfulPaint?.toFixed(2)}ms`
      );
      console.log(
        `📐 Cumulative Layout Shift: ${report.metrics.pageLoad.cumulativeLayoutShift?.toFixed(3)}`
      );
    }

    if (report.metrics.themeSwitch) {
      console.log(
        `🎨 Average Theme Switch: ${report.metrics.themeSwitch.averageSwitchTime?.toFixed(2)}ms`
      );
    }

    if (report.coverage) {
      console.log(
        `📝 JavaScript Coverage: ${report.coverage.javascript.toFixed(2)}%`
      );
      console.log(`🎨 CSS Coverage: ${report.coverage.css.toFixed(2)}%`);
    }

    if (report.analysis.recommendations.length > 0) {
      console.log('\n💡 Recommendations:');
      report.analysis.recommendations.forEach((rec, index) => {
        console.log(`${index + 1}. ${rec.message}`);
        console.log(`   Action: ${rec.action}`);
      });
    }
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
    }
  }
}

// CLI interface
if (require.main === module) {
  const monitor = new PerformanceMonitor();

  monitor
    .start()
    .then(results => {
      const status = results.analysis?.status || 'UNKNOWN';
      process.exit(status === 'ERROR' ? 1 : 0);
    })
    .catch(error => {
      console.error('Performance monitoring failed:', error);
      process.exit(1);
    });
}

module.exports = PerformanceMonitor;
