import assert from 'node:assert/strict';
import {coverIdentity,assertUniqueArticleCover} from '../lib/cover-uniqueness.js';

const original='https://cdn.shopify.com/s/files/1/store/files/fold6.webp?v=1';
const copied='https://cdn.shopify.com/s/files/1/store/articles/fold6_1ab166fb-adde-4c14-9b14-d64b3c8e54b5.webp?v=2';
assert.equal(coverIdentity(copied),'fold6.webp');
const article={id:'gid://shopify/Article/2',handle:'new-guide',image:{url:original}};
const duplicate={id:'gid://shopify/Article/1',handle:'existing-guide',image:{url:copied}};
await assert.rejects(
 ()=>assertUniqueArticleCover({},article,async()=>({articles:{nodes:[duplicate],pageInfo:{hasNextPage:false}}}),{}),
 /cover is already used by article "existing-guide"/
);
let count=0;
const gql=async(_auth,_query,{after})=>{
 count++;
 return after?{articles:{nodes:[{id:article.id,handle:article.handle,image:{url:original}}],pageInfo:{hasNextPage:false}}}:{articles:{nodes:[{id:'gid://shopify/Article/1',handle:'unrelated',image:{url:'https://cdn.shopify.com/s/files/1/store/articles/other.webp'}}],pageInfo:{hasNextPage:true,endCursor:'next'}}};
};
await assertUniqueArticleCover({},article,gql,{});
assert.equal(count,2);
await assert.rejects(
 ()=>assertUniqueArticleCover({}, {id:article.id,handle:article.handle,image:{url:''}}, gql, {}),
 /no verifiable editorial cover/
);
console.log('Stage 03 duplicate featured-image publishing gate: passed');
