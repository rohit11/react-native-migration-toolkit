# React Native Props Adder

A Node.js script that automatically adds configurable props to React Native components while maintaining alphabetical order and handling imports from specific packages.

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

2. **Make the script executable:**
   ```bash
   chmod +x add-props.js
   ```

## Configuration

Edit `config.json` to customize the script behavior:

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

## Usage

### Command Line Options

| Option | Description | Example |
|--------|-------------|---------|
| `--src` or `-s` | Specify custom source folder path | `--src /path/to/src` |
| `--help` or `-h` | Show usage information | `--help` |

### Basic Usage
```bash
npm start
```

### Direct Execution
```bash
node add-props.js
```

### With Custom Source Folder
```bash
# Absolute path
node add-props.js --src /Users/username/projects/MyApp/src

# Relative path from current directory
node add-props.js --src ../another-project/src

# Short form
node add-props.js -s ./custom-src-folder
```

### Help
```bash
node add-props.js --help
```

## How It Works

1. **File Discovery**: Recursively finds all TypeScript/JSX files in the src folder
2. **Import Analysis**: Parses import statements to identify component sources
3. **Component Detection**: Identifies JSX elements and filters out HTML elements
4. **Props Processing**: Adds new props or updates existing ones based on configuration
5. **Alphabetical Sorting**: Maintains proper prop order for linting compliance
6. **Code Generation**: Regenerates code with proper formatting
7. **Reporting**: Provides detailed statistics and error reporting

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

## Component Detection Logic

The script processes components based on:

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
