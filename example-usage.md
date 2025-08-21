# Example Usage

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run the script:**
   ```bash
   npm start
   ```

## Configuration Examples

### Example 1: Add maxLength to TextInput components

```json
{
  "components": ["TextInput"],
  "packages": ["react-native"],
  "props": [
    {
      "name": "maxLength",
      "value": "1.5"
    }
  ],
  "updateExisting": false,
  "srcFolder": "./src"
}
```

### Example 2: Add multiple props to multiple components

```json
{
  "components": ["TextInput", "Input", "SearchInput"],
  "packages": ["react-native", "ui-components"],
  "props": [
    {
      "name": "maxLength",
      "value": "1.5"
    },
    {
      "name": "autoComplete",
      "value": "off"
    },
    {
      "name": "autoCorrect",
      "value": "false"
    }
  ],
  "updateExisting": true,
  "srcFolder": "./src"
}
```

### Example 3: Target components from specific packages only

```json
{
  "components": [],
  "packages": ["@react-navigation", "custom-ui-lib"],
  "props": [
    {
      "name": "testID",
      "value": "component-test"
    }
  ],
  "updateExisting": false,
  "srcFolder": "./src"
}
```

## What Gets Modified

### Before (Original Code)
```tsx
import { TextInput } from 'react-native';

function MyComponent() {
  return (
    <TextInput
      placeholder="Enter text"
      style={styles.input}
    />
  );
}
```

### After (Modified Code)
```tsx
import { TextInput } from 'react-native';

function MyComponent() {
  return (
    <TextInput
      maxLength={1.5}
      placeholder="Enter text"
      style={styles.input}
    />
  );
}
```

## Component Detection Examples

### ✅ Will Be Processed
- `<TextInput />` - Direct component match
- `<CustomInput />` - Direct component match  
- `<NavigationButton />` - Imported from @react-navigation
- `<UIButton />` - Imported from ui-components package

### ❌ Will Be Skipped
- `<div>` - HTML element
- `<span>` - HTML element
- `<p>` - HTML element
- `<Button />` - Not in target list or packages

## Running the Script

### Basic Run
```bash
npm start
```

### With Custom Source Folder
```bash
# Process files in a different location
node add-props.js --src /Users/username/projects/AnotherApp/src

# Process files in a relative path
node add-props.js -s ../shared-components/src
```

### Check What Would Be Changed
The script processes files and shows:
- Which files are being processed
- Which files were modified
- How many components were found
- How many props were added/updated
- Any errors encountered

### Output Example
```
🚀 React Native Props Adder
Processing files...

Found 8 files to process.

Processing: src/components/Input.tsx
✓ Modified: src/components/Input.tsx

Processing: src/screens/Login.tsx
✓ Modified: src/screens/Login.tsx

📊 Processing Report
──────────────────────────────────────────────────────────────────
Files Processed: 8
Files Modified: 2
Components Found: 3
Props Added: 6
Props Updated: 0
Components Skipped: 0

──────────────────────────────────────────────────────────────────
✅ Processing complete!
```

## Customization Tips

1. **Add New Components**: Edit the `components` array in `config.json`
2. **Add New Packages**: Edit the `packages` array in `config.json`
3. **Add New Props**: Edit the `props` array in `config.json`
4. **Change Source Folder**: Modify `srcFolder` in `config.json`
5. **Control Updates**: Set `updateExisting` to `true` or `false`

## Troubleshooting

- **No files found**: Check if `srcFolder` path is correct
- **Components not processed**: Verify component names and package sources
- **Props not added**: Check if components match the criteria
- **Errors**: Check console output for specific error messages
