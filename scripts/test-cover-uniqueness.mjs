import assert from 'node:assert/strict';
import {coverIdentity,registerCover,coverIsUnique,selectUniqueCoverImage,loadCoverInventory} from '../lib/cover-uniqueness.js';

const original='https://cdn.shopify.com/s/files/1/store/files/fold6.webp?v=1';
const articleCopy='https://cdn.shopify.com/s/files/1/store/articles/fold6_f3300388-ac0e-4864-89e8-4b163286ed9d.webp?v=2';
const stacked='https://cdn.shopify.com/s/files/1/store/articles/blue16_12ee6476-bee1-45f9-a611-6c675e0e2f9f_f3300388-ac0e-4864-89e8-4b163286ed9d.png';
assert.equal(coverIdentity(original),'fold6.webp');
assert.equal(coverIdentity(articleCopy),'fold6.webp');
assert.equal(coverIdentity(stacked),'blue16.png');
assert.equal(coverIdentity('invalid-url'),'');

const usage=new Map();
registerCover(usage,articleCopy,'published-a');
assert.equal(coverIsUnique(original,usage,'another-b'),false);
assert.equal(coverIsUnique(original,usage,'published-a'),true);
const chosen=selectUniqueCoverImage([
 {url:original,width:1024,height:672},
 {url:'https://cdn.shopify.com/s/files/1/store/files/fold3.webp',width:1024,height:668}
],usage,'new-b');
assert.equal(coverIdentity(chosen.url),'fold3.webp');
assert.throws(()=>selectUniqueCoverImage([{url:original}],usage,'new-b'),/No distinctive unused catalog cover/);

let calls=0;
const fakeGql=async (_auth,_query,{after})=>{
 calls++;
 if(after===null)return{articles:{nodes:[{handle:'a',image:{url:articleCopy}}],pageInfo:{hasNextPage:true,endCursor:'next'}}};
 if(after==='next')return{articles:{nodes:[{handle:'b',image:{url:stacked}}],pageInfo:{hasNextPage:false,endCursor:null}}};
 throw Error('Unknown cursor');
};
const loaded=await loadCoverInventory({shop:'test.myshopify.com'},fakeGql);
assert.equal(calls,2);
assert.equal(coverIsUnique(original,loaded,'c'),false);
assert.equal(coverIsUnique('https://cdn.shopify.com/s/files/1/store/files/blue16.png',loaded,'c'),false);
console.log('WattWheelz cover-source uniqueness: 9 assertions passed');
