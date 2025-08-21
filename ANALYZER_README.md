# 🔍 React Native Component Analyzer

A powerful Node.js script that analyzes React Native projects to identify components imported from specific packages and generates comprehensive migration reports.

## 🎯 **Purpose**

This script helps you plan component migrations by:
- **Identifying all components** imported from specified packages
- **Counting usage** per component and per file
- **Prioritizing migration** based on usage frequency
- **Generating beautiful HTML reports** for team collaboration
- **Providing migration insights** and recommendations

## ✨ **Features**

- 🔍 **Smart Component Detection** - Finds components by import source
- 📊 **Usage Analytics** - Counts imports and JSX usage separately
- 🎨 **Beautiful HTML Reports** - Interactive, searchable reports
- 📈 **Migration Priority** - High/Medium/Low priority recommendations
- 🔧 **Configurable Tracking** - Track any packages you specify
- 📁 **File Impact Analysis** - See which files will be most affected
- 📦 **Package Breakdown** - Understand component distribution
- 💾 **Multiple Formats** - HTML + JSON output

## 🚀 **Quick Start**

### **1. Install Dependencies**
```bash
npm install
```

### **2. Run Analysis**
```bash
npm run analyze
```

### **3. View Reports**
- **HTML Report**: `component-migration-report-[timestamp].html`
- **JSON Report**: `component-migration-report-[timestamp].json`

## 📋 **Usage Examples**

### **Basic Analysis**
```bash
# Analyze current src folder
npm run analyze

# Direct execution
node component-analyzer.js
```

### **Custom Source Folder**
```bash
# Absolute path
node component-analyzer.js --src /Users/username/projects/MyApp/src

# Relative path
node component-analyzer.js --src ../another-project/src

# Short form
node component-analyzer.js -s ./custom-src-folder
```

### **Custom Configuration**
```bash
# Use different config file
node component-analyzer.js --config ./my-config.json

# Short form
node component-analyzer.js -c ./my-config.json
```

### **Help**
```bash
node component-analyzer.js --help
```

## ⚙️ **Configuration**

Edit `analyzer-config.json` to customize the analysis:

```json
{
  "srcFolder": "./src",
  "fileExtensions": [".ts", ".tsx", ".js", ".jsx"],
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

### **Configuration Options**

| Option | Description | Default |
|--------|-------------|---------|
| `srcFolder` | Source folder to analyze | `"./src"` |
| `fileExtensions` | File types to process | `[".ts", ".tsx", ".js", ".jsx"]` |
| `packagesToTrack` | Packages to monitor for components | `["react-native", "@react-navigation"]` |
| `priorityThresholds.high` | Usage count for high priority | `10` |
| `priorityThresholds.medium` | Usage count for medium priority | `5` |
| `componentFilters.include` | Only analyze these components | `[]` (all) |
| `componentFilters.exclude` | Skip these components | `[]` (none) |

## 📊 **Report Structure**

### **1. Summary Dashboard**
- Total files analyzed
- Total components found
- Total usages counted
- Packages tracked

### **2. Component Analysis**
- **Component Name** with package tags
- **Usage Count** per component
- **Migration Priority** (High/Medium/Low)
- **File Locations** with usage counts
- **Migration Tips** and recommendations

### **3. File Impact Analysis**
- Files ordered by component usage
- Most impacted files first
- Usage counts per file

### **4. Package Analysis**
- Components grouped by package
- Import source breakdown
- Migration scope per package

## 🎨 **HTML Report Features**

- **Responsive Design** - Works on all devices
- **Search Functionality** - Find components quickly
- **Color-Coded Priorities** - Visual priority indicators
- **Interactive Elements** - Expandable sections
- **Professional Styling** - Clean, modern interface

## 🔍 **How It Works**

### **1. File Discovery**
```
Recursively scan src folder → Find all TypeScript/JSX files
```

### **2. Import Analysis**
```
Parse import statements → Identify components from tracked packages
```

### **3. Usage Counting**
```
Parse JSX elements → Count component usage in each file
```

### **4. Priority Calculation**
```
Usage count → Migration priority (High/Medium/Low)
```

### **5. Report Generation**
```
Analysis data → HTML + JSON reports
```

## 📈 **Migration Planning Insights**

### **High Priority Components**
- Used 10+ times across the project
- Critical for immediate migration
- High impact on codebase

### **Medium Priority Components**
- Used 5-9 times
- Plan for next development cycle
- Moderate impact

### **Low Priority Components**
- Used less than 5 times
- Can be migrated later
- Low impact

## 🛠️ **Use Cases**

### **1. Migration Planning**
- Identify which components to replace first
- Understand migration scope and timeline
- Plan development resources

### **2. Impact Analysis**
- See which files will be most affected
- Understand component dependencies
- Plan refactoring strategy

### **3. Team Collaboration**
- Share HTML reports with stakeholders
- Discuss migration priorities
- Track migration progress

### **4. Code Review**
- Identify heavy react-native usage
- Find opportunities for custom components
- Understand component patterns

## 🔧 **Advanced Features**

### **Component Filtering**
```json
{
  "componentFilters": {
    "include": ["TextInput", "Button"],
    "exclude": ["View", "Text"]
  }
}
```

### **Custom Priority Thresholds**
```json
{
  "priorityThresholds": {
    "high": 20,
    "medium": 10
  }
}
```

### **Package-Specific Tracking**
```json
{
  "packagesToTrack": [
    "react-native",
    "@react-navigation",
    "expo",
    "custom-ui-lib"
  ]
}
```

## 📝 **Example Output**

### **Console Summary**
```
🔍 React Native Component Analyzer
Analyzing components for migration planning...

Found 10 files to analyze.

Analyzing: src/components/TextInput.tsx
Analyzing: src/components/Button.tsx
...

✅ Analysis Complete!
──────────────────────────────────────────────────────────────────
📊 Summary:
   Files analyzed: 10
   Components found: 8
   Total usages: 25
   Packages tracked: 3
──────────────────────────────────────────────────────────────────
📄 HTML Report: component-migration-report-2024-01-15T10-30-45-123Z.html
📄 JSON Report: component-migration-report-2024-01-15T10-30-45-123Z.json
──────────────────────────────────────────────────────────────────

🏆 Top Components by Usage:
1. TextInput - 8 usages (HIGH PRIORITY)
2. Button - 6 usages (MEDIUM PRIORITY)
3. View - 5 usages (MEDIUM PRIORITY)
```

## 🚨 **Troubleshooting**

### **Common Issues**

1. **"No files found"**
   - Check `srcFolder` path in config
   - Verify file extensions are correct

2. **"Parsing error"**
   - File may have syntax issues
   - Check for malformed JSX/TypeScript

3. **"Permission denied"**
   - Ensure script has read access to files
   - Check file permissions

4. **Components not detected**
   - Verify package names in `packagesToTrack`
   - Check import statements in files

### **Debug Mode**
Add logging to see detailed analysis:
```javascript
// Add this line for verbose logging
console.log('Analyzing component:', componentName, 'from package:', packageName);
```

## 🔄 **Integration with Props Adder**

This analyzer works perfectly with the **Props Adder** script:

1. **Analyze** components with this script
2. **Plan** migration based on usage patterns
3. **Use Props Adder** to add properties to components
4. **Track** migration progress over time

## 📄 **License**

MIT License - feel free to use in your projects!

## 🤝 **Contributing**

Feel free to submit issues and enhancement requests!
