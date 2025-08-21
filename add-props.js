#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { glob } = require('glob');
const chalk = require('chalk');
const { parse } = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const generate = require('@babel/generator').default;
const t = require('@babel/types');

// Parse command line arguments
const args = process.argv.slice(2);
let customSrcPath = null;

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--src' || args[i] === '-s') {
    customSrcPath = args[i + 1];
    i++; // Skip next argument as it's the path
  } else if (args[i] === '--help' || args[i] === '-h') {
    console.log(chalk.blue.bold('🚀 React Native Props Adder - Usage'));
    console.log(chalk.gray('─'.repeat(50)));
    console.log(chalk.blue('Basic usage:'));
    console.log('  node add-props.js');
    console.log('');
    console.log(chalk.blue('With custom source folder:'));
    console.log('  node add-props.js --src /path/to/your/src');
    console.log('  node add-props.js -s /path/to/your/src');
    console.log('');
    console.log(chalk.blue('Help:'));
    console.log('  node add-props.js --help');
    console.log('  node add-props.js -h');
    console.log('');
    console.log(chalk.gray('─'.repeat(50)));
    process.exit(0);
  }
}

// Load configuration
const config = JSON.parse(fs.readFileSync('./config.json', 'utf8'));

// Override src folder if custom path provided
if (customSrcPath) {
  // Validate custom path exists
  if (!fs.existsSync(customSrcPath)) {
    console.error(chalk.red(`❌ Error: Source folder does not exist: ${customSrcPath}`));
    process.exit(1);
  }
  
  // Convert to absolute path if relative
  const absolutePath = path.isAbsolute(customSrcPath) 
    ? customSrcPath 
    : path.resolve(process.cwd(), customSrcPath);
    
  config.srcFolder = absolutePath;
  console.log(chalk.yellow(`📁 Using custom source folder: ${absolutePath}`));
}

// Statistics tracking
const stats = {
  filesProcessed: 0,
  filesModified: 0,
  componentsFound: 0,
  propsAdded: 0,
  propsUpdated: 0,
  componentsSkipped: 0,
  errors: []
};

// HTML elements to skip (lowercase)
const HTML_ELEMENTS = new Set([
  'div', 'span', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'a', 'img', 'ul', 'ol', 'li', 'table', 'tr', 'td', 'th',
  'form', 'input', 'button', 'label', 'select', 'option',
  'textarea', 'section', 'article', 'header', 'footer', 'nav',
  'main', 'aside', 'figure', 'figcaption', 'blockquote', 'code',
  'pre', 'em', 'strong', 'small', 'mark', 'del', 'ins', 'sub', 'sup'
]);

/**
 * Check if a component is imported from specified packages
 */
function isComponentFromTargetPackages(imports, componentName) {
  for (const importInfo of imports) {
    if (importInfo.components.includes(componentName) && 
        config.packages.some(pkg => importInfo.source.includes(pkg))) {
      return true;
    }
  }
  return false;
}

/**
 * Check if component should be processed
 */
function shouldProcessComponent(componentName, imports) {
  // Safety check for component name
  if (!componentName || typeof componentName !== 'string') {
    return false;
  }
  
  // Skip HTML elements
  if (HTML_ELEMENTS.has(componentName.toLowerCase())) {
    return false;
  }
  
  // Check if component is in our target list
  if (config.components.includes(componentName)) {
    return true;
  }
  
  // Check if component is imported from target packages
  return isComponentFromTargetPackages(imports, componentName);
}

/**
 * Sort props alphabetically
 */
function sortPropsAlphabetically(props) {
  return props.sort((a, b) => {
    const nameA = a.key?.name || a.key?.value || '';
    const nameB = b.key?.name || b.key?.value || '';
    return nameA.localeCompare(nameB);
  });
}

/**
 * Check if prop already exists
 */
function hasProp(props, propName) {
  return props.some(prop => {
    const key = prop.key?.name || prop.key?.value;
    return key === propName;
  });
}

/**
 * Update existing prop value
 */
function updatePropValue(props, propName, newValue) {
  const prop = props.find(p => {
    const key = p.key?.name || p.key?.value;
    return key === propName;
  });
  
  if (prop) {
    prop.value = t.stringLiteral(newValue);
    return true;
  }
  return false;
}

/**
 * Add new props to component
 */
function addPropsToComponent(jsxElement, imports) {
  const componentName = jsxElement.openingElement.name.name;
  
  if (!shouldProcessComponent(componentName, imports)) {
    return false;
  }
  
  stats.componentsFound++;
  
  const existingProps = jsxElement.openingElement.attributes || [];
  let hasChanges = false;
  
  // Process each prop from config
  for (const propConfig of config.props) {
    const propName = propConfig.name;
    const propValue = propConfig.value;
    
    if (hasProp(existingProps, propName)) {
      if (config.updateExisting) {
        if (updatePropValue(existingProps, propName, propValue)) {
          stats.propsUpdated++;
          hasChanges = true;
        }
      } else {
        stats.componentsSkipped++;
        continue; // Skip this component for this prop
      }
    } else {
      // Add new prop
      const newProp = t.jsxAttribute(
        t.jsxIdentifier(propName),
        t.jsxExpressionContainer(t.stringLiteral(propValue))
      );
      
      existingProps.push(newProp);
      stats.propsAdded++;
      hasChanges = true;
    }
  }
  
  // Sort props alphabetically if there were changes
  if (hasChanges) {
    jsxElement.openingElement.attributes = sortPropsAlphabetically(existingProps);
  }
  
  return hasChanges;
}

/**
 * Process a single file
 */
function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const relativePath = path.relative(process.cwd(), filePath);
    
    console.log(chalk.blue(`Processing: ${relativePath}`));
    
    // Parse the file
    const ast = parse(content, {
      sourceType: 'module',
      plugins: ['jsx', 'typescript']
    });
    
    let fileModified = false;
    const imports = [];
    
    // Collect import information
    traverse(ast, {
      ImportDeclaration(path) {
        const source = path.node.source.value;
        const components = path.node.specifiers
          .filter(spec => spec.type === 'ImportSpecifier')
          .map(spec => spec.local.name);
        
        if (components.length > 0) {
          imports.push({ source, components });
        }
      }
    });
    
    // Process JSX elements
    traverse(ast, {
      JSXElement(path) {
        if (addPropsToComponent(path.node, imports)) {
          fileModified = true;
        }
      }
    });
    
    // Write changes back to file if modified
    if (fileModified) {
      const output = generate(ast, {
        retainLines: true,
        compact: false
      });
      
      fs.writeFileSync(filePath, output.code);
      stats.filesModified++;
      console.log(chalk.green(`✓ Modified: ${relativePath}`));
    } else {
      console.log(chalk.gray(`- No changes needed: ${relativePath}`));
    }
    
    stats.filesProcessed++;
    
  } catch (error) {
    const errorMsg = `Error processing ${filePath}: ${error.message}`;
    stats.errors.push(errorMsg);
    console.error(chalk.red(`✗ ${errorMsg}`));
  }
}

/**
 * Main execution function
 */
async function main() {
  console.log(chalk.yellow.bold('🚀 React Native Props Adder'));
  console.log(chalk.gray('Processing files...\n'));
  
  try {
    // Find all matching files
    const pattern = `${config.srcFolder}/**/*.{${config.fileExtensions.join(',')}}`;
    const files = await glob(pattern, { ignore: ['**/node_modules/**'] });
    
    if (files.length === 0) {
      console.log(chalk.yellow('No files found matching the pattern.'));
      return;
    }
    
    console.log(chalk.blue(`Found ${files.length} files to process.\n`));
    
    // Process each file
    for (const file of files) {
      processFile(file);
    }
    
    // Generate report
    generateReport();
    
  } catch (error) {
    console.error(chalk.red(`Fatal error: ${error.message}`));
    process.exit(1);
  }
}

/**
 * Generate detailed report
 */
function generateReport() {
  console.log(chalk.yellow.bold('\n📊 Processing Report'));
  console.log(chalk.gray('─'.repeat(50)));
  
  console.log(chalk.blue(`Files Processed: ${stats.filesProcessed}`));
  console.log(chalk.green(`Files Modified: ${stats.filesModified}`));
  console.log(chalk.blue(`Components Found: ${stats.componentsFound}`));
  console.log(chalk.green(`Props Added: ${stats.propsAdded}`));
  console.log(chalk.yellow(`Props Updated: ${stats.propsUpdated}`));
  console.log(chalk.gray(`Components Skipped: ${stats.componentsSkipped}`));
  
  if (stats.errors.length > 0) {
    console.log(chalk.red(`\nErrors: ${stats.errors.length}`));
    stats.errors.forEach(error => {
      console.log(chalk.red(`  • ${error}`));
    });
  }
  
  console.log(chalk.gray('\n─'.repeat(50)));
  console.log(chalk.green.bold('✅ Processing complete!'));
}

// Run the script
main().catch(console.error);
