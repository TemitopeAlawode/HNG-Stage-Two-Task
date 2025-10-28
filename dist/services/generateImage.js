// import Jimp from 'jimp';
const Jimp = require('jimp');
import path from 'path';
import Country from '../models/Country'; // Your updated Country model
export async function generateSummaryImage() {
    try {
        // Fetch required data
        const total = await Country.count();
        const top5 = await Country.findAll({
            order: [['estimated_gdp', 'DESC NULLS LAST']],
            limit: 5,
            attributes: ['name', 'estimated_gdp'],
        });
        const lastRefresh = await Country.max('last_refreshed_at');
        // Create a blank image (800x600, white background)
        const image = await Jimp.create(800, 600, 0xffffffff); // White background (hex: FFFFFFFF)
        // Load a font (Jimp's built-in sans-serif, black, 32pt)
        const font = await Jimp.loadFont(Jimp.FONT_SANS_32_BLACK);
        // Add text to the image
        // Title
        image.print(font, 50, 50, `Country Currency Summary`);
        // Total countries
        image.print(font, 50, 100, `Total Countries: ${total}`);
        // Last refresh timestamp
        const formattedDate = lastRefresh instanceof Date ? lastRefresh.toISOString() : "N/A";
        // const formattedDate = lastRefresh ? new Date(lastRefresh).toISOString() : 'N/A';
        image.print(font, 50, 150, `Last Refresh: ${formattedDate}`);
        // Top 5 countries by GDP
        image.print(font, 50, 200, `Top 5 Countries by Estimated GDP:`);
        top5.forEach((country, index) => {
            const gdp = country.estimated_gdp
                ? country.estimated_gdp.toFixed(2)
                : 'N/A';
            image.print(font, 50, 250 + index * 50, // Space out each entry
            `${index + 1}. ${country.name}: ${gdp}`);
        });
        // Save the image to cache/summary.png
        const imagePath = path.join(__dirname, '../../cache/summary.png');
        await image.writeAsync(imagePath);
    }
    catch (error) {
        console.error('Error generating summary image:', error.message);
        throw new Error('Failed to generate summary image');
    }
}
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
