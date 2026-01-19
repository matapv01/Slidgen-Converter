const puppeteer = require('puppeteer');
const path = require('path');

async function checkTextContainerOverflow(inputFilePath, outputFilePath) {
    console.log('[TEXT CONTAINER OVERFLOW] 📦 Checking if text overflows parent containers...\n');
    
    const browser = await puppeteer.launch({ headless: "new" });
    
    try {
        // ✅ Parse INPUT to get parent-child relationships
        const inputPage = await browser.newPage();
        await inputPage.goto(`file://${path.resolve(inputFilePath)}`, { waitUntil: 'networkidle0' });
        
        const parentChildMap = await inputPage.evaluate(() => {
            const map = [];
            const textTags = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p'];
            
            const textElements = Array.from(document.querySelectorAll('*'))
                .filter(el => {
                    // Chỉ lấy text tags (h1, h2, h3, p...)
                    const tag = el.tagName.toLowerCase();
                    return textTags.includes(tag);
                });
            
            textElements.forEach(textEl => {
                const parent = textEl.parentElement;
                if (!parent) return;
                
                map.push({
                    textTag: textEl.tagName.toLowerCase(),
                    textClass: textEl.className || '',
                    textContent: textEl.textContent.trim().substring(0, 80),
                    parentTag: parent.tagName.toLowerCase(),
                    parentClass: parent.className || ''
                });
            });
            
            return map;
        });
        
        await inputPage.close();
        console.log(`✅ Found ${parentChildMap.length} parent-child relationships in input\n`);
        
        // ✅ Parse OUTPUT to get positions
        const page = await browser.newPage();
        await page.goto(`file://${path.resolve(outputFilePath)}`, { waitUntil: 'networkidle0' });
        
        // Lấy text elements và parent containers từ OUTPUT
        const outputElements = await page.evaluate(() => {
            const elements = [];
            
            // Lấy tất cả elements
            Array.from(document.querySelectorAll('.content-wrapper *')).forEach(el => {
                const style = window.getComputedStyle(el);
                if (style.display === 'none' || style.visibility === 'hidden') return;
                
                const rect = el.getBoundingClientRect();
                if (rect.width === 0 || rect.height === 0) return;
                
                const textContent = el.textContent?.trim() || '';
                
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
                
                // ✅ MARGIN BOX
                const outerLeft = baseLeft - marginLeft;
                const outerTop = baseTop - marginTop;
                const outerWidth = computedWidth + marginLeft + marginRight;
                const outerHeight = computedHeight + marginTop + marginBottom;
                
                elements.push({
                    tag: el.tagName.toLowerCase(),
                    class: el.className || '',
                    textContent: textContent.substring(0, 80),
                    hasText: textContent.length > 0,
                    left: outerLeft,
                    top: outerTop,
                    width: outerWidth,
                    height: outerHeight,
                    right: outerLeft + outerWidth,
                    bottom: outerTop + outerHeight,
                    zIndex: parseInt(style.zIndex) || 0
                });
            });
            
            return elements;
        });
        
        await page.close();
        
        console.log(`✅ Found ${outputElements.length} elements in output\n`);
        
        // ✅ Match text elements with their parents from input
        const textOverflows = [];
        
        parentChildMap.forEach(relation => {
            // Tìm text element trong output
            const textEl = outputElements.find(el => 
                el.tag === relation.textTag &&
                el.class === relation.textClass &&
                el.textContent === relation.textContent &&
                el.hasText
            );
            
            if (!textEl) return;
            
            // Tìm parent container trong output
            const parentEl = outputElements.find(el =>
                el.tag === relation.parentTag &&
                el.class === relation.parentClass
            );
            
            if (!parentEl) return;
            
            // ✅ Check overflow
            const overflowLeft = textEl.left < parentEl.left ? parentEl.left - textEl.left : 0;
            const overflowRight = textEl.right > parentEl.right ? textEl.right - parentEl.right : 0;
            const overflowTop = textEl.top < parentEl.top ? parentEl.top - textEl.top : 0;
            const overflowBottom = textEl.bottom > parentEl.bottom ? textEl.bottom - parentEl.bottom : 0;
            
            const hasOverflow = overflowLeft > 1 || overflowRight > 1 || 
                               overflowTop > 1 || overflowBottom > 1;
            
            if (hasOverflow) {
                textOverflows.push({
                    text: {
                        tag: textEl.tag,
                        class: textEl.class,
                        content: textEl.textContent,
                        position: `(${textEl.left.toFixed(0)}, ${textEl.top.toFixed(0)})`,
                        size: `${textEl.width.toFixed(0)}×${textEl.height.toFixed(0)}`,
                        bounds: `${textEl.left.toFixed(0)}-${textEl.right.toFixed(0)}, ${textEl.top.toFixed(0)}-${textEl.bottom.toFixed(0)}`,
                        zIndex: textEl.zIndex
                    },
                    parent: {
                        tag: parentEl.tag,
                        class: parentEl.class,
                        position: `(${parentEl.left.toFixed(0)}, ${parentEl.top.toFixed(0)})`,
                        size: `${parentEl.width.toFixed(0)}×${parentEl.height.toFixed(0)}`,
                        bounds: `${parentEl.left.toFixed(0)}-${parentEl.right.toFixed(0)}, ${parentEl.top.toFixed(0)}-${parentEl.bottom.toFixed(0)}`
                    },
                    overflow: {
                        left: overflowLeft.toFixed(1),
                        right: overflowRight.toFixed(1),
                        top: overflowTop.toFixed(1),
                        bottom: overflowBottom.toFixed(1),
                        directions: [
                            overflowLeft > 1 ? 'LEFT' : null,
                            overflowRight > 1 ? 'RIGHT' : null,
                            overflowTop > 1 ? 'TOP' : null,
                            overflowBottom > 1 ? 'BOTTOM' : null
                        ].filter(d => d !== null)
                    }
                });
            }
        });
        
        // ✅ HIỂN THỊ KẾT QUẢ
        console.log('═══════════════════════════════════════════════════════');
        console.log('📊 TEXT CONTAINER OVERFLOW RESULTS');
        console.log('═══════════════════════════════════════════════════════\n');
        
        if (textOverflows.length > 0) {
            console.log(`🚨 Found ${textOverflows.length} text elements overflowing their containers!\n`);
            
            textOverflows.forEach((item, idx) => {
                const severity = Math.max(
                    parseFloat(item.overflow.left),
                    parseFloat(item.overflow.right),
                    parseFloat(item.overflow.top),
                    parseFloat(item.overflow.bottom)
                ) > 20 ? 'CRITICAL' : 'WARNING';
                
                const icon = severity === 'CRITICAL' ? '🚨' : '⚠️';
                
                console.log(`${idx + 1}. ${icon} ${severity}`);
                console.log(`   📝 Text: <${item.text.tag} class="${item.text.class}">`);
                console.log(`      Content: "${item.text.content}"`);
                console.log(`      Position: ${item.text.position} ${item.text.size}`);
                console.log(`      Bounds: [${item.text.bounds}] (z:${item.text.zIndex})`);
                console.log(``);
                console.log(`   📦 Parent: <${item.parent.tag} class="${item.parent.class}">`);
                console.log(`      Position: ${item.parent.position} ${item.parent.size}`);
                console.log(`      Bounds: [${item.parent.bounds}]`);
                console.log(``);
                console.log(`   ⚠️  Text overflows ${item.overflow.directions.join(', ')}:`);
                if (parseFloat(item.overflow.left) > 1) {
                    console.log(`      ← Left: ${item.overflow.left}px`);
                }
                if (parseFloat(item.overflow.right) > 1) {
                    console.log(`      → Right: ${item.overflow.right}px`);
                }
                if (parseFloat(item.overflow.top) > 1) {
                    console.log(`      ↑ Top: ${item.overflow.top}px`);
                }
                if (parseFloat(item.overflow.bottom) > 1) {
                    console.log(`      ↓ Bottom: ${item.overflow.bottom}px`);
                }
                console.log(``);
            });
            
            console.log('💡 SOLUTIONS:');
            console.log('   → Reduce text font-size or content length');
            console.log('   → Increase parent container size');
            console.log('   → Add `overflow: hidden` or `overflow: auto` to parent');
            console.log('   → Adjust text positioning or margins\n');
        } else {
            console.log('✅ No container overflows detected! All text fits within parent containers.\n');
        }
        
        // ✅ FINAL SUMMARY
        console.log('═══════════════════════════════════════════════════════');
        console.log('📊 FINAL SUMMARY');
        console.log('═══════════════════════════════════════════════════════');
        console.log(`Container overflows:        ${textOverflows.length} ${textOverflows.length > 0 ? '🚨' : '✅'}`);
        console.log(`Status:                     ${textOverflows.length === 0 ? '✅ PASS' : '🚨 FAIL'}\n`);
        
    } catch (error) {
        console.error('[ERROR] ❌', error);
        process.exit(1);
    } finally {
        await browser.close();
    }
}

if (process.argv.length < 4) {
    console.error('❌ Usage: node text-container-overflow.js <input.html> <output.html>');
    process.exit(1);
}

checkTextContainerOverflow(process.argv[2], process.argv[3]);
