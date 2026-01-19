const puppeteer = require('puppeteer');
const path = require('path');

async function checkZIndexConflicts(outputFilePath) {
    console.log('[Z-INDEX CHECKER] 🔍 Checking if text is hidden behind other elements...\n');
    
    const browser = await puppeteer.launch({ headless: "new" });
    
    try {
        const page = await browser.newPage();
        await page.goto(`file://${path.resolve(outputFilePath)}`, { waitUntil: 'networkidle0' });
        
        // Lấy TẤT CẢ elements (text + non-text như img, div, etc.)
        const allElements = await page.evaluate(() => {
            const elements = Array.from(document.querySelectorAll('.content-wrapper > *'));
            const textElements = [];
            const nonTextElements = [];
            
            elements.forEach((el, index) => {
                const style = window.getComputedStyle(el);
                if (style.display === 'none' || style.visibility === 'hidden') return;
                
                const rect = el.getBoundingClientRect();
                if (rect.width === 0 || rect.height === 0) return;
                
                const textContent = el.textContent?.trim() || '';
                
                const elementData = {
                    index: index,
                    tag: el.tagName.toLowerCase(),
                    class: el.className || '',
                    text: textContent.substring(0, 80),
                    textLength: textContent.length,
                    left: parseFloat(style.left) || 0,
                    top: parseFloat(style.top) || 0,
                    width: rect.width,
                    height: rect.height,
                    right: (parseFloat(style.left) || 0) + rect.width,
                    bottom: (parseFloat(style.top) || 0) + rect.height,
                    zIndex: parseInt(style.zIndex) || 0,
                    backgroundColor: style.backgroundColor,
                    backgroundImage: style.backgroundImage
                };
                
                // Phân loại: có text = text element, không có text = non-text element (img, div rỗng, etc.)
                if (textContent.length > 0) {
                    textElements.push(elementData);
                } else {
                    nonTextElements.push(elementData);
                }
            });
            
            return { textElements, nonTextElements };
        });
        
        await page.close();
        
        console.log(`✅ Found ${allElements.textElements.length} text elements`);
        console.log(`✅ Found ${allElements.nonTextElements.length} non-text elements (images, divs, etc.)\n`);
        
        // ✅ CHECK Z-INDEX CONFLICTS
        console.log('═══════════════════════════════════════════════════════');
        console.log('🚨 CHECKING Z-INDEX CONFLICTS');
        console.log('═══════════════════════════════════════════════════════\n');
        
        function checkOverlap(el1, el2) {
            // Kiểm tra có overlap không
            if (el1.right <= el2.left || el2.right <= el1.left || 
                el1.bottom <= el2.top || el2.bottom <= el1.top) {
                return null;
            }
            
            // Tính diện tích overlap
            const overlapLeft = Math.max(el1.left, el2.left);
            const overlapRight = Math.min(el1.right, el2.right);
            const overlapTop = Math.max(el1.top, el2.top);
            const overlapBottom = Math.min(el1.bottom, el2.bottom);
            
            const overlapWidth = overlapRight - overlapLeft;
            const overlapHeight = overlapBottom - overlapTop;
            const overlapArea = overlapWidth * overlapHeight;
            
            const textArea = el1.width * el1.height;
            const overlapPercent = (overlapArea / textArea) * 100;
            
            // Chỉ báo cáo nếu overlap > 10%
            if (overlapPercent < 10) return null;
            
            return {
                overlapPercent: overlapPercent.toFixed(2),
                overlapArea: overlapArea.toFixed(2)
            };
        }
        
        const zIndexConflicts = [];
        
        // Kiểm tra từng text element với tất cả non-text elements
        allElements.textElements.forEach(textEl => {
            allElements.nonTextElements.forEach(nonTextEl => {
                const overlap = checkOverlap(textEl, nonTextEl);
                
                if (overlap) {
                    // ❌ CONFLICT: Text có z-index THẤP HƠN hoặc BẰNG non-text element
                    // → Text sẽ bị che!
                    if (textEl.zIndex <= nonTextEl.zIndex) {
                        zIndexConflicts.push({
                            textElement: {
                                tag: textEl.tag,
                                class: textEl.class,
                                text: textEl.text,
                                position: `(${textEl.left.toFixed(0)}, ${textEl.top.toFixed(0)})`,
                                size: `${textEl.width.toFixed(0)}×${textEl.height.toFixed(0)}`,
                                zIndex: textEl.zIndex
                            },
                            coveringElement: {
                                tag: nonTextEl.tag,
                                class: nonTextEl.class,
                                position: `(${nonTextEl.left.toFixed(0)}, ${nonTextEl.top.toFixed(0)})`,
                                size: `${nonTextEl.width.toFixed(0)}×${nonTextEl.height.toFixed(0)}`,
                                zIndex: nonTextEl.zIndex,
                                hasBackground: nonTextEl.backgroundColor !== 'rgba(0, 0, 0, 0)' || nonTextEl.backgroundImage !== 'none'
                            },
                            overlap: {
                                percent: overlap.overlapPercent + '%',
                                area: overlap.overlapArea + 'px²'
                            },
                            severity: textEl.zIndex < nonTextEl.zIndex ? 'CRITICAL' : 'WARNING'
                        });
                    }
                }
            });
        });
        
        // ✅ HIỂN THỊ KẾT QUẢ
        console.log('═══════════════════════════════════════════════════════');
        console.log('📊 Z-INDEX CONFLICT RESULTS');
        console.log('═══════════════════════════════════════════════════════\n');
        
        if (zIndexConflicts.length > 0) {
            console.log(`🚨 CRITICAL: Found ${zIndexConflicts.length} z-index conflicts!\n`);
            console.log('⚠️  Text elements may be hidden behind other elements!\n');
            
            zIndexConflicts.forEach((item, idx) => {
                const icon = item.severity === 'CRITICAL' ? '🚨' : '⚠️';
                console.log(`${idx + 1}. ${icon} ${item.severity}: TEXT HIDDEN BEHIND ELEMENT`);
                console.log(`   📝 Text Element: <${item.textElement.tag} class="${item.textElement.class}">`);
                console.log(`      Text: "${item.textElement.text}"`);
                console.log(`      Position: ${item.textElement.position} ${item.textElement.size}`);
                console.log(`      Z-Index: ${item.textElement.zIndex}`);
                console.log(``);
                console.log(`   🖼️  Covering Element: <${item.coveringElement.tag} class="${item.coveringElement.class}">`);
                console.log(`      Position: ${item.coveringElement.position} ${item.coveringElement.size}`);
                console.log(`      Z-Index: ${item.coveringElement.zIndex} ${item.coveringElement.zIndex > item.textElement.zIndex ? '(HIGHER - will cover text!)' : '(SAME - may cover text!)'}`);
                console.log(`      Has Background: ${item.coveringElement.hasBackground ? 'YES (will hide text)' : 'NO (may be transparent)'}`);
                console.log(``);
                console.log(`   ⚠️  Overlap: ${item.overlap.percent} (${item.overlap.area})`);
                console.log(``);
            });
            
            console.log('💡 SOLUTION:');
            console.log('   → Increase text element z-index to be HIGHER than covering elements');
            console.log('   → Or reposition elements to avoid overlap\n');
        } else {
            console.log('✅ No z-index conflicts detected! All text elements are properly layered.\n');
        }
        
        // ✅ FINAL SUMMARY
        console.log('═══════════════════════════════════════════════════════');
        console.log('📊 FINAL SUMMARY');
        console.log('═══════════════════════════════════════════════════════');
        console.log(`Total text elements:        ${allElements.textElements.length}`);
        console.log(`Total non-text elements:    ${allElements.nonTextElements.length}`);
        console.log(`Z-index conflicts:          ${zIndexConflicts.length} ${zIndexConflicts.length > 0 ? '🚨' : '✅'}`);
        console.log(`Status:                     ${zIndexConflicts.length === 0 ? '✅ PASS' : '🚨 FAIL'}\n`);
        
    } catch (error) {
        console.error('[ERROR] ❌', error);
        process.exit(1);
    } finally {
        await browser.close();
    }
}

if (process.argv.length < 3) {
    console.error('❌ Usage: node z-index-checker.js <output.html>');
    process.exit(1);
}

checkZIndexConflicts(process.argv[2]);
