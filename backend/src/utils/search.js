
function parseQuery(q=''){
  const tokens = q.split(/\s+/).filter(Boolean);
  const out = { text: [], tags: [], language: '', favorite: null, before: null, after: null };
  for(const t of tokens){
    const [k,...rest] = t.split(':');
    const v = rest.join(':'); // supports values with : inside
    if (k==='tag') out.tags.push(v);
    else if (k==='lang' || k==='language') out.language = v;
    else if (k==='fav' || k==='favorite') out.favorite = v==='true' || v==='1' || v==='yes';
    else if (k==='before') out.before = v;
    else if (k==='after') out.after = v;
    else out.text.push(t);
  }
  return out;
}
module.exports = { parseQuery };
