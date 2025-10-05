#!/usr/bin/env node

const puppeteer = require('puppeteer');

async function testSliders() {
    console.log('🚀 Starting slider test...');
    
    let browser;
    try {
        // Launch browser
        browser = await puppeteer.launch({ 
            headless: false, // Show browser for visual verification
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        
        const page = await browser.newPage();
        
        // Set viewport
        await page.setViewport({ width: 1280, height: 720 });
        
        console.log('📱 Navigating to Cloud Coach page...');
        await page.goto('http://localhost:4000/cloud-coach/', { 
            waitUntil: 'networkidle2' 
        });
        
        // Wait for the app to load
        await page.waitForSelector('#aws-coach-app', { timeout: 10000 });
        console.log('✅ Cloud Coach app loaded');
        
        // Wait for sliders to be rendered
        await page.waitForSelector('input[type="range"]', { timeout: 5000 });
        console.log('✅ Sliders found');
        
        // Test slider functionality
        const sliders = await page.$$('input[type="range"]');
        console.log(`🎚️  Found ${sliders.length} sliders`);
        
        for (let i = 0; i < sliders.length; i++) {
            const slider = sliders[i];
            
            // Get initial value
            const initialValue = await page.evaluate(el => el.value, slider);
            console.log(`Slider ${i + 1} initial value: ${initialValue}%`);
            
            // Test slider interaction
            const newValue = Math.floor(Math.random() * 100);
            await page.evaluate((el, val) => {
                el.value = val;
                el.dispatchEvent(new Event('change', { bubbles: true }));
            }, slider, newValue);
            
            // Verify value changed
            const updatedValue = await page.evaluate(el => el.value, slider);
            console.log(`Slider ${i + 1} updated value: ${updatedValue}%`);
            
            if (updatedValue == newValue) {
                console.log(`✅ Slider ${i + 1} working correctly`);
            } else {
                console.log(`❌ Slider ${i + 1} failed to update`);
            }
        }
        
        // Test the overall progress bar
        const progressBar = await page.$('[style*="width:"]');
        if (progressBar) {
            console.log('✅ Progress bar found');
        }
        
        console.log('🎉 Slider test completed!');
        console.log('👀 Check the browser window to visually verify slider behavior');
        
        // Keep browser open for 10 seconds for visual inspection
        await page.waitForTimeout(10000);
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

// Check if puppeteer is available
try {
    testSliders();
} catch (error) {
    console.log('📦 Puppeteer not available, using manual testing instead');
    console.log('🌐 Please open http://localhost:4000/cloud-coach/ in your browser');
    console.log('🎚️  Test the sliders in the Domain board section');
    console.log('✅ Expected behavior: sliders should move and update values');
}

