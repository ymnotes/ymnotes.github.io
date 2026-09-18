import {spawnSync} from 'node:child_process';
import {mkdir,writeFile,cp,rm,readFile} from 'node:fs/promises';
import {home,listing,article,missing,escape} from './render.mjs';
const base=process.env.CONTENT_EXPORT_URL;
const token=process.env.CONTENT_EXPORT_TOKEN;
const snapshotPath=process.env.CONTENT_SNAPSHOT;
const snapshot=snapshotPath?JSON.parse(await readFile(snapshotPath,'utf8')):null;
if(!snapshot&&(!base||!token))throw Error('Missing content export credentials. Existing published site is preserved.');
if(!snapshot&&new URL(base).protocol!=='https:')throw Error('HTTPS export required');
async function read(params={}) {
 if(snapshot){if(params.cursor)throw Error('Snapshot must contain the entire library');if(params.id){const detail=snapshot.articles.find(r=>r.id===params.id);if(!detail)throw Error('Incomplete snapshot');return detail;}return snapshot.list;}
 const url=new URL(base);Object.entries(params).forEach(([k,v])=>url.searchParams.set(k,v));
 for(let i=0;i<3;i++) {
  // curl uses the desktop network configuration. Keep the credential in
  // memory only; never write it to a file or return upstream bodies in errors.
  const result=spawnSync('curl',['--header','OAI-Sites-Authorization: Bearer '+token,'--silent','--show-error','--max-time','90','--write-out','\\n%{http_code}',url.href],{encoding:'utf8',maxBuffer:10*1024*1024});
  if(result.status!==0)throw Error('Content export network failure; existing site preserved.');
  const split=result.stdout.lastIndexOf('\n');const status=Number(result.stdout.slice(split+1));
  if(status===200)return JSON.parse(result.stdout.slice(0,split));
  if(i<2&&[409,429,502,503,504].includes(status)){await new Promise(r=>setTimeout(r,3000*(i+1)));continue;}
  throw Error('Content export failed: HTTP '+status+' (no deployment was made)');
 }
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
