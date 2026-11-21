import assert from 'node:assert/strict';
const base='http://127.0.0.1:5173';
let cookie='';
async function call(path,options={}){return fetch(base+path,{...options,headers:{...(cookie?{cookie}:{}),...options.headers}});}
assert.equal((await call('/api/bookings')).status,401);
const login=await call('/signin-with-chatgpt?return_to=%2F',{redirect:'manual'});
cookie=login.headers.getSetCookie().map(x=>x.split(';')[0]).join('; ');
assert.ok(cookie);
const b={primaryName:'API Test Guest',phone:'9999999999',email:'',property:'Disposable test cottage',rooms:2,roomNumbers:'101,102',checkIn:'2026-12-01',checkInTime:'14:00',checkOut:'2026-12-03',checkOutTime:'11:00',guestCount:1,guests:[{id:crypto.randomUUID(),name:'API Test Guest',age:30,gender:'',address:'Test address only',idType:'Other',consent:true}],source:'Direct',reference:'AUTOMATED-TEST',arrivingFrom:'Test City',purpose:'Leisure',notes:'Disposable integration test',total:10000,paid:4000,paymentMethod:'UPI',status:'Confirmed',cleaning:'Ready'};
async function post(v){return call('/api/bookings',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(v)});}
assert.equal((await post({...b,paid:11000})).status,400);
assert.equal((await post({...b,guestCount:2})).status,400);
assert.equal((await post({...b,checkOut:'2026-11-01'})).status,400);
const r=await post(b);assert.equal(r.status,200);const saved=await r.json();
try{
const list=await(await call('/api/bookings')).json();assert.ok(list.some(x=>x.id===saved.id));
assert.equal((await post({...saved,status:'Checked in'})).status,200);
const f=new FormData();f.append('booking',saved.id);f.append('guest',b.guests[0].id);f.append('file',new File(['%PDF-1.4\n% test file, no personal data\n%%EOF'], 'test-document.pdf',{type:'application/pdf'}));
const upload=await call('/api/documents',{method:'POST',body:f});assert.equal(upload.status,200);const doc=await upload.json();
const download=await call('/api/documents?id='+doc.id);assert.equal(download.status,200);assert.match(await download.text(),/%PDF-1.4/);
const denied=await fetch(base+'/api/documents?id='+doc.id);assert.equal(denied.status,401);
assert.equal((await call('/api/documents?id='+doc.id,{method:'DELETE'})).status,200);
assert.equal((await call('/api/documents?id='+doc.id)).status,404);
assert.equal((await post({...saved,id:crypto.randomUUID()})).status,404);
console.log('PASS: unauthorized access, validation, create/read/update, document upload/download/delete, missing-record protection.');
}finally{assert.equal((await call('/api/bookings?id='+saved.id,{method:'DELETE'})).status,200);}
console.log('PASS: booking deletion and test cleanup.');