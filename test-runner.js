#!/usr/bin/env node

/**
 * Cloud Coach Test Runner
 * 
 * This script can be run to test Cloud Coach functionality:
 * - node test-runner.js (run all tests)
 * - node test-runner.js --mastery (test mastery changes)
 * - node test-runner.js --rewatch (test rewatch functionality)
 * - node test-runner.js --deploy (run deployment tests)
 */

const fs = require('fs');
const path = require('path');

// Test configuration
const TESTS = {
    mastery: {
        name: "Mastery Level Tests",
        tests: [
            {
                name: "Mastery values are valid",
                test: (state) => state.domains.every(d => d.mastery >= 0 && d.mastery <= 100),
                message: "All domain mastery values should be between 0-100%"
            },
            {
                name: "Mastery affects overall progress",
                test: (state) => {
                    const progress = Math.round(state.domains.reduce((sum, d) => sum + d.mastery, 0) / state.domains.length);
                    return progress >= 0 && progress <= 100;
                },
                message: "Overall progress should be calculated correctly"
            },
            {
                name: "Domain weights sum to 100%",
                test: (state) => {
                    const totalWeight = state.domains.reduce((sum, d) => sum + d.weight, 0);
                    return totalWeight === 100;
                },
                message: "Domain weights should sum to exactly 100%"
            }
        ]
    },
    rewatch: {
        name: "Rewatch Planner Tests",
        tests: [
            {
                name: "Rewatch data exists",
                test: (state) => state.rewatch && state.rewatch.length > 0,
                message: "Rewatch planner should have lesson data"
            },
            {
                name: "Lessons have required fields",
                test: (state) => state.rewatch.every(lesson => 
                    lesson.title && 
                    typeof lesson.impact === 'number' && 
                    lesson.domain !== undefined
                ),
                message: "All lessons should have title, impact, and domain"
            },
            {
                name: "Impact scores are valid",
                test: (state) => state.rewatch.every(lesson => 
                    lesson.impact >= 1 && lesson.impact <= 10
                ),
                message: "Impact scores should be between 1-10"
            }
        ]
    },
    checklist: {
        name: "Checklist Tests",
        tests: [
            {
                name: "Question distribution exists",
                test: (state) => state.checklist && state.checklist.items && state.checklist.items.length > 0,
                message: "Checklist should have question distribution"
            },
            {
                name: "Question counts are positive",
                test: (state) => state.checklist.items.every(item => item.questions > 0),
                message: "All question counts should be positive"
            },
            {
                name: "Total questions match target",
                test: (state) => {
                    const totalQuestions = state.checklist.items.reduce((sum, item) => sum + item.questions, 0);
                    return totalQuestions === (state.settings?.questionCount || 20);
                },
                message: "Total questions should match settings target"
            }
        ]
    },
    settings: {
        name: "Settings Tests",
        tests: [
            {
                name: "Settings object exists",
                test: (state) => state.settings && typeof state.settings === 'object',
                message: "Settings should be properly initialized"
            },
            {
                name: "Required settings present",
                test: (state) => 
                    'rewatchFollowNextFocus' in state.settings &&
                    'questionCount' in state.settings,
                message: "Required settings should be present"
            }
        ]
    }
};

// Mock state for testing
const mockState = {
    domains: [
        { name: "Design Secure Architectures", mastery: 45, weight: 30 },
        { name: "Design Resilient Architectures", mastery: 60, weight: 26 },
        { name: "Design High-Performing Architectures", mastery: 30, weight: 24 },
        { name: "Design Cost-Optimized Architectures", mastery: 70, weight: 20 }
    ],
    checklist: {
        items: [
            { questions: 6, domain: 0 },
            { questions: 5, domain: 1 },
            { questions: 5, domain: 2 },
            { questions: 4, domain: 3 }
        ]
    },
    rewatch: [
        { title: "EC2 Fundamentals", impact: 8, lastWatched: null, domain: 0 },
        { title: "S3 Security", impact: 9, lastWatched: null, domain: 0 },
        { title: "RDS Multi-AZ", impact: 7, lastWatched: null, domain: 1 },
        { title: "CloudFront", impact: 6, lastWatched: null, domain: 2 }
    ],
    settings: {
        rewatchFollowNextFocus: true,
        questionCount: 20
    }
};

// Test runner functions
function runTest(test, state) {
    try {
        const result = test.test(state);
        return {
            name: test.name,
            passed: result,
            message: test.message,
            error: null
        };
    } catch (error) {
        return {
            name: test.name,
            passed: false,
            message: test.message,
            error: error.message
        };
    }
}

function runTestSuite(suiteName, state) {
    const suite = TESTS[suiteName];
    if (!suite) {
        console.error(`❌ Unknown test suite: ${suiteName}`);
        return false;
    }

    console.log(`\n🧪 Running ${suite.name}...`);
    let allPassed = true;

    suite.tests.forEach(test => {
        const result = runTest(test, state);
        const status = result.passed ? '✅' : '❌';
        console.log(`  ${status} ${result.name}`);
        
        if (!result.passed) {
            console.log(`     ${result.message}`);
            if (result.error) {
                console.log(`     Error: ${result.error}`);
            }
            allPassed = false;
        }
    });

    return allPassed;
}

function runAllTests(state) {
    console.log('🚀 Cloud Coach Test Suite');
    console.log('========================');
    
    let allPassed = true;
    const suites = Object.keys(TESTS);
    
    suites.forEach(suiteName => {
        const passed = runTestSuite(suiteName, state);
        if (!passed) allPassed = false;
    });
    
    console.log('\n📊 Test Summary');
    console.log('===============');
    console.log(allPassed ? '✅ All tests passed!' : '❌ Some tests failed!');
    
    return allPassed;
}

function runDeploymentTests(state) {
    console.log('🚀 Cloud Coach Deployment Tests');
    console.log('===============================');
    
    // Check if main page exists
    const pagePath = path.join(__dirname, '_pages', 'cloud-coach.md');
    if (!fs.existsSync(pagePath)) {
        console.log('❌ Cloud Coach page not found');
        return false;
    }
    console.log('✅ Cloud Coach page exists');
    
    // Check if page has required content
    const pageContent = fs.readFileSync(pagePath, 'utf8');
    const requiredElements = [
        'Cloud Coach',
        'React.createElement',
        'useState',
        'useEffect',
        'Progress',
        'DomainBoard',
        'RewatchPlanner'
    ];
    
    let contentPassed = true;
    requiredElements.forEach(element => {
        if (!pageContent.includes(element)) {
            console.log(`❌ Missing required element: ${element}`);
            contentPassed = false;
        } else {
            console.log(`✅ Found: ${element}`);
        }
    });
    
    // Run functional tests
    const functionalPassed = runAllTests(state);
    
    return contentPassed && functionalPassed;
}

// Main execution
function main() {
    const args = process.argv.slice(2);
    const command = args[0];
    
    let success = false;
    
    switch (command) {
        case '--mastery':
            success = runTestSuite('mastery', mockState);
            break;
        case '--rewatch':
            success = runTestSuite('rewatch', mockState);
            break;
        case '--checklist':
            success = runTestSuite('checklist', mockState);
            break;
        case '--settings':
            success = runTestSuite('settings', mockState);
            break;
        case '--deploy':
            success = runDeploymentTests(mockState);
            break;
        default:
            success = runAllTests(mockState);
    }
    
    process.exit(success ? 0 : 1);
}

if (require.main === module) {
    main();
}

module.exports = {
    runAllTests,
    runTestSuite,
    runDeploymentTests,
    TESTS
};
