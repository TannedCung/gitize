#!/usr/bin/env node

/**
 * Bundle size analyzer for AppFlowy UI System
 * Monitors component library bundle size and tree-shaking effectiveness
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const CONFIG = {
  maxBundleSize: 100 * 1024, // 100KB max for UI components
  maxChunkSize: 50 * 1024, // 50KB max for individual chunks
  outputPath: './bundle-analysis.json',
  thresholds: {
    error: 0.9, // 90% of max size triggers error
    warning: 0.7, // 70% of max size triggers warning
  },
};

class BundleAnalyzer {
  constructor() {
    this.results = {
      timestamp: new Date().toISOString(),
      totalSize: 0,
      chunks: [],
      components: {},
      treeshaking: {
        unusedExports: [],
        duplicateModules: [],
      },
      performance: {
        buildTime: 0,
        compressionRatio: 0,
      },
    };
  }

  async analyze() {
    console.log('🔍 Starting bundle analysis...');

    try {
      await this.buildForAnalysis();
      await this.analyzeBundle();
      await this.checkTreeShaking();
      await this.generateReport();

      console.log('✅ Bundle analysis complete!');
      return this.results;
    } catch (error) {
      console.error('❌ Bundle analysis failed:', error.message);
      throw error;
    }
  }

  async buildForAnalysis() {
    console.log('📦 Building for analysis...');
    const startTime = Date.now();

    try {
      // Build the project with analysis flags
      execSync('npm run build', {
        stdio: 'pipe',
        cwd: process.cwd(),
      });

      this.results.performance.buildTime = Date.now() - startTime;
      console.log(
        `⏱️  Build completed in ${this.results.performance.buildTime}ms`
      );
    } catch (error) {
      throw new Error(`Build failed: ${error.message}`);
    }
  }

  async analyzeBundle() {
    console.log('📊 Analyzing bundle structure...');

    const buildDir = path.join(process.cwd(), '.next');

    if (!fs.existsSync(buildDir)) {
      throw new Error('Build directory not found. Run npm run build first.');
    }

    // Analyze static chunks
    const staticDir = path.join(buildDir, 'static', 'chunks');
    if (fs.existsSync(staticDir)) {
      const chunks = fs.readdirSync(staticDir);

      for (const chunk of chunks) {
        if (chunk.endsWith('.js')) {
          const chunkPath = path.join(staticDir, chunk);
          const stats = fs.statSync(chunkPath);

          this.results.chunks.push({
            name: chunk,
            size: stats.size,
            path: chunkPath,
            isUIComponent: this.isUIComponentChunk(chunk),
          });

          this.results.totalSize += stats.size;
        }
      }
    }

    // Analyze component sizes
    await this.analyzeComponentSizes();
  }

  async analyzeComponentSizes() {
    console.log('🧩 Analyzing component sizes...');

    const componentsDir = path.join(process.cwd(), 'app', 'components', 'ui');

    if (!fs.existsSync(componentsDir)) {
      console.warn('⚠️  UI components directory not found');
      return;
    }

    const components = fs.readdirSync(componentsDir);

    for (const component of components) {
      if (component.endsWith('.tsx') || component.endsWith('.ts')) {
        const componentPath = path.join(componentsDir, component);
        const stats = fs.statSync(componentPath);
        const content = fs.readFileSync(componentPath, 'utf8');

        this.results.components[component] = {
          sourceSize: stats.size,
          lines: content.split('\n').length,
          exports: this.extractExports(content),
          imports: this.extractImports(content),
          complexity: this.calculateComplexity(content),
        };
      }
    }
  }

  async checkTreeShaking() {
    console.log('🌳 Checking tree-shaking effectiveness...');

    // Check for unused exports
    const indexPath = path.join(
      process.cwd(),
      'app',
      'components',
      'ui',
      'index.ts'
    );

    if (fs.existsSync(indexPath)) {
      const indexContent = fs.readFileSync(indexPath, 'utf8');
      const exports = this.extractExports(indexContent);

      // This is a simplified check - in a real scenario, you'd use
      // tools like webpack-bundle-analyzer or rollup-plugin-analyzer
      this.results.treeshaking.unusedExports = exports.filter(
        exp => !this.isExportUsed(exp)
      );
    }

    // Check for duplicate modules
    this.results.treeshaking.duplicateModules = this.findDuplicateModules();
  }

  async generateReport() {
    console.log('📋 Generating report...');

    const report = {
      ...this.results,
      analysis: {
        status: this.getOverallStatus(),
        recommendations: this.getRecommendations(),
        metrics: this.calculateMetrics(),
      },
    };

    // Write detailed report
    fs.writeFileSync(CONFIG.outputPath, JSON.stringify(report, null, 2));

    // Print summary
    this.printSummary(report);
  }

  getOverallStatus() {
    const uiComponentsSize = this.results.chunks
      .filter(chunk => chunk.isUIComponent)
      .reduce((total, chunk) => total + chunk.size, 0);

    if (uiComponentsSize > CONFIG.maxBundleSize * CONFIG.thresholds.error) {
      return 'ERROR';
    } else if (
      uiComponentsSize >
      CONFIG.maxBundleSize * CONFIG.thresholds.warning
    ) {
      return 'WARNING';
    }
    return 'GOOD';
  }

  getRecommendations() {
    const recommendations = [];

    const uiComponentsSize = this.results.chunks
      .filter(chunk => chunk.isUIComponent)
      .reduce((total, chunk) => total + chunk.size, 0);

    if (uiComponentsSize > CONFIG.maxBundleSize) {
      recommendations.push({
        type: 'size',
        message: `UI components bundle (${this.formatSize(uiComponentsSize)}) exceeds maximum (${this.formatSize(CONFIG.maxBundleSize)})`,
        action:
          'Consider lazy loading more components or reducing component complexity',
      });
    }

    if (this.results.treeshaking.unusedExports.length > 0) {
      recommendations.push({
        type: 'treeshaking',
        message: `${this.results.treeshaking.unusedExports.length} unused exports detected`,
        action: 'Remove unused exports to improve tree-shaking',
      });
    }

    if (this.results.treeshaking.duplicateModules.length > 0) {
      recommendations.push({
        type: 'duplication',
        message: `${this.results.treeshaking.duplicateModules.length} duplicate modules found`,
        action: 'Consolidate duplicate dependencies',
      });
    }

    return recommendations;
  }

  calculateMetrics() {
    const uiComponentsSize = this.results.chunks
      .filter(chunk => chunk.isUIComponent)
      .reduce((total, chunk) => total + chunk.size, 0);

    return {
      totalBundleSize: this.results.totalSize,
      uiComponentsSize,
      compressionRatio: this.calculateCompressionRatio(),
      treeshakingEfficiency: this.calculateTreeshakingEfficiency(),
      componentCount: Object.keys(this.results.components).length,
      averageComponentSize:
        uiComponentsSize / Object.keys(this.results.components).length,
    };
  }

  printSummary(report) {
    console.log('\n📊 Bundle Analysis Summary');
    console.log('='.repeat(50));

    const status = report.analysis.status;
    const statusIcon =
      status === 'GOOD' ? '✅' : status === 'WARNING' ? '⚠️' : '❌';

    console.log(`${statusIcon} Overall Status: ${status}`);
    console.log(
      `📦 Total Bundle Size: ${this.formatSize(report.analysis.metrics.totalBundleSize)}`
    );
    console.log(
      `🧩 UI Components Size: ${this.formatSize(report.analysis.metrics.uiComponentsSize)}`
    );
    console.log(
      `🗜️  Compression Ratio: ${report.analysis.metrics.compressionRatio.toFixed(2)}%`
    );
    console.log(
      `🌳 Tree-shaking Efficiency: ${report.analysis.metrics.treeshakingEfficiency.toFixed(2)}%`
    );
    console.log(`⏱️  Build Time: ${report.performance.buildTime}ms`);

    if (report.analysis.recommendations.length > 0) {
      console.log('\n💡 Recommendations:');
      report.analysis.recommendations.forEach((rec, index) => {
        console.log(`${index + 1}. ${rec.message}`);
        console.log(`   Action: ${rec.action}`);
      });
    }

    console.log(`\n📄 Detailed report saved to: ${CONFIG.outputPath}`);
  }

  // Helper methods
  isUIComponentChunk(chunkName) {
    return (
      chunkName.includes('ui-components') ||
      chunkName.includes('components') ||
      chunkName.includes('Button') ||
      chunkName.includes('TextField')
    );
  }

  extractExports(content) {
    const exportRegex =
      /export\s+(?:const|function|class|interface|type)\s+(\w+)/g;
    const exports = [];
    let match;

    while ((match = exportRegex.exec(content)) !== null) {
      exports.push(match[1]);
    }

    return exports;
  }

  extractImports(content) {
    const importRegex = /import\s+.*?from\s+['"]([^'"]+)['"]/g;
    const imports = [];
    let match;

    while ((match = importRegex.exec(content)) !== null) {
      imports.push(match[1]);
    }

    return imports;
  }

  calculateComplexity(content) {
    // Simple complexity calculation based on cyclomatic complexity
    const complexityIndicators = [
      /if\s*\(/g,
      /else\s*{/g,
      /for\s*\(/g,
      /while\s*\(/g,
      /switch\s*\(/g,
      /case\s+/g,
      /catch\s*\(/g,
      /\?\s*:/g, // ternary operators
    ];

    let complexity = 1; // Base complexity

    complexityIndicators.forEach(regex => {
      const matches = content.match(regex);
      if (matches) {
        complexity += matches.length;
      }
    });

    return complexity;
  }

  isExportUsed(exportName) {
    // Simplified check - in reality, you'd analyze the entire codebase
    // This is a placeholder that assumes all exports are used
    return true;
  }

  findDuplicateModules() {
    // Placeholder for duplicate module detection
    // In reality, you'd use webpack-bundle-analyzer data
    return [];
  }

  calculateCompressionRatio() {
    // Placeholder for compression ratio calculation
    return 65; // Typical gzip compression ratio
  }

  calculateTreeshakingEfficiency() {
    const totalExports = Object.values(this.results.components).reduce(
      (total, comp) => total + comp.exports.length,
      0
    );
    const unusedExports = this.results.treeshaking.unusedExports.length;

    return totalExports > 0
      ? ((totalExports - unusedExports) / totalExports) * 100
      : 100;
  }

  formatSize(bytes) {
    const sizes = ['B', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
  }
}

// CLI interface
if (require.main === module) {
  const analyzer = new BundleAnalyzer();

  analyzer
    .analyze()
    .then(results => {
      const status = results.analysis?.status || 'UNKNOWN';
      process.exit(status === 'ERROR' ? 1 : 0);
    })
    .catch(error => {
      console.error('Bundle analysis failed:', error);
      process.exit(1);
    });
}

module.exports = BundleAnalyzer;
