const puppeteer = require('puppeteer');
const fs = require('fs/promises');
const path = require('path');

async function detectTextOverlap(outputFilePath) {
    console.log('[OVERLAP DETECTOR] 🔍 Checking text element overlaps in OUTPUT...\n');
    
    const browser = await puppeteer.launch({ headless: "new" });
    
    try {
        // ✅ Lấy TẤT CẢ text elements từ OUTPUT
        const outputPage = await browser.newPage();
        await outputPage.goto(`file://${path.resolve(outputFilePath)}`, { waitUntil: 'networkidle0' });
        
        const outputElements = await outputPage.evaluate(() => {
            const elements = Array.from(document.querySelectorAll('.content-wrapper > *'));
            
            return elements.map((el) => {
                const rect = el.getBoundingClientRect();
                const style = window.getComputedStyle(el);
                const textContent = el.textContent.trim();
                
                // CHỈ LẤY CÁC ELEMENT CÓ TEXT
                if (!textContent) return null;
                if (rect.width === 0 || rect.height === 0) return null;
                
                // ✅ Lấy margin, padding, border
                const marginTop = parseFloat(style.marginTop) || 0;
                const marginRight = parseFloat(style.marginRight) || 0;
                const marginBottom = parseFloat(style.marginBottom) || 0;
                const marginLeft = parseFloat(style.marginLeft) || 0;
                
                const paddingTop = parseFloat(style.paddingTop) || 0;
                const paddingRight = parseFloat(style.paddingRight) || 0;
                const paddingBottom = parseFloat(style.paddingBottom) || 0;
                const paddingLeft = parseFloat(style.paddingLeft) || 0;
                
                const borderTopWidth = parseFloat(style.borderTopWidth) || 0;
                const borderRightWidth = parseFloat(style.borderRightWidth) || 0;
                const borderBottomWidth = parseFloat(style.borderBottomWidth) || 0;
                const borderLeftWidth = parseFloat(style.borderLeftWidth) || 0;
                
                // ✅ Tính line-height để thêm vào outer box
                const fontSize = parseFloat(style.fontSize) || 16;
                const lineHeightValue = style.lineHeight;
                let lineHeight;
                if (lineHeightValue === 'normal') {
                    lineHeight = fontSize * 1.2;
                } else if (lineHeightValue.endsWith('px')) {
                    lineHeight = parseFloat(lineHeightValue);
                } else if (!isNaN(parseFloat(lineHeightValue))) {
                    lineHeight = parseFloat(lineHeightValue) * fontSize;
                } else {
                    lineHeight = rect.height; // fallback
                }
                
                // ✅ Extra space từ line-height (phân bố đều 2 bên)
                const lineHeightExtra = Math.max(0, lineHeight - rect.height);
                const lineHeightTop = lineHeightExtra / 2;
                const lineHeightBottom = lineHeightExtra / 2;
                
                // ✅ OUTER BOX = rect + margin + line-height space
                const baseLeft = parseFloat(style.left) || rect.left;
                const baseTop = parseFloat(style.top) || rect.top;
                
                // ✅ Dùng computed width/height (CSS) thay vì rect (bounding box thực tế)
                const computedWidth = parseFloat(style.width) || rect.width;
                const computedHeight = parseFloat(style.height) || rect.height;
                
                return {
                    tagName: el.tagName.toLowerCase(),
                    className: el.className || '',
                    textContent: textContent.substring(0, 80),
                    // Visual bounding box (content + padding + border, KHÔNG có margin)
                    left: baseLeft,
                    top: baseTop,
                    width: rect.width,
                    height: rect.height,
                    // OUTER BOX (bao gồm margin + line-height) - ĐÂY LÀ Ô VUÔNG THỰC SỰ
                    outerLeft: baseLeft - marginLeft,
                    outerTop: baseTop - marginTop - lineHeightTop,
                    outerWidth: computedWidth + marginLeft + marginRight,
                    outerHeight: computedHeight + marginTop + marginBottom,
                    zIndex: parseInt(style.zIndex) || 0,
                    // Computed styles để so sánh
                    computedWidth: computedWidth,
                    computedHeight: computedHeight,
                    // Box model details
                    margin: { top: marginTop, right: marginRight, bottom: marginBottom, left: marginLeft },
                    padding: { top: paddingTop, right: paddingRight, bottom: paddingBottom, left: paddingLeft },
                    border: { top: borderTopWidth, right: borderRightWidth, bottom: borderBottomWidth, left: borderLeftWidth },
                    fontSize: style.fontSize,
                    lineHeight: lineHeightValue,
                    lineHeightExtra: lineHeightExtra
                };
            }).filter(el => el !== null);
        });
        
        await outputPage.close();
        console.log(`[OUTPUT] ✅ Found ${outputElements.length} text elements\n`);
        
        // ✅ In ra tất cả các elements
        console.log('═══════════════════════════════════════════════════════');
        console.log('📋 ALL TEXT ELEMENTS');
        console.log('═══════════════════════════════════════════════════════\n');
        
        outputElements.forEach((el, index) => {
            console.log(`Element ${index + 1}:`);
            console.log(`   Tag: <${el.tagName}${el.className ? ' class="' + el.className + '"' : ''}>`);
            console.log(`   📏 Visual Box (content + padding + border):`);
            console.log(`      Position: (${el.left.toFixed(0)}, ${el.top.toFixed(0)})`);
            console.log(`      Size: ${el.width.toFixed(0)}×${el.height.toFixed(0)}px`);
            console.log(`      End: (${(el.left + el.width).toFixed(0)}, ${(el.top + el.height).toFixed(0)})`);
            console.log(`      Computed (CSS): ${el.computedWidth ? el.computedWidth.toFixed(0) : 'auto'}×${el.computedHeight ? el.computedHeight.toFixed(0) : 'auto'}px`);
            console.log(`   📦 OUTER BOX (bao gồm margin + line-height) - Ô VUÔNG THỰC SỰ:`);
            console.log(`      Position: (${el.outerLeft.toFixed(0)}, ${el.outerTop.toFixed(0)})`);
            console.log(`      Size: ${el.outerWidth.toFixed(0)}×${el.outerHeight.toFixed(0)}px`);
            console.log(`      End: (${(el.outerLeft + el.outerWidth).toFixed(0)}, ${(el.outerTop + el.outerHeight).toFixed(0)})`);
            console.log(`   📐 Box Model:`);
            console.log(`      Margin: ${el.margin.top}px ${el.margin.right}px ${el.margin.bottom}px ${el.margin.left}px`);
            console.log(`      Padding: ${el.padding.top}px ${el.padding.right}px ${el.padding.bottom}px ${el.padding.left}px`);
            console.log(`      Border: ${el.border.top}px ${el.border.right}px ${el.border.bottom}px ${el.border.left}px`);
            console.log(`   ✍️ Typography:`);
            console.log(`      Font size: ${el.fontSize}`);
            console.log(`      Line height: ${el.lineHeight}`);
            console.log(`      Line height extra space: ${el.lineHeightExtra.toFixed(1)}px (${(el.lineHeightExtra/2).toFixed(1)}px trên + ${(el.lineHeightExtra/2).toFixed(1)}px dưới)`);
            console.log(`   z-index: ${el.zIndex}`);
            console.log(`   Content: "${el.textContent}"`);
            console.log();
        });
        
        console.log('═══════════════════════════════════════════════════════\n');
        
        // ✅ Hàm kiểm tra overlap - DÙNG OUTER BOX - DÙNG OUTER BOX
        function checkOverlap(el1, el2) {
            // SỬ DỤNG OUTER BOX (bao gồm margin) - Ô VUÔNG THỰC SỰ
            const left1 = el1.outerLeft;
            const right1 = el1.outerLeft + el1.outerWidth;
            const top1 = el1.outerTop;
            const bottom1 = el1.outerTop + el1.outerHeight;
            
            const left2 = el2.outerLeft;
            const right2 = el2.outerLeft + el2.outerWidth;
            const top2 = el2.outerTop;
            const bottom2 = el2.outerTop + el2.outerHeight;
            
            // Kiểm tra KHÔNG overlap
            if (right1 <= left2 || right2 <= left1 || bottom1 <= top2 || bottom2 <= top1) {
                return null;
            }
            
            // Tính diện tích overlap
            const overlapLeft = Math.max(left1, left2);
            const overlapRight = Math.min(right1, right2);
            const overlapTop = Math.max(top1, top2);
            const overlapBottom = Math.min(bottom1, bottom2);
            
            const overlapWidth = overlapRight - overlapLeft;
            const overlapHeight = overlapBottom - overlapTop;
            const overlapArea = overlapWidth * overlapHeight;
            
            // Tính % overlap so với element nhỏ hơn (dùng OUTER BOX)
            const area1 = el1.outerWidth * el1.outerHeight;
            const area2 = el2.outerWidth * el2.outerHeight;
            const smallerArea = Math.min(area1, area2);
            const overlapPercent = (overlapArea / smallerArea) * 100;
            
            // Chỉ báo cáo nếu overlap > 5%
            if (overlapPercent < 5) return null;
            
            return {
                overlapWidth: overlapWidth.toFixed(2),
                overlapHeight: overlapHeight.toFixed(2),
                overlapArea: overlapArea.toFixed(2),
                overlapPercent: overlapPercent.toFixed(2)
            };
        }
        
        // ✅ So sánh TỪNG CẶP elements
        console.log('═══════════════════════════════════════════════════════');
        console.log('🚨 CHECKING TEXT OVERLAPS IN OUTPUT');
        console.log('═══════════════════════════════════════════════════════\n');
        
        const overlaps = [];
        
        for (let i = 0; i < outputElements.length; i++) {
            for (let j = i + 1; j < outputElements.length; j++) {
                const el1 = outputElements[i];
                const el2 = outputElements[j];
                
                const overlap = checkOverlap(el1, el2);
                
                if (overlap) {
                    overlaps.push({
                        element1: el1,
                        element2: el2,
                        overlap: overlap
                    });
                    
                    console.log(`❌ OVERLAP ${overlaps.length}:`);
                    console.log(`   Element 1: <${el1.tagName}${el1.className ? ' class="' + el1.className + '"' : ''}>`);
                    console.log(`      OUTER BOX: (${el1.outerLeft.toFixed(0)}, ${el1.outerTop.toFixed(0)}) → (${(el1.outerLeft + el1.outerWidth).toFixed(0)}, ${(el1.outerTop + el1.outerHeight).toFixed(0)})`);
                    console.log(`      Size: ${el1.outerWidth.toFixed(0)}×${el1.outerHeight.toFixed(0)}px`);
                    console.log(`      Text: "${el1.textContent.substring(0, 50)}${el1.textContent.length > 50 ? '...' : ''}"`);
                    console.log();
                    console.log(`   Element 2: <${el2.tagName}${el2.className ? ' class="' + el2.className + '"' : ''}>`);
                    console.log(`      OUTER BOX: (${el2.outerLeft.toFixed(0)}, ${el2.outerTop.toFixed(0)}) → (${(el2.outerLeft + el2.outerWidth).toFixed(0)}, ${(el2.outerTop + el2.outerHeight).toFixed(0)})`);
                    console.log(`      Size: ${el2.outerWidth.toFixed(0)}×${el2.outerHeight.toFixed(0)}px`);
                    console.log(`      Text: "${el2.textContent.substring(0, 50)}${el2.textContent.length > 50 ? '...' : ''}"`);
                    console.log();
                    console.log(`   📊 Overlap:`);
                    console.log(`      Size: ${overlap.overlapWidth}×${overlap.overlapHeight}px`);
                    console.log(`      Percentage: ${overlap.overlapPercent}%`);
                    console.log();
                    console.log('───────────────────────────────────────────────────────\n');
                }
            }
        }
        
        // ✅ Tổng kết
        console.log('═══════════════════════════════════════════════════════');
        console.log('📊 FINAL SUMMARY');
        console.log('═══════════════════════════════════════════════════════');
        console.log(`Total text elements:        ${outputElements.length}`);
        console.log(`Total overlaps detected:    ${overlaps.length} ${overlaps.length > 0 ? '🚨' : '✅'}`);
        console.log();
        
        if (overlaps.length > 0) {
            console.log('❌ OVERLAP ISSUES FOUND! Please check converter logic.');
        } else {
            console.log('✅ NO OVERLAPS DETECTED! All text elements are properly positioned.');
        }
        
    } catch (error) {
        console.error('❌ Error during overlap detection:', error);
        throw error;
    } finally {
        await browser.close();
    }
}

// ✅ CLI Usage
if (require.main === module) {
    const args = process.argv.slice(2);
    
    if (args.length !== 1) {
        console.error('Usage: node simple-overlap-detector.js <output.html>');
        console.error('Example: node simple-overlap-detector.js output.html');
        process.exit(1);
    }
    
    const outputFilePath = args[0];
    
    detectTextOverlap(outputFilePath)
        .then(() => {
            console.log('\n✅ Overlap detection completed!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('\n❌ Overlap detection failed:', error);
            process.exit(1);
        });
}

module.exports = { detectTextOverlap };
