#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { glob } = require('glob');
const chalk = require('chalk');
const { parse } = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const t = require('@babel/types');

// Parse command line arguments
const args = process.argv.slice(2);
let customSrcPath = null;
let customConfigPath = null;

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--src' || args[i] === '-s') {
    customSrcPath = args[i + 1];
    i++;
  } else if (args[i] === '--config' || args[i] === '-c') {
    customConfigPath = args[i + 1];
    i++;
  } else if (args[i] === '--help' || args[i] === '-h') {
    console.log(chalk.blue.bold('🔍 React Native Component Analyzer - Usage'));
    console.log(chalk.gray('─'.repeat(60)));
    console.log(chalk.blue('Basic usage:'));
    console.log('  node component-analyzer.js');
    console.log('');
    console.log(chalk.blue('With custom source folder:'));
    console.log('  node component-analyzer.js --src /path/to/your/src');
    console.log('  node component-analyzer.js -s /path/to/your/src');
    console.log('');
    console.log(chalk.blue('With custom config:'));
    console.log('  node component-analyzer.js --config ./custom-config.json');
    console.log('  node component-analyzer.js -c ./custom-config.json');
    console.log('');
    console.log(chalk.blue('Help:'));
    console.log('  node component-analyzer.js --help');
    console.log('  node component-analyzer.js -h');
    console.log('');
    console.log(chalk.gray('─'.repeat(60)));
    process.exit(0);
  }
}

// Load configuration
const configPath = customConfigPath || './analyzer-config.json';
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

// Override src folder if custom path provided
if (customSrcPath) {
  if (!fs.existsSync(customSrcPath)) {
    console.error(chalk.red(`❌ Error: Source folder does not exist: ${customSrcPath}`));
    process.exit(1);
  }
  
  const absolutePath = path.isAbsolute(customSrcPath) 
    ? customSrcPath 
    : path.resolve(process.cwd(), customSrcPath);
    
  config.srcFolder = absolutePath;
  console.log(chalk.yellow(`📁 Using custom source folder: ${absolutePath}`));
}

// Analysis data structure
const analysis = {
  summary: {
    totalFiles: 0,
    totalComponents: 0,
    totalUsages: 0,
    packages: new Set(),
    startTime: new Date(),
  },
  components: new Map(), // componentName -> componentData
  files: new Map(), // filePath -> fileData
  imports: new Map(), // packageName -> components[]
};

/**
 * Get migration priority based on usage count
 */
function getMigrationPriority(usageCount) {
  if (usageCount >= config.priorityThresholds.high) return 'high';
  if (usageCount >= config.priorityThresholds.medium) return 'medium';
  return 'low';
}

/**
 * Get priority color for HTML
 */
function getPriorityColor(priority) {
  const colors = {
    high: '#dc3545',
    medium: '#ffc107',
    low: '#28a745'
  };
  return colors[priority] || '#6c757d';
}

/**
 * Generate GitHub URL for file path
 */
function generateGitHubUrl(filePath, lineNumber = null) {
  if (!config.github || !config.github.repository) {
    return null;
  }
  
  const relativePath = path.relative(process.cwd(), filePath);
  const branch = config.github.branch || 'main';
  
  let url = `https://github.com/${config.github.repository}/blob/${branch}/${relativePath}`;
  
  if (lineNumber) {
    url += `#L${lineNumber}`;
  }
  
  return url;
}

/**
 * Analyze import statements
 */
function analyzeImports(ast, filePath) {
  const fileImports = [];
  
  traverse(ast, {
    ImportDeclaration(importPath) {
      const source = importPath.node.source.value;
      
      // Check if this package is in our tracking list (exact match)
      if (config.packagesToTrack.some(pkg => source === pkg)) {
        const components = importPath.node.specifiers
          .filter(spec => spec.type === 'ImportSpecifier')
          .map(spec => spec.local.name);
        
        if (components.length > 0) {
          fileImports.push({ source, components });
          
          // Track package usage
          analysis.summary.packages.add(source);
          
          // Initialize package in imports map
          if (!analysis.imports.has(source)) {
            analysis.imports.set(source, []);
          }
          
          components.forEach(comp => {
            if (!analysis.imports.get(source).includes(comp)) {
              analysis.imports.get(source).push(comp);
            }
          });
        }
      }
    }
  });
  
  return fileImports;
}

/**
 * Analyze JSX usage
 */
function analyzeJSXUsage(ast, filePath, fileImports) {
  const componentUsage = new Map();
  
  traverse(ast, {
    JSXElement(jsxPath) {
      if (!jsxPath || !jsxPath.node || !jsxPath.node.openingElement) return;
      
      const componentName = jsxPath.node.openingElement.name.name;
      
      // Apply component filters (include/exclude)
      if (config.componentFilters.include.length > 0 && 
          !config.componentFilters.include.includes(componentName)) {
        return; // Skip if not in include list
      }
      
      if (config.componentFilters.exclude.includes(componentName)) {
        return; // Skip if in exclude list
      }
      
      // Check if this component is imported from tracked packages
      const isTrackedComponent = fileImports.some(imp => 
        imp.components.includes(componentName)
      );
      
      if (isTrackedComponent) {
        // Count usage
        if (!componentUsage.has(componentName)) {
          componentUsage.set(componentName, 0);
        }
        componentUsage.set(componentName, componentUsage.get(componentName) + 1);
        
        // Update global analysis
        if (!analysis.components.has(componentName)) {
          analysis.components.set(componentName, {
            name: componentName,
            totalUsages: 0,
            files: new Map(),
            packages: new Set(),
            migrationPriority: 'low'
          });
        }
        
        const componentData = analysis.components.get(componentName);
        componentData.totalUsages++;
        
        if (!componentData.files.has(filePath)) {
          componentData.files.set(filePath, 0);
        }
        componentData.files.set(filePath, componentData.files.get(filePath) + 1);
        
        // Add package info
        const importInfo = fileImports.find(imp => imp.components.includes(componentName));
        if (importInfo) {
          componentData.packages.add(importInfo.source);
        }
      }
    }
  });
  
  return componentUsage;
}

/**
 * Process a single file
 */
function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const relativePath = path.relative(process.cwd(), filePath);
    
    console.log(chalk.blue(`Analyzing: ${relativePath}`));
    
    // Parse the file
    const ast = parse(content, {
      sourceType: 'module',
      plugins: ['jsx', 'typescript']
    });
    
    // Analyze imports
    const fileImports = analyzeImports(ast, filePath);
    
    // Analyze JSX usage
    const componentUsage = analyzeJSXUsage(ast, filePath, fileImports);
    
    // Store file data
    analysis.files.set(filePath, {
      path: filePath,
      relativePath,
      imports: fileImports,
      componentUsage: Object.fromEntries(componentUsage),
      totalUsages: Array.from(componentUsage.values()).reduce((sum, count) => sum + count, 0)
    });
    
    analysis.summary.totalFiles++;
    
  } catch (error) {
    const errorMsg = `Error analyzing ${filePath}: ${error.message}`;
    console.error(chalk.red(`✗ ${errorMsg}`));
  }
}

/**
 * Generate HTML report
 */
function generateHTMLReport() {
  // Calculate migration priorities
  analysis.components.forEach(component => {
    component.migrationPriority = getMigrationPriority(component.totalUsages);
  });
  
  // Sort components by usage count (descending)
  const sortedComponents = Array.from(analysis.components.values())
    .sort((a, b) => b.totalUsages - a.totalUsages);
  
  // Sort files by usage count (descending)
  const sortedFiles = Array.from(analysis.files.values())
    .sort((a, b) => b.totalUsages - a.totalUsages);
  
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>React Native Component Migration Report</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; background: #f8f9fa; }
        .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
        .header { background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); margin-bottom: 20px; }
        .header h1 { color: #007bff; margin-bottom: 10px; }
        .summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .summary-card { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); text-align: center; }
        .summary-card h3 { color: #6c757d; font-size: 14px; margin-bottom: 10px; }
        .summary-card .number { font-size: 32px; font-weight: bold; color: #007bff; }
        .section { background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); margin-bottom: 20px; }
        .section h2 { color: #495057; margin-bottom: 20px; border-bottom: 2px solid #e9ecef; padding-bottom: 10px; }
        .component-item { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 15px; border-left: 4px solid #007bff; }
        .component-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
        .component-name { font-size: 18px; font-weight: bold; color: #495057; }
        .usage-count { background: #007bff; color: white; padding: 5px 12px; border-radius: 20px; font-size: 14px; }
        .priority-badge { padding: 5px 12px; border-radius: 20px; color: white; font-size: 12px; font-weight: bold; }
        .file-list { margin-top: 15px; }
        .file-item { display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid #e9ecef; }
        .file-item:last-child { border-bottom: none; }
        .file-path { font-family: monospace; color: #6c757d; }
        .file-path a { color: #007bff; text-decoration: none; }
        .file-path a:hover { text-decoration: underline; }
        .file-usage { background: #e9ecef; color: #495057; padding: 3px 8px; border-radius: 12px; font-size: 12px; }
        .package-info { margin-top: 10px; font-size: 14px; color: #6c757d; }
        .package-tag { background: #e9ecef; color: #495057; padding: 3px 8px; border-radius: 12px; font-size: 12px; margin-right: 5px; }
        .migration-tips { background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 20px; margin-top: 20px; }
        .migration-tips h4 { color: #856404; margin-bottom: 10px; }
        .migration-tips ul { margin-left: 20px; }
        .migration-tips li { margin-bottom: 5px; color: #856404; }
        .high-priority { border-left-color: #dc3545; }
        .medium-priority { border-left-color: #ffc107; }
        .low-priority { border-left-color: #28a745; }
        .tabs { display: flex; border-bottom: 1px solid #dee2e6; margin-bottom: 20px; }
        .tab { padding: 10px 20px; cursor: pointer; border: none; background: none; color: #6c757d; }
        .tab.active { color: #007bff; border-bottom: 2px solid #007bff; }
        .tab-content { display: none; }
        .tab-content.active { display: block; }
        .search-box { width: 100%; padding: 10px; border: 1px solid #dee2e6; border-radius: 5px; margin-bottom: 20px; font-size: 16px; }
        @media (max-width: 768px) { .summary-grid { grid-template-columns: 1fr; } .component-header { flex-direction: column; align-items: flex-start; gap: 10px; } }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔍 React Native Component Migration Report</h1>
            <p>Generated on ${analysis.summary.startTime.toLocaleString()}</p>
            <p>Source folder: ${config.srcFolder}</p>
        </div>
        
        <div class="summary-grid">
            <div class="summary-card">
                <h3>Files Analyzed</h3>
                <div class="number">${analysis.summary.totalFiles}</div>
            </div>
            <div class="summary-card">
                <h3>Components Found</h3>
                <div class="number">${analysis.summary.totalComponents}</div>
            </div>
            <div class="summary-card">
                <h3>Total Usages</h3>
                <div class="number">${analysis.summary.totalUsages}</div>
            </div>
            <div class="summary-card">
                <h3>Packages Tracked</h3>
                <div class="number">${analysis.summary.packages.size}</div>
            </div>
        </div>
        
        <div class="section">
            <h2>📊 Component Analysis</h2>
            <input type="text" class="search-box" placeholder="Search components..." onkeyup="filterComponents(this.value)">
            
            ${sortedComponents.map(component => `
                <div class="component-item ${component.migrationPriority}-priority">
                    <div class="component-header">
                        <div>
                            <div class="component-name">${component.name}</div>
                            <div class="package-info">
                                ${Array.from(component.packages).map(pkg => `<span class="package-tag">${pkg}</span>`).join('')}
                            </div>
                        </div>
                        <div style="display: flex; gap: 10px; align-items: center;">
                            <span class="usage-count">${component.totalUsages} usages</span>
                            <span class="priority-badge" style="background-color: ${getPriorityColor(component.migrationPriority)}">
                                ${component.migrationPriority.toUpperCase()} PRIORITY
                            </span>
                        </div>
                    </div>
                    
                    <div class="file-list">
                        ${Array.from(component.files.entries()).map(([filePath, count]) => {
                            const relativePath = path.relative(process.cwd(), filePath);
                            const githubUrl = generateGitHubUrl(filePath);
                            
                            if (githubUrl) {
                                return `
                                    <div class="file-item">
                                        <span class="file-path">
                                            <a href="${githubUrl}" target="_blank" style="color: #007bff; text-decoration: none;">
                                                ${relativePath} 🔗
                                            </a>
                                        </span>
                                        <span class="file-usage">${count} usage${count > 1 ? 's' : ''}</span>
                                    </div>
                                `;
                            } else {
                                return `
                                    <div class="file-item">
                                        <span class="file-path">${relativePath}</span>
                                        <span class="file-usage">${count} usage${count > 1 ? 's' : ''}</span>
                                    </div>
                                `;
                            }
                        }).join('')}
                    </div>
                    
                    <div class="migration-tips">
                        <h4>💡 Migration Tips</h4>
                        <ul>
                            ${component.migrationPriority === 'high' ? 
                                '<li>High usage - prioritize custom component development</li>' : ''}
                            ${component.migrationPriority === 'medium' ? 
                                '<li>Medium usage - plan for next development cycle</li>' : ''}
                            ${component.migrationPriority === 'low' ? 
                                '<li>Low usage - can be migrated later</li>' : ''}
                            <li>Found in ${component.files.size} file${component.files.size > 1 ? 's' : ''}</li>
                            <li>Imported from: ${Array.from(component.packages).join(', ')}</li>
                        </ul>
                    </div>
                </div>
            `).join('')}
        </div>
        
        <div class="section">
            <h2>📁 File Impact Analysis</h2>
            <p>Files ordered by total component usage (most impacted first)</p>
            
            ${sortedFiles.map(file => {
                const githubUrl = generateGitHubUrl(file.path);
                
                if (githubUrl) {
                    return `
                        <div class="file-item">
                            <span class="file-path">
                                <a href="${githubUrl}" target="_blank" style="color: #007bff; text-decoration: none;">
                                    ${file.relativePath} 🔗
                                </a>
                            </span>
                            <span class="file-usage">${file.totalUsages} component usage${file.totalUsages > 1 ? 's' : ''}</span>
                        </div>
                    `;
                } else {
                    return `
                        <div class="file-item">
                            <span class="file-path">${file.relativePath}</span>
                            <span class="file-usage">${file.totalUsages} component usage${file.totalUsages > 1 ? 's' : ''}</span>
                        </div>
                    `;
                }
            }).join('')}
        </div>
        
        <div class="section">
            <h2>📦 Package Analysis</h2>
            ${Array.from(analysis.imports.entries()).map(([packageName, components]) => `
                <div style="margin-bottom: 20px;">
                    <h3 style="color: #495057; margin-bottom: 10px;">${packageName}</h3>
                    <div style="display: flex; flex-wrap: wrap; gap: 5px;">
                        ${components.map(comp => `<span class="package-tag">${comp}</span>`).join('')}
                    </div>
                </div>
            `).join('')}
        </div>
    </div>
    
    <script>
        function filterComponents(searchTerm) {
            const components = document.querySelectorAll('.component-item');
            searchTerm = searchTerm.toLowerCase();
            
            components.forEach(component => {
                const componentName = component.querySelector('.component-name').textContent.toLowerCase();
                if (componentName.includes(searchTerm)) {
                    component.style.display = 'block';
                } else {
                    component.style.display = 'none';
                }
            });
        }
    </script>
</body>
</html>`;

  return html;
}

/**
 * Generate JSON report
 */
function generateJSONReport() {
  const report = {
    summary: {
      totalFiles: analysis.summary.totalFiles,
      totalComponents: analysis.summary.totalComponents,
      totalUsages: analysis.summary.totalUsages,
      packages: Array.from(analysis.summary.packages),
      generatedAt: analysis.summary.startTime.toISOString(),
      sourceFolder: config.srcFolder
    },
    components: Array.from(analysis.components.values()).map(comp => ({
      name: comp.name,
      totalUsages: comp.totalUsages,
      migrationPriority: comp.migrationPriority,
      packages: Array.from(comp.packages),
      files: Object.fromEntries(comp.files)
    })),
    files: Array.from(analysis.files.values()).map(file => ({
      path: file.relativePath,
      totalUsages: file.totalUsages,
      componentUsage: file.componentUsage
    })),
    imports: Object.fromEntries(analysis.imports)
  };
  
  return JSON.stringify(report, null, 2);
}

/**
 * Main execution function
 */
async function main() {
  console.log(chalk.yellow.bold('🔍 React Native Component Analyzer'));
  console.log(chalk.gray('Analyzing components for migration planning...\n'));
  
  try {
    // Find all matching files
    const pattern = `${config.srcFolder}/**/*.{${config.fileExtensions.join(',')}}`;
    const files = await glob(pattern, { ignore: ['**/node_modules/**'] });
    
    if (files.length === 0) {
      console.log(chalk.yellow('No files found matching the pattern.'));
      return;
    }
    
    console.log(chalk.blue(`Found ${files.length} files to analyze.\n`));
    
    // Process each file
    for (const file of files) {
      processFile(file);
    }
    
    // Calculate summary
    analysis.summary.totalComponents = analysis.components.size;
    analysis.summary.totalUsages = Array.from(analysis.components.values())
      .reduce((sum, comp) => sum + comp.totalUsages, 0);
    
    // Generate reports
    const htmlReport = generateHTMLReport();
    const jsonReport = generateJSONReport();
    
    // Write reports
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const htmlPath = `component-migration-report-${timestamp}.html`;
    const jsonPath = `component-migration-report-${timestamp}.json`;
    
    fs.writeFileSync(htmlPath, htmlReport);
    fs.writeFileSync(jsonPath, jsonReport);
    
    console.log(chalk.green.bold('\n✅ Analysis Complete!'));
    console.log(chalk.gray('─'.repeat(50)));
    console.log(chalk.blue(`📊 Summary:`));
    console.log(`   Files analyzed: ${analysis.summary.totalFiles}`);
    console.log(`   Components found: ${analysis.summary.totalComponents}`);
    console.log(`   Total usages: ${analysis.summary.totalUsages}`);
    console.log(`   Packages tracked: ${analysis.summary.packages.size}`);
    console.log(chalk.gray('─'.repeat(50)));
    console.log(chalk.green(`📄 HTML Report: ${htmlPath}`));
    console.log(chalk.green(`📄 JSON Report: ${jsonPath}`));
    console.log(chalk.gray('─'.repeat(50)));
    
    // Show top components by usage
    const topComponents = Array.from(analysis.components.values())
      .sort((a, b) => b.totalUsages - a.totalUsages)
      .slice(0, 5);
    
    console.log(chalk.yellow.bold('\n🏆 Top Components by Usage:'));
    topComponents.forEach((comp, index) => {
      const priority = getPriorityColor(comp.migrationPriority);
      console.log(`${index + 1}. ${comp.name} - ${comp.totalUsages} usages (${comp.migrationPriority.toUpperCase()} priority)`);
    });
    
  } catch (error) {
    console.error(chalk.red(`Fatal error: ${error.message}`));
    process.exit(1);
  }
}

// Run the script
main().catch(console.error);
