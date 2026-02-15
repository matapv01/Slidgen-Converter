/**
 * converter.js
 *
 * Render HTML → convert to absolute-positioned static HTML using Playwright
 *
 * Usage:
 *   node converter.js input.html output.html
 */

const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

async function convertHtmlToAbsolute(inputPath, outputPath) {
    console.log('[JS] 🚀 Starting conversion with Playwright...');

    const browser = await chromium.launch({
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"]
    });
    const page = await browser.newPage({
        viewport: { width: 1920, height: 1080 }
    });

    // Đọc head styles từ input file
    let inputHeadHtml = '';
    try {
        const inputRaw = fs.readFileSync(inputPath, 'utf8');
        const headMatch = inputRaw.match(/<head[\s\S]*?<\/head>/i);
        if (headMatch) {
            const linkAndStyleTags = headMatch[0].match(/<(link[^>]*rel=["']stylesheet["'][^>]*>|style[\s\S]*?<\/style>)/gi);
            if (linkAndStyleTags) {
                inputHeadHtml = linkAndStyleTags.join('\n');
            }
        }
    } catch (e) {
        console.warn('[JS] ⚠️ Cannot read head styles:', e.message);
    }

    try {
        const absInput = path.resolve(inputPath);
        await page.goto(`file://${absInput}`, { waitUntil: "networkidle" });
        console.log(`[JS] 📁 Page loaded: ${absInput}`);

        // Ensure fonts + animations are fully resolved
        await page.evaluate(async () => {
            await document.fonts.ready;
            await Promise.all(document.getAnimations().map(a => a.finished)).catch(() => { });
            await new Promise(requestAnimationFrame);
        }).catch(() => console.warn('[JS] ⚠️ Font/animation wait failed'));

        /**
         * Extract all visible elements with computed positions & styles
         */
        const pageData = await page.evaluate(() => {
            const stylePropsToCopy = [
                'color', 'background', 'background-color', 'background-image', 'background-size',
                'background-position', 'background-repeat', 'background-clip',
                'font-family', 'font-size', 'font-weight', 'font-style', 'line-height',
                'text-align', 'text-decoration', 'text-transform', 'text-shadow', 'letter-spacing', 'word-spacing',
                'border-radius', 'opacity', 'box-shadow', 'filter', 'transform', 'transform-origin',
                'fill', 'stroke', 'stroke-width', 'clip-path',
                'padding', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
                'box-sizing', 'vertical-align', 'white-space',
                'width', 'height', 'object-fit', 'object-position', 'display'
            ];

            function getVisualStyles(element) {
                const cs = window.getComputedStyle(element);
                let s = '';
                const inline = element.getAttribute('style');
                if (inline) s += inline.endsWith(';') ? inline : inline + '; ';
                for (const prop of stylePropsToCopy) {
                    if (inline && inline.includes(prop + ':')) continue;
                    const val = cs.getPropertyValue(prop);
                    if (val && val !== 'none' && val !== '0px' && val !== 'normal' && val !== 'initial' && val !== 'auto') {
                        s += `${prop}: ${val}; `;
                    }
                }
                ['border-top', 'border-right', 'border-bottom', 'border-left'].forEach(p => {
                    s += `${p}: ${cs.getPropertyValue(p)}; `;
                });
                return s;
            }

            function getAttrs(el) {
                const attrs = {};
                const tag = el.tagName.toLowerCase();
                const importantAttrs = {
                    'img': ['src', 'alt', 'title'], 'a': ['href', 'target'],
                    'input': ['type', 'name', 'value', 'placeholder'],
                    'iframe': ['src', 'title'], 'video': ['src', 'controls', 'poster']
                };
                ['id', 'class', 'title', ...(importantAttrs[tag] || [])].forEach(attr => {
                    const v = el.getAttribute(attr);
                    if (v !== null) attrs[attr] = v;
                });
                Array.from(el.attributes).forEach(a => {
                    if (a.name.startsWith('data-')) attrs[a.name] = a.value;
                });
                return attrs;
            }

            const mainContainer = document.body;
            const containerRect = mainContainer.getBoundingClientRect();
            const elements = Array.from(mainContainer.querySelectorAll('*:not(script, style, meta, link, title)'));
            const elementsData = [];
            const processed = new Set();

            elements.forEach((el, index) => {
                if (processed.has(el)) return;
                const style = window.getComputedStyle(el);
                if (style.visibility === 'hidden' || style.display === 'none' || style.opacity === '0') return;
                const rect = el.getBoundingClientRect();
                if (rect.width === 0 && rect.height === 0) return;

                const tag = el.tagName.toLowerCase();
                let content = '';

                // SVG: capture whole thing
                if (tag === 'svg') {
                    content = el.outerHTML;
                    el.querySelectorAll('*').forEach(c => processed.add(c));
                    processed.add(el);
                }
                // Div with direct SVG child
                else if (tag === 'div' && Array.from(el.children).some(c => c.tagName.toLowerCase() === 'svg')) {
                    content = el.innerHTML;
                    el.querySelectorAll('*').forEach(c => processed.add(c));
                    processed.add(el);
                }
                // Complex blocks
                else if (['ul', 'ol', 'table', 'figure'].includes(tag)) {
                    content = el.innerHTML;
                    el.querySelectorAll('*').forEach(c => processed.add(c));
                }
                // Skip if inside complex block
                else if (['li', 'td', 'th', 'tr', 'thead', 'tbody', 'figcaption'].includes(tag)) {
                    return;
                }
                // Text blocks
                else if (['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'a', 'button'].includes(tag)) {
                    content = el.innerHTML;
                    el.querySelectorAll('*').forEach(c => processed.add(c));
                }
                // Inline elements - skip (handled by parent)
                else if (['span', 'strong', 'b', 'em', 'i', 'u', 'mark', 'small', 'code', 'sub', 'sup'].includes(tag)) {
                    return;
                }
                // Self-closing
                else if (['img', 'input', 'br', 'hr', 'iframe', 'video'].includes(tag)) {
                    content = '';
                }
                // Div: check content
                else if (tag === 'div') {
                    const onlyInline = Array.from(el.childNodes).every(n =>
                        n.nodeType === Node.TEXT_NODE ||
                        (n.nodeType === Node.ELEMENT_NODE && ['span', 'strong', 'b', 'em', 'i', 'u', 'br'].includes(n.tagName.toLowerCase()))
                    );
                    if (onlyInline) {
                        content = el.innerHTML;
                        el.querySelectorAll('span, strong, b, em, i, u').forEach(c => processed.add(c));
                    }
                }

                elementsData.push({
                    tagName: tag === 'svg' ? 'div' : tag,
                    rect: { width: rect.width, height: rect.height },
                    style: getVisualStyles(el),
                    attributes: getAttrs(el),
                    content,
                    index,
                    relativeX: rect.left - containerRect.left,
                    relativeY: rect.top - containerRect.top,
                    zIndex: 100 + index
                });
                processed.add(el);
            });

            // Filter empty divs
            const filtered = elementsData.filter(el => {
                if (el.tagName !== 'div') return true;
                if (el.content && el.content.trim()) return true;
                const s = el.style.toLowerCase();
                return (s.includes('background-color') && !s.includes('rgba(0, 0, 0, 0)') && !s.includes('transparent')) ||
                    (s.includes('background-image') && !s.includes('none')) ||
                    (s.includes('box-shadow') && !s.includes('box-shadow: none'));
            });

            const svgDefsEl = document.querySelector('svg[width="0"][height="0"]');
            const bodyStyle = window.getComputedStyle(document.body);
            const bg = (bodyStyle.backgroundImage && bodyStyle.backgroundImage !== 'none') ? bodyStyle.background : bodyStyle.backgroundColor;

            return {
                svgDefsHtml: svgDefsEl ? svgDefsEl.outerHTML : '',
                bodyBg: bg,
                contentBlock: { width: containerRect.width, height: containerRect.height },
                elements: filtered
            };
        });

        if (!pageData || pageData.elements.length === 0) {
            throw new Error("No visible elements found.");
        }
        console.log(`[JS] ✅ Analyzed ${pageData.elements.length} elements.`);

        // Build output HTML
        let html = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>Converted</title>${inputHeadHtml}<style>
*{box-sizing:border-box;}
html{width:1920px;height:1080px;}
body{margin:0;padding:0;background:${pageData.bodyBg};overflow:hidden;}
.outer-wrapper{width:1920px;height:1080px;overflow:hidden;}
.content-wrapper{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%) scale(var(--scale,1));transform-origin:center center;width:${pageData.contentBlock.width}px;height:${pageData.contentBlock.height}px;overflow:visible;background:inherit;}
</style></head><body>${pageData.svgDefsHtml}<div class="outer-wrapper"><div class="content-wrapper">
`;

        pageData.elements.sort((a, b) => a.index - b.index).forEach(data => {
            const styleContent = data.style.replace(/z-index\s*:\s*[^;]+;?/g, '').replace(/'/g, '&#39;');
            let finalStyle = `position:absolute;z-index:${data.zIndex};left:${data.relativeX}px;top:${data.relativeY}px;width:${data.rect.width}px;height:${data.rect.height}px;box-sizing:border-box;${styleContent}`;

            if (data.tagName === 'img') {
                finalStyle = finalStyle.replace(/\bwidth\s*:\s*[^;]+;?\s*/gi, '').replace(/\bheight\s*:\s*[^;]+;?\s*/gi, '');
                finalStyle = `position:absolute;z-index:${data.zIndex};left:${data.relativeX}px;top:${data.relativeY}px;width:${data.rect.width}px;height:${data.rect.height}px;object-fit:cover;box-sizing:border-box;${styleContent}`;
            }

            let attrs = '';
            for (const k in data.attributes) {
                attrs += ` ${k}="${String(data.attributes[k]).replace(/"/g, '&quot;')}"`;
            }

            const selfClosing = ['img', 'input', 'br', 'hr', 'iframe'];
            if (selfClosing.includes(data.tagName)) {
                html += `  <${data.tagName} style='${finalStyle}'${attrs}>\n`;
            } else {
                html += `  <${data.tagName} style='${finalStyle}'${attrs}>${data.content}</${data.tagName}>\n`;
            }
        });

        html += `</div></div><script>
(function(){function r(){var w=document.querySelector('.content-wrapper');if(!w)return;var s=Math.min(window.innerWidth/w.offsetWidth,window.innerHeight/w.offsetHeight);w.style.setProperty('--scale',s);}window.addEventListener('resize',r);window.addEventListener('DOMContentLoaded',r);})();
</script></body></html>`;

        fs.writeFileSync(outputPath, html);
        console.log(`[JS] ✨ Success! Output: ${outputPath}`);

    } catch (error) {
        console.error('[JS] ❌ Error:', error);
        process.exit(1);
    } finally {
        await browser.close();
    }
}

/**
 * CLI
 */
if (process.argv.length < 4) {
    console.error("Usage: node converter.js input.html output.html");
    process.exit(1);
}

convertHtmlToAbsolute(process.argv[2], process.argv[3]).catch(err => {
    console.error("❌ Conversion failed:", err);
    process.exit(1);
});
