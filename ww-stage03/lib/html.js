export function htmlEscape(value){return String(value??'').replace(/[&<>\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));}
export function countTag(html,tag){return(String(html).match(new RegExp(`<${tag}\\b`,'gi'))||[]).length;}
export function wordCount(html){return String(html).replace(/<[^>]+>/g,' ').replace(/&[a-z0-9#]+;/gi,' ').trim().split(/\s+/).filter(Boolean).length;}
export function extractInternalLinks(html){const links=[];for(const match of String(html).matchAll(/href=["']([^"']+)["']/gi)){const raw=match[1];if(raw.startsWith('/'))links.push(`https://wattwheelz.com${raw}`);else{try{const url=new URL(raw);if(url.hostname==='wattwheelz.com')links.push(url.href);}catch{}}}return[...new Set(links)];}
