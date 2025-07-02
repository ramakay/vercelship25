#!/usr/bin/env node

import { promises as fs } from 'fs';
import path from 'path';

async function captureScreenshots() {
  console.log('📸 Screenshot Capture Instructions\n');
  
  const screenshotDir = path.join(process.cwd(), 'public', 'article-assets');
  await fs.mkdir(screenshotDir, { recursive: true });
  
  console.log('Please capture the following screenshots manually:');
  console.log('(Save them to: public/article-assets/)\n');
  
  const screenshots = [
    {
      name: '1-dashboard-initial.png',
      description: 'Dashboard with initial prompt and empty state'
    },
    {
      name: '2-model-comparison.png',
      description: 'Model comparison table showing all three AI models with latency and cost'
    },
    {
      name: '3-cost-accumulator.png',
      description: 'Cost accumulator showing spend progress (capture at different spend levels)'
    },
    {
      name: '4-cpu-sparkline.png',
      description: 'Active CPU vs Wall Time chart after multiple requests'
    },
    {
      name: '5-sandbox-execution.png',
      description: 'Sandbox execution output (if AI generates executable code)'
    },
    {
      name: '6-data-export.png',
      description: 'Data export buttons in action'
    },
    {
      name: '7-probe-results.png',
      description: 'Terminal output showing probe results'
    },
    {
      name: '8-vercel-dashboard.png',
      description: 'Vercel dashboard showing AI Gateway usage'
    }
  ];
  
  screenshots.forEach((screenshot, index) => {
    console.log(`${index + 1}. ${screenshot.name}`);
    console.log(`   ${screenshot.description}\n`);
  });
  
  console.log('Tips:');
  console.log('- Use Chrome DevTools Device Mode for consistent dimensions');
  console.log('- Recommended viewport: 1440x900');
  console.log('- Include relevant data in each screenshot');
  console.log('- Blur any sensitive information');
  
  // Create a README for the assets
  const readmeContent = `# Article Assets

Screenshots captured on: ${new Date().toISOString()}

## Screenshots
${screenshots.map(s => `- ${s.name}: ${s.description}`).join('\n')}

## Metrics Files
- cost-log.csv: Exported cost data
- metrics.json: Summary metrics
- probes.json: Feature availability probe results
`;
  
  await fs.writeFile(
    path.join(screenshotDir, 'README.md'),
    readmeContent
  );
  
  console.log('\n✅ Created README.md in article-assets directory');
}

captureScreenshots().catch(console.error);