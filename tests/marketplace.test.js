import {test} from 'node:test';
import assert from 'node:assert/strict';
import {filterServices,paginate} from '../src/services/marketplaceFilters.js';
const rows=[{service_title:'AC repair',city:'Kanpur',category_id:'a',price:800},{service_title:'Plumbing',city:'Azamgarh',category_id:'b',price:499}];
test('case insensitive search',()=>assert.deepEqual(filterServices(rows,{search:' AC REPAIR '}),[rows[0]]));
test('combined filters',()=>assert.deepEqual(filterServices(rows,{city:'azam',category:'b',maxPrice:'500'}),[rows[1]]));
test('sort without mutating original',()=>{assert.deepEqual(filterServices(rows,{sort:'low'}),[rows[1],rows[0]]);assert.equal(rows[0].price,800)});
test('pagination',()=>assert.deepEqual(paginate(rows,2,1),[rows[1]]));
