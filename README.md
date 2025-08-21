# React Native Component Tools

A collection of Node.js scripts for analyzing and enhancing React Native components. This project includes two main tools:

1. **Props Adder** - Automatically adds configurable props to React Native components
2. **Component Analyzer** - Analyzes component usage patterns and generates detailed reports

## Tools Overview

### 🔧 Props Adder (`add-props.js`)
Automatically adds configurable props to React Native components while maintaining alphabetical order and handling imports from specific packages.

### 🔍 Component Analyzer (`component-analyzer.js`)
Analyzes your React Native codebase to understand component usage patterns, import sources, and provides insights for migration planning.

## Features

- ✅ **Configurable Component List** - Easily add/remove target components
- ✅ **Package Import Detection** - Check components imported from specific packages
- ✅ **Multiple Props Support** - Add multiple properties with different values
- ✅ **Alphabetical Props Ordering** - Maintains proper prop order for linting
- ✅ **Update Existing Props** - Configurable flag to update or skip existing props
- ✅ **Recursive File Processing** - Processes all TypeScript/JSX files in src folder
- ✅ **Error Handling** - Gracefully handles syntax errors and malformed JSX
- ✅ **Detailed Reporting** - Shows what was processed, modified, and any issues
- ✅ **HTML Element Filtering** - Automatically skips native HTML elements

## Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Make the scripts executable:**
   ```bash
   chmod +x add-props.js
   chmod +x component-analyzer.js
   ```

## Configuration

### Props Adder Configuration

Edit `config.json` to customize the props adder behavior:

```json
{
  "components": [
    "TextInput",
    "CustomInput",
    "Input",
    "TextField",
    "SearchInput"
  ],
  "packages": [
    "react-native",
    "@react-navigation",
    "custom-package",
    "ui-components"
  ],
  "props": [
    {
      "name": "maxLength",
      "value": "1.5"
    },
    {
      "name": "autoComplete",
      "value": "off"
    }
  ],
  "updateExisting": true,
  "srcFolder": "./src",
  "fileExtensions": [".ts", ".tsx", ".js", ".jsx"]
}
```

### Configuration Options

| Option | Description | Example |
|--------|-------------|---------|
| `components` | Array of component names to target | `["TextInput", "Button"]` |
| `packages` | Array of package names to check imports from | `["react-native", "@react-navigation"]` |
| `props` | Array of props to add with name and value | `[{"name": "maxLength", "value": "1.5"}]` |
| `updateExisting` | Boolean: `true` to update existing props, `false` to skip | `true` |
| `srcFolder` | Path to source folder (relative to script location) | `"./src"` |
| `fileExtensions` | Array of file extensions to process | `[".ts", ".tsx", ".js", ".jsx"]` |

### Component Analyzer Configuration

Edit `analyzer-config.json` to customize the analyzer behavior:

```json
{
  "srcFolder": "./src",
  "fileExtensions": ["ts", "tsx", "js", "jsx"],
  "packagesToTrack": [
    "react-native",
    "@react-navigation",
    "expo",
    "@expo/vector-icons"
  ],
  "priorityThresholds": {
    "high": 10,
    "medium": 5
  },
  "componentFilters": {
    "include": [],
    "exclude": []
  },
  "reportOptions": {
    "generateHTML": true,
    "generateJSON": true,
    "includeMigrationTips": true,
    "includeFileImpact": true,
    "includePackageAnalysis": true
  }
}
```

#### Analyzer Configuration Options

| Option | Description | Example |
|--------|-------------|---------|
| `srcFolder` | Path to source folder | `"./src"` |
| `fileExtensions` | Array of file extensions to analyze | `["ts", "tsx", "js", "jsx"]` |
| `packagesToTrack` | Array of package names to monitor | `["react-native", "@react-navigation"]` |
| `priorityThresholds` | Usage count thresholds for priority levels | `{"high": 10, "medium": 5}` |
| `componentFilters` | Include/exclude specific components | `{"include": [], "exclude": []}` |
| `reportOptions` | Control report generation options | `{"generateHTML": true, "generateJSON": true}` |

## Usage

### Props Adder (`add-props.js`)

#### Command Line Options

| Option | Description | Example |
|--------|-------------|---------|
| `--src` or `-s` | Specify custom source folder path | `--src /path/to/src` |
| `--help` or `-h` | Show usage information | `--help` |

#### Basic Usage
```bash
# Run Props Adder
npm start

# Run Component Analyzer  
npm run analyze
```

#### Direct Execution
```bash
node add-props.js
```

#### With Custom Source Folder
```bash
# Absolute path
node add-props.js --src /Users/username/projects/MyApp/src

# Relative path from current directory
node add-props.js --src ../another-project/src

# Short form
node add-props.js -s ./custom-src-folder
```

#### Help
```bash
node add-props.js --help
```

### Component Analyzer (`component-analyzer.js`)

#### Command Line Options

| Option | Description | Example |
|--------|-------------|---------|
| `--src` or `-s` | Specify custom source folder path | `--src /path/to/src` |
| `--config` or `-c` | Specify custom analyzer config file | `--config ./custom-analyzer.json` |
| `--help` or `-h` | Show usage information | `--help` |

#### Basic Usage
```bash
npm run analyze
```

#### Direct Execution
```bash
node component-analyzer.js
```

#### With Custom Source Folder
```bash
node component-analyzer.js --src /path/to/your/src
```

#### With Custom Config
```bash
node component-analyzer.js --config ./my-analyzer-config.json
```

#### Help
```bash
node component-analyzer.js --help
```

## How It Works

### Props Adder Process

1. **File Discovery**: Recursively finds all TypeScript/JSX files in the src folder
2. **Import Analysis**: Parses import statements to identify component sources
3. **Component Detection**: Identifies JSX elements and filters out HTML elements
4. **Props Processing**: Adds new props or updates existing ones based on configuration
5. **Alphabetical Sorting**: Maintains proper prop order for linting compliance
6. **Code Generation**: Regenerates code with proper formatting
7. **Reporting**: Provides detailed statistics and error reporting

### Component Analyzer Process

1. **File Discovery**: Recursively finds all TypeScript/JSX files in the src folder
2. **Import Analysis**: Analyzes import statements and tracks component sources
3. **Usage Analysis**: Counts component usage across files and components
4. **Package Tracking**: Monitors components imported from specified packages
5. **Priority Assessment**: Assigns migration priority based on usage thresholds
6. **Report Generation**: Creates HTML and JSON reports with detailed insights

## Example Transformations

### Before
```tsx
import { TextInput } from 'react-native';

<TextInput
  placeholder="Enter text"
  style={styles.input}
/>
```

### After
```tsx
import { TextInput } from 'react-native';

<TextInput
  autoComplete="off"
  maxLength={1.5}
  placeholder="Enter text"
  style={styles.input}
/>
```

## When to Use Each Tool

### Props Adder (`add-props.js`)
Use when you need to:
- Add consistent props across multiple components
- Standardize component configurations
- Apply bulk prop updates for migration purposes
- Ensure props are alphabetically ordered for linting

### Component Analyzer (`component-analyzer.js`)
Use when you need to:
- Understand your component usage patterns
- Plan migrations or refactoring
- Identify high-impact components
- Analyze package dependencies
- Generate reports for team discussions

## Component Detection Logic

The Props Adder processes components based on:

1. **Direct Match**: Component name is in the `components` array
2. **Import Source**: Component is imported from packages in the `packages` array
3. **HTML Filtering**: Automatically skips native HTML elements (div, span, p, etc.)

## Error Handling

- **Syntax Errors**: Files with parsing errors are logged and skipped
- **Malformed JSX**: Invalid JSX structures are reported but don't crash the script
- **File Access**: Permission or file system errors are logged
- **Import Issues**: Components with import problems are still processed if they match the target list

## Output Example

```
🚀 React Native Props Adder
Processing files...

Found 15 files to process.

Processing: src/components/Input.tsx
✓ Modified: src/components/Input.tsx

Processing: src/screens/Login.tsx
✓ Modified: src/screens/Login.tsx

Processing: src/components/Button.tsx
- No changes needed: src/components/Button.tsx

📊 Processing Report
──────────────────────────────────────────────────────────────────
Files Processed: 15
Files Modified: 8
Components Found: 12
Props Added: 24
Props Updated: 3
Components Skipped: 2

──────────────────────────────────────────────────────────────────
✅ Processing complete!
```

### Component Analyzer Output

```
🔍 React Native Component Analyzer
Analyzing files...

Found 15 files to analyze.

Processing: src/components/Input.tsx
Processing: src/components/Button.tsx
Processing: src/screens/Login.tsx

📊 Analysis Report
──────────────────────────────────────────────────────────────────
Total Files: 15
Total Components: 25
Total Usages: 67
Packages Tracked: 4

📈 Component Usage Summary
- High Priority: 3 components
- Medium Priority: 8 components  
- Low Priority: 14 components

📁 Reports Generated:
- HTML Report: component-analysis.html
- JSON Report: component-analysis.json

──────────────────────────────────────────────────────────────────
✅ Analysis complete!
```

The Component Analyzer generates detailed HTML and JSON reports with:
- Component usage statistics
- Import source analysis
- Migration priority recommendations
- File impact assessment
- Package dependency insights

## Safety Features

- **No Backup Creation**: Since you're using Git, changes are tracked
- **AST-Based Parsing**: Reliable code modification without regex issues
- **Format Preservation**: Maintains existing code formatting and structure
- **Error Recovery**: Continues processing other files if one fails

## Troubleshooting

### Common Issues

1. **"No files found"**: Check `srcFolder` path in config
2. **"Parsing error"**: File may have syntax issues - check manually
3. **"Permission denied"**: Ensure script has read/write access to files
4. **Props not added**: Verify component names and import sources in config

### Debug Mode

Add console logging by modifying the script:
```javascript
// Add this line for verbose logging
console.log('Processing component:', componentName, 'from imports:', imports);
```

## Contributing

Feel free to submit issues and enhancement requests!

## License

MIT License - feel free to use in your projects.
