import { createCanvas, registerFont } from 'canvas';  // Import functions to create an image canvas and register fonts
import path from 'path';  // For working with file paths
import { promises as fs } from 'fs';  // For reading/writing files asynchronously
import Country from '../models/Country';  // Import the Country model for database operations

export async function generateSummaryImage() {
  try {
    // Step 1: Verify and register the custom font
    // Verify font file
    const fontPath = path.join(__dirname, '../fonts/OpenSans-Regular.ttf');
    console.log('Font path:', fontPath);
    try {
      await fs.access(fontPath); // Check if font file exists
      console.log('Font file exists');
      // Register multiple family names to handle mismatches
      registerFont(fontPath, { family: 'Open Sans' });
      registerFont(fontPath, { family: 'OpenSans' });
      registerFont(fontPath, { family: 'Open Sans Regular' });
    } catch (error: any) {
      console.error('Font file error:', error.message);
      throw new Error(`Failed to load font file: ${fontPath}`);
    }

    // Step 2: Fetch data from the database
    // Fetch required data
    const total = await Country.count(); // Count total number of countries
    const top5 = await Country.findAll({ // Get top 5 countries by GDP
      order: [['estimated_gdp', 'DESC']],
      limit: 5,
      attributes: ['name', 'estimated_gdp'],
    });
    const lastRefresh = await Country.max('last_refreshed_at'); // Get last refresh timestamp

    console.log('Total countries:', total);
    console.log('Top 5:', top5.map(c => ({ name: c.name, estimated_gdp: c.estimated_gdp })));
    console.log('Last refresh:', lastRefresh);

    // Step 3: Create a canvas (1200x800) and set background
    // Create a canvas (1200x800)
    const canvas = createCanvas(1200, 800);
    const ctx = canvas.getContext('2d');

    // Set white background
    ctx.fillStyle = '#ffffff'; // White background
    ctx.fillRect(0, 0, 1200, 800);

    // Step 4: Try using the registered font (fallbacks included)
    // Set font and color
    const fontFamilies = ['Open Sans', 'OpenSans', 'Open Sans Regular', 'sans-serif'];
    let fontLoaded = false;
    for (const family of fontFamilies) {
      ctx.font = `32px "${family}"`;
      console.log(`Trying font: ${family}`);
      try {
        ctx.fillText('Test', 0, 0); // Test rendering to check font
        fontLoaded = true;
        break;
      } catch (error: any) {
        console.log(`Font ${family} failed:`, error.message);
      }
    }
    if (!fontLoaded) {
      console.warn('All font families failed, using sans-serif');
      ctx.font = '32px sans-serif';
    }
    ctx.fillStyle = '#000000'; // Set text color to black

    // Step 5: Add text to the image
    // Add text to the image
    ctx.fillText('Country Currency Summary', 50, 50);
    ctx.fillText(`Total Countries: ${total}`, 50, 100);

    // Format last refresh date (ISO string or N/A)
    const formattedDate =
      lastRefresh instanceof Date ? lastRefresh.toISOString() : 'N/A';
    ctx.fillText(`Last Refresh: ${formattedDate}`, 50, 150);
   
    // Add top 5 countries with GDP values
    ctx.fillText('Top 5 Countries by Estimated GDP:', 50, 200);
   top5.forEach((country: any, index: number) => {
      const rawGdp = country.estimated_gdp;
      // Parse estimated_gdp as a number, handling string or number
      const gdpNumber = typeof rawGdp === 'string' ? parseFloat(rawGdp) : rawGdp;
      const gdp = typeof gdpNumber === 'number' && !isNaN(gdpNumber)
        ? gdpNumber.toFixed(2) // Display raw GDP with 2 decimal places
        : 'N/A';
      console.log('Country:', country.name, 'GDP:', gdp, 'Raw estimated_gdp:', rawGdp);
      ctx.fillText(`${index + 1}. ${country.name}: ${gdp}`, 50, 250 + index * 50);
    });
    // top5.forEach((country: any, index: number) => {
    //   const gdp = typeof country.estimated_gdp === 'number' && !isNaN(country.estimated_gdp)
    //     ? country.estimated_gdp.toFixed(2)
    //     : 'N/A';
    //   console.log('Country:', country.name, 'GDP:', gdp, 'Raw estimated_gdp:', country.estimated_gdp);
    //   ctx.fillText(`${index + 1}. ${country.name}: ${gdp}`, 50, 250 + index * 50);
    // });

    // Step 6: Save the generated image to /cache/summary.png
    // Save the image
    const imagePath = path.join(__dirname, '../../cache/summary.png');
    const buffer = canvas.toBuffer('image/png');
    await fs.writeFile(imagePath, buffer);
    console.log('Image saved:', imagePath);
  } catch (error: any) {
    console.error('Error generating summary image:', error.message);
    throw new Error('Failed to generate summary image');
  }
}












// import { createCanvas, registerFont } from 'canvas';
// import path from 'path';
// import { promises as fs } from 'fs';
// import Country from '../models/Country';

// // Register the .ttf font
// registerFont(path.join(__dirname, '../fonts/OpenSans-Regular.ttf'), { family: 'Open Sans' });

// export async function generateSummaryImage() {
//   try {
//     // Fetch required data
//     const total = await Country.count();
//     const top5 = await Country.findAll({
//       order: [['estimated_gdp', 'DESC']],
//       limit: 5,
//       attributes: ['name', 'estimated_gdp'],
//     });
//     const lastRefresh = await Country.max('last_refreshed_at');

//     // Create a canvas (800x600)
//     const canvas = createCanvas(800, 600);
//     const ctx = canvas.getContext('2d');

//     // Set white background
//     ctx.fillStyle = '#ffffff';
//     ctx.fillRect(0, 0, 800, 600);

//     // Set font and color
//     ctx.font = '32px "Open Sans"';
//     ctx.fillStyle = '#000000';

//     // Add text to the image
//     ctx.fillText('Country Currency Summary', 50, 50);
//     ctx.fillText(`Total Countries: ${total}`, 50, 100);
//     const formattedDate =
//       lastRefresh instanceof Date ? lastRefresh.toISOString() : 'N/A';
//     ctx.fillText(`Last Refresh: ${formattedDate}`, 50, 150);
//     ctx.fillText('Top 5 Countries by Estimated GDP:', 50, 200);
//     top5.forEach((country, index) => {
//       const gdp = country.estimated_gdp
//         ? country.estimated_gdp.toFixed(2)
//         : 'N/A';
//       console.log('Country:', country.name, 'GDP:', gdp); // Debug country data
//       ctx.fillText(`${index + 1}. ${country.name}: ${gdp}`, 50, 250 + index * 50);
//     });

//     // Save the image
//     const imagePath = path.join(__dirname, '../../cache/summary.png');
//     const buffer = canvas.toBuffer('image/png');
//     await fs.writeFile(imagePath, buffer);
//   } catch (error: any) {
//     console.error('Error generating summary image:', error.message);
//     throw new Error('Failed to generate summary image');
//   }
// }





// const Jimp = require('jimp');
// const path = require('path');
// const Country = require('../models/Country'); // Adjust to CommonJS for consistency

// export async function generateSummaryImage() {
//   try {
//     // Fetch required data
//     console.log('Country model:', Country);
//     const total = await Country.count();
//     // console.log('Total countries:', total);
//     const top5 = await Country.findAll({
//       order: [['estimated_gdp', 'DESC']],
//       limit: 5,
//       attributes: ['name', 'estimated_gdp'],
//     });
//     const lastRefresh = await Country.max('last_refreshed_at');

//     // Create a blank image (800x600, white background)
//     const image = await Jimp.create(800, 600, 0xffffffff); // White background (hex: FFFFFFFF)

//     // Load a font (using built-in font since it’s working)
//     const font = await Jimp.loadFont(Jimp.FONT_SANS_32_BLACK);

//     // Add text to the image
//     // Title
//     image.print(font, 50, 50, `Country Currency Summary`);

//     // Total countries
//     image.print(font, 50, 100, `Total Countries: ${total}`);

//     // Last refresh timestamp
//     const formattedDate =
//       lastRefresh instanceof Date ? lastRefresh.toISOString() : 'N/A';
//     image.print(font, 50, 150, `Last Refresh: ${formattedDate}`);

//     // Top 5 countries by GDP
//     image.print(font, 50, 200, `Top 5 Countries by Estimated GDP:`);
//     top5.forEach((country: { estimated_gdp: number; name: any; }, index: number) => {
//       const gdp = country.estimated_gdp
//         ? country.estimated_gdp.toFixed(2)
//         : 'N/A';
//       image.print(
//         font,
//         50,
//         250 + index * 50, // Space out each entry
//         `${index + 1}. ${country.name}: ${gdp}`
//       );
//     });

//     // Save the image to cache/summary.png
//     const imagePath = path.join(__dirname, '../../cache/summary.png');
//     await image.writeAsync(imagePath);
//   } catch (error: any) {
//     console.error('Error generating summary image:', error.message);
//     throw new Error('Failed to generate summary image');
//   }
// }












// // import Jimp from 'jimp';
// const Jimp = require("jimp");
// import path from 'path';
// import Country from '../models/Country'; // Your updated Country model

// export async function generateSummaryImage() {
//   try {
//     // Fetch required data
//     const total = await Country.count();
//     const top5 = await Country.findAll({
//       order: [['estimated_gdp', 'DESC']],
//       limit: 5,
//       attributes: ['name', 'estimated_gdp'],
//     });
//     const lastRefresh = await Country.max('last_refreshed_at');

//     // Create a blank image (800x600, white background)
//     const image = await new Jimp({ width: 800, height: 600, background: 0xffffffff }); // White background (hex: FFFFFFFF)
//     // const image = await Jimp.create(800, 600, 0xffffffff); // White background (hex: FFFFFFFF)

//     // Load a font (Jimp's built-in sans-serif, black, 32pt)
//     const font = await Jimp.loadFont(Jimp.FONT_SANS_32_BLACK);

//     // Add text to the image
//     // Title
//     image.print(font, 50, 50, `Country Currency Summary`);
    
//     // Total countries
//     image.print(font, 50, 100, `Total Countries: ${total}`);
    
//     // Last refresh timestamp
//     const formattedDate =
//       lastRefresh instanceof Date ? lastRefresh.toISOString() : "N/A";
//     // const formattedDate = lastRefresh ? new Date(lastRefresh).toISOString() : 'N/A';
//     image.print(font, 50, 150, `Last Refresh: ${formattedDate}`);
    
//     // Top 5 countries by GDP
//     image.print(font, 50, 200, `Top 5 Countries by Estimated GDP:`);
//     top5.forEach((country, index) => {
//       const gdp = country.estimated_gdp 
//         ? country.estimated_gdp.toFixed(2) 
//         : 'N/A';
//       image.print(
//         font,
//         50,
//         250 + index * 50, // Space out each entry
//         `${index + 1}. ${country.name}: ${gdp}`
//       );
//     });

//     // Save the image to cache/summary.png
//     const imagePath = path.join(__dirname, '../../cache/summary.png');
//     await image.writeAsync(imagePath);
//   } catch (error: any) {
//     console.error('Error generating summary image:', error.message);
//     throw new Error('Failed to generate summary image');
//   }
// }












// // import Jimp from 'jimp';
// const Jimp = require('jimp');
// import path from 'path';
// import Country from '../models/Country'; // Your updated Country model
// // import * as JimpFonts from '@jimp/fonts';


// export async function generateSummaryImage() {
//   try {
//     // Fetch required data
//     const total = await Country.count();
//     const top5 = await Country.findAll({
//       order: [['estimated_gdp', 'DESC NULLS LAST']],
//       limit: 5,
//       attributes: ['name', 'estimated_gdp'],
//     });
//     const lastRefresh = await Country.max('last_refreshed_at');

//     // Create a blank image (800x600, white background)
//     // const image = await new Jimp({ width: 800, height: 600, background: 0xffffffff }); // White background (hex: FFFFFFFF)
//     const image = await Jimp.create(800, 600, 0xffffffff); // White background (hex: FFFFFFFF)

//     // Load a font (Jimp's built-in sans-serif, black, 32pt)
//     const font = await Jimp.loadFont(Jimp.FONT_SANS_32_BLACK);
// // const font = await Jimp.loadFont(JimpFonts.FONT_SANS_32_BLACK);

//     // Add text to the image
//     // Title
//     image.print(font, 50, 50, `Country Currency Summary`);
    
//     // Total countries
//     image.print(font, 50, 100, `Total Countries: ${total}`);
    
//     // Last refresh timestamp
//     const formattedDate =
//       lastRefresh instanceof Date ? lastRefresh.toISOString() : "N/A";
//     image.print(font, 50, 150, `Last Refresh: ${formattedDate}`);

//     // const formattedDate = lastRefresh 
//     //   ? new Date(lastRefresh).toISOString() 
//     //   : 'N/A';
//     // image.print(font, 50, 150, `Last Refresh: ${formattedDate}`);
    
//     // Top 5 countries by GDP
//     image.print(font, 50, 200, `Top 5 Countries by Estimated GDP:`);
//     top5.forEach((country, index) => {
//       const gdp = country.estimated_gdp 
//         ? country.estimated_gdp.toFixed(2) 
//         : 'N/A';
//       image.print(
//         font,
//         50,
//         250 + index * 50, // Space out each entry
//         `${index + 1}. ${country.name}: ${gdp}`
//       );
//     });

//     // Save the image to cache/summary.png
//     const imagePath = path.join(__dirname, '../../cache/summary.png');
//     await image.writeAsync(imagePath);
//   } catch (error: any) {
//     console.error('Error generating summary image:', error.message);
//     throw new Error('Failed to generate summary image');
//   }
// }