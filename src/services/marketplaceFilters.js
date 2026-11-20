const norm = value => String(value ?? '').trim().toLowerCase();
export function filterServices(services, {search='',city='',category='',sort='',maxPrice=''}={}) {
  return services.filter(s => (!category || s.category_id===category) && norm([s.service_title,s.service_description,s.category_name,s.provider_name].join(' ')).includes(norm(search)) && norm(s.city).includes(norm(city)) && (maxPrice==='' || (Number.isFinite(Number(s.price)) && Number(s.price)<=Number(maxPrice)))).sort((a,b)=>sort==='low'?Number(a.price)-Number(b.price):sort==='high'?Number(b.price)-Number(a.price):0);
}
export function paginate(items,page,size=12) { return items.slice((page-1)*size,page*size); }
