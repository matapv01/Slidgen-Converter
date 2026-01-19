const puppeteer = require('puppeteer');
const path = require('path');

async function detectTextOverflow(outputFilePath) {
    console.log('[TEXT OVERFLOW DETECTOR] 📐 Checking viewport overflow in output...\n');
    
    const browser = await puppeteer.launch({ headless: "new" });
    
    try {
        const page = await browser.newPage();
        await page.goto(`file://${path.resolve(outputFilePath)}`, { waitUntil: 'networkidle0' });
        
        // Lấy TẤT CẢ text elements với tọa độ (MARGIN BOX)
        const textElements = await page.evaluate(() => {
            const elements = Array.from(document.querySelectorAll('.content-wrapper > *'));
            const results = [];
            
            elements.forEach((el, index) => {
                const textContent = el.textContent?.trim() || '';
                if (!textContent) return;
                
                const style = window.getComputedStyle(el);
                if (style.display === 'none' || style.visibility === 'hidden') return;
                
                const rect = el.getBoundingClientRect();
                if (rect.width === 0 || rect.height === 0) return;
                
                // ✅ Parse margin
                const marginTop = parseFloat(style.marginTop) || 0;
                const marginRight = parseFloat(style.marginRight) || 0;
                const marginBottom = parseFloat(style.marginBottom) || 0;
                const marginLeft = parseFloat(style.marginLeft) || 0;
                
                // ✅ Base position
                const baseLeft = parseFloat(style.left) || rect.left;
                const baseTop = parseFloat(style.top) || rect.top;
                
                // ✅ Computed CSS dimensions
                const computedWidth = parseFloat(style.width) || rect.width;
                const computedHeight = parseFloat(style.height) || rect.height;
                
                // ✅ MARGIN BOX (giống DevTools)
                const outerLeft = baseLeft - marginLeft;
                const outerTop = baseTop - marginTop;
                const outerWidth = computedWidth + marginLeft + marginRight;
                const outerHeight = computedHeight + marginTop + marginBottom;
                
                results.push({
                    index: index,
                    tag: el.tagName.toLowerCase(),
                    class: el.className || '',
                    text: textContent.substring(0, 80),
                    textLength: textContent.length,
                    left: outerLeft,
                    top: outerTop,
                    width: outerWidth,
                    height: outerHeight,
                    right: outerLeft + outerWidth,
                    bottom: outerTop + outerHeight,
                    zIndex: parseInt(style.zIndex) || 0
                });
            });
            
            return results;
        });
        
        await page.close();
        
        console.log(`✅ Found ${textElements.length} text elements\n`);
        
        // ✅ IN RA TỌA ĐỘ TẤT CẢ ELEMENTS
        console.log('═══════════════════════════════════════════════════════');
        console.log('📋 ALL TEXT ELEMENTS WITH COORDINATES');
        console.log('═══════════════════════════════════════════════════════\n');
        
        textElements.forEach((el, idx) => {
            console.log(`${idx + 1}. <${el.tag} class="${el.class}">`);
            console.log(`   Text: "${el.text}"`);
            console.log(`   📦 MARGIN BOX:`);
            console.log(`      Position: (${el.left.toFixed(0)}, ${el.top.toFixed(0)})`);
            console.log(`      Size: ${el.width.toFixed(0)}×${el.height.toFixed(0)}px`);
            console.log(`      End: (${el.right.toFixed(0)}, ${el.bottom.toFixed(0)})`);
            console.log(`      z-index: ${el.zIndex}`);
            console.log('');
        });
        
        // ✅ CHECK VIEWPORT OVERFLOW (1920×1080)
        console.log('═══════════════════════════════════════════════════════');
        console.log('📐 CHECKING VIEWPORT OVERFLOW (1920×1080)');
        console.log('═══════════════════════════════════════════════════════\n');
        
        const VIEWPORT_WIDTH = 1920;
        const VIEWPORT_HEIGHT = 1080;
        
        const overflows = textElements.filter(el => {
            return el.right > VIEWPORT_WIDTH || el.bottom > VIEWPORT_HEIGHT;
        });
        
        if (overflows.length > 0) {
            console.log(`🚨 Found ${overflows.length} elements exceeding viewport bounds!\n`);
            
            overflows.forEach((el, idx) => {
                const overflowRight = Math.max(0, el.right - VIEWPORT_WIDTH);
                const overflowBottom = Math.max(0, el.bottom - VIEWPORT_HEIGHT);
                
                const severity = (overflowRight > 50 || overflowBottom > 50) ? 'CRITICAL' : 'WARNING';
                const icon = severity === 'CRITICAL' ? '🚨' : '⚠️';
                
                console.log(`${idx + 1}. ${icon} ${severity}`);
                console.log(`   <${el.tag} class="${el.class}">`);
                console.log(`   Text: "${el.text}"`);
                console.log(`   Position: ${el.left.toFixed(0)}, ${el.top.toFixed(0)} | Size: ${el.width.toFixed(0)}×${el.height.toFixed(0)}`);
                
                if (overflowRight > 0) {
                    console.log(`   → Right edge: ${el.right.toFixed(0)}px (exceeds by ${overflowRight.toFixed(0)}px)`);
                }
                if (overflowBottom > 0) {
                    console.log(`   → Bottom edge: ${el.bottom.toFixed(0)}px (exceeds by ${overflowBottom.toFixed(0)}px)`);
                }
                console.log('');
            });
        } else {
            console.log('✅ All text elements are within viewport bounds!\n');
        }
        
        // ✅ FINAL SUMMARY
        console.log('═══════════════════════════════════════════════════════');
        console.log('📊 FINAL SUMMARY');
        console.log('═══════════════════════════════════════════════════════');
        console.log(`Total text elements:        ${textElements.length}`);
        console.log(`Viewport overflows:         ${overflows.length} ${overflows.length > 0 ? '🚨' : '✅'}`);
        console.log(`Overall status:             ${overflows.length === 0 ? '✅ PASS' : '🚨 FAIL'}\n`);
        
    } catch (error) {
        console.error('[ERROR] ❌', error);
        process.exit(1);
    } finally {
        await browser.close();
    }
}

if (process.argv.length < 3) {
    console.error('❌ Usage: node text-overflow-detector.js <output.html>');
    process.exit(1);
}

detectTextOverflow(process.argv[2]);
