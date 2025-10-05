#!/bin/bash

# Cloud Coach CI Test Script
# This simulates what GitHub Actions will run

echo "🚀 Cloud Coach CI Test Script"
echo "============================="

# Check if we're in the right directory
if [ ! -f "test-runner.js" ]; then
    echo "❌ Error: test-runner.js not found. Run this from the project root."
    exit 1
fi

echo "✅ Found test-runner.js"

# Run all tests
echo ""
echo "🧪 Running Cloud Coach Test Suite..."
node test-runner.js
if [ $? -ne 0 ]; then
    echo "❌ Tests failed!"
    exit 1
fi

# Run individual test suites
echo ""
echo "🔍 Running individual test suites..."
node test-runner.js --mastery
node test-runner.js --rewatch
node test-runner.js --checklist
node test-runner.js --settings

# Check file structure
echo ""
echo "📁 Checking file structure..."
required_files=(
    "_pages/cloud-coach.md"
    "test-runner.js"
    "test-cloud-coach.html"
    "package.json"
    ".github/workflows/test.yml"
)

for file in "${required_files[@]}"; do
    if [ ! -f "$file" ]; then
        echo "❌ Required file not found: $file"
        exit 1
    else
        echo "✅ Found: $file"
    fi
done

# Test Jekyll build
echo ""
echo "🏗️ Testing Jekyll build..."
if command -v bundle &> /dev/null; then
    bundle exec jekyll build
    if [ $? -eq 0 ]; then
        echo "✅ Jekyll build successful"
        
        # Check if Cloud Coach page was built
        if [ -f "_site/cloud-coach/index.html" ]; then
            echo "✅ Cloud Coach page built successfully"
        else
            echo "❌ Cloud Coach page not found in build"
            exit 1
        fi
    else
        echo "❌ Jekyll build failed"
        exit 1
    fi
else
    echo "⚠️  Bundle not found, skipping Jekyll build test"
fi

echo ""
echo "🎉 All CI tests passed!"
echo "This means your code is ready for deployment to GitHub Pages."

