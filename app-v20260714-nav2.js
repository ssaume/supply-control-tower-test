const TODAY = '2026-07-14';

const regions = [
  { id:'TW', name:'台灣', factories:[['TW01','桃園一廠'],['TW02','新竹二廠'],['TW03','台中三廠'],['TW04','台南四廠']] },
  { id:'CN', name:'中國', factories:[['CN01','上海一廠'],['CN02','蘇州二廠'],['CN03','昆山三廠'],['CN04','深圳四廠'],['CN05','成都五廠'],['CN06','重慶六廠']] },
  { id:'TH', name:'泰國', factories:[['TH01','曼谷一廠'],['TH02','春武里二廠'],['TH03','羅勇三廠'],['TH04','大城四廠'],['TH05','巴吞他尼五廠'],['TH06','北欖六廠'],['TH07','巴真武里七廠'],['TH08','清邁八廠']] }
];

const factoryLookup = Object.fromEntries(regions.flatMap(r => r.factories.map(([id,name]) => [id,{id,name,region:r.id,regionName:r.name}])));
const allFactories = regions.flatMap(r => r.factories.map(([id]) => id));

const productTypes = [
  {key:'UPS',name:'UPS不斷電系統',family:'電源系統',factories:['TW01','CN01','TH01']},
  {key:'EPS',name:'嵌入式電源供應器',family:'電源系統',factories:['TW01','CN01','TH01']},
  {key:'TRF',name:'變壓器',family:'電源系統',factories:['TW01','CN03','TH06']},
  {key:'RTR',name:'路由器',family:'資通訊',factories:['TW02','CN04','TH07']},
  {key:'FAN',name:'散熱風扇模組',family:'熱管理與馬達',factories:['TW03','CN05','TH04']},
  {key:'BLM',name:'直流無刷馬達',family:'熱管理與馬達',factories:['TW03','CN05','TH04']},
  {key:'OBC',name:'車載充電器',family:'車用電力電子',factories:['TW04','CN02','TH03']},
  {key:'DCDC',name:'直流電能轉換器',family:'車用電力電子',factories:['TW04','CN02','TH03']},
  {key:'INV',name:'牽引逆變器',family:'電動車動力',factories:['TW04','CN06','TH03']},
  {key:'EDM',name:'電動車驅動馬達',family:'電動車動力',factories:['TW03','CN06','TH03']},
  {key:'MCU',name:'馬達控制器',family:'電動車動力',factories:['TW04','CN06','TH03']},
  {key:'EVSE',name:'直流/交流電動車充電樁設備',family:'充電基礎設施',factories:['TW04','CN02','TH05']},
  {key:'VFD',name:'變頻器',family:'工業自動化',factories:['TW02','CN03','TH02']},
  {key:'PLC',name:'PLC控制器',family:'工業自動化',factories:['TW02','CN03','TH02']},
  {key:'LED',name:'LED 照明模組',family:'照明',factories:['TW02','CN05','TH08']},
  {key:'SOL',name:'太陽能逆變器',family:'新能源',factories:['TW01','CN01','TH05']},
  {key:'ESS',name:'儲能系統（ESS）',family:'新能源',factories:['TW01','CN01','TH05']},
  {key:'MGC',name:'微電網控制器',family:'新能源',factories:['TW02','CN01','TH05']},
  {key:'FAS',name:'新風系統',family:'樓宇自動化',factories:['TW03','CN05','TH04']},
  {key:'CAM',name:'安控攝影機',family:'影像與安控',factories:['TW02','CN04','TH07']},
  {key:'PRJ',name:'投影機',family:'影像與安控',factories:['TW02','CN04','TH08']}
];

const productLookup = Object.fromEntries(productTypes.map(p => [p.key,p]));
const factoryProducts = Object.fromEntries(allFactories.map(f => [f,productTypes.filter(p => p.factories.includes(f))]));

function buildBom(product, sku, seed){
  const powerFamilies = ['電源系統','車用電力電子','電動車動力','充電基礎設施','新能源'];
  const isPower = powerFamilies.includes(product.family);
  const depth = 3 + seed % 3;
  const sourcePlant = product.factories[(seed + 1) % product.factories.length];
  const smtPlant = product.factories[(seed + 2) % product.factories.length];
  const root = {id:sku,name:`${product.name} 成品`,type:'fg',source:'自製',children:[
    {id:`${sku}-MOD01`,name:isPower?'功率轉換模組':'主控運算模組',type:'module',source:`友廠模組｜${sourcePlant}`,children:[
      {id:`${sku}-PCB01`,name:'主控制板 PCBA',type:'smt',source:`友廠SMT｜${smtPlant}`,children:[
        {id:`${sku}-IC01`,name:isPower?'功率半導體／控制IC':'SoC／記憶體',type:'external',source:'外部供應商'},
        {id:`${sku}-PCBRAW`,name:'裸板與被動元件',type:'external',source:'外部供應商'}
      ]},
      {id:`${sku}-FW01`,name:'韌體與參數包',type:'internal',source:'研發版本庫'}
    ]},
    {id:`${sku}-MEC01`,name:isPower?'散熱與機構總成':'機構與光學總成',type:'module',source:'外購模組',children:[
      {id:`${sku}-CASE`,name:'機箱／外殼',type:'external',source:'外部供應商'},
      {id:`${sku}-THERM`,name:'散熱器／風扇',type:'external',source:'外部供應商'}
    ]},
    {id:`${sku}-PKG`,name:'包材與附件',type:'external',source:'在地供應商'}
  ]};
  if(depth >= 5){
    root.children[0].children[0].children[0].children = [
      {id:`${sku}-WAFER`,name:'晶圓／核心Die',type:'external',source:'半導體供應商'}
    ];
  }
  return root;
}

const productCatalog = productTypes.flatMap((p,idx) => {
  const count = 3 + idx % 4;
  return Array.from({length:count},(_,i) => {
    const sku = `${p.key}-${String(100+i+idx%7).padStart(3,'0')}`;
    const factory = p.factories[i % p.factories.length];
    return {sku,productKey:p.key,product:p.name,family:p.family,factory,bom:buildBom(p,sku,idx+i)};
  });
});
const skuLookup = Object.fromEntries(productCatalog.map(x => [x.sku,x]));

const customers = [
  {name:'Formosa Data Center',region:'TW',country:'台灣',city:'台北'},
  {name:'Pacific Telecom',region:'TW',country:'台灣',city:'高雄'},
  {name:'Dragon Cloud',region:'CN',country:'中國',city:'上海'},
  {name:'Shenzhen Mobility',region:'CN',country:'中國',city:'深圳'},
  {name:'Siam Energy',region:'TH',country:'泰國',city:'曼谷'},
  {name:'Thai Automotive',region:'TH',country:'泰國',city:'羅勇'},
  {name:'EuroGrid GmbH',region:'EU',country:'德國',city:'漢堡'},
  {name:'NorthStar Systems',region:'US',country:'美國',city:'達拉斯'},
  {name:'Sakura Automation',region:'JP',country:'日本',city:'名古屋'},
  {name:'ASEAN Distribution',region:'SG',country:'新加坡',city:'新加坡'}
];

function hashText(text){ return [...String(text)].reduce((a,c) => ((a*31 + c.charCodeAt(0)) >>> 0), 7); }
function productForFactory(factory,index=0){
  const products = factoryProducts[factory];
  const p = products[index % products.length];
  const skus = productCatalog.filter(x => x.productKey===p.key && x.factory===factory);
  const fallback = productCatalog.filter(x => x.productKey===p.key);
  return (skus.length?skus:fallback)[index % (skus.length||fallback.length)];
}

function buildDemandEvents(){
  const events=[];
  let serial=1;
  const addEvent=data=>{
    const event={
      id:`DE-${String(serial++).padStart(4,'0')}`,
      parentEventId:'',rootEventId:'',childEventIds:[],originMode:'',purpose:'',remainingQty:null,
      customer:'',destinationRegion:'',destinationCountry:'',destinationCity:'',soNo:'',shippingStatus:'',incoterm:'',transportMode:'',
      ...data
    };
    event.rootEventId=event.rootEventId||event.id;
    events.push(event);
    return event;
  };
  const link=(parent,child)=>{parent.childEventIds=[...(parent.childEventIds||[]),child.id];child.parentEventId=parent.id;child.rootEventId=parent.rootEventId||parent.id;};
  const poStatus=(fi,seed)=>(fi+seed)%3===0?'已轉內部SO':'已確認';
  const assignSo=(event,fi,seed)=>{
    if(event.status!=='已轉內部SO')return;
    event.soNo=`SO-${event.factory}-${String(88000+fi*20+seed).slice(-5)}`;
    event.shippingStatus=['備料中','待出貨','已出貨','延遲風險'][(fi+seed)%4];
  };
  const makeCustomerPo=({factory,fi,parent,item,customer,qty,demandDate,originMode,seed})=>{
    const po=addEvent({
      batchId:`PO-${factory}-${String(fi*10+seed+1).padStart(3,'0')}`,
      region:factoryLookup[factory].region,factory,source:'客戶PO',status:poStatus(fi,seed),
      demandDate,customer:customer.name,destinationRegion:customer.region,destinationCountry:customer.country,destinationCity:customer.city,
      productKey:item.productKey,product:item.product,sku:item.sku,qty,priority:originMode==='緊急詢單轉單'?1:2,
      createdDate:shiftDate(TODAY,-((fi+seed)%7)),originMode,purpose:'正式客戶訂單'
    });
    link(parent,po);assignSo(po,fi,seed);return po;
  };

  allFactories.forEach((factory,fi)=>{
    const region=factoryLookup[factory].region;
    const localCustomer=customers.find(c=>c.region===region);
    const exportCustomer=customers[(fi*2+6)%customers.length];
    const customerA=fi%2===0?localCustomer:exportCustomer;
    const customerB=customers[(fi*3+7)%customers.length];
    const customerC=customers[(fi*5+8)%customers.length];

    // 關係鏈一：客戶預測 → 客戶 PO（完整轉換）
    const itemA=productForFactory(factory,fi);
    const qtyA=1800+((fi+2)*617)%7600;
    const dateA=shiftDate('2026-07-24',fi*2);
    const forecastConverted=fi%4!==1;
    const forecast=addEvent({
      batchId:`FCST-${factory}-001`,region,factory,source:'客戶預測',status:forecastConverted?'已轉換':(fi%2?'已確認':'待確認'),
      demandDate:dateA,productKey:itemA.productKey,product:itemA.product,sku:itemA.sku,qty:qtyA,priority:3,
      createdDate:shiftDate(TODAY,-(fi%8)),purpose:'客戶需求預測（尚未形成正式訂單）',
      prospectCustomer:customerA.name,prospectRegion:customerA.region,prospectCountry:customerA.country,prospectCity:customerA.city
    });
    if(forecastConverted)makeCustomerPo({factory,fi,parent:forecast,item:itemA,customer:customerA,qty:qtyA,demandDate:dateA,originMode:'預測完整轉換',seed:1});

    // 關係鏈二：內部預測 → 計畫庫存
    const itemB=productForFactory(factory,fi+2);
    const qtyB=1200+((fi+4)*431)%6200;
    const dateB=shiftDate('2026-08-05',fi*2+4);
    const stockCreated=fi%5!==2;
    const internalForecast=addEvent({
      batchId:`IFC-${factory}-001`,region,factory,source:'內部預測',status:stockCreated?'已轉換':'已確認',
      demandDate:dateB,productKey:itemB.productKey,product:itemB.product,sku:itemB.sku,qty:qtyB,priority:3,
      createdDate:shiftDate(TODAY,-((fi+2)%8)),purpose:'S&OP內部需求預測'
    });
    if(stockCreated){
      const stock=addEvent({
        batchId:`STK-${factory}-001`,region,factory,source:'計畫庫存',status:'已確認',
        demandDate:dateB,productKey:itemB.productKey,product:itemB.product,sku:itemB.sku,qty:qtyB,remainingQty:qtyB,priority:3,
        createdDate:shiftDate(TODAY,-((fi+1)%7)),originMode:'內部預測轉庫存',purpose:'區域成品安全庫存'
      });
      link(internalForecast,stock);
    }

    // 關係鏈三：緊急詢單 → 客戶 PO
    const itemC=productForFactory(factory,fi+4);
    const qtyC=700+((fi+5)*293)%3800;
    const dateC=shiftDate('2026-07-20',fi+3);
    const inquiryConverted=fi%4!==2;
    const inquiry=addEvent({
      batchId:`RFQ-${factory}-001`,region,factory,source:'緊急詢單',status:inquiryConverted?'已轉換':'已確認',
      demandDate:dateC,productKey:itemC.productKey,product:itemC.product,sku:itemC.sku,qty:qtyC,priority:1,
      createdDate:shiftDate(TODAY,-(fi%5)),purpose:'緊急交期與數量可行性詢問',
      prospectCustomer:customerB.name,prospectRegion:customerB.region,prospectCountry:customerB.country,prospectCity:customerB.city
    });
    if(inquiryConverted)makeCustomerPo({factory,fi,parent:inquiry,item:itemC,customer:customerB,qty:qtyC,demandDate:dateC,originMode:'緊急詢單轉單',seed:3});

    // 關係鏈四：內部預測 → 計畫庫存 → 客戶 PO（消耗計畫庫存）
    const itemD=productForFactory(factory,fi+6);
    const qtyD=2400+((fi+7)*367)%7000;
    const dateD=shiftDate('2026-08-18',fi*2+5);
    const internalForecast2=addEvent({
      batchId:`IFC-${factory}-002`,region,factory,source:'內部預測',status:'已轉換',
      demandDate:dateD,productKey:itemD.productKey,product:itemD.product,sku:itemD.sku,qty:qtyD,priority:3,
      createdDate:shiftDate(TODAY,-((fi+4)%8)),purpose:'區域補庫預測'
    });
    const consumeStock=fi%5!==3;
    const stock2=addEvent({
      batchId:`STK-${factory}-002`,region,factory,source:'計畫庫存',status:consumeStock?'部分消耗':'已確認',
      demandDate:dateD,productKey:itemD.productKey,product:itemD.product,sku:itemD.sku,qty:qtyD,remainingQty:qtyD,priority:3,
      createdDate:shiftDate(TODAY,-((fi+3)%7)),originMode:'內部預測轉庫存',purpose:'可承接客戶PO的計畫庫存'
    });
    link(internalForecast2,stock2);
    if(consumeStock){
      const consumeQty=fi%2===0?qtyD:Math.round(qtyD*.65);
      stock2.remainingQty=qtyD-consumeQty;
      stock2.status=stock2.remainingQty===0?'已被PO消耗':'部分消耗';
      makeCustomerPo({factory,fi,parent:stock2,item:itemD,customer:customerC,qty:consumeQty,demandDate:shiftDate(dateD,-(fi%3)),originMode:'計畫庫存消耗',seed:5});
    }
  });
  return events;
}

const baseDemandEvents = buildDemandEvents();

function demandEventChainFrom(events,d){
  const chain=[];const seen=new Set();let cursor=d;
  while(cursor&&!seen.has(cursor.id)){seen.add(cursor.id);chain.unshift(cursor);cursor=cursor.parentEventId?events.find(x=>x.id===cursor.parentEventId):null;}
  return chain;
}
function changeTitleFor(po,parent){
  if(po.originMode==='預測完整轉換')return '客戶預測轉為正式客戶 PO';
  if(po.originMode==='緊急詢單轉單')return '緊急詢單確認後轉為客戶 PO';
  if(po.originMode==='計畫庫存消耗')return '客戶 PO 消耗既有計畫庫存';
  return `${parent?.source||'需求事件'}轉為正式客戶 PO`;
}
function buildChangeEventFromDemand(events,po,index=0){
  if(!po||po.source!=='客戶PO')return null;
  const parent=events.find(x=>x.id===po.parentEventId);const chain=demandEventChainFrom(events,po);
  const oldQty=parent?.qty??po.qty;const newQty=po.qty;const oldDate=parent?.demandDate||po.demandDate;const newDate=po.demandDate;
  const qtyDelta=newQty-oldQty;const days=dateDiff(newDate,oldDate);const freeze=dateDiff(newDate,TODAY)<=14;
  const severity=freeze&&po.priority===1?'red':(freeze||Math.abs(qtyDelta)>oldQty*.25||days<0||po.originMode==='計畫庫存消耗')?'yellow':'green';
  const workflowStatus=po.status==='已轉內部SO'?'已核准':severity==='red'?'待決策':index%3===0?'模擬中':'待評估';
  const chainLabel=chain.map(x=>x.source).join(' → ');
  const stockText=po.originMode==='計畫庫存消耗'&&parent?`原計畫庫存 ${Number(parent.qty).toLocaleString('zh-TW')} 件，客戶 PO 消耗 ${Number(po.qty).toLocaleString('zh-TW')} 件，目前剩餘 ${Number(parent.remainingQty??0).toLocaleString('zh-TW')} 件。`:'';
  return {
    id:`CE-${po.id}`,region:po.region,factory:po.factory,customer:po.customer||'尚無正式客戶',model:po.sku,product:po.product,
    source:'客戶PO',originSource:parent?.source||'需求來源',originMode:po.originMode||'',title:changeTitleFor(po,parent),
    oldQty,newQty,oldDate,newDate,oldPriority:parent?.priority||3,priority:po.priority||2,
    revenue:Math.round(newQty*.42),impactRevenue:Math.max(120,Math.round((Math.abs(qtyDelta)+newQty*.08)*.42)),
    severity,status:workflowStatus,freeze,
    reason:`需求總覽中的 ${parent?.id||'上游事件'} 已轉換為 ${po.id}。${stockText||`轉換方式為「${po.originMode||chainLabel}」，需重新確認產能、物料與交付承諾。`}`,
    owner:['陳建宏','林怡君','王磊','Narin S.','Kanya P.'][index%5],ownerDept:['供應鏈規劃','工廠生管','區域計畫','採購管理','專案管理'][index%5],
    versionFrom:`V${String(20+index).padStart(2,'0')}`,versionTo:`V${String(21+index).padStart(2,'0')}`,
    demandEventId:po.id,upstreamEventId:parent?.id||'',rootDemandEventId:po.rootEventId||chain[0]?.id||po.id,
    relationChain:chainLabel,sourceDemandStatus:parent?.status||'—',targetDemandStatus:po.status,
    destinationCountry:po.destinationCountry,destinationCity:po.destinationCity,batchId:po.batchId
  };
}
function buildChangeEvents(events){
  const pos=events.filter(d=>d.source==='客戶PO');
  return pos.map((po,i)=>buildChangeEventFromDemand(events,po,i)).filter(Boolean);
}

const baseEvents = buildChangeEvents(baseDemandEvents);

const bottleneckTemplates = [
  {id:'B01',type:'capacity',name:'最終組裝線',gap:'240 小時',impactQty:1500,revenue:12000,difficulty:78,impact:88,severity:'red',dept:'製造部',owner:'張志明',options:[
    {id:'overtime',name:'本廠增加加班',desc:'連續6日增開班次。',qty:750,cost:42,days:0,risk:'中'},
    {id:'outsource',name:'友廠代工組裝',desc:'將半成品調至同產品族友廠。',qty:900,cost:58,days:2,risk:'中'},
    {id:'resequence',name:'調整其他客戶順位',desc:'釋放共用產線能力。',qty:1000,cost:8,days:0,risk:'客戶中'}]},
  {id:'B02',type:'material',name:'功率模組／關鍵IC',gap:'700 件',impactQty:700,revenue:3500,difficulty:64,impact:68,severity:'red',dept:'採購部',owner:'陳美玲',options:[
    {id:'expedite',name:'外部供應商加急',desc:'原供應商提前交付。',qty:500,cost:18,days:2,risk:'中'},
    {id:'transfer',name:'友廠模組調撥',desc:'由供應同類模組的友廠空運。',qty:430,cost:25,days:1,risk:'低'},
    {id:'secondSource',name:'第二供應商',desc:'啟動替代供應商。',qty:700,cost:32,days:1,risk:'品質中'}]},
  {id:'B03',type:'smt',name:'SMT 高速線',gap:'36 小時',impactQty:580,revenue:1800,difficulty:42,impact:55,severity:'yellow',dept:'製造工程',owner:'吳家豪',options:[
    {id:'smtOT',name:'友廠SMT加班',desc:'由既有代工友廠增開週末班。',qty:420,cost:16,days:0,risk:'中'},
    {id:'smtSwitch',name:'切換第二SMT工廠',desc:'移轉已共用鋼網與程式的料號。',qty:520,cost:24,days:2,risk:'首件中'}]},
  {id:'B04',type:'labor',name:'特殊技能人力',gap:'18 人日',impactQty:420,revenue:1100,difficulty:48,impact:50,severity:'yellow',dept:'製造工程',owner:'許雅雯',options:[
    {id:'crossTrain',name:'跨廠人員支援',desc:'由相近產品線派遣認證人員。',qty:280,cost:7,days:0,risk:'原線中'},
    {id:'agency',name:'派遣人力',desc:'補充一般作業人力。',qty:190,cost:11,days:1,risk:'訓練中'}]}
];

const trackingBase = [
  {id:'T01',factory:'TW01',item:'UPS組裝加班工時',owner:'張志明',target:'120 小時',actual:'96 小時',reason:'夜班人力到位率80%。',severity:'yellow',action:'調用TW02支援'},
  {id:'T02',factory:'TW04',item:'OBC功率模組到料',owner:'陳美玲',target:'12,600 件',actual:'12,100 件',reason:'友廠模組供應少500件。',severity:'red',action:'啟動第二供應來源'},
  {id:'T03',factory:'CN03',item:'PLC SMT產出',owner:'吳家豪',target:'7,800 件',actual:'7,640 件',reason:'換線時間高於標準。',severity:'yellow',action:'核准週末班'},
  {id:'T04',factory:'TH03',item:'牽引逆變器爬坡',owner:'Narin S.',target:'良率 95%',actual:'93.8%',reason:'新治具參數仍在優化。',severity:'yellow',action:'工程駐線'},
  {id:'T05',factory:'CN04',item:'安控攝影機插單',owner:'王磊',target:'17,600 件',actual:'預估 15,900 件',reason:'主控板SMT尚未取得跨廠支援。',severity:'red',action:'升級區域協調'},
  {id:'T06',factory:'TH05',item:'ESS模組調撥',owner:'Kanya P.',target:'2,800 件',actual:'2,800 件',reason:'已完成跨廠調撥。',severity:'green',action:'無需升級'}
];

function generateSupplyRelations(){
  const externalSuppliers = ['Global Semi','PowerCore Electronics','Asia PCB','ThermalWorks','Precision Mechanics','OptiVision','Local Packaging'];
  const relations=[];
  productCatalog.forEach((item,i)=>{
    const product=productLookup[item.productKey];
    const modulePlant=product.factories[(product.factories.indexOf(item.factory)+1)%product.factories.length];
    const smtPlant=product.factories[(product.factories.indexOf(item.factory)+2)%product.factories.length];
    const weekly=500+(hashText(item.sku)%6200);
    relations.push({id:`R-${item.sku}-E`,sku:item.sku,productKey:item.productKey,type:'external',source:externalSuppliers[i%externalSuppliers.length],destination:item.factory,item:'關鍵電子料／機構料',demand:weekly,supply:Math.round(weekly*(.82+(i%18)/100)),lead:21+i%35});
    relations.push({id:`R-${item.sku}-M`,sku:item.sku,productKey:item.productKey,type:'module',source:modulePlant,destination:item.factory,item:`${item.product}核心模組`,demand:Math.round(weekly*.72),supply:Math.round(weekly*(.62+(i%15)/100)),lead:4+i%8});
    relations.push({id:`R-${item.sku}-S`,sku:item.sku,productKey:item.productKey,type:'smt',source:smtPlant,destination:item.factory,item:'主控制板SMT代工',demand:Math.round(weekly*.88),supply:Math.round(weekly*(.78+(i%14)/100)),lead:3+i%6});
    if(i%3===0) relations.push({id:`R-${item.sku}-T`,sku:item.sku,productKey:item.productKey,type:'transfer',source:modulePlant,destination:item.factory,item:'安全庫存跨廠調撥',demand:Math.round(weekly*.2),supply:Math.round(weekly*.18),lead:2+i%4});
  });
  return relations;
}
const supplyRelations=generateSupplyRelations();

function loadStored(key,fallback){try{const raw=localStorage.getItem(key);return raw?JSON.parse(raw):fallback;}catch{return fallback;}}
function saveStored(key,value){try{localStorage.setItem(key,JSON.stringify(value));}catch{}}
function clearStored(keys){try{keys.forEach(k=>localStorage.removeItem(k));}catch{}}

const state={
  region:'ALL',factory:'ALL',selectedEventId:baseEvents[0].id,selectedTaskId:'B01',selectedScenario:null,
  eventSeverity:'all',eventStatus:'all',trackingFilter:'all',simDimension:'product',simulated:null,
  productionFactory:'TW01',productionHorizon:14,productionResource:'all',
  demandSource:'all',demandStatus:'all',demandHorizon:'all',shipmentTrade:'all',shipmentTransport:'all',shipmentStatus:'all',
  expandedDemandId:'',expandedShipmentId:'',selectedWorkOrderByEvent:{},selectedFulfillmentByEvent:{},fulfillmentViewMode:'tile',
  routeEventId:baseDemandEvents.find(x=>x.source==='客戶PO')?.id||baseDemandEvents[0]?.id||'',routeViewMode:'sequence',
  networkProduct:'all',networkSku:'all',networkRelation:'all',
  sidebarCollapsed:loadStored('ct-sidebar-collapsed-v1',false),
  navGroups:loadStored('ct-nav-groups-v1',{overview:false,approval:false}),
  events:loadStored('ct-events-v4',structuredClone(baseEvents)),
  demandEvents:loadStored('ct-demand-events-v2',structuredClone(baseDemandEvents)),
  tracking:loadStored('ct-tracking-v3',structuredClone(trackingBase)),
  commits:loadStored('ct-commits-v3',{}),decisions:loadStored('ct-decisions-v3',{})
};

const $=s=>document.querySelector(s);
const $$=s=>[...document.querySelectorAll(s)];
const fmt=n=>new Intl.NumberFormat('zh-TW').format(Math.round(Number(n)||0));
const money=n=>`${fmt(n)} 萬`;
const sevLabel={red:'紅燈',yellow:'黃燈',green:'綠燈'};
const sevTag=s=>`<span class="tag ${s==='red'?'danger':s==='yellow'?'warning':'success'}"><i class="signal ${s}"></i>${sevLabel[s]}</span>`;
const sourceClass={'客戶預測':'info','內部預測':'neutral','客戶PO':'success','計畫庫存':'warning','緊急詢單':'danger'};
const statusClass={'待整合':'neutral','待確認':'warning','已確認':'info','已轉換':'success','部分消耗':'warning','已被PO消耗':'neutral','已轉內部SO':'success','已取消':'danger'};

function init(){setupFilters();setupNavigation();setupInteractions();setupNetworkControls();renderAll();setupTour();}

function setupFilters(){
  $('#regionSelect').innerHTML=`<option value="ALL">全球｜18座工廠</option>`+regions.map(r=>`<option value="${r.id}">${r.name}｜${r.factories.length}座工廠</option>`).join('');
  $('#regionSelect').value=state.region;
  $('#regionSelect').addEventListener('change',e=>{state.region=e.target.value;state.factory='ALL';updateFactoryOptions();ensureSelectedEvent();renderAll();});
  updateFactoryOptions();
  $('#factorySelect').addEventListener('change',e=>{state.factory=e.target.value;ensureSelectedEvent();renderAll();});
}
function updateFactoryOptions(){
  const list=state.region==='ALL'?regions.flatMap(r=>r.factories):regions.find(r=>r.id===state.region).factories;
  $('#factorySelect').innerHTML=`<option value="ALL">全部工廠</option>`+list.map(([id,name])=>`<option value="${id}">${id}｜${name}</option>`).join('');
  $('#factorySelect').value=state.factory;
}
function setupNavigation(){
  applySidebarState();
  applyNavGroupState();
  $$('.nav-item').forEach(btn=>btn.addEventListener('click',()=>switchView(btn.dataset.view)));
  $$('.jump-view').forEach(btn=>btn.addEventListener('click',()=>switchView(btn.dataset.target)));
  $$('.nav-group-toggle').forEach(btn=>btn.addEventListener('click',()=>{
    const group=btn.closest('.nav-group');
    const key=group?.dataset.navGroup;
    if(!key)return;
    state.navGroups[key]=!state.navGroups[key];
    saveStored('ct-nav-groups-v1',state.navGroups);
    applyNavGroupState();
  }));
  $('#sidebarCollapse')?.addEventListener('click',()=>{
    state.sidebarCollapsed=!state.sidebarCollapsed;
    saveStored('ct-sidebar-collapsed-v1',state.sidebarCollapsed);
    applySidebarState();
  });
  $('#menuToggle').addEventListener('click',()=>{$('#sidebar').classList.toggle('open');$('#overlay').classList.toggle('show');});
  $('#overlay').addEventListener('click',closeOverlays);
}
function applySidebarState(){
  const sidebar=$('#sidebar');
  const button=$('#sidebarCollapse');
  if(!sidebar)return;
  sidebar.classList.toggle('is-collapsed',Boolean(state.sidebarCollapsed));
  if(button){
    button.setAttribute('aria-expanded',String(!state.sidebarCollapsed));
    button.setAttribute('aria-label',state.sidebarCollapsed?'展開左側功能列':'收合左側功能列');
    button.title=state.sidebarCollapsed?'展開左側功能列':'收合左側功能列';
  }
}
function applyNavGroupState(){
  $$('.nav-group').forEach(group=>{
    const key=group.dataset.navGroup;
    const collapsed=Boolean(state.navGroups?.[key]);
    group.classList.toggle('collapsed',collapsed);
    group.querySelector('.nav-group-toggle')?.setAttribute('aria-expanded',String(!collapsed));
  });
}
function revealActiveNavGroup(view){
  const active=$(`.nav-item[data-view="${view}"]`);
  const group=active?.closest('.nav-group');
  const key=group?.dataset.navGroup;
  if(!group||!key||!state.navGroups?.[key])return;
  state.navGroups[key]=false;
  saveStored('ct-nav-groups-v1',state.navGroups);
  applyNavGroupState();
}
function switchView(view,preserveOverlay=false){
  revealActiveNavGroup(view);
  $$('.nav-item').forEach(x=>x.classList.toggle('active',x.dataset.view===view));
  $$('.view').forEach(x=>x.classList.toggle('active',x.id===`view-${view}`));
  const titles={overview:'總覽控制塔',demand:'需求總覽',shipment:'出貨總覽',events:'需求變更事件',simulation:'有限／無限模擬',network:'供應網路與 BOM',routing:'生產供應途程',production:'產區現況',bottlenecks:'瓶頸分析',commit:'責任人 Commit',decision:'跨部門決策室',tracking:'執行追蹤與 Highlight'};
  $('#pageTitle').textContent=titles[view]||'供需承諾控制塔';
  if(!preserveOverlay) closeOverlays();
  window.scrollTo({top:0,behavior:'smooth'});
}
function setupInteractions(){
  $('#eventSeverityFilter').addEventListener('change',e=>{state.eventSeverity=e.target.value;renderEvents();});
  $('#eventStatusFilter').addEventListener('change',e=>{state.eventStatus=e.target.value;renderEvents();});
  $('#quantitySlider').addEventListener('input',updateSimulationOutputs);
  $('#dateSlider').addEventListener('input',updateSimulationOutputs);
  $('#runSimulation').addEventListener('click',()=>runSimulation(true));
  $('#simulationDimension').addEventListener('click',e=>{const b=e.target.closest('[data-dimension]');if(!b)return;state.simDimension=b.dataset.dimension;renderSimulationBreakdown();});
  $('#approveScenario').addEventListener('click',approveSelectedScenario);
  $('#demandSourceFilter').addEventListener('change',e=>{state.demandSource=e.target.value;renderDemand();});
  $('#demandStatusFilter').addEventListener('change',e=>{state.demandStatus=e.target.value;renderDemand();});
  $('#demandHorizonFilter').addEventListener('change',e=>{state.demandHorizon=e.target.value;renderDemand();});
  $('#shipmentTradeFilter').addEventListener('change',e=>{state.shipmentTrade=e.target.value;renderShipment();});
  $('#shipmentTransportFilter').addEventListener('change',e=>{state.shipmentTransport=e.target.value;renderShipment();});
  $('#shipmentStatusFilter').addEventListener('change',e=>{state.shipmentStatus=e.target.value;renderShipment();});
  $('#routingEventSelect').addEventListener('change',e=>{state.routeEventId=e.target.value;renderRouting();});
  $('#routingViewToggle').addEventListener('click',e=>{const b=e.target.closest('[data-route-view]');if(!b)return;state.routeViewMode=b.dataset.routeView;renderRouting();});
  $('#productionFactorySelect').addEventListener('change',e=>{state.productionFactory=e.target.value;renderProduction();});
  $('#productionHorizonSelect').addEventListener('change',e=>{state.productionHorizon=Number(e.target.value);renderProduction();});
  $('#productionResourceFilter').addEventListener('change',e=>{state.productionResource=e.target.value;renderProduction();});
  $('#resetDemo').addEventListener('click',()=>{
    clearStored(['ct-events-v3','ct-events-v4','ct-demand-events-v1','ct-demand-events-v2','ct-tracking-v3','ct-commits-v3','ct-decisions-v3']);
    state.events=structuredClone(baseEvents);state.demandEvents=structuredClone(baseDemandEvents);state.tracking=structuredClone(trackingBase);state.commits={};state.decisions={};state.selectedEventId=baseEvents[0].id;state.selectedScenario=null;state.expandedDemandId='';state.expandedShipmentId='';state.selectedWorkOrderByEvent={};state.selectedFulfillmentByEvent={};state.fulfillmentViewMode='tile';state.routeEventId=baseDemandEvents.find(x=>x.source==='客戶PO')?.id||baseDemandEvents[0]?.id||'';state.routeViewMode='sequence';renderAll();toast('示範資料已重設');
  });
}
function setupNetworkControls(){
  $('#networkProductSelect').innerHTML=`<option value="all">全部產品</option>`+productTypes.map(p=>`<option value="${p.key}">${p.name}</option>`).join('');
  $('#networkProductSelect').value=state.networkProduct;
  $('#networkProductSelect').addEventListener('change',e=>{state.networkProduct=e.target.value;state.networkSku='all';updateNetworkSkuOptions();renderNetwork();});
  $('#networkSkuSelect').addEventListener('change',e=>{state.networkSku=e.target.value;renderNetwork();});
  $('#networkRelationSelect').addEventListener('change',e=>{state.networkRelation=e.target.value;renderNetwork();});
  updateNetworkSkuOptions();
}
function updateNetworkSkuOptions(){
  const list=productCatalog.filter(x=>state.networkProduct==='all'||x.productKey===state.networkProduct);
  $('#networkSkuSelect').innerHTML=`<option value="all">全部成品料號</option>`+list.map(x=>`<option value="${x.sku}">${x.sku}｜${x.product}</option>`).join('');
  $('#networkSkuSelect').value=state.networkSku;
}

function inScope(factory){return (state.region==='ALL'||factoryLookup[factory]?.region===state.region)&&(state.factory==='ALL'||factory===state.factory);}
function filteredEvents(){return state.events.filter(e=>inScope(e.factory));}
function ensureSelectedEvent(){const list=filteredEvents();if(list.length&&!list.some(e=>e.id===state.selectedEventId))state.selectedEventId=list[0].id;}
function selectedEvent(){return state.events.find(e=>e.id===state.selectedEventId)||state.events[0];}
function factoryName(id){return factoryLookup[id]?.name||id;}
function renderAll(){renderContext();renderOverview();renderDemand();renderShipment();renderEvents();renderSimulation();renderNetwork();renderRouting();renderProduction();renderBottlenecks();renderCommit();renderDecision();renderTracking();}

function renderContext(){
  let label='全球｜18座工廠';
  if(state.factory!=='ALL')label=`${factoryLookup[state.factory].regionName}｜${factoryName(state.factory)}`;
  else if(state.region!=='ALL'){const r=regions.find(x=>x.id===state.region);label=`${r.name}｜${r.factories.length}座工廠`;}
  $('#currentScope').textContent=label;$('#currentVersion').textContent=`Demand ${selectedEvent().versionTo}`;
  $('#lastUpdated').textContent='2026/07/14 21:00';
}

function renderOverview(){
  const ev=filteredEvents();const demands=state.demandEvents.filter(d=>inScope(d.factory));const shipments=buildShipments().filter(s=>inScope(s.factory));
  const red=ev.filter(x=>x.severity==='red').length;const impact=ev.reduce((s,e)=>s+Math.max(0,e.impactRevenue),0);
  const kpis=[
    ['需求日期事件',demands.length,'已按需求日期獨立拆分','D','tone-blue'],
    ['已轉內部 SO',shipments.length,'可進入出貨總覽','SO','tone-green'],
    ['紅燈承諾風險',red,'需跨部門或高階決策','!','tone-red'],
    ['預估營收影響',money(impact),'需求變更曝險','$','tone-yellow']
  ];
  $('#kpiGrid').innerHTML=kpis.map(kpiCard).join('');
  $('#overviewEventList').innerHTML=ev.slice(0,5).map(eventCard).join('')||'<div class="empty-state">此範圍目前沒有需求變更</div>';bindEventCards('#overviewEventList');
  const factories=[...new Set(ev.map(e=>e.factory))].map(fid=>{const items=ev.filter(e=>e.factory===fid);return{fid,events:items.length,score:items.reduce((s,e)=>s+Math.max(0,e.impactRevenue)+(e.severity==='red'?900:200),0)}}).sort((a,b)=>b.score-a.score).slice(0,6);
  const max=Math.max(...factories.map(x=>x.score),1);
  $('#factoryRiskList').innerHTML=factories.map((x,i)=>`<div class="rank-item"><div class="rank-no">${i+1}</div><div class="rank-name"><strong>${x.fid}｜${factoryName(x.fid)}</strong><span>${x.events}件變更事件</span><div class="progress"><i style="width:${x.score/max*100}%"></i></div></div><div class="rank-value">${money(x.score)}</div></div>`).join('')||'<div class="empty-state">沒有風險資料</div>';
  renderHotspot('#overviewHotspot',scenarioBottlenecks().slice(0,4));
  const dq=ev.filter(e=>e.status==='待決策').slice(0,4);$('#decisionCountTag').textContent=`${dq.length}件待核准`;
  $('#decisionQueue').innerHTML=dq.map(e=>`<div class="decision-item"><div><strong>${e.customer}｜${e.model}</strong><span>${e.factory}・${e.title}</span></div><button class="action-link decision-jump" data-id="${e.id}">進入決策</button></div>`).join('')||'<div class="empty-state">目前沒有待決策事項</div>';
  $$('.decision-jump').forEach(b=>b.addEventListener('click',()=>{state.selectedEventId=b.dataset.id;state.selectedScenario=null;renderAll();switchView('decision');}));
}
function kpiCard([l,v,n,i,t]){return `<article class="kpi-card ${t}"><div class="kpi-top"><div><div class="kpi-label">${l}</div><div class="kpi-value">${v}</div><div class="kpi-note">${n}</div></div><div class="kpi-icon">${i}</div></div></article>`;}

function fulfillmentSeed(eventId,itemId=''){
  return hashText(`${eventId}|${itemId}`);
}
function progressFor(event,nodeId,kind){
  const seed=fulfillmentSeed(event.id,nodeId+kind);
  let base=event.status==='已轉內部SO'?42:event.source==='客戶PO'?24:event.status==='已確認'?15:6;
  if(event.shippingStatus==='已出貨')base=100;
  else if(event.shippingStatus==='待出貨')base=82;
  else if(event.shippingStatus==='備料中')base=54;
  else if(event.shippingStatus==='延遲風險')base=38;
  const bias=kind==='purchase'?((seed%27)-8):((seed%31)-10);
  return Math.max(0,Math.min(100,base+bias));
}
function orderStatus(progress,risk=false,planned=false){
  if(planned&&progress<10)return '計畫中';
  if(progress>=100)return '已完成';
  if(risk&&progress<60)return '延遲風險';
  if(progress>=75)return '接近完成';
  if(progress>=25)return '執行中';
  return '待開工';
}
function fulfillmentStatusTag(status){
  const cls=status==='已完成'?'success':status==='延遲風險'?'danger':status==='接近完成'?'info':status==='執行中'?'warning':'neutral';
  return `<span class="tag ${cls}">${status}</span>`;
}
function extractPlant(source){
  const m=String(source||'').match(/｜(TW\d{2}|CN\d{2}|TH\d{2})/);return m?m[1]:'';
}
function flattenBom(node,level=0,parentId=''){
  const row={...node,level,parentId};
  return [row,...(node.children||[]).flatMap(c=>flattenBom(c,level+1,node.id))];
}
function supplyRelationFor(sku,type){
  return supplyRelations.find(r=>r.sku===sku&&r.type===type)||null;
}
function buildFulfillment(event){
  const item=skuLookup[event.sku]||productCatalog.find(x=>x.productKey===event.productKey);
  if(!item)return {event,workOrders:[],purchaseOrders:[],nodes:[],item:null};
  const nodes=flattenBom(item.bom);
  const planned=event.source!=='客戶PO'||event.status!=='已轉內部SO';
  const workOrders=[];const purchaseOrders=[];
  const dueBase=event.demandDate;
  nodes.forEach((node,index)=>{
    const seed=fulfillmentSeed(event.id,node.id);
    const factor=node.level===0?1:Math.max(.72,.94-node.level*.04);
    const qty=Math.max(1,Math.round(event.qty*factor));
    const due=shiftDate(dueBase,-Math.max(0,(nodes.length-index)%8+node.level*2));
    const start=shiftDate(due,-Math.max(1,3+node.level+(seed%4)));
    const risk=(seed%9===0)||(event.shippingStatus==='延遲風險'&&node.level<2);
    const source=String(node.source||'');
    const isInternal=node.level===0||node.type==='internal'||source==='自製';
    const isOutsource=node.type==='smt'||source.startsWith('友廠模組')||source.startsWith('友廠SMT');
    const isPurchase=node.type==='external'||source.includes('外部供應商')||source.includes('在地供應商')||source.includes('半導體供應商')||source==='外購模組';
    if(isInternal||isOutsource){
      const kind=isOutsource?'委外工單':'內製工單';
      const relationType=node.type==='smt'?'smt':source.startsWith('友廠模組')?'module':'internal';
      const relation=supplyRelationFor(event.sku,relationType);
      const supplierPlant=isOutsource?(extractPlant(source)||relation?.source||'協力廠') : event.factory;
      const progress=progressFor(event,node.id,'work');
      const id=`${isOutsource?'SUB':'MO'}-${event.factory}-${String(seed%100000).padStart(5,'0')}`;
      workOrders.push({id,eventId:event.id,bomId:node.id,parentBomId:node.parentId,level:node.level,item:node.name,kind,source,nodeType:node.type,
        plant:supplierPlant,qty,start,due,progress,risk,status:orderStatus(progress,risk,planned),relationType,
        relationLabel:isOutsource?(node.type==='smt'?'友廠SMT代工':'友廠模組供應'):'廠內生產'});
    }
    if(isPurchase){
      const relation=supplyRelationFor(event.sku,'external');
      const progress=progressFor(event,node.id,'purchase');
      const ordered=Math.max(1,Math.round(qty*(.96+(seed%8)/100)));
      const received=Math.min(ordered,Math.round(ordered*progress/100));
      const vendor=source==='外購模組'?(relation?.source||'模組供應商'):(relation?.source||source||'外部供應商');
      purchaseOrders.push({id:`PO-${event.factory}-${String(seed%100000).padStart(5,'0')}`,eventId:event.id,bomId:node.id,parentBomId:node.parentId,level:node.level,item:node.name,
        vendor,qty:ordered,received,due,progress,risk,status:progress>=100?'已到料':risk&&progress<60?'到料風險':progress>=70?'部分到料':'催交中',source,nodeType:node.type,
        relationLabel:source==='外購模組'?'外購現成模組':'外部採購'});
    }
  });
  // 讓每一張成品工單具備可閱讀的最終測試工單，並掛在根工單下。
  const root=workOrders.find(w=>w.level===0);
  if(root){
    const seed=fulfillmentSeed(event.id,'FINAL-TEST');const progress=Math.max(0,root.progress-12);
    workOrders.push({id:`MO-${event.factory}-${String(seed%100000).padStart(5,'0')}`,eventId:event.id,bomId:`${event.sku}-TEST`,parentBomId:root.bomId,level:1,item:'最終功能測試／校正',kind:'內製工單',source:'自製',nodeType:'route',plant:event.factory,qty:event.qty,
      start:shiftDate(event.demandDate,-4),due:shiftDate(event.demandDate,-2),progress,risk:root.risk,status:orderStatus(progress,root.risk,planned),relationType:'internal',relationLabel:'廠內測試'});
  }
  return {event,item,nodes,workOrders,purchaseOrders};
}
function fulfillmentSummary(f){
  const workAvg=f.workOrders.length?f.workOrders.reduce((s,x)=>s+x.progress,0)/f.workOrders.length:0;
  const poQty=f.purchaseOrders.reduce((s,x)=>s+x.qty,0);const received=f.purchaseOrders.reduce((s,x)=>s+x.received,0);const matRate=poQty?received/poQty*100:100;
  return {workAvg,matRate,internal:f.workOrders.filter(x=>x.kind==='內製工單').length,outsource:f.workOrders.filter(x=>x.kind==='委外工單').length,purchase:f.purchaseOrders.length,
    risk:f.workOrders.filter(x=>x.risk&&x.progress<60).length+f.purchaseOrders.filter(x=>x.risk&&x.progress<60).length};
}
function progressHtml(progress,label=''){
  const cls=progress<40?'red':progress<75?'yellow':'green';
  return `<div class="order-progress"><div><strong>${Math.round(progress)}%</strong><span>${label}</span></div><div class="mini-progress ${cls}"><i style="width:${Math.min(100,progress)}%"></i></div></div>`;
}
function tileMeta(label,value){
  return `<div class="info-tile-meta"><span>${label}</span><strong>${value}</strong></div>`;
}
function metricInfoTile(label,value,note,tone='blue'){
  return `<article class="standard-info-tile metric-info-tile tone-${tone}"><span class="metric-info-label">${label}</span><strong>${value}</strong><small>${note}</small></article>`;
}
function plantLabel(plant){
  const f=factoryLookup[plant];return f?`${plant}｜${f.name}`:plant;
}
function fulfillmentRecords(f){
  return [
    ...f.workOrders.map(x=>({type:'work',id:x.id,due:x.due,start:x.start,bomId:x.bomId,parentBomId:x.parentBomId,data:x})),
    ...f.purchaseOrders.map(x=>({type:'purchase',id:x.id,due:x.due,start:x.due,bomId:x.bomId,parentBomId:x.parentBomId,data:x}))
  ].sort((a,b)=>String(a.due).localeCompare(String(b.due))||String(a.start).localeCompare(String(b.start))||a.id.localeCompare(b.id));
}
function isBomAncestor(ancestorBom,childBom,parentMap){
  if(!ancestorBom||!childBom)return false;
  let cursor=childBom;const seen=new Set();
  while(cursor&&!seen.has(cursor)){if(cursor===ancestorBom)return true;seen.add(cursor);cursor=parentMap.get(cursor)||'';}
  return false;
}
function fulfillmentSelection(f,event){
  const records=fulfillmentRecords(f);
  const stored=state.selectedFulfillmentByEvent[event.id];
  const selected=stored?records.find(r=>r.type===stored.type&&r.id===stored.id)||null:null;
  return {records,selected};
}
function fulfillmentVisualStates(f,selected){
  const records=fulfillmentRecords(f);const result=new Map();
  if(!selected){records.forEach(r=>result.set(`${r.type}:${r.id}`,'normal'));return result;}
  const parentMap=new Map();
  [...f.nodes,...f.workOrders,...f.purchaseOrders].forEach(x=>{if(x.bomId||x.id)parentMap.set(x.bomId||x.id,x.parentBomId||x.parentId||'');});
  records.forEach(r=>{
    let related=false;
    if(r.type===selected.type&&r.id===selected.id)result.set(`${r.type}:${r.id}`,'selected');
    else{
      if(selected.type==='work'){
        related=isBomAncestor(r.bomId,selected.bomId,parentMap)||isBomAncestor(selected.bomId,r.bomId,parentMap);
      }else{
        const parent=selected.parentBomId;
        related=r.bomId===parent||r.parentBomId===parent||isBomAncestor(r.bomId,parent,parentMap);
      }
      result.set(`${r.type}:${r.id}`,related?'related':'dimmed');
    }
  });
  return result;
}
function visualClass(visual){return visual==='selected'?'selected':visual==='related'?'related':visual==='dimmed'?'dimmed':'';}
function workOrderTile(w,event,context,visual='normal',compact=false,sequence=''){
  return `<button type="button" class="standard-info-tile order-info-tile timeline-order-tile fulfillment-item-link ${visualClass(visual)} ${compact?'compact':''}" data-event="${event.id}" data-item-id="${w.id}" data-item-type="work" data-context="${context}">
    <div class="info-tile-top"><div class="info-tile-badges">${sequence?`<span class="timeline-seq">${sequence}</span>`:''}<span class="tag ${w.kind==='委外工單'?'warning':'info'}">${w.kind}</span><span class="tag neutral">BOM L${w.level}</span></div>${fulfillmentStatusTag(w.status)}</div>
    <div class="info-tile-title"><strong>${w.item}</strong><span>${w.id}</span><small>${w.bomId}</small></div>
    <div class="info-tile-meta-grid">
      ${tileMeta('生產單位',plantLabel(w.plant))}
      ${tileMeta('計畫數量',`${fmt(w.qty)} 件`)}
      ${tileMeta('開始日期',formatDate(w.start))}
      ${tileMeta('需求完成日',formatDate(w.due))}
    </div>
    <div class="info-tile-footer"><span>${w.relationLabel}</span>${progressHtml(w.progress,'生產')}</div>
  </button>`;
}
function purchaseOrderTile(po,event,context,visual='normal',compact=false,sequence=''){
  const normalized=po.status==='已到料'?'已完成':po.status==='到料風險'?'延遲風險':'執行中';
  return `<button type="button" class="standard-info-tile order-info-tile timeline-order-tile purchase-info-tile fulfillment-item-link ${visualClass(visual)} ${compact?'compact':''}" data-event="${event.id}" data-item-id="${po.id}" data-item-type="purchase" data-context="${context}">
    <div class="info-tile-top"><div class="info-tile-badges">${sequence?`<span class="timeline-seq">${sequence}</span>`:''}<span class="tag success">採購 PO</span><span class="tag neutral">BOM L${po.level}</span></div>${fulfillmentStatusTag(normalized)}</div>
    <div class="info-tile-title"><strong>${po.item}</strong><span>${po.id}</span><small>${po.bomId}</small></div>
    <div class="info-tile-meta-grid">
      ${tileMeta('供應來源',po.vendor)}
      ${tileMeta('訂購數量',`${fmt(po.qty)} 件`)}
      ${tileMeta('已到數量',`${fmt(po.received)} 件`)}
      ${tileMeta('需求到料日',formatDate(po.due))}
    </div>
    <div class="info-tile-footer"><span>${po.relationLabel}</span>${progressHtml(po.progress,'到料')}</div>
  </button>`;
}
function staticWorkOrderTile(w){return workOrderTile(w,{id:w.eventId},'dependency','selected',true,'');}
function staticPurchaseOrderTile(po){return purchaseOrderTile(po,{id:po.eventId},'dependency','selected',true,'');}
function fulfillmentList(records,f,event,context,states){
  const rows=records.map((r,i)=>{
    const x=r.data,visual=states.get(`${r.type}:${r.id}`)||'normal';
    const type=r.type==='work'?x.kind:'採購 PO';
    const owner=r.type==='work'?plantLabel(x.plant):x.vendor;
    const qty=r.type==='work'?`${fmt(x.qty)} 件`:`${fmt(x.received)} / ${fmt(x.qty)} 件`;
    const status=r.type==='work'?x.status:x.status;
    const progress=r.type==='work'?x.progress:x.progress;
    return `<tr tabindex="0" class="fulfillment-list-row fulfillment-item-link ${visualClass(visual)}" data-event="${event.id}" data-item-id="${r.id}" data-item-type="${r.type}" data-context="${context}"><td>${String(i+1).padStart(2,'0')}</td><td><span class="tag ${r.type==='purchase'?'success':x.kind==='委外工單'?'warning':'info'}">${type}</span><br>${fulfillmentStatusTag(status==='已到料'?'已完成':status==='到料風險'?'延遲風險':status)}</td><td><strong>${r.id}</strong><br><span class="event-id">BOM L${x.level}・${x.bomId}</span></td><td><strong>${x.item}</strong><br><span class="event-id">${x.relationLabel}</span></td><td>${owner}</td><td>${qty}</td><td><strong>${formatDateFull(r.due)}</strong>${r.type==='work'?`<br><span class="event-id">開始 ${formatDate(x.start)}</span>`:''}</td><td>${progressHtml(progress,r.type==='work'?'生產':'到料')}</td></tr>`;
  }).join('');
  return `<div class="table-wrap fulfillment-list-wrap"><table class="fulfillment-list-table"><thead><tr><th>順序</th><th>類型／狀態</th><th>單號／BOM</th><th>項目</th><th>責任單位／供應商</th><th>數量</th><th>需求時間</th><th>進度</th></tr></thead><tbody>${rows}</tbody></table></div>`;
}
function fulfillmentPanel(event,context){
  const f=buildFulfillment(event);const summary=fulfillmentSummary(f);
  const {records,selected}=fulfillmentSelection(f,event);const states=fulfillmentVisualStates(f,selected);
  const tileHtml=records.map((r,i)=>r.type==='work'?workOrderTile(r.data,event,context,states.get(`work:${r.id}`),false,String(i+1).padStart(2,'0')):purchaseOrderTile(r.data,event,context,states.get(`purchase:${r.id}`),false,String(i+1).padStart(2,'0'))).join('');
  const content=state.fulfillmentViewMode==='list'?fulfillmentList(records,f,event,context,states):`<div class="standard-tile-grid order-tile-grid fulfillment-timeline-grid">${tileHtml||'<div class="empty-state">尚未產生履行單據</div>'}</div>`;
  return `<div class="fulfillment-panel" data-fulfillment-event="${event.id}">
    <div class="fulfillment-head"><div><p class="eyebrow">DEMAND FULFILLMENT TRACE</p><h3>${event.id}｜${event.product} ${event.sku}</h3><p>工單與採購 PO 已依需求時間由上往下排序。點擊任一單據，可突出同一 BOM 分支中的對應工單與採購項目，其他項目會淡出。</p></div><span class="tag ${summary.risk?'danger':'success'}">${summary.risk?`${summary.risk}項風險`:'履行正常'}</span></div>
    <div class="fulfillment-kpis standard-tile-grid summary-tile-grid">
      ${metricInfoTile('生產平均進度',`${summary.workAvg.toFixed(0)}%`,'所有內製與委外工單','blue')}
      ${metricInfoTile('物料到料率',`${summary.matRate.toFixed(0)}%`,'所有採購 PO 加權','green')}
      ${metricInfoTile('內製工單',summary.internal,'由本廠生產執行','blue')}
      ${metricInfoTile('委外工單',summary.outsource,'友廠或協力廠承接','yellow')}
      ${metricInfoTile('採購 PO',summary.purchase,'外購料與現成模組','green')}
    </div>
    <div class="fulfillment-control-bar">
      <div><h4>工單與採購需求時程</h4><span>${records.length} 張單據・最早需求 ${records[0]?formatDateFull(records[0].due):'—'}・最晚需求 ${records.at(-1)?formatDateFull(records.at(-1).due):'—'}</span></div>
      <div class="fulfillment-actions"><div class="segmented-control compact-segmented"><button class="segment fulfillment-view-toggle ${state.fulfillmentViewMode==='tile'?'active':''}" data-mode="tile">資訊磚</button><button class="segment fulfillment-view-toggle ${state.fulfillmentViewMode==='list'?'active':''}" data-mode="list">清單列表</button></div><button class="primary-button production-route-jump" data-event="${event.id}">生產供應途程</button></div>
    </div>
    <section class="fulfillment-section fulfillment-timeline-section">${content}</section>
    ${renderFulfillmentDependencies(f,selected)}
  </div>`;
}
function renderFulfillmentDependencies(f,selected){
  if(!selected)return '<div class="empty-state">沒有可檢視的工單或採購 PO</div>';
  if(selected.type==='purchase'){
    const po=selected.data;const consumer=f.workOrders.find(w=>w.bomId===po.parentBomId)||f.workOrders.find(w=>w.level===0);
    const siblingWorks=f.workOrders.filter(w=>w.parentBomId===po.parentBomId);
    const siblingPos=f.purchaseOrders.filter(x=>x.parentBomId===po.parentBomId&&x.id!==po.id);
    const cards=[...(consumer?[{...consumer,dependencyType:'work'}]:[]),...siblingWorks.filter(x=>x.id!==consumer?.id).map(x=>({...x,dependencyType:'work'})),...siblingPos.map(x=>({...x,dependencyType:'purchase'}))]
      .sort((a,b)=>String(a.due).localeCompare(String(b.due)))
      .map(x=>x.dependencyType==='work'?workOrderTile(x,f.event,'dependency','related',true):purchaseOrderTile(x,f.event,'dependency','related',true)).join('');
    return `<section class="dependency-panel"><div class="dependency-header"><div><p class="eyebrow">PURCHASE-TO-WORK ORDER TRACE</p><h4>${po.id}｜${po.item}</h4><p>此採購 PO 的供給去向，以及同一裝配節點需要同步齊套的工單與採購項目。</p></div><div class="dependency-meta"><span>採購 PO</span><strong>BOM L${po.level}</strong><span>${po.relationLabel}</span></div></div><div class="dependency-body standardized-dependency-body"><div class="dependency-current">${staticPurchaseOrderTile(po)}</div><div class="dependency-flow-label"><span>供給至／共同齊套</span><strong>↓</strong></div><div class="standard-tile-grid dependency-list">${cards||'<div class="leaf-node"><strong>尚未對應消耗工單</strong><span>請確認 BOM 或採購分配關係。</span></div>'}</div></div></section>`;
  }
  const work=selected.data;
  const childWorks=f.workOrders.filter(w=>w.parentBomId===work.bomId&&w.id!==work.id);
  const childPos=f.purchaseOrders.filter(po=>po.parentBomId===work.bomId);
  const descendants=[...childWorks.map(x=>({...x,dependencyType:'work'})),...childPos.map(x=>({...x,dependencyType:'purchase'}))].sort((a,b)=>String(a.due).localeCompare(String(b.due)));
  const cards=descendants.map(x=>x.dependencyType==='work'?workOrderTile(x,f.event,'dependency','related',true):purchaseOrderTile(x,f.event,'dependency','related',true)).join('');
  const path=[];let cursor=work;const seen=new Set();
  while(cursor&&!seen.has(cursor.id)){seen.add(cursor.id);path.unshift(cursor);cursor=f.workOrders.find(w=>w.bomId===cursor.parentBomId);}
  return `<section class="dependency-panel"><div class="dependency-header"><div><p class="eyebrow">BOM & SUPPLY CHAIN DRILLDOWN</p><h4>${work.id}｜${work.item}</h4><p>${path.map(x=>x.item).join(' → ')}</p></div><div class="dependency-meta"><span>${work.kind}</span><strong>BOM L${work.level}</strong><span>${work.relationLabel}</span></div></div><div class="dependency-body standardized-dependency-body"><div class="dependency-current">${staticWorkOrderTile(work)}</div><div class="dependency-flow-label"><span>直接下階供應</span><strong>↓</strong></div><div class="standard-tile-grid dependency-list">${cards||'<div class="leaf-node"><strong>此工單已是製造葉節點</strong><span>沒有更下階工單或採購 PO。</span></div>'}</div></div></section>`;
}
function selectFulfillmentItem(context,eventId,type,id){
  state.selectedFulfillmentByEvent[eventId]={type,id};
  if(type==='work')state.selectedWorkOrderByEvent[eventId]=id;
  context==='demand'?renderDemand():renderShipment();
}
function bindFulfillmentInteractions(context){
  const root=context==='demand'?'#view-demand':'#view-shipment';
  const mainSelector=context==='demand'?`${root} .demand-main-row`:`${root} .shipment-main-row`;
  $$(mainSelector).forEach(row=>row.addEventListener('click',ev=>{
    if(ev.target.closest('button,a,select,input'))return;
    const id=row.dataset.eventId;
    if(context==='demand')state.expandedDemandId=state.expandedDemandId===id?'':id;
    else state.expandedShipmentId=state.expandedShipmentId===id?'':id;
    context==='demand'?renderDemand():renderShipment();
  }));
  $$(`${root} .fulfillment-toggle`).forEach(btn=>btn.addEventListener('click',ev=>{
    ev.stopPropagation();const id=btn.dataset.id;
    if(context==='demand')state.expandedDemandId=state.expandedDemandId===id?'':id;
    else state.expandedShipmentId=state.expandedShipmentId===id?'':id;
    context==='demand'?renderDemand():renderShipment();
  }));
  $$(`${root} .fulfillment-item-link`).forEach(el=>{
    const activate=ev=>{ev.stopPropagation();selectFulfillmentItem(context,el.dataset.event,el.dataset.itemType,el.dataset.itemId);};
    el.addEventListener('click',activate);el.addEventListener('keydown',ev=>{if(ev.key==='Enter'||ev.key===' '){ev.preventDefault();activate(ev);}});
  });
  $$(`${root} .fulfillment-view-toggle`).forEach(btn=>btn.addEventListener('click',ev=>{ev.stopPropagation();state.fulfillmentViewMode=btn.dataset.mode;context==='demand'?renderDemand():renderShipment();}));
  $$(`${root} .production-route-jump`).forEach(btn=>btn.addEventListener('click',ev=>{ev.stopPropagation();state.routeEventId=btn.dataset.event;renderRouting();switchView('routing');}));
}

function routeEligibleEvents(){
  return state.demandEvents.filter(d=>inScope(d.factory)&&d.sku&&skuLookup[d.sku]).sort((a,b)=>{
    const rank=x=>x.source==='客戶PO'?0:x.source==='計畫庫存'?1:2;
    return rank(a)-rank(b)||String(a.demandDate).localeCompare(String(b.demandDate));
  });
}
function classifySupplyForRoute(po){
  const name=po.item;
  if(/IC|SoC|記憶體|裸板|被動|晶圓|Die/.test(name))return 'smt';
  if(/包材|附件/.test(name))return 'pack';
  if(/機箱|外殼|散熱|風扇|機構|光學/.test(name))return 'assembly';
  return 'module';
}
function buildProductionRoute(event){
  const f=buildFulfillment(event);
  const root=f.workOrders.find(w=>w.level===0);
  const test=f.workOrders.find(w=>w.nodeType==='route'||/測試|校正/.test(w.item));
  const smt=f.workOrders.filter(w=>w.relationType==='smt');
  const module=f.workOrders.filter(w=>w.relationType==='module'||(w.level>0&&/模組/.test(w.item)));
  const internalPrep=f.workOrders.filter(w=>w.level>0&&w.relationType==='internal'&&w.id!==test?.id);
  const posBy={smt:[],module:[],assembly:[],pack:[]};
  f.purchaseOrders.forEach(po=>posBy[classifySupplyForRoute(po)].push(po));
  const stages=[
    {key:'material',name:'來料檢驗與齊套',resource:'IQC／物料超市',plant:event.factory,works:[],supplies:[...posBy.smt,...posBy.module,...posBy.assembly],note:'確認關鍵電子料、模組與機構件可於投入前齊套。'},
    {key:'smt',name:'SMT／PCBA 製造',resource:'SMT 高速線／AOI',plant:smt[0]?.plant||event.factory,works:smt,supplies:posBy.smt,note:'主控制板印刷、貼片、回焊與電測；可由友廠 SMT 代工。'},
    {key:'module',name:'核心模組製造',resource:'功率／控制模組線',plant:module[0]?.plant||event.factory,works:[...module,...internalPrep],supplies:posBy.module,note:'組立核心模組並載入韌體／參數版本。'},
    {key:'assembly',name:'成品總裝',resource:'最終組裝線',plant:root?.plant||event.factory,works:root?[root]:[],supplies:[...module,...posBy.assembly],note:'將核心模組、機構與散熱件組裝為成品。'},
    {key:'test',name:'功能測試與校正',resource:'老化／功能測試線',plant:test?.plant||event.factory,works:test?[test]:[],supplies:internalPrep,note:'執行功能、安規、校正與必要的老化測試。'},
    {key:'pack',name:'包裝與出貨準備',resource:'包裝線／成品倉',plant:event.factory,works:[],supplies:posBy.pack,note:'完成包材、附件、標籤與出貨文件齊套。'}
  ];
  const routeWindows=[[-18,-13],[-12,-10],[-9,-7],[-6,-4],[-3,-2],[-1,0]];
  stages.forEach((stage,i)=>{
    stage.start=shiftDate(event.demandDate,routeWindows[i][0]);
    stage.due=shiftDate(event.demandDate,routeWindows[i][1]);
    const progressItems=[...stage.works,...stage.supplies];
    stage.progress=progressItems.length?progressItems.reduce((s,x)=>s+x.progress,0)/progressItems.length:Math.max(0,12+i*8);
    stage.risk=progressItems.some(x=>x.risk&&x.progress<60)||progressItems.some(x=>x.due&&x.due>stage.due);
  });
  return {f,stages};
}
function routeMiniItem(item,event,type){
  const isWork=type==='work';
  return `<div class="route-supply-item ${isWork&&item.kind==='委外工單'?'outsource':isWork?'work':'purchase'}"><div><span>${isWork?item.kind:'採購 PO'}</span><strong>${item.item}</strong><small>${item.id}・${isWork?plantLabel(item.plant):item.vendor}</small></div><div><strong>${formatDate(item.due)}</strong><small>${Math.round(item.progress)}%</small></div></div>`;
}
function routeNetworkItem(item,type){
  const isWork=type==='work';
  const kind=isWork?(item.kind==='委外工單'?'outsource':'work'):'purchase';
  return `<div class="route-network-input ${kind}"><span>${isWork?item.kind:'採購 PO'}</span><strong>${item.item}</strong><small>${item.id}</small><em>${isWork?plantLabel(item.plant):item.vendor}・${formatDate(item.due)}・${Math.round(item.progress)}%</em></div>`;
}
function renderRouteNetwork(stages,event){
  return `<div class="route-network-scroll"><div class="route-network-header"><span class="route-endpoint start">途程起點</span><strong>${event.product}｜${event.sku}</strong><span class="route-endpoint end">途程終點</span></div><div class="route-network-track">${stages.map((stage,i)=>{
    const inputs=[...stage.works.map(x=>routeNetworkItem(x,'work')),...stage.supplies.map(x=>routeNetworkItem(x,x.id.startsWith('PO-')?'purchase':'work'))].join('');
    return `<section class="route-network-stage ${stage.risk?'risk':''}" data-stage="${stage.key}"><div class="route-network-node"><div class="route-network-index">${String(i+1).padStart(2,'0')}</div><div class="route-network-node-head"><span>${stage.start} → ${stage.due}</span>${stage.risk?'<b>齊套風險</b>':'<b class="ok">正常</b>'}</div><h3>${stage.name}</h3><p>${plantLabel(stage.plant)}</p><small>${stage.resource}</small><div class="route-network-progress"><i style="width:${Math.min(100,stage.progress)}%"></i></div><footer><span>${Math.round(stage.progress)}%</span><span>${stage.works.length} 工單・${stage.supplies.length} 供給</span></footer></div>${i<stages.length-1?'<div class="route-network-arrow" aria-hidden="true"><i></i><b>›</b></div>':''}<div class="route-network-feed"><h4>途程投入</h4>${inputs||'<div class="route-network-empty">無額外工單或採購供給</div>'}</div></section>`;
  }).join('')}</div></div>`;
}

function renderRouting(){
  const options=routeEligibleEvents();
  if(!options.length){$('#routingEventSelect').innerHTML='';$('#routingKpis').innerHTML='';$('#routingContext').innerHTML='<div class="empty-state">目前範圍沒有可呈現的需求事件</div>';$('#productionSupplyRoute').innerHTML='';$('#productionSupplyNetwork').innerHTML='';return;}
  if(!options.some(x=>x.id===state.routeEventId))state.routeEventId=options[0].id;
  const event=options.find(x=>x.id===state.routeEventId)||options[0];
  $('#routingEventSelect').innerHTML=options.map(x=>`<option value="${x.id}">${x.id}｜${x.source}｜${x.product} ${x.sku}｜${formatDate(x.demandDate)}</option>`).join('');
  $('#routingEventSelect').value=event.id;
  const {f,stages}=buildProductionRoute(event);
  const crossPlants=new Set(f.workOrders.map(w=>w.plant).filter(Boolean));
  const risks=stages.reduce((s,x)=>s+(x.risk?1:0),0);
  $('#routingKpis').innerHTML=[
    ['生產途程',stages.length,'由物料齊套至包裝出貨','R','tone-blue'],
    ['參與廠區',crossPlants.size||1,'本廠、友廠與委外單位','F','tone-green'],
    ['委外工單',f.workOrders.filter(x=>x.kind==='委外工單').length,'友廠模組或 SMT','O','tone-yellow'],
    ['風險途程',risks,'需要提前協調齊套','!','tone-red']
  ].map(kpiCard).join('');
  $('#routingContext').innerHTML=`<div class="routing-context"><div><p class="eyebrow">SELECTED FINISHED GOOD</p><h3>${event.product}｜${event.sku}</h3><p>${event.id}・${event.source}${event.soNo?`・${event.soNo}`:''}</p></div><div class="routing-context-meta"><span>生產工廠<strong>${plantLabel(event.factory)}</strong></span><span>需求數量<strong>${fmt(event.qty)} 件</strong></span><span>需求日期<strong>${formatDateFull(event.demandDate)}</strong></span><span>客戶／用途<strong>${event.customer||event.purpose||'內部需求'}</strong></span></div><div class="view-difference-note"><strong>視角差異</strong><span>供應網路與 BOM：看「從哪裡來、組成什麼」</span><span>生產供應途程：看「先做什麼、何時齊料、在哪裡做」</span></div></div>`;
  $('#productionSupplyRoute').innerHTML=stages.map((stage,i)=>{
    const workItems=stage.works.map(x=>routeMiniItem(x,event,'work')).join('');
    const supplyItems=stage.supplies.map(x=>routeMiniItem(x,event,x.id.startsWith('PO-')?'purchase':'work')).join('');
    return `<article class="route-stage ${stage.risk?'risk':''}"><div class="route-stage-axis"><span>${String(i+1).padStart(2,'0')}</span>${i<stages.length-1?'<i></i>':''}</div><div class="route-stage-card"><div class="route-stage-head"><div><span class="route-stage-kicker">${stage.start} → ${stage.due}</span><h3>${stage.name}</h3><p>${stage.note}</p></div><div class="route-stage-status">${stage.risk?'<span class="tag danger">齊套風險</span>':fulfillmentStatusTag(orderStatus(stage.progress,false,false))}<strong>${Math.round(stage.progress)}%</strong></div></div><div class="route-stage-meta"><span>執行地點<strong>${plantLabel(stage.plant)}</strong></span><span>產能資源<strong>${stage.resource}</strong></span><span>最晚完成<strong>${formatDateFull(stage.due)}</strong></span></div><div class="route-stage-content"><section><h4>承接工單</h4><div class="route-supply-list">${workItems||'<div class="route-empty">此站點以檢驗、倉儲或包裝作業為主</div>'}</div></section><section><h4>投入前必須齊套</h4><div class="route-supply-list">${supplyItems||'<div class="route-empty">無額外採購或下階工單</div>'}</div></section></div></div></article>`;
  }).join('');
  $('#productionSupplyNetwork').innerHTML=renderRouteNetwork(stages,event);
  $$('#routingViewToggle [data-route-view]').forEach(b=>b.classList.toggle('active',b.dataset.routeView===state.routeViewMode));
  $('#productionSupplyRoute').hidden=state.routeViewMode!=='sequence';
  $('#productionSupplyNetwork').hidden=state.routeViewMode!=='network';
}

function demandScopeRows(){
  return state.demandEvents.filter(d=>inScope(d.factory)).filter(d=>state.demandSource==='all'||d.source===state.demandSource).filter(d=>state.demandStatus==='all'||d.status===state.demandStatus).filter(d=>{
    if(state.demandHorizon==='all')return true;return dateDiff(d.demandDate,TODAY)<=Number(state.demandHorizon)&&dateDiff(d.demandDate,TODAY)>=0;
  }).sort((a,b)=>a.factory.localeCompare(b.factory)||a.demandDate.localeCompare(b.demandDate));
}
function renderDemand(){
  $('#demandSourceFilter').value=state.demandSource;$('#demandStatusFilter').value=state.demandStatus;$('#demandHorizonFilter').value=state.demandHorizon;
  const all=state.demandEvents.filter(d=>inScope(d.factory));const rows=demandScopeRows();
  const sources=['客戶預測','內部預測','客戶PO','計畫庫存','緊急詢單'];
  $('#demandKpis').innerHTML=sources.map((source,i)=>kpiCard([source,all.filter(d=>d.source===source).length,`${fmt(all.filter(d=>d.source===source).reduce((s,d)=>s+d.qty,0))} 件`,['F','I','PO','S','!'][i],['tone-blue','tone-green','tone-yellow','tone-blue','tone-red'][i]])).join('');
  $('#demandEventCount').textContent=`${rows.length}筆日期事件`;
  const grouped=Object.groupBy?Object.groupBy(rows,r=>r.factory):rows.reduce((a,r)=>((a[r.factory]??=[]).push(r),a),{});
  $('#demandEventTable').innerHTML=Object.entries(grouped).map(([factory,items])=>{
    const total=items.reduce((s,x)=>s+x.qty,0);
    const header=`<tr class="factory-group-row"><td colspan="10"><div><strong>${factory}｜${factoryName(factory)}</strong><span>${items.length}筆事件・${fmt(total)}件</span></div></td></tr>`;
    return header+items.map(d=>demandRow(d)+(state.expandedDemandId===d.id?`<tr class="fulfillment-expand-row"><td colspan="10">${fulfillmentPanel(d,'demand')}</td></tr>`:'')).join('');
  }).join('')||'<tr><td colspan="10">沒有符合條件的需求事件</td></tr>';
  $$('.demand-action').forEach(b=>b.addEventListener('click',ev=>{ev.stopPropagation();handleDemandAction(b.dataset.id,b.dataset.action);}));
  bindFulfillmentInteractions('demand');
}
function demandChain(d){
  const chain=[];const seen=new Set();let cursor=d;
  while(cursor&&!seen.has(cursor.id)){seen.add(cursor.id);chain.unshift(cursor);cursor=cursor.parentEventId?state.demandEvents.find(x=>x.id===cursor.parentEventId):null;}
  return chain;
}
function relationChainHtml(d){
  const chain=demandChain(d);const sources=chain.map(x=>x.source);
  const children=(d.childEventIds||[]).map(id=>state.demandEvents.find(x=>x.id===id)).filter(Boolean);
  const full=[...sources,...children.map(x=>x.source)].filter((x,i,a)=>i===0||x!==a[i-1]);
  const ids=[...chain.map(x=>x.id),...children.map(x=>x.id)].filter((x,i,a)=>a.indexOf(x)===i);
  return `<div class="chain-cell"><strong>${full.join(' → ')||d.source}</strong><span>${d.originMode||'需求來源起點'}</span><small>${ids.join(' → ')}</small></div>`;
}
function demandAudienceHtml(d){
  if(d.source==='客戶PO')return `<strong>${d.customer}</strong><br><span class="event-id">${d.destinationCountry}・${d.destinationCity}</span>`;
  return `<strong>${d.purpose||'內部規劃用途'}</strong><br><span class="event-id">尚無正式客戶與出貨目的地</span>`;
}
function demandRow(d){
  let action=['—','none'];
  if(d.status==='待整合')action=['送確認','confirmQueue'];
  else if(d.status==='待確認')action=['確認需求','confirm'];
  else if(d.status==='已確認'){
    if(d.source==='客戶預測'||d.source==='緊急詢單')action=['轉客戶PO','toCustomerPo'];
    else if(d.source==='內部預測')action=['轉計畫庫存','toPlannedStock'];
    else if(d.source==='計畫庫存')action=['建立PO消耗','consumeStock'];
    else if(d.source==='客戶PO')action=['轉內部SO','toSo'];
  }else if(d.source==='客戶PO'&&d.status==='已轉內部SO')action=['查看SO','viewSo'];
  else if((d.childEventIds||[]).length)action=['查看下游','viewDownstream'];
  const expanded=state.expandedDemandId===d.id;
  return `<tr class="demand-main-row expandable-data-row ${expanded?'expanded':''}" data-event-id="${d.id}"><td><button class="fulfillment-toggle row-expand-toggle" data-id="${d.id}" data-context="demand" aria-label="${expanded?'收合':'展開'}需求履行">${expanded?'−':'+'}</button><strong>${d.id}</strong><br><span class="event-id">批次 ${d.batchId}</span></td><td><strong>${formatDateFull(d.demandDate)}</strong><br><span class="event-id">建立 ${formatDate(d.createdDate)}</span></td><td><span class="tag ${sourceClass[d.source]}">${d.source}</span></td><td><span class="tag ${statusClass[d.status]||'neutral'}">${d.status}</span></td><td>${relationChainHtml(d)}</td><td>${demandAudienceHtml(d)}</td><td><strong>${d.product}</strong><br><span class="event-id">${d.sku}</span></td><td><strong>${fmt(d.qty)} 件</strong>${d.source==='計畫庫存'&&d.remainingQty!==null?`<br><span class="event-id">剩餘 ${fmt(d.remainingQty)} 件</span>`:`<br><span class="event-id">P${d.priority}</span>`}</td><td>${d.soNo?`<strong>${d.soNo}</strong>`:'<span class="event-id">尚未建立</span>'}</td><td><button class="action-link demand-action" data-id="${d.id}" data-action="${action[1]}" ${action[1]==='none'?'disabled':''}>${action[0]}</button></td></tr>`;
}
function nextDemandId(){
  const n=Math.max(0,...state.demandEvents.map(x=>Number((x.id.match(/\d+/)||['0'])[0])));return `DE-${String(n+1).padStart(4,'0')}`;
}
function prospectFor(parent){
  if(parent.prospectCustomer)return {name:parent.prospectCustomer,region:parent.prospectRegion,country:parent.prospectCountry,city:parent.prospectCity};
  return customers[hashText(parent.id+parent.factory)%customers.length];
}
function createDerivedDemandEvent(parent,targetSource){
  const customer=prospectFor(parent);const id=nextDemandId();
  const common={id,region:parent.region,factory:parent.factory,demandDate:parent.demandDate,productKey:parent.productKey,product:parent.product,sku:parent.sku,priority:parent.priority,createdDate:TODAY,parentEventId:parent.id,rootEventId:parent.rootEventId||parent.id,childEventIds:[],soNo:'',shippingStatus:'',incoterm:'',transportMode:''};
  let child;
  if(targetSource==='計畫庫存'){
    child={...common,batchId:`STK-${parent.factory}-${String(hashText(id)%999).padStart(3,'0')}`,source:'計畫庫存',status:'已確認',qty:parent.qty,remainingQty:parent.qty,originMode:'內部預測轉庫存',purpose:'區域成品安全庫存',customer:'',destinationRegion:'',destinationCountry:'',destinationCity:''};
    parent.status='已轉換';
  }else{
    const available=parent.source==='計畫庫存'?(parent.remainingQty??parent.qty):parent.qty;
    const qty=parent.source==='計畫庫存'?Math.max(100,Math.round(available*.6)):parent.qty;
    const originMode=parent.source==='客戶預測'?'預測完整轉換':parent.source==='緊急詢單'?'緊急詢單轉單':'計畫庫存消耗';
    child={...common,batchId:`PO-${parent.factory}-${String(hashText(id)%999).padStart(3,'0')}`,source:'客戶PO',status:'已確認',qty,remainingQty:null,originMode,purpose:'正式客戶訂單',customer:customer.name,destinationRegion:customer.region,destinationCountry:customer.country,destinationCity:customer.city,priority:parent.source==='緊急詢單'?1:2};
    if(parent.source==='計畫庫存'){
      parent.remainingQty=Math.max(0,available-qty);parent.status=parent.remainingQty===0?'已被PO消耗':'部分消耗';
    }else parent.status='已轉換';
  }
  parent.childEventIds=[...(parent.childEventIds||[]),child.id];state.demandEvents.push(child);return child;
}
function handleDemandAction(id,action){
  const d=state.demandEvents.find(x=>x.id===id);if(!d)return;
  if(action==='confirmQueue')d.status='待確認';
  if(action==='confirm')d.status='已確認';
  if(action==='toCustomerPo'||action==='consumeStock'){
    const child=createDerivedDemandEvent(d,'客戶PO');const change=buildChangeEventFromDemand(state.demandEvents,child,state.events.length);if(change){state.events.unshift(change);state.selectedEventId=change.id;}persist();renderAll();toast(`已建立客戶PO事件 ${child.id}，並產生需求變更事件 ${change?.id||''}`);return;
  }
  if(action==='toPlannedStock'){
    const child=createDerivedDemandEvent(d,'計畫庫存');persist();renderAll();toast(`已建立計畫庫存事件 ${child.id}`);return;
  }
  if(action==='toSo'){
    if(d.source!=='客戶PO'){toast('只有客戶PO可以轉成內部SO');return;}
    d.status='已轉內部SO';const linkedChange=state.events.find(e=>e.demandEventId===d.id);if(linkedChange){linkedChange.targetDemandStatus=d.status;linkedChange.status='已核准';}d.soNo=`SO-${d.factory}-${String(90000+hashText(d.id)%9999).slice(-5)}`;d.shippingStatus='待排程';
    const trade=d.destinationRegion===d.region?'內銷':'外銷';d.incoterm=trade==='內銷'?'DAP':['FOB','CIF','DDP','FCA'][hashText(d.id)%4];d.transportMode=chooseTransportMode(d,trade);
  }
  if(action==='viewSo'){state.shipmentTrade='all';state.shipmentTransport='all';state.shipmentStatus='all';renderShipment();switchView('shipment');toast(`已定位 ${d.soNo}`);return;}
  if(action==='viewDownstream'){
    const child=state.demandEvents.find(x=>x.id===(d.childEventIds||[])[0]);if(child){state.demandSource=child.source;state.demandStatus='all';renderDemand();toast(`下游事件：${child.id}｜${child.source}`);}return;
  }
  persist();renderAll();toast(`需求事件已更新為「${d.status}」`);
}

function chooseTransportMode(d,trade){
  if(trade==='內銷')return '陸運';
  const family=skuLookup[d.sku]?.family||'';
  const heavy=['電源系統','車用電力電子','電動車動力','充電基礎設施','新能源','環境系統'].includes(family);
  const urgent=d.originMode==='緊急詢單轉單'||dateDiff(d.demandDate,TODAY)<=14;
  if(urgent)return '空運';
  if(d.region==='CN'&&d.destinationRegion==='EU'&&!heavy)return '鐵路';
  if(['EU','US'].includes(d.destinationRegion))return heavy?'海運':'空運';
  if(heavy)return hashText(d.id)%3===0?'複合運輸':'海運';
  return ['空運','快遞','海運'][hashText(d.id)%3];
}
function transportLead(mode){return {陸運:2,快遞:3,空運:5,鐵路:12,複合運輸:14,海運:18}[mode]||7;}
function transportModeTag(mode){const cls=mode==='空運'||mode==='快遞'?'warning':mode==='海運'||mode==='複合運輸'?'info':mode==='鐵路'?'success':'neutral';return `<span class="tag ${cls}">${mode}</span>`;}
function buildShipments(){
  return state.demandEvents.filter(d=>d.source==='客戶PO'&&d.status==='已轉內部SO'&&d.soNo).map(d=>{
    const trade=d.destinationRegion===d.region?'內銷':'外銷';const transportMode=d.transportMode||chooseTransportMode(d,trade);const shipLead=transportLead(transportMode);
    return {...d,trade,transportMode,plannedShipDate:shiftDate(d.demandDate,-shipLead),deliveryDate:d.demandDate,shippingStatus:d.shippingStatus||'待排程',incoterm:d.incoterm||(trade==='內銷'?'DAP':'FOB')};
  });
}
function renderShipment(){
  $('#shipmentTradeFilter').value=state.shipmentTrade;$('#shipmentTransportFilter').value=state.shipmentTransport;$('#shipmentStatusFilter').value=state.shipmentStatus;
  const all=buildShipments().filter(s=>inScope(s.factory));
  const rows=all.filter(s=>state.shipmentTrade==='all'||s.trade===state.shipmentTrade).filter(s=>state.shipmentTransport==='all'||s.transportMode===state.shipmentTransport).filter(s=>state.shipmentStatus==='all'||s.shippingStatus===state.shipmentStatus).sort((a,b)=>a.plannedShipDate.localeCompare(b.plannedShipDate));
  const domestic=all.filter(x=>x.trade==='內銷'),exports=all.filter(x=>x.trade==='外銷'),risk=all.filter(x=>x.shippingStatus==='延遲風險'),ready=all.filter(x=>['待出貨','已出貨'].includes(x.shippingStatus));
  $('#shipmentKpis').innerHTML=[['內銷 SO',domestic.length,`${fmt(domestic.reduce((s,x)=>s+x.qty,0))} 件`,'內','tone-blue'],['外銷 SO',exports.length,`${fmt(exports.reduce((s,x)=>s+x.qty,0))} 件`,'外','tone-green'],['待出貨／已出貨',ready.length,'已具備交運排程','↗','tone-yellow'],['延遲風險',risk.length,'需確認生產與物流','!','tone-red']].map(kpiCard).join('');
  $('#shipmentCount').textContent=`${rows.length}筆客戶PO內部SO`;
  $('#shipmentTable').innerHTML=rows.map(s=>{const expanded=state.expandedShipmentId===s.id;return `<tr class="shipment-main-row expandable-data-row ${s.shippingStatus==='延遲風險'?'risk-row':''} ${expanded?'expanded':''}" data-event-id="${s.id}"><td><button class="fulfillment-toggle row-expand-toggle" data-id="${s.id}" data-context="shipment" aria-label="${expanded?'收合':'展開'}需求履行">${expanded?'−':'+'}</button><strong>${s.soNo}</strong><br><button class="link-button shipment-demand-link" data-id="${s.id}">${s.id}</button><br><span class="event-id">${s.originMode}</span></td><td><strong>${s.factory}</strong><br><span class="event-id">${factoryName(s.factory)}</span></td><td><span class="tag ${s.trade==='內銷'?'info':'success'}">${s.trade}</span></td><td><strong>${s.customer}</strong><br><span class="event-id">${s.destinationCountry}・${s.destinationCity}</span></td><td><strong>${s.product}</strong><br><span class="event-id">${s.sku}</span></td><td><strong>${fmt(s.qty)} 件</strong></td><td>${formatDateFull(s.demandDate)}</td><td>${formatDateFull(s.plannedShipDate)}</td><td>${transportModeTag(s.transportMode)}</td><td>${s.incoterm}</td><td>${shipmentStatusTag(s.shippingStatus)}</td></tr>${expanded?`<tr class="fulfillment-expand-row"><td colspan="11">${fulfillmentPanel(s,'shipment')}</td></tr>`:''}`;}).join('')||'<tr><td colspan="11">目前沒有符合條件的客戶PO內部SO出貨資料</td></tr>';
  $$('.shipment-demand-link').forEach(b=>b.addEventListener('click',ev=>{ev.stopPropagation();const d=state.demandEvents.find(x=>x.id===b.dataset.id);state.region=d.region;state.factory=d.factory;$('#regionSelect').value=state.region;updateFactoryOptions();$('#factorySelect').value=state.factory;state.demandSource='客戶PO';state.demandStatus='已轉內部SO';renderAll();switchView('demand');}));
  bindFulfillmentInteractions('shipment');
}
function shipmentStatusTag(status){const cls=status==='延遲風險'?'danger':status==='已出貨'?'success':status==='待出貨'?'info':status==='備料中'?'warning':'neutral';return `<span class="tag ${cls}">${status}</span>`;}

function eventCard(e){
  const demand=state.demandEvents.find(d=>d.id===e.demandEventId);const audience=demand?.customer||demand?.purpose||e.customer;
  return `<div class="event-item ${e.id===state.selectedEventId?'active':''}" data-event-id="${e.id}"><div class="event-row"><span class="event-id">${e.id}｜${e.demandEventId}</span>${sevTag(e.severity)}</div><div class="event-title">${audience}｜${e.model}－${e.title}</div><div class="event-meta"><span>${e.factory} ${factoryName(e.factory)}</span><span>${e.relationChain}</span><span>需求日 ${formatDate(e.newDate)}</span><span>${e.status}</span></div></div>`;
}
function bindEventCards(scope){$$(`${scope} .event-item`).forEach(el=>el.addEventListener('click',()=>{state.selectedEventId=el.dataset.eventId;state.selectedScenario=null;renderAll();if(scope==='#overviewEventList')switchView('events');}));}
function renderEvents(){
  const items=filteredEvents().filter(e=>(state.eventSeverity==='all'||e.severity===state.eventSeverity)&&(state.eventStatus==='all'||e.status===state.eventStatus));
  $('#eventSeverityFilter').value=state.eventSeverity;$('#eventStatusFilter').value=state.eventStatus;$('#eventList').innerHTML=items.map(eventCard).join('')||'<div class="empty-state">沒有符合條件的事件</div>';bindEventCards('#eventList');
  const e=selectedEvent();const demand=state.demandEvents.find(d=>d.id===e.demandEventId);const upstream=state.demandEvents.find(d=>d.id===e.upstreamEventId);const qtyDelta=e.newQty-e.oldQty;const days=dateDiff(e.newDate,e.oldDate);
  const audience=demand?.customer||demand?.purpose||e.customer;const destination=demand?.source==='客戶PO'?`${demand.destinationCountry}・${demand.destinationCity}`:'尚無正式出貨目的地';
  $('#eventDetail').innerHTML=`<div class="detail-hero"><p class="eyebrow">${e.id}・${e.factory} ${factoryName(e.factory)}</p><h2>${audience}｜${e.product}</h2><p>${e.title}</p></div><div class="event-row"><div><span class="event-id">事件狀態／需求來源鏈</span><div style="margin-top:5px"><span class="tag neutral">${e.status}</span> <span class="tag ${sourceClass[e.originSource]||'info'}">${e.originSource}</span> <span class="chain-arrow">→</span> <span class="tag ${sourceClass[e.source]||'success'}">${e.source}</span> ${e.freeze?'<span class="tag danger">需求日進入凍結區</span>':'<span class="tag info">需求日位於彈性區</span>'}</div></div>${sevTag(e.severity)}</div><div class="demand-link-box"><div><span>需求總覽關聯</span><strong>${e.upstreamEventId||'—'} → ${e.demandEventId}</strong></div><div><span>來源批次</span><strong>${upstream?.batchId||'—'} → ${demand?.batchId||e.batchId}</strong></div><div><span>事件關係鏈</span><strong>${e.relationChain}</strong></div><button class="secondary-button event-action" data-action="viewDemand">在需求總覽查看</button></div><div class="detail-grid" style="margin-top:16px"><div class="detail-stat"><span>需求數量變化</span><strong class="${qtyDelta>=0?'delta-up':'delta-down'}">${qtyDelta>=0?'+':''}${fmt(qtyDelta)} 件</strong><span>${fmt(e.oldQty)} → ${fmt(e.newQty)}</span></div><div class="detail-stat"><span>需求日期變化</span><strong>${days===0?'同一需求日期':days<0?`提前 ${Math.abs(days)} 天`:`延後 ${days} 天`}</strong><span>${formatDateFull(e.newDate)}</span></div><div class="detail-stat"><span>需求事件狀態</span><strong>${e.sourceDemandStatus} → ${e.targetDemandStatus}</strong><span>${e.originMode}</span></div><div class="detail-stat"><span>客戶／目的地</span><strong>${audience}</strong><span>${destination}</span></div></div><h3>需求事件差異</h3><table class="version-compare"><thead><tr><th>項目</th><th>${e.upstreamEventId||'上游事件'}</th><th>${e.demandEventId}</th><th>變化</th></tr></thead><tbody><tr><td>需求來源</td><td>${upstream?.source||e.originSource}</td><td>${demand?.source||e.source}</td><td>${e.originMode}</td></tr><tr><td>事件狀態</td><td>${e.sourceDemandStatus}</td><td>${e.targetDemandStatus}</td><td>形成正式需求</td></tr><tr><td>需求數量</td><td>${fmt(e.oldQty)}</td><td>${fmt(e.newQty)}</td><td>${qtyDelta>=0?'+':''}${fmt(qtyDelta)}</td></tr><tr><td>需求日期</td><td>${formatDateFull(e.oldDate)}</td><td>${formatDateFull(e.newDate)}</td><td>${days===0?'同日':days<0?`提前${Math.abs(days)}天`:`延後${days}天`}</td></tr><tr><td>正式客戶</td><td>${upstream?.source==='客戶PO'?upstream.customer:'尚未形成'}</td><td>${demand?.customer||'—'}</td><td>${destination}</td></tr></tbody></table><div class="reason-box"><strong>事件說明：</strong>${e.reason}</div><div class="detail-actions"><button class="primary-button event-action" data-action="模擬中">接受進入模擬</button><button class="secondary-button event-action" data-action="待補件">退回補充理由</button><button class="secondary-button event-action" data-action="下期處理">併入下次週期</button><button class="danger-button event-action" data-action="待決策">緊急升級</button></div>`;
  $$('.event-action').forEach(b=>b.addEventListener('click',()=>{if(b.dataset.action==='viewDemand'){state.region=e.region;state.factory=e.factory;$('#regionSelect').value=state.region;updateFactoryOptions();$('#factorySelect').value=state.factory;state.demandSource='all';state.demandStatus='all';renderAll();switchView('demand');toast(`已切換至 ${e.demandEventId} 所屬需求總覽`);return;}e.status=b.dataset.action;persist();renderAll();toast(`事件已更新為「${e.status}」`);if(e.status==='模擬中')switchView('simulation');}));
}

function renderSimulation(){
  const e=selectedEvent();$('#simulationSubtitle').textContent=`${e.id}｜${e.demandEventId}｜${e.customer} ${e.model}｜${e.relationChain}｜需求 ${e.versionFrom} → ${e.versionTo}`;
  const delta=Math.max(0,e.newQty-e.oldQty);$('#quantitySlider').value=state.simulated?.eventId===e.id?state.simulated.extra:delta;$('#dateSlider').value=state.simulated?.eventId===e.id?state.simulated.earlier:Math.max(0,-dateDiff(e.newDate,e.oldDate));$('#prioritySelect').value=String(e.priority);updateSimulationOutputs();runSimulation(false);
}
function updateSimulationOutputs(){$('#quantityOutput').textContent=`+${fmt(Number($('#quantitySlider').value))} 件`;$('#dateOutput').textContent=`提前 ${$('#dateSlider').value} 天`;}
function runSimulation(showToast=false){
  const e=selectedEvent(),extra=Number($('#quantitySlider').value),earlier=Number($('#dateSlider').value),priority=Number($('#prioritySelect').value);const demand=Math.max(100,e.oldQty+extra);const pressure=1+extra/Math.max(1,e.oldQty)*.72+earlier*.022+(4-priority)*.035;const baseCapacity=e.oldQty*.94;const finite=Math.min(demand,Math.round(baseCapacity/pressure+e.oldQty*.10));const gap=Math.max(0,demand-finite);const completionDelay=Math.ceil(gap/Math.max(300,e.oldQty*.06));const capHours=Math.round(demand*.08),mat=demand,test=Math.round(demand*.04);state.simulated={eventId:e.id,extra,earlier,priority,demand,finite,gap,completionDelay,capHours,mat,test};
  $('#unlimitedMetrics').innerHTML=metricRows([['需求完成數量',`${fmt(demand)} 件`,100],['理論完成日期',formatDate(shiftDate(e.oldDate,-earlier)),100],['組裝所需工時',`${fmt(capHours)} 小時`,Math.min(100,pressure*72)],['關鍵材料需求',`${fmt(mat)} 件`,100],['SMT／測試需求',`${fmt(test)} 小時`,Math.min(100,pressure*78)]]);
  $('#finiteMetrics').innerHTML=metricRows([['可完成數量',`${fmt(finite)} 件`,finite/demand*100],['預估完成日期',formatDate(shiftDate(e.newDate,completionDelay)),Math.max(30,100-completionDelay*8)],['可用組裝工時',`${fmt(Math.round(capHours*finite/demand))} 小時`,finite/demand*100],['可用關鍵材料',`${fmt(Math.round(mat*(finite/demand+.015)))} 件`,Math.min(100,(finite/demand+.015)*100)],['可用SMT／測試',`${fmt(Math.round(test*(finite/demand+.03)))} 小時`,Math.min(100,(finite/demand+.03)*100)]]);
  $('#gapTag').textContent=`缺口 ${fmt(gap)} 件`;
  const b=scenarioBottlenecks();$('#gapAnalysis').innerHTML=`<div class="gap-summary"><div class="gap-card"><span>需求量</span><strong>${fmt(demand)}</strong></div><div class="gap-card"><span>有限可達</span><strong>${fmt(finite)}</strong></div><div class="gap-card"><span>未滿足缺口</span><strong>${fmt(gap)}</strong></div><div class="gap-card"><span>滿足率</span><strong>${(finite/demand*100).toFixed(1)}%</strong></div></div><div class="impact-list">${b.map(x=>`<div class="impact-row"><div><h3>${x.name}</h3><p>${x.dept}・${x.owner}</p></div><div class="bar-track"><i style="width:${x.impact}%"></i></div>${sevTag(x.severity)}</div>`).join('')}</div>`;
  renderSimulationBreakdown();renderBottlenecks();renderCommit();renderDecision();if(showToast)toast('已使用相同需求快照完成有限／無限模擬');
}
function metricRows(items){return items.map(([l,v,p])=>`<div class="metric-row"><div class="metric-line"><span>${l}</span><strong>${v}</strong></div><div class="bar-track"><i style="width:${Math.max(4,Math.min(100,p))}%"></i></div></div>`).join('');}
function renderSimulationBreakdown(){
  $$('#simulationDimension .segment').forEach(b=>b.classList.toggle('active',b.dataset.dimension===state.simDimension));
  const activeRows=state.demandEvents.filter(d=>inScope(d.factory)&&d.status!=='已取消'&&d.status!=='已轉換'&&d.status!=='已被PO消耗').map(d=>({...d,analysisQty:d.source==='計畫庫存'?(d.remainingQty??d.qty):d.qty})).filter(d=>d.analysisQty>0);
  const rows=state.simDimension==='customer'?activeRows.filter(d=>d.source==='客戶PO'&&d.customer):activeRows;
  const key=state.simDimension==='product'?'product':'customer';const groups=rows.reduce((a,d)=>{const k=d[key];(a[k]??=[]).push(d);return a;},{});
  const data=Object.entries(groups).map(([name,items])=>{const demand=items.reduce((s,x)=>s+x.analysisQty,0);const factor=.79+(hashText(name)%19)/100;const finite=Math.round(demand*Math.min(.98,factor));const gap=demand-finite;return{name,demand,finite,gap,rate:finite/demand*100,secondary:state.simDimension==='product'?[...new Set(items.map(x=>x.factory))].join('、'):[...new Set(items.map(x=>x.product))].slice(0,3).join('、'),constraint:['材料供應','SMT能力','組裝產能','測試設備','無重大限制'][hashText(name)%5]};}).sort((a,b)=>b.gap-a.gap).slice(0,18);
  $('#simulationBreakdownHead').innerHTML=`<tr><th>${state.simDimension==='product'?'產品':'客戶'}</th><th>${state.simDimension==='product'?'生產工廠':'產品組合'}</th><th>無限需求</th><th>有限可達</th><th>缺口</th><th>滿足率</th><th>主要限制</th></tr>`;
  $('#simulationBreakdownBody').innerHTML=data.map(x=>`<tr><td><strong>${x.name}</strong></td><td class="reason-text">${x.secondary}</td><td>${fmt(x.demand)}</td><td>${fmt(x.finite)}</td><td class="${x.gap?'delta-up':'delta-down'}">${fmt(x.gap)}</td><td><div class="coverage-cell"><strong>${x.rate.toFixed(1)}%</strong><div class="mini-progress"><i style="width:${x.rate}%"></i></div></div></td><td>${x.constraint}</td></tr>`).join('')||'<tr><td colspan="7">此範圍沒有需求資料</td></tr>';
}
function scopeFactoryIds(){
  if(state.factory!=='ALL')return [state.factory];
  if(state.region!=='ALL')return regions.find(r=>r.id===state.region).factories.map(([id])=>id);
  return allFactories;
}
function capacityResourcesForFactory(factory){
  const families=new Set((factoryProducts[factory]||[]).map(p=>p.family));
  const resources=[{id:'SMT-01',name:'SMT 高速線',type:'SMT',capacity:20}];
  if([...families].some(f=>['電源系統','車用電力電子','電動車動力','充電基礎設施','新能源'].includes(f)))resources.push({id:'MOD-01',name:'功率模組製造線',type:'MODULE',capacity:18});
  else if([...families].some(f=>['熱管理與馬達'].includes(f)))resources.push({id:'MOD-01',name:'馬達繞線／轉子線',type:'MODULE',capacity:18});
  else if([...families].some(f=>['影像與安控'].includes(f)))resources.push({id:'MOD-01',name:'光學／影像模組線',type:'MODULE',capacity:16});
  else resources.push({id:'MOD-01',name:'控制模組製造線',type:'MODULE',capacity:18});
  resources.push({id:'ASM-01',name:'最終組裝線 A',type:'ASSEMBLY',capacity:20},{id:'ASM-02',name:'最終組裝線 B',type:'ASSEMBLY',capacity:16});
  const testName=[...families].some(f=>['電源系統','車用電力電子','新能源'].includes(f))?'老化／功能測試線':[...families].some(f=>f==='影像與安控')?'影像校正／功能測試線':'功能測試／校正線';
  resources.push({id:'TST-01',name:testName,type:'TEST',capacity:18});return resources;
}
function effectiveFactoryDemands(factory){
  return state.demandEvents.filter(d=>d.factory===factory&&!['已取消','已轉換','已被PO消耗'].includes(d.status)).filter(d=>d.source==='客戶PO'||(d.source==='計畫庫存'&&(d.remainingQty??0)>0)).map(d=>({...d,effectiveQty:d.source==='計畫庫存'?(d.remainingQty??d.qty):d.qty})).sort((a,b)=>a.demandDate.localeCompare(b.demandDate));
}
function productionPlanFor(factory,horizon=14){
  const resources=capacityResourcesForFactory(factory);const demands=effectiveFactoryDemands(factory);const fallback=(factoryProducts[factory]||[]).flatMap(p=>productCatalog.filter(x=>x.productKey===p.key)).slice(0,12);
  const days=Array.from({length:horizon},(_,i)=>shiftDate(TODAY,i));
  const rows=resources.map((resource,ri)=>{
    const cells=days.map((date,di)=>{
      const seed=hashText(`${factory}-${resource.id}-${date}`);const demand=demands.length?demands[(seed+ri+di)%demands.length]:null;const item=demand?skuLookup[demand.sku]:(fallback.length?fallback[(seed+di)%fallback.length]:null);
      if(seed%29===0)return {date,kind:'maintenance',load:28,hours:Math.round(resource.capacity*.28*10)/10,title:'預防保養／換線準備',sku:'—',product:'設備保養',qty:0,demandId:'—',source:'維護'};
      if(seed%19===0)return {date,kind:'idle',load:0,hours:0,title:'待排／能力保留',sku:'—',product:'未排產',qty:0,demandId:'—',source:'能力保留'};
      let load=58+seed%47;if(demand?.priority===1)load+=7;if(demand&&dateDiff(demand.demandDate,date)<=7)load+=6;load=Math.min(118,load);
      const hours=Math.round(resource.capacity*load)/100;const baseQty=demand?.effectiveQty||1200;const qty=Math.max(40,Math.round(baseQty/Math.max(7,horizon)*(0.72+(seed%35)/100)));
      return {date,kind:load>100?'over':load>=85?'tight':'normal',load,hours,title:item?.product||demand?.product||'混合產品',sku:item?.sku||demand?.sku||'—',product:item?.product||demand?.product||'混合產品',qty,demandId:demand?.id||'補庫排程',source:demand?.source||'計畫排程'};
    });
    return {resource,cells};
  });
  const cells=rows.flatMap(r=>r.cells);const working=cells.filter(c=>c.kind!=='idle');const avg=working.length?working.reduce((s,c)=>s+c.load,0)/working.length:0;
  return {factory,days,rows,avg,over:cells.filter(c=>c.load>100).length,tight:cells.filter(c=>c.load>=85&&c.load<=100).length,maintenance:cells.filter(c=>c.kind==='maintenance').length,plannedHours:cells.reduce((s,c)=>s+c.hours,0),capacityHours:resources.reduce((s,r)=>s+r.capacity*horizon,0)};
}
function loadClass(load){return load>100?'over':load>=85?'tight':'normal';}
function weekdayLabel(date){return ['日','一','二','三','四','五','六'][parseDate(date).getDay()];}
function renderProduction(){
  const factories=scopeFactoryIds();if(!factories.includes(state.productionFactory))state.productionFactory=factories[0]||allFactories[0];
  $('#productionFactorySelect').innerHTML=factories.map(f=>`<option value="${f}">${f}｜${factoryName(f)}</option>`).join('');$('#productionFactorySelect').value=state.productionFactory;
  $('#productionHorizonSelect').value=String(state.productionHorizon);$('#productionResourceFilter').value=state.productionResource;
  const summaries=factories.map(f=>productionPlanFor(f,state.productionHorizon)).sort((a,b)=>b.avg-a.avg);const selected=productionPlanFor(state.productionFactory,state.productionHorizon);
  const avg=summaries.length?summaries.reduce((s,x)=>s+x.avg,0)/summaries.length:0;const over=summaries.reduce((s,x)=>s+x.over,0);const tight=summaries.reduce((s,x)=>s+x.tight,0);const max=summaries[0];
  $('#productionKpis').innerHTML=[['平均 Loading',`${avg.toFixed(1)}%`,`${factories.length}座工廠／未來${state.productionHorizon}天`,'L','tone-blue'],['超載資源日',over,'每日資源負荷超過100%','!','tone-red'],['吃緊資源日',tight,'負荷介於85%至100%','△','tone-yellow'],['最高負荷工廠',max?`${max.factory} ${max.avg.toFixed(0)}%`:'—',max?factoryName(max.factory):'目前無資料','F','tone-green']].map(kpiCard).join('');
  $('#factoryLoadingCards').innerHTML=summaries.map(x=>`<button class="factory-loading-card ${x.factory===state.productionFactory?'active':''} ${loadClass(x.avg)}" data-factory="${x.factory}"><div class="event-row"><span class="event-id">${x.factory}</span><span class="loading-percent">${x.avg.toFixed(0)}%</span></div><strong>${factoryName(x.factory)}</strong><div class="loading-bar"><i style="width:${Math.min(100,x.avg)}%"></i></div><div class="loading-card-meta"><span>超載 ${x.over}</span><span>吃緊 ${x.tight}</span><span>${fmt(x.plannedHours)}h</span></div></button>`).join('');
  $$('.factory-loading-card').forEach(b=>b.addEventListener('click',()=>{state.productionFactory=b.dataset.factory;renderProduction();}));
  const rows=selected.rows.filter(r=>state.productionResource==='all'||r.resource.type===state.productionResource);$('#capacityGridTitle').textContent=`${selected.factory}｜${factoryName(selected.factory)} 產能資源逐日排程`;$('#capacityGridSubtitle').textContent=`平均 Loading ${selected.avg.toFixed(1)}%，計畫工時 ${fmt(selected.plannedHours)}／可用 ${fmt(selected.capacityHours)} 小時。`;
  $('#capacityGridCount').textContent=`${rows.length}項資源 × ${selected.days.length}天`;
  $('#capacityGridHead').innerHTML=`<tr><th class="resource-sticky">產能資源</th>${selected.days.map(d=>`<th><strong>${formatDate(d)}</strong><span>週${weekdayLabel(d)}</span></th>`).join('')}</tr>`;
  $('#capacityGridBody').innerHTML=rows.map(r=>`<tr><th class="resource-sticky"><strong>${r.resource.name}</strong><span>${r.resource.id}・${r.resource.capacity}h／日</span><em>${r.resource.type}</em></th>${r.cells.map(c=>`<td><button class="capacity-cell ${c.kind}" data-resource="${r.resource.name}" data-date="${c.date}" data-product="${c.product}" data-sku="${c.sku}" data-load="${c.load}" data-hours="${c.hours}" data-qty="${c.qty}" data-demand="${c.demandId}" data-source="${c.source}"><span class="cell-load">${c.load}%</span><strong>${c.product}</strong><small>${c.sku}</small>${c.qty?`<em>${fmt(c.qty)}件</em>`:`<em>${c.title}</em>`}</button></td>`).join('')}</tr>`).join('');
  $$('.capacity-cell').forEach(c=>c.addEventListener('click',()=>toast(`${c.dataset.date}｜${c.dataset.resource}｜${c.dataset.product} ${c.dataset.sku}｜${c.dataset.qty}件｜${c.dataset.hours}h／${c.dataset.load}%｜${c.dataset.source} ${c.dataset.demand}`)));
}

function scenarioBottlenecks(){const e=selectedEvent();return bottleneckTemplates.map((b,i)=>({...b,factory:i===0?e.factory:i===1?productLookup[skuLookup[e.model]?.productKey]?.factories?.[1]||e.factory:i===2?productLookup[skuLookup[e.model]?.productKey]?.factories?.[2]||e.factory:e.factory,impactQty:Math.max(100,Math.round((state.simulated?.gap||e.newQty*.12)*[.52,.25,.15,.08][i]))}));}
function renderBottlenecks(){const list=scenarioBottlenecks();$('#bottleneckMatrix').innerHTML=`<span class="axis-y">交付與營收影響 ↑</span><span class="axis-x">處理難度 →</span>`+list.map(x=>`<div class="matrix-dot ${x.severity}" style="left:${x.difficulty}%;top:${100-x.impact}%">${x.name}</div>`).join('');$('#bottleneckTable').innerHTML=list.map(x=>`<tr><td><strong>${x.name}</strong><br><span class="event-id">${x.type}</span></td><td>${x.factory}<br><span class="event-id">${factoryName(x.factory)}</span></td><td>${x.gap}</td><td>${fmt(x.impactQty)}件</td><td>${money(x.revenue)}</td><td class="owner-cell"><strong>${x.owner}</strong><span>${x.dept}</span></td><td>${sevTag(x.severity)}</td></tr>`).join('');}
function renderHotspot(sel,list){$(sel).innerHTML=list.map(x=>`<div class="hotspot-node ${x.severity}" style="left:${Math.min(86,x.difficulty)}%;top:${Math.max(12,100-x.impact)}%"><strong>${x.name}</strong><span>${x.gap}</span></div>`).join('');}

function networkRows(){return supplyRelations.filter(r=>inScope(r.destination)).filter(r=>state.networkProduct==='all'||r.productKey===state.networkProduct).filter(r=>state.networkSku==='all'||r.sku===state.networkSku).filter(r=>state.networkRelation==='all'||r.type===state.networkRelation);}
function renderNetwork(){
  $('#networkProductSelect').value=state.networkProduct;$('#networkSkuSelect').value=state.networkSku;$('#networkRelationSelect').value=state.networkRelation;
  const rows=networkRows();const risk=rows.filter(r=>r.supply/r.demand<.9);const external=rows.filter(r=>r.type==='external').length;const interplant=rows.filter(r=>['module','smt','transfer'].includes(r.type)).length;
  $('#networkKpis').innerHTML=[['供應關係',rows.length,'目前篩選範圍','N','tone-blue'],['友廠協同',interplant,'模組／SMT／調撥','↔','tone-green'],['外部供應',external,'料件與現成模組','E','tone-yellow'],['供給風險',risk.length,'覆蓋率低於90%','!','tone-red']].map(kpiCard).join('');
  const selectedSku=state.networkSku!=='all'?skuLookup[state.networkSku]:rows[0]?skuLookup[rows[0].sku]:productCatalog[0];
  const mapRows=rows.filter(r=>!selectedSku||r.sku===selectedSku.sku).slice(0,8);const dest=selectedSku?.factory||mapRows[0]?.destination;
  $('#supplyNetworkMap').innerHTML=`<div class="network-center"><span>生產工廠</span><strong>${dest||'—'}</strong><small>${factoryName(dest)}</small></div><div class="network-source-grid">${mapRows.map(r=>`<button class="network-source ${r.type}" data-source="${r.source}"><span>${relationLabel(r.type)}</span><strong>${r.source}</strong><small>${r.item}</small><i>${Math.round(r.supply/r.demand*100)}%</i></button>`).join('')}</div>`;
  const bom=selectedSku?.bom;$('#bomSummary').innerHTML=bom?`<strong>${selectedSku.sku}</strong><span>${selectedSku.product}・${selectedSku.factory}</span>`:'<span>請選擇成品料號</span>';$('#bomTree').innerHTML=bom?renderBomNode(bom,0):'<div class="empty-state">沒有BOM資料</div>';
  $('#networkRelationCount').textContent=`${rows.length}條供應關係`;
  $('#networkRelationTable').innerHTML=rows.slice(0,120).map(r=>{const rate=r.supply/r.demand*100;const sev=rate<85?'red':rate<95?'yellow':'green';return `<tr><td><strong>${r.source}</strong></td><td><span class="tag ${r.type==='external'?'info':r.type==='module'?'success':r.type==='smt'?'warning':'neutral'}">${relationLabel(r.type)}</span></td><td><strong>${r.item}</strong><br><span class="event-id">${r.sku}</span></td><td>${r.destination}<br><span class="event-id">${factoryName(r.destination)}</span></td><td>${fmt(r.demand)}</td><td>${fmt(r.supply)}</td><td><div class="coverage-cell"><strong>${rate.toFixed(0)}%</strong><div class="mini-progress ${sev}"><i style="width:${Math.min(100,rate)}%"></i></div></div></td><td>${r.lead}天</td><td>${sevTag(sev)}</td></tr>`;}).join('')||'<tr><td colspan="9">沒有符合條件的供應關係</td></tr>';
  $$('.bom-toggle').forEach(b=>b.addEventListener('click',()=>b.closest('.bom-node').classList.toggle('collapsed')));
}
function relationLabel(t){return{external:'外部供應商',module:'友廠模組',smt:'友廠SMT',transfer:'跨廠調撥'}[t]||t;}
function renderBomNode(node,level){const children=node.children||[];return `<div class="bom-node level-${level}"><div class="bom-node-row"><button class="bom-toggle" ${children.length?'':'disabled'}>${children.length?'−':'•'}</button><div><strong>${node.id}</strong><span>${node.name}</span></div><em>${node.source}</em></div>${children.length?`<div class="bom-children">${children.map(c=>renderBomNode(c,level+1)).join('')}</div>`:''}</div>`;}

function renderCommit(){const tasks=scenarioBottlenecks();$('#commitTaskCount').textContent=`${tasks.length}項待處理`;$('#commitTaskList').innerHTML=tasks.map(t=>`<div class="task-card ${state.selectedTaskId===t.id?'active':''}" data-task="${t.id}"><div class="event-row"><span class="event-id">${t.id}・${t.factory}</span>${sevTag(t.severity)}</div><h3>${t.name}</h3><p>${t.owner}・${t.dept}｜影響 ${fmt(t.impactQty)} 件</p></div>`).join('');$$('.task-card').forEach(c=>c.addEventListener('click',()=>{state.selectedTaskId=c.dataset.task;renderCommit();}));const task=tasks.find(t=>t.id===state.selectedTaskId)||tasks[0];renderCommitWorkbench(task);}
function renderCommitWorkbench(task){if(!task){$('#commitWorkbench').innerHTML='<div class="empty-state">請選擇一項瓶頸任務</div>';return;}const e=selectedEvent();const saved=state.commits[`${e.id}-${task.id}`];$('#commitWorkbench').innerHTML=`<div class="workbench-hero"><p class="eyebrow">${e.id}・${task.factory}</p><h2>${task.name}</h2><p>${task.owner}需針對${task.gap}缺口，提交含數量、日期、成本及前提的條件式承諾。</p></div><h3>選擇處理方案</h3><div class="option-grid">${task.options.map(o=>`<label class="option-card ${saved?.selected?.includes(o.id)?'selected':''}"><input type="checkbox" value="${o.id}" ${saved?.selected?.includes(o.id)?'checked':''}><h3>${o.name}</h3><p>${o.desc}</p><div class="option-metrics"><span>+${fmt(o.qty)}件</span><span>${money(o.cost)}</span><span>風險${o.risk}</span></div></label>`).join('')}</div><div id="commitPreview" class="commit-preview"></div><h3>承諾前提</h3><ul class="assumption-list"><li>承諾綁定 Demand ${e.versionTo} 與需求日期 ${formatDate(e.newDate)}。</li><li>友廠模組、SMT代工與跨廠調料須完成品質及客戶核可。</li></ul><div class="detail-actions"><button class="primary-button" id="submitCommit">提交 Commit</button><button class="secondary-button" id="clearCommit">清除選擇</button></div>`;
  $$('.option-card input').forEach(inp=>inp.addEventListener('change',()=>{inp.closest('.option-card').classList.toggle('selected',inp.checked);updateCommitPreview(task);}));$('#clearCommit').addEventListener('click',()=>{$$('.option-card input').forEach(i=>{i.checked=false;i.closest('.option-card').classList.remove('selected');});updateCommitPreview(task);});$('#submitCommit').addEventListener('click',()=>{const selected=$$('.option-card input:checked').map(x=>x.value);if(!selected.length){toast('請至少選擇一個處理方案');return;}const calc=calcCommit(task,selected);state.commits[`${e.id}-${task.id}`]={selected,...calc,submitted:true};persist();renderCommit();toast(`${task.owner} 的 Commit 已提交`);});updateCommitPreview(task);
}
function calcCommit(task,selected){const opts=task.options.filter(o=>selected.includes(o.id)),recovered=opts.reduce((s,o)=>s+o.qty,0),cost=opts.reduce((s,o)=>s+o.cost,0),maxDays=Math.max(0,...opts.map(o=>o.days));const e=selectedEvent(),base=state.simulated?.eventId===e.id?state.simulated.finite:Math.round(e.oldQty*.92),commitQty=Math.min(e.newQty,base+recovered);return{recovered,cost,maxDays,commitQty,remaining:Math.max(0,e.newQty-commitQty)};}
function updateCommitPreview(task){const selected=$$('.option-card input:checked').map(x=>x.value),c=calcCommit(task,selected),e=selectedEvent();$('#commitPreview').innerHTML=`<div class="commit-preview-grid"><div><span>可回收缺口</span><strong>+${fmt(c.recovered)} 件</strong></div><div><span>承諾數量</span><strong>${fmt(c.commitQty)} 件</strong></div><div><span>剩餘缺口</span><strong>${fmt(c.remaining)} 件</strong></div><div><span>額外成本</span><strong>${money(c.cost)}</strong></div></div><p class="muted" style="margin:10px 0 0">建議承諾：${formatDate(e.newDate)}前完成${fmt(c.commitQty)}件；剩餘${fmt(c.remaining)}件於${formatDate(shiftDate(e.newDate,c.maxDays+2))}前完成。</p>`;}

function buildScenarios(){const e=selectedEvent(),sim=state.simulated?.eventId===e.id?state.simulated:null,finite=sim?.finite||Math.round(e.oldQty*.92),demand=sim?.demand||e.newQty,commits=Object.entries(state.commits).filter(([k,v])=>k.startsWith(`${e.id}-`)&&v.submitted).map(([,v])=>v),recovery=commits.reduce((s,c)=>s+c.recovered,0),cost=commits.reduce((s,c)=>s+c.cost,0);return[{id:'S1',name:'維持現有資源',desc:'不增加成本，以現有產能與物料分批交付。',qty:finite,date:shiftDate(e.newDate,Math.ceil(Math.max(0,demand-finite)/500)),cost:0,customer:'高',other:'低',score:2},{id:'S2',name:'友廠協同＋材料加急',desc:'使用友廠模組、SMT代工及材料加急，平衡交付與成本。',qty:Math.min(demand,finite+Math.max(1200,recovery)),date:shiftDate(e.newDate,Math.max(1,Math.ceil(Math.max(0,demand-finite-recovery)/700))),cost:Math.max(67,cost),customer:'中低',other:'低',score:4,recommended:true},{id:'S3',name:'調整其他客戶順位',desc:'犧牲低優先訂單，優先滿足策略客戶。',qty:demand,date:e.newDate,cost:42,customer:'低',other:'高',score:3}];}
function renderDecision(){const e=selectedEvent(),scenarios=buildScenarios();$('#decisionSummary').innerHTML=`<div class="decision-summary-grid"><div><p class="eyebrow">${e.id}・DECISION PACKAGE</p><h2>${e.customer}｜${e.product}－${e.title}</h2><p class="muted">請在交付、跨廠供應、成本與既有客戶影響之間作出取捨。</p></div><div class="summary-value"><span>新需求</span><strong>${fmt(e.newQty)}件</strong></div><div class="summary-value"><span>需求日期</span><strong>${formatDate(e.newDate)}</strong></div><div class="summary-value"><span>有限計畫缺口</span><strong>${fmt(state.simulated?.eventId===e.id?state.simulated.gap:Math.max(0,e.newQty-Math.round(e.oldQty*.92)))}件</strong></div><div class="summary-value"><span>版本</span><strong>${e.versionFrom}→${e.versionTo}</strong></div></div>`;$('#scenarioGrid').innerHTML=scenarios.map(s=>`<article class="scenario-card ${state.selectedScenario===s.id?'selected':''}" data-scenario="${s.id}">${s.recommended?'<span class="recommended">系統建議</span>':''}<p class="eyebrow">${s.id}</p><h2>${s.name}</h2><p>${s.desc}</p><div class="scenario-metrics"><div class="scenario-metric"><span>可交數量</span><strong>${fmt(s.qty)} 件</strong></div><div class="scenario-metric"><span>完成日期</span><strong>${formatDate(s.date)}</strong></div><div class="scenario-metric"><span>額外成本</span><strong>${money(s.cost)}</strong></div><div class="scenario-metric"><span>策略客戶風險</span><strong>${s.customer}</strong></div><div class="scenario-metric"><span>其他客戶影響</span><strong>${s.other}</strong></div></div><div class="event-row"><span class="event-id">綜合評分</span><div class="score-row">${[1,2,3,4,5].map(i=>`<i class="${i<=s.score?'on':''}"></i>`).join('')}</div></div></article>`).join('');$$('.scenario-card').forEach(c=>c.addEventListener('click',()=>{state.selectedScenario=c.dataset.scenario;renderDecision();}));$('#approveScenario').disabled=!state.selectedScenario;}
function approveSelectedScenario(){const e=selectedEvent(),scenario=buildScenarios().find(s=>s.id===state.selectedScenario);if(!scenario)return;state.decisions[e.id]={scenario:scenario.id,name:scenario.name,note:$('#decisionNote').value,approvedAt:new Date().toISOString()};e.status='已核准';state.tracking.unshift({id:`T-${Date.now()}`,factory:e.factory,item:`${e.customer} ${e.model} 新承諾`,owner:e.owner,target:`${fmt(scenario.qty)} 件／${formatDate(scenario.date)}`,actual:'待執行',reason:`已核准「${scenario.name}」。`,severity:'green',action:'開始執行'});persist();renderAll();toast(`已核准「${scenario.name}」，建立新版本`);switchView('tracking');}

function renderTracking(){const rows=state.tracking.filter(t=>inScope(t.factory)),red=rows.filter(x=>x.severity==='red').length,yellow=rows.filter(x=>x.severity==='yellow').length,green=rows.filter(x=>x.severity==='green').length;$('#trackingKpis').innerHTML=[['紅燈異常',red,'需要立即升級','!','tone-red'],['黃燈風險',yellow,'已有對策持續追蹤','△','tone-yellow'],['正常執行',green,'依承諾進行中','✓','tone-green'],['原始承諾達成率','91.6%','排除需求版本變更','%','tone-blue']].map(kpiCard).join('');const filtered=rows.filter(r=>state.trackingFilter==='all'||r.severity===state.trackingFilter);$('#trackingTable').innerHTML=filtered.map(r=>`<tr><td><strong>${r.item}</strong><br><span class="event-id">${r.id}</span></td><td>${r.factory}<br><span class="event-id">${factoryName(r.factory)}</span></td><td>${r.owner}</td><td>${r.target}</td><td>${r.actual}</td><td class="reason-text">${r.reason}</td><td>${sevTag(r.severity)}</td><td><button class="action-link tracking-action">${r.action}</button></td></tr>`).join('')||'<tr><td colspan="8">沒有符合條件的追蹤項目</td></tr>';$$('.tracking-filter').forEach(b=>{b.classList.toggle('active',b.dataset.status===state.trackingFilter);b.onclick=()=>{state.trackingFilter=b.dataset.status;renderTracking();};});$$('.tracking-action').forEach(b=>b.addEventListener('click',()=>toast(`已建立處置任務：${b.textContent}`)));}

function persist(){saveStored('ct-events-v4',state.events);saveStored('ct-demand-events-v2',state.demandEvents);saveStored('ct-tracking-v3',state.tracking);saveStored('ct-commits-v3',state.commits);saveStored('ct-decisions-v3',state.decisions);}
function toast(msg){const t=$('#toast');t.textContent=msg;t.classList.add('show');clearTimeout(toast.timer);toast.timer=setTimeout(()=>t.classList.remove('show'),2600);}
function closeOverlays(){$('#sidebar').classList.remove('open');$('#overlay').classList.remove('show');$('#tourModal').classList.remove('show');}
function parseDate(v){return new Date(`${String(v).replaceAll('/','-')}T00:00:00`);}
function dateDiff(a,b){return Math.round((parseDate(a)-parseDate(b))/86400000);}
function shiftDate(date,days){const d=parseDate(date);d.setDate(d.getDate()+days);return d.toISOString().slice(0,10);}
function formatDate(d){const x=parseDate(d);return `${x.getMonth()+1}/${x.getDate()}`;}
function formatDateFull(d){const x=parseDate(d);return `${x.getFullYear()}/${String(x.getMonth()+1).padStart(2,'0')}/${String(x.getDate()).padStart(2,'0')}`;}

function setupTour(){
  const steps=[
    {view:'overview',title:'1. 控制塔總覽',text:'從全球、地區或單一工廠查看需求、內部SO、變更風險及決策事項。',path:['選地區／工廠','看需求與SO','進入重大項目']},
    {view:'demand',title:'2. BY廠區需求總覽',text:'來源批次會依每一個需求日期拆成獨立事件，並保留來源與狀態。',path:['客戶預測／PO','日期拆分','確認／轉SO']},
    {view:'shipment',title:'3. 客戶PO出貨總覽',text:'只有客戶PO轉成內部SO後才進入出貨總覽，並顯示內外銷、客戶、目的地、運輸模式與出貨狀態。',path:['客戶PO→內部SO','內外銷','運輸模式']},
    {view:'events',title:'4. 需求變更事件',text:'重大變更不直接覆蓋舊版本，而是保留數量、日期、來源與原因差異。',path:['版本差異','門檻判定','接受／退回／升級']},
    {view:'simulation',title:'5. 有限與無限模擬',text:'以相同快照比較需求與實際可達量，並可切換BY產品或BY客戶。',path:['無限需求','有限可達','產品／客戶檢視']},
    {view:'network',title:'6. 供應網路與BOM',text:'展開多階BOM，查看外部供應、友廠模組、SMT代工與跨廠調撥。',path:['多階BOM','友廠協同','供給覆蓋率']},
    {view:'routing',title:'7. 生產供應途程',text:'從成品需求往下看生產先後、執行地點，以及每一道途程需要齊套的工單與採購PO。',path:['途程順序','站點齊套','跨廠執行']},
    {view:'production',title:'8. 產區現況',text:'比較各廠Loading，並用資源×日期時間網格查看每日正在生產的產品與料號。',path:['廠區負荷','產能資源','逐日排程']},
    {view:'bottlenecks',title:'9. 瓶頸與責任',text:'找出產能、材料、SMT及人力瓶頸並指派責任人。',path:['風險矩陣','責任人','Commit']},
    {view:'decision',title:'10. 決策與追蹤',text:'主管比較跨廠協同、加急與客戶取捨方案，核准後進入執行追蹤。',path:['比較方案','核准版本','Highlight']}
  ];let idx=0;const show=()=>{const s=steps[idx];$('#tourStep').innerHTML=`<h3>${s.title}</h3><p>${s.text}</p><div class="step-path">${s.path.map(x=>`<span>${x}</span>`).join('')}</div>`;$('#tourProgress').textContent=`${idx+1} / ${steps.length}`;$('#tourPrev').disabled=idx===0;$('#tourNext').textContent=idx===steps.length-1?'完成':'下一步';switchView(s.view,true);};$('#guidedTour').addEventListener('click',()=>{idx=0;$('#overlay').classList.add('show');$('#tourModal').classList.add('show');show();});$('#tourClose').addEventListener('click',closeOverlays);$('#tourPrev').addEventListener('click',()=>{if(idx>0){idx--;show();}});$('#tourNext').addEventListener('click',()=>{if(idx<steps.length-1){idx++;show();}else closeOverlays();});
}

document.addEventListener('DOMContentLoaded',init);
