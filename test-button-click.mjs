import { chromium } from 'playwright';

async function testButtonClick() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    // Navigate to the showdown page
    await page.goto('http://localhost:3000/showdown-anime');
    
    // Wait for the page to load
    await page.waitForTimeout(1000);
    
    // Click the launch button
    const launchButton = page.locator('button:has-text("Launch AI Showdown")');
    await launchButton.click();
    
    // Wait for animation to complete and conclusions to appear
    console.log('Waiting for animation to complete...');
    await page.waitForTimeout(20000); // 20 seconds for full animation
    
    // Try to click the View Full Response button
    console.log('Attempting to click View Full Response button...');
    const viewButton = page.locator('button:has-text("View Full Response")').first();
    
    // Check if button is visible and clickable
    const isVisible = await viewButton.isVisible();
    console.log('Button visible:', isVisible);
    
    if (isVisible) {
      await viewButton.click({ timeout: 5000 });
      console.log('✅ Successfully clicked View Full Response button!');
      
      // Check if modal appears
      const modal = page.locator('.fixed.inset-0.bg-black.bg-opacity-50');
      const modalVisible = await modal.isVisible();
      console.log('Modal visible:', modalVisible);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await browser.close();
  }
}

testButtonClick();