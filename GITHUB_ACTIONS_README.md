# 🚀 GitHub Actions: Component Migration Analyzer

This GitHub Actions workflow allows you to run the React Native Component Analyzer automatically in a CI/CD environment, generating migration reports and insights for your team.

## 🎯 **What It Does**

- **Automated Component Analysis** - Run analysis on any React Native project
- **Migration Reports** - Generate HTML and JSON reports automatically
- **Artifact Storage** - Download reports from GitHub Actions
- **Team Collaboration** - Share results via GitHub UI and comments
- **Custom Configuration** - Override settings via workflow inputs

## 📋 **Workflow Features**

### **Manual Trigger**
- **Workflow Dispatch** - Run anytime via GitHub UI
- **Customizable Inputs** - Configure source folder, packages, thresholds
- **Flexible Configuration** - Override default settings

### **Output & Reports**
- **HTML Report** - Interactive migration analysis
- **JSON Report** - Machine-readable data
- **Analysis Log** - Detailed execution output
- **GitHub Summary** - Inline results display

### **Integration**
- **PR Comments** - Automatic analysis summaries
- **Artifact Storage** - 30-day retention
- **Error Handling** - Graceful failure reporting

## 🚀 **How to Use**

### **1. Setup the Workflow**

The workflow file is located at `.github/workflows/component-analyzer.yml` and will be automatically available in your GitHub repository.

### **2. Run the Analysis**

1. **Go to Actions Tab** in your GitHub repository
2. **Select "Component Migration Analyzer"** workflow
3. **Click "Run workflow"** button
4. **Configure inputs** (or use defaults)
5. **Click "Run workflow"** to start

### **3. Configure Inputs**

| Input | Description | Default | Example |
|-------|-------------|---------|---------|
| `source_folder` | Source folder to analyze | `./src` | `./components` |
| `custom_config` | Custom config file path | `./analyzer-config.json` | `./my-config.json` |
| `packages_to_track` | Packages to monitor | `react-native,@react-navigation,expo` | `react-native,ui-lib` |
| `priority_thresholds` | Priority thresholds (high,medium) | `10,5` | `20,10` |

### **4. View Results**

- **Workflow Summary** - See results inline
- **Artifacts** - Download HTML/JSON reports
- **Logs** - Check execution details
- **PR Comments** - Automatic summaries (if applicable)

## 📊 **Example Workflow Run**

### **Input Configuration:**
```yaml
source_folder: ./src
packages_to_track: react-native,@react-navigation,expo
priority_thresholds: 10,5
```

### **Output Summary:**
```
## 🔍 Component Migration Analysis Complete!

### 📊 Analysis Summary
Files analyzed: 15 | Components found: 12 | Total usages: 45 | Packages tracked: 3

### 🏆 Top Components by Usage
1. Text - 15 usages (HIGH priority) | 2. View - 12 usages (HIGH priority) | 3. TextInput - 8 usages (MEDIUM priority)

### 📄 Reports Generated
- HTML Report: Available in artifacts
- JSON Report: Available in artifacts
- Analysis Log: Available in artifacts
```

## 🔧 **Customization Options**

### **1. Modify Default Configuration**

Edit the workflow file to change default values:

```yaml
inputs:
  source_folder:
    default: './my-components'  # Change default source folder
  packages_to_track:
    default: 'react-native,my-ui-lib'  # Change default packages
  priority_thresholds:
    default: '15,8'  # Change default thresholds
```

### **2. Add Custom Steps**

Insert additional steps before or after analysis:

```yaml
- name: Pre-analysis Setup
  run: |
    echo "Setting up custom environment..."
    # Your custom setup code here

- name: Post-analysis Processing
  run: |
    echo "Processing results..."
    # Your custom post-processing code here
```

### **3. Modify Output Handling**

Customize how results are displayed or stored:

```yaml
- name: Custom Notification
  uses: actions/github-script@v7
  with:
    script: |
      // Your custom notification logic here
```

## 📁 **File Structure**

```
.github/
└── workflows/
    └── component-analyzer.yml    # Main workflow file

analyzer-config.json              # Default configuration
component-analyzer.js             # Analysis script
package.json                      # Dependencies
```

## 🚨 **Troubleshooting**

### **Common Issues**

1. **"Workflow not found"**
   - Ensure `.github/workflows/` folder exists
   - Check YAML syntax is valid
   - Verify file is committed to main branch

2. **"Dependencies not found"**
   - Ensure `package.json` exists
   - Check all required packages are listed
   - Verify `npm install` completes successfully

3. **"Source folder not found"**
   - Verify the folder path is correct
   - Check relative path from repository root
   - Ensure folder contains TypeScript/JSX files

4. **"No components found"**
   - Verify packages are correctly specified
   - Check import statements in source files
   - Ensure file extensions are supported

### **Debug Steps**

1. **Check Workflow Logs** - Review detailed execution output
2. **Verify Inputs** - Confirm input values are correct
3. **Test Locally** - Run script manually to verify
4. **Check Permissions** - Ensure workflow has repository access

## 🔄 **Integration Examples**

### **1. Scheduled Analysis**

Add cron trigger for regular reports:

```yaml
on:
  workflow_dispatch:
    # Manual trigger
  schedule:
    - cron: '0 9 * * 1'  # Every Monday at 9 AM
```

### **2. PR Integration**

Run analysis on every PR:

```yaml
on:
  workflow_dispatch:
    # Manual trigger
  pull_request:
    branches: [ main, develop ]
```

### **3. Release Gates**

Run before releases:

```yaml
on:
  workflow_dispatch:
    # Manual trigger
  release:
    types: [published]
```

## 📈 **Best Practices**

### **1. Regular Analysis**
- Run analysis weekly to track migration progress
- Compare results over time to measure improvements
- Use results for sprint planning and resource allocation

### **2. Team Collaboration**
- Share HTML reports in team meetings
- Use JSON data for automated dashboards
- Track migration priorities in project management tools

### **3. Configuration Management**
- Store common configurations in repository
- Use environment-specific configs for different projects
- Document custom configurations for team reference

## 🎉 **Benefits**

- **Automation** - No manual script execution needed
- **Consistency** - Same analysis process every time
- **Collaboration** - Share results with entire team
- **Tracking** - Monitor migration progress over time
- **Integration** - Works with existing GitHub workflows
- **Scalability** - Analyze multiple projects easily

## 🚀 **Getting Started**

1. **Commit** the workflow file to your repository
2. **Navigate** to Actions tab in GitHub
3. **Select** Component Migration Analyzer workflow
4. **Configure** inputs for your project
5. **Run** the analysis
6. **Download** reports from artifacts
7. **Share** results with your team

The workflow is now ready to help you plan and track React Native component migrations automatically! 🎯
