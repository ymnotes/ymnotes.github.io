const p=new URLSearchParams(location.search);const type=p.get('type');const tag=p.get('tag');let count=0;
for(const el of document.querySelectorAll('.journal-entry')){const show=(!type||el.dataset.type===type)&&(!tag||JSON.parse(el.dataset.tags).includes(tag));el.hidden=!show;if(show)count++;}
document.querySelector('#empty').hidden=count>0;
document.querySelector('#list-heading').textContent=type||'全部记录';
document.querySelector('#list-index').textContent='['+({'随想':'THOUGHTS','文章':'ARTICLES','收藏':'COLLECTION','作品':'PROJECTS'}[type]||'ALL NOTES')+']';
for(const el of document.querySelectorAll('[data-category]')){if(el.dataset.category===(type||'全部')){el.classList.add('active');el.setAttribute('aria-current','page');}}
if(tag){const box=document.querySelector('#tag-filter');box.hidden=false;box.append(document.createTextNode('标签：#'+tag+' '));const a=document.createElement('a');a.textContent='清除筛选 ×';a.href='/notes/?'+new URLSearchParams(type?{type}:{});box.append(a);}
