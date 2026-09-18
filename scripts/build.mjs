import {mkdir,writeFile,cp,rm,readFile} from 'node:fs/promises';
import {home,listing,article,missing,escape} from './render.mjs';
const snapshotPath=process.env.CONTENT_SNAPSHOT;
if(!snapshotPath)throw Error('Provide a complete, published-only local snapshot. This builder does not accept credentials.');
const snapshot=JSON.parse(await readFile(snapshotPath,'utf8'));
if(!snapshot.list || !Array.isArray(snapshot.articles) || snapshot.list.next)throw Error('Incomplete snapshot; existing website preserved.');
async function read(params={}) {
 if(params.cursor)throw Error('Snapshot must contain the entire library');
 if(params.id){const detail=snapshot.articles.find(r=>r.id===params.id);if(!detail)throw Error('Incomplete snapshot');return detail;}
 return snapshot.list;
}
let cursor,site;const entries=[];const seen=new Set();do{const d=await read(cursor?{cursor}:{});if(d.version!==1||!Array.isArray(d.entries))throw Error('Invalid export response');site={name:d.name||'ymnotes',bio:d.bio||''};for(const r of d.entries){if(!/^[a-f0-9-]{32,36}$/i.test(r.id))throw Error('Invalid content ID');if(!seen.has(r.id)){entries.push(r);seen.add(r.id);}}cursor=d.next;if(entries.length>10000)throw Error('Export too large');}while(cursor);
const articles=[];for(const row of entries){const detail=await read({id:row.id});if(!Array.isArray(detail.blocks))throw Error('Incomplete article');articles.push(detail);}
// Assemble output only after every Notion request succeeds. No secrets or source
// payloads are copied into the artifact, and each deployment replaces old pages.
await rm('_site',{recursive:true,force:true});await mkdir('_site/notes',{recursive:true});await cp('assets','_site/assets',{recursive:true});
await writeFile('_site/index.html',home(site));await writeFile('_site/notes/index.html',listing(site,articles));await writeFile('_site/404.html',missing(site));await writeFile('_site/.nojekyll','');
for(const r of articles){await mkdir('_site/notes/'+r.id,{recursive:true});await writeFile('_site/notes/'+r.id+'/index.html',article(site,r));}
await writeFile('_site/robots.txt','User-agent: *\nAllow: /\nSitemap: https://ymnotes.github.io/sitemap.xml\n');
await writeFile('_site/sitemap.xml','<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+['/','/notes/',...articles.map(r=>'/notes/'+r.id+'/')].map(p=>'<url><loc>'+escape('https://ymnotes.github.io'+p)+'</loc></url>').join('')+'</urlset>');
console.log('Built '+articles.length+' published notes.');
