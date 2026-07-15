const TODAY = '2026-07-14';

const regions = [
  { id:'TW', name:'台灣', factories:[['TW01','桃園一廠'],['TW02','新竹二廠'],['TW03','台中三廠'],['TW04','台南四廠']] },
  { id:'CN', name:'中國', factories:[['CN01','上海一廠'],['CN02','蘇州二廠'],['CN03','昆山三廠'],['CN04','深圳四廠'],['CN05','成都五廠'],['CN06','重慶六廠']] },
  { id:'TH', name:'泰國', factories:[['TH01','曼谷一廠'],['TH02','春武里二廠'],['TH03','羅勇三廠'],['TH04','大城四廠'],['TH05','巴吞他尼五廠'],['TH06','北欖六廠'],['TH07','巴真武里七廠'],['TH08','清邁八廠']] }
];

const factoryLookup = Object.fromEntries(regions.flatMap(r => r.factories.map(([id,name]) => [id,{id,name,region:r.id,regionName:r.name}])));
const allFactories = regions.flatMap(r => r.factories.map(([id]) => id));

const productTypes = [
  {key:'UPS',name:'UPS不斷電系統',family:'電源系統',factories:['TW01','CN01','TH01'],orderLeadTime:45},
  {key:'EPS',name:'嵌入式電源供應器',family:'電源系統',factories:['TW01','CN01','TH01'],orderLeadTime:30},
  {key:'TRF',name:'變壓器',family:'電源系統',factories:['TW01','CN03','TH06'],orderLeadTime:60},
  {key:'RTR',name:'路由器',family:'資通訊',factories:['TW02','CN04','TH07'],orderLeadTime:28},
  {key:'FAN',name:'散熱風扇模組',family:'熱管理與馬達',factories:['TW03','CN05','TH04'],orderLeadTime:21},
  {key:'BLM',name:'直流無刷馬達',family:'熱管理與馬達',factories:['TW03','CN05','TH04'],orderLeadTime:45},
  {key:'OBC',name:'車載充電器',family:'車用電力電子',factories:['TW04','CN02','TH03'],orderLeadTime:75},
  {key:'DCDC',name:'直流電能轉換器',family:'車用電力電子',factories:['TW04','CN02','TH03'],orderLeadTime:60},
  {key:'INV',name:'牽引逆變器',family:'電動車動力',factories:['TW04','CN06','TH03'],orderLeadTime:90},
  {key:'EDM',name:'電動車驅動馬達',family:'電動車動力',factories:['TW03','CN06','TH03'],orderLeadTime:90},
  {key:'MCU',name:'馬達控制器',family:'電動車動力',factories:['TW04','CN06','TH03'],orderLeadTime:75},
  {key:'EVSE',name:'直流/交流電動車充電樁設備',family:'充電基礎設施',factories:['TW04','CN02','TH05'],orderLeadTime:60},
  {key:'VFD',name:'變頻器',family:'工業自動化',factories:['TW02','CN03','TH02'],orderLeadTime:45},
  {key:'PLC',name:'PLC控制器',family:'工業自動化',factories:['TW02','CN03','TH02'],orderLeadTime:35},
  {key:'LED',name:'LED 照明模組',family:'照明',factories:['TW02','CN05','TH08'],orderLeadTime:21},
  {key:'SOL',name:'太陽能逆變器',family:'新能源',factories:['TW01','CN01','TH05'],orderLeadTime:60},
  {key:'ESS',name:'儲能系統（ESS）',family:'新能源',factories:['TW01','CN01','TH05'],orderLeadTime:120},
  {key:'MGC',name:'微電網控制器',family:'新能源',factories:['TW02','CN01','TH05'],orderLeadTime:75},
  {key:'FAS',name:'新風系統',family:'樓宇自動化',factories:['TW03','CN05','TH04'],orderLeadTime:45},
  {key:'CAM',name:'安控攝影機',family:'影像與安控',factories:['TW02','CN04','TH07'],orderLeadTime:30},
  {key:'PRJ',name:'投影機',family:'影像與安控',factories:['TW02','CN04','TH08'],orderLeadTime:45}
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
    return {sku,productKey:p.key,product:p.name,family:p.family,factory,orderLeadTime:p.orderLeadTime,bom:buildBom(p,sku,idx+i)};
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


const destinationMaster = [
  {id:'TW-TPE',region:'TW',country:'台灣',city:'台北',label:'台灣／台北'},
  {id:'TW-HSZ',region:'TW',country:'台灣',city:'新竹',label:'台灣／新竹'},
  {id:'TW-KHH',region:'TW',country:'台灣',city:'高雄',label:'台灣／高雄'},
  {id:'CN-SHA',region:'CN',country:'中國',city:'上海',label:'中國／上海'},
  {id:'CN-SZX',region:'CN',country:'中國',city:'深圳',label:'中國／深圳'},
  {id:'CN-SUZ',region:'CN',country:'中國',city:'蘇州',label:'中國／蘇州'},
  {id:'TH-BKK',region:'TH',country:'泰國',city:'曼谷',label:'泰國／曼谷'},
  {id:'TH-RYG',region:'TH',country:'泰國',city:'羅勇',label:'泰國／羅勇'},
  {id:'DE-HAM',region:'EU',country:'德國',city:'漢堡',label:'德國／漢堡'},
  {id:'US-DFW',region:'US',country:'美國',city:'達拉斯',label:'美國／達拉斯'},
  {id:'JP-NGO',region:'JP',country:'日本',city:'名古屋',label:'日本／名古屋'},
  {id:'SG-SIN',region:'SG',country:'新加坡',city:'新加坡',label:'新加坡／新加坡'}
];
const customerDestinationMap = {
  'Formosa Data Center':['TW-TPE','TW-HSZ'],
  'Pacific Telecom':['TW-KHH','TW-TPE'],
  'Dragon Cloud':['CN-SHA','CN-SUZ'],
  'Shenzhen Mobility':['CN-SZX','CN-SHA'],
  'Siam Energy':['TH-BKK','TH-RYG'],
  'Thai Automotive':['TH-RYG','TH-BKK'],
  'EuroGrid GmbH':['DE-HAM'],
  'NorthStar Systems':['US-DFW'],
  'Sakura Automation':['JP-NGO'],
  'ASEAN Distribution':['SG-SIN','TH-BKK']
};
function destinationsForCustomer(customerName){
  const ids=customerDestinationMap[customerName]||[];
  const rows=ids.map(id=>destinationMaster.find(x=>x.id===id)).filter(Boolean);
  return rows.length?rows:destinationMaster;
}
function populateManualDestinations(customerName,keep=''){
  const select=$('#manualDemandDestination');if(!select)return;
  const rows=destinationsForCustomer(customerName);
  select.innerHTML=rows.map(x=>`<option value="${x.label}">${x.label}</option>`).join('');
  if(rows.some(x=>x.label===keep))select.value=keep;
}

const demandProposers = {
  '客戶預測':[['林怡君','全球業務規劃'],['張博翔','關鍵客戶業務'],['陳玟伶','區域業務']],
  '客戶PO':[['李佳蓉','訂單管理'],['王冠宇','業務營運'],['周品妤','客戶服務']],
  '緊急詢單':[['黃信傑','業務專案'],['許雅雯','關鍵客戶業務'],['吳承翰','區域業務']],
  '內部預測':[['劉子瑜','S&OP規劃'],['蔡明哲','需求規劃'],['鄭書瑋','產品事業處']],
  '內部需求':[['郭佩珊','區域供應計畫'],['何俊廷','產品營運'],['楊欣怡','庫存規劃']],
  '計畫庫存':[['謝孟軒','生產計畫'],['蘇妍希','供應計畫'],['曾志豪','成品庫存管理']]
};

// 清除需求示範資料前所使用的標準候選值，供人工單筆建單下拉選擇。
const legacyDemandEntryOptions = {
  quantities:[709,1002,1295,1465,1588,1881,1896,2165,2174,2221,2258,2327,2458,2467,2735,2740,2751,2758,2760,2838,2924,3034,3044,3053,3107,3189,3337,3346,3355,3455,3468,3474,3620,3630,3651,3786,3841,3923,4051,4072,4208,4216,4217,4268,4423,4648,4689,4885,4900,4969,5079,5306,5336,5377,5502,5510,5703,5854,5923,5941,6070,6119,6372,6437,6736,6803,6804,7171,7234,7353,7538,7905,7970,8272,8587,8639,9006,9204,9373],
  dates:["2026-07-23","2026-07-24","2026-07-25","2026-07-26","2026-07-27","2026-07-28","2026-07-29","2026-07-30","2026-07-31","2026-08-01","2026-08-02","2026-08-03","2026-08-04","2026-08-05","2026-08-06","2026-08-07","2026-08-08","2026-08-09","2026-08-11","2026-08-13","2026-08-15","2026-08-17","2026-08-19","2026-08-21","2026-08-23","2026-08-24","2026-08-25","2026-08-27","2026-08-29","2026-08-30","2026-08-31","2026-09-02","2026-09-04","2026-09-05","2026-09-06","2026-09-08","2026-09-10","2026-09-11","2026-09-12","2026-09-14","2026-09-16","2026-09-18","2026-09-20","2026-09-22","2026-09-23","2026-09-24","2026-09-26"],
  purposes:{
    '客戶預測':['客戶需求預測（尚未形成正式訂單）'],
    '客戶PO':['正式客戶訂單','預測完整轉換','緊急詢單轉單','計畫庫存消耗'],
    '緊急詢單':['緊急交期與數量可行性詢問'],
    '內部預測':['S&OP內部需求預測','區域補庫預測'],
    '內部需求':['經核准的內部補庫／調撥需求','正式區域補庫需求'],
    '計畫庫存':['區域成品安全庫存','可承接客戶PO的計畫庫存']
  }
};
const customerDemandSources=['客戶預測','客戶PO'];
const demandSourceCategories=['客戶','內部'];
const demandTypesByCategory={客戶:['客戶預測','客戶PO'],內部:['內部預測']};
const sourcePeopleMaster={客戶:[...new Map(['客戶預測','客戶PO'].flatMap(type=>demandProposers[type]||[]).map(pair=>[pair[0],pair])).values()],內部:[...(demandProposers['內部預測']||[])]};
const internalDemandPurposes=['S&OP內部需求預測','產品／區域補庫預測','跨廠供應準備'];
const customerPoCategories=['外部客戶','內部客戶','新產品專案','維修'];
function sourceCategoryFor(type){return ['客戶預測','客戶PO'].includes(type)?'客戶':'內部';}
function getOrderLeadTime(sku){return Number(skuLookup[sku]?.orderLeadTime||productLookup[skuLookup[sku]?.productKey]?.orderLeadTime||30);}
function leadTimeAssessment(sku,demandDate){
  const orderLeadTime=getOrderLeadTime(sku);const daysToDemand=dateDiff(demandDate,TODAY);const within=daysToDemand>=0&&daysToDemand<orderLeadTime;
  return {orderLeadTime,daysToDemand,within,shortfall:Math.max(0,orderLeadTime-daysToDemand)};
}
function statusForDemand(type,sku,demandDate){
  const assessment=leadTimeAssessment(sku,demandDate);
  if(['客戶預測','客戶PO'].includes(type)&&assessment.within)return {status:'待審批',requiresApproval:true,...assessment};
  if(type==='客戶預測')return {status:'待整合',requiresApproval:false,...assessment};
  if(type==='客戶PO')return {status:'待確認',requiresApproval:false,...assessment};
  return {status:assessment.within?'已轉計畫庫存':'待整合',requiresApproval:false,...assessment};
}


function demandAuditFields(event,seed=0){
  const pool=demandProposers[event.source]||[['系統管理員','需求治理']];
  const h=hashText(`${event.factory}|${event.source}|${event.batchId||event.id}|${seed}`);
  const proposer=pool[h%pool.length];
  const proposedDate=event.proposedDate||event.createdDate||TODAY;
  const versionCount=Math.max(1,Number(event.versionCount)||1+(h%4));
  const lastVersionDate=[proposedDate,shiftDate(proposedDate,versionCount-1)].sort().at(-1)>TODAY?TODAY:shiftDate(proposedDate,versionCount-1);
  return {
    proposer:event.proposer||proposer[0],proposerDept:event.proposerDept||proposer[1],
    proposedDate,createdDate:event.createdDate||proposedDate,versionCount,currentVersion:`V${String(versionCount).padStart(2,'0')}`,
    revisionCount:Math.max(0,versionCount-1),lastVersionDate:event.lastVersionDate||lastVersionDate
  };
}
function enrichDemandAudit(event,seed=0){Object.assign(event,demandAuditFields(event,seed));return event;}
function touchDemandEvent(event){
  if(!event)return;
  event.versionCount=Math.max(1,Number(event.versionCount)||1)+1;
  event.currentVersion=`V${String(event.versionCount).padStart(2,'0')}`;
  event.revisionCount=event.versionCount-1;
  event.lastVersionDate=TODAY;
}


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
    enrichDemandAudit(event,serial);
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

    // 關係鏈二：內部預測 → 內部需求 → 計畫庫存
    const itemB=productForFactory(factory,fi+2);
    const qtyB=1200+((fi+4)*431)%6200;
    const dateB=shiftDate('2026-08-05',fi*2+4);
    const internalDemandCreated=fi%5!==2;
    const stockCreated=internalDemandCreated&&fi%6!==4;
    const internalForecast=addEvent({
      batchId:`IFC-${factory}-001`,region,factory,source:'內部預測',status:internalDemandCreated?'已轉換':'已確認',
      demandDate:dateB,productKey:itemB.productKey,product:itemB.product,sku:itemB.sku,qty:qtyB,priority:3,
      createdDate:shiftDate(TODAY,-(10+(fi%5))),purpose:'S&OP內部需求預測'
    });
    if(internalDemandCreated){
      const internalDemand=addEvent({
        batchId:`IDM-${factory}-001`,region,factory,source:'內部需求',status:stockCreated?'已轉換':'已確認',
        demandDate:dateB,productKey:itemB.productKey,product:itemB.product,sku:itemB.sku,qty:qtyB,priority:2,
        createdDate:shiftDate(TODAY,-(7+(fi%4))),originMode:'內部預測轉內部需求',purpose:'經核准的區域補庫／調撥需求'
      });
      link(internalForecast,internalDemand);
      if(stockCreated){
        const stock=addEvent({
          batchId:`STK-${factory}-001`,region,factory,sourceCategory:'內部',demandType:'計畫庫存',source:'計畫庫存',status:'已確認',
          demandDate:dateB,productKey:itemB.productKey,product:itemB.product,sku:itemB.sku,qty:qtyB,remainingQty:qtyB,priority:3,
          createdDate:shiftDate(TODAY,-(4+(fi%3))),originMode:'內部需求轉庫存',purpose:'區域成品安全庫存'
        });
        link(internalDemand,stock);
      }
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

    // 關係鏈四：內部預測 → 內部需求 → 計畫庫存 → 客戶 PO（消耗計畫庫存）
    const itemD=productForFactory(factory,fi+6);
    const qtyD=2400+((fi+7)*367)%7000;
    const dateD=shiftDate('2026-08-18',fi*2+5);
    const internalForecast2=addEvent({
      batchId:`IFC-${factory}-002`,region,factory,source:'內部預測',status:'已轉換',
      demandDate:dateD,productKey:itemD.productKey,product:itemD.product,sku:itemD.sku,qty:qtyD,priority:3,
      createdDate:shiftDate(TODAY,-(12+(fi%4))),purpose:'區域補庫預測'
    });
    const internalDemand2=addEvent({
      batchId:`IDM-${factory}-002`,region,factory,source:'內部需求',status:'已轉換',
      demandDate:dateD,productKey:itemD.productKey,product:itemD.product,sku:itemD.sku,qty:qtyD,priority:2,
      createdDate:shiftDate(TODAY,-(9+(fi%4))),originMode:'內部預測轉內部需求',purpose:'正式區域補庫需求'
    });
    link(internalForecast2,internalDemand2);
    const consumeStock=fi%5!==3;
    const stock2=addEvent({
      batchId:`STK-${factory}-002`,region,factory,source:'計畫庫存',status:consumeStock?'部分消耗':'已確認',
      demandDate:dateD,productKey:itemD.productKey,product:itemD.product,sku:itemD.sku,qty:qtyD,remainingQty:qtyD,priority:3,
      createdDate:shiftDate(TODAY,-(6+(fi%3))),originMode:'內部需求轉庫存',purpose:'可承接客戶PO的計畫庫存'
    });
    link(internalDemand2,stock2);
    if(consumeStock){
      const consumeQty=fi%2===0?qtyD:Math.round(qtyD*.65);
      stock2.remainingQty=qtyD-consumeQty;
      stock2.status=stock2.remainingQty===0?'已被PO消耗':'部分消耗';
      makeCustomerPo({factory,fi,parent:stock2,item:itemD,customer:customerC,qty:consumeQty,demandDate:shiftDate(dateD,-(fi%3)),originMode:'計畫庫存消耗',seed:5});
    }
  });
  return events;
}

const baseDemandEvents = [];

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
  const workflowStatus=po.status==='已轉內部SO'?'已核准':po.requiresApproval?'待評估':severity==='red'?'待決策':index%3===0?'模擬中':'待評估';
  const chainLabel=chain.map(x=>x.source).join(' → ');
  const stockText=po.originMode==='計畫庫存消耗'&&parent?`原計畫庫存 ${Number(parent.qty).toLocaleString('zh-TW')} 件，客戶 PO 消耗 ${Number(po.qty).toLocaleString('zh-TW')} 件，目前剩餘 ${Number(parent.remainingQty??0).toLocaleString('zh-TW')} 件。`:'';
  return {
    id:`CE-${po.id}`,approvalType:po.requiresApproval?'ORDER_LT':'DEMAND_CHANGE',region:po.region,factory:po.factory,customer:po.customer||'尚無正式客戶',model:po.sku,product:po.product,
    source:'客戶PO',originSource:parent?.source||'需求來源',originMode:po.originMode||'',title:po.requiresApproval?`客戶PO落在接單 LT 內`:changeTitleFor(po,parent),
    oldQty,newQty,oldDate,newDate,oldPriority:parent?.priority||3,priority:po.priority||2,
    revenue:Math.round(newQty*.42),impactRevenue:Math.max(120,Math.round((Math.abs(qtyDelta)+newQty*.08)*.42)),
    severity,status:workflowStatus,freeze,
    reason:`需求總覽中的 ${parent?.id||'上游事件'} 已轉換為 ${po.id}。${stockText||`轉換方式為「${po.originMode||chainLabel}」，需重新確認產能、物料與交付承諾。`}`,
    owner:['陳建宏','林怡君','王磊','Narin S.','Kanya P.'][index%5],ownerDept:['供應鏈規劃','工廠生管','區域計畫','採購管理','專案管理'][index%5],
    versionFrom:`V${String(20+index).padStart(2,'0')}`,versionTo:`V${String(21+index).padStart(2,'0')}`,
    demandEventId:po.id,upstreamEventId:parent?.id||'',rootDemandEventId:po.rootEventId||chain[0]?.id||po.id,
    relationChain:chainLabel,sourceDemandStatus:parent?.status||'—',targetDemandStatus:po.status,
    destinationCountry:po.destinationCountry,destinationCity:po.destinationCity,batchId:po.batchId,orderLeadTime:po.orderLeadTime,daysToDemand:po.daysToDemand,leadTimeShortfall:po.leadTimeShortfall
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

const trackingBase = [];

function generateSupplyRelations(){
  const externalSuppliers = ['Global Semi','PowerCore Electronics','Asia PCB','ThermalWorks','Precision Mechanics','OptiVision','Local Packaging'];
  const relations=[];
  productCatalog.forEach((item,i)=>{
    const product=productLookup[item.productKey];
    const modulePlant=product.factories[(product.factories.indexOf(item.factory)+1)%product.factories.length];
    const smtPlant=product.factories[(product.factories.indexOf(item.factory)+2)%product.factories.length];
    const weekly=0;
    relations.push({id:`R-${item.sku}-E`,sku:item.sku,productKey:item.productKey,type:'external',source:externalSuppliers[i%externalSuppliers.length],destination:item.factory,item:'關鍵電子料／機構料',demand:0,supply:0,lead:21+i%35});
    relations.push({id:`R-${item.sku}-M`,sku:item.sku,productKey:item.productKey,type:'module',source:modulePlant,destination:item.factory,item:`${item.product}核心模組`,demand:0,supply:0,lead:4+i%8});
    relations.push({id:`R-${item.sku}-S`,sku:item.sku,productKey:item.productKey,type:'smt',source:smtPlant,destination:item.factory,item:'主控制板SMT代工',demand:0,supply:0,lead:3+i%6});
    if(i%3===0) relations.push({id:`R-${item.sku}-T`,sku:item.sku,productKey:item.productKey,type:'transfer',source:modulePlant,destination:item.factory,item:'安全庫存跨廠調撥',demand:0,supply:0,lead:2+i%4});
  });
  return relations;
}
const supplyRelations=generateSupplyRelations();

function loadStored(key,fallback){try{const raw=localStorage.getItem(key);return raw?JSON.parse(raw):fallback;}catch{return fallback;}}
function saveStored(key,value){try{localStorage.setItem(key,JSON.stringify(value));}catch{}}
function clearStored(keys){try{keys.forEach(k=>localStorage.removeItem(k));}catch{}}

const state={
  region:'ALL',factory:'ALL',selectedEventId:baseEvents[0]?.id||'',selectedTaskId:'B01',selectedScenario:null,
  eventSeverity:'all',eventStatus:'all',trackingFilter:'all',simDimension:'product',simulated:null,
  productionFactory:'TW01',productionHorizon:14,productionResource:'all',
  demandSource:'all',demandType:'all',demandStatus:'all',demandHorizon:'all',shipmentTrade:'all',shipmentTransport:'all',shipmentStatus:'all',
  expandedDemandId:'',expandedShipmentId:'',selectedWorkOrderByEvent:{},selectedFulfillmentByEvent:{},fulfillmentViewMode:'tile',
  routeEventId:'',routeViewMode:'sequence',
  importPreviewRows:[],recentImportIds:[],
  networkProduct:'all',networkSku:'all',networkRelation:'all',
  sidebarCollapsed:loadStored('ct-sidebar-collapsed-v1',false),
  navGroups:loadStored('ct-nav-groups-v2',{input:false,resource:false,overview:false,approval:false}),
  events:loadStored('ct-events-v8-resource',[]),
  demandEvents:loadStored('ct-demand-events-v8-resource',[]),
  tracking:loadStored('ct-tracking-v5-resource',[]),
  commits:loadStored('ct-commits-v5-resource',{}),decisions:loadStored('ct-decisions-v5-resource',{})
};

const $=s=>document.querySelector(s);
const $$=s=>[...document.querySelectorAll(s)];
const fmt=n=>new Intl.NumberFormat('zh-TW').format(Math.round(Number(n)||0));
const money=n=>`${fmt(n)} 萬`;
const sevLabel={red:'紅燈',yellow:'黃燈',green:'綠燈'};
const sevTag=s=>`<span class="tag ${s==='red'?'danger':s==='yellow'?'warning':'success'}"><i class="signal ${s}"></i>${sevLabel[s]}</span>`;
const sourceClass={'客戶':'success','內部':'neutral','客戶預測':'info','內部預測':'neutral','內部需求':'info','客戶PO':'success','計畫庫存':'warning','緊急詢單':'danger','計畫庫存行動':'warning'};
const statusClass={'待審批':'danger','詢單評估':'warning','待整合':'neutral','待確認':'warning','已確認':'info','已轉換':'success','部分消耗':'warning','已被PO消耗':'neutral','已轉內部SO':'success','已取消':'danger'};

function initLegacyMRP15(){setupFilters();setupNavigation();setupInteractions();setupNetworkControls();setupDemandImport();setupResourceManagement();renderAll();setupTour();}

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
    saveStored('ct-nav-groups-v2',state.navGroups);
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
  saveStored('ct-nav-groups-v2',state.navGroups);
  applyNavGroupState();
}
function switchViewLegacyMRP15(view,preserveOverlay=false){
  revealActiveNavGroup(view);
  $$('.nav-item').forEach(x=>x.classList.toggle('active',x.dataset.view===view));
  $$('.view').forEach(x=>x.classList.toggle('active',x.id===`view-${view}`));
  const titles={import:'需求匯入',products:'產品總覽',customers:'客戶總覽',workorders:'工單匯入',labor:'工時管理',capacity:'產能管理',overview:'總覽控制塔',demand:'需求總覽',shipment:'出貨總覽',events:'需求變更事件',simulation:'有限／無限模擬',network:'供應網路與 BOM',routing:'生產供應途程',production:'產區現況',bottlenecks:'瓶頸分析',commit:'責任人 Commit',decision:'跨部門決策室',tracking:'執行追蹤與 Highlight'};
  $('#pageTitle').textContent=titles[view]||'供需承諾控制塔';
  if(view==='demand')requestAnimationFrame(drawDemandFlowConnections);
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
  $('#demandSourceFilter').addEventListener('change',e=>{state.demandSource=e.target.value;state.demandType='all';renderDemand();});
  $('#demandStatusFilter').addEventListener('change',e=>{state.demandStatus=e.target.value;renderDemand();});
  $('#demandHorizonFilter').addEventListener('change',e=>{state.demandHorizon=e.target.value;renderDemand();});
  $('#shipmentTradeFilter').addEventListener('change',e=>{state.shipmentTrade=e.target.value;renderShipment();});
  $('#shipmentTransportFilter').addEventListener('change',e=>{state.shipmentTransport=e.target.value;renderShipment();});
  $('#shipmentStatusFilter').addEventListener('change',e=>{state.shipmentStatus=e.target.value;renderShipment();});
  $('#routingEventSelect').addEventListener('change',e=>{state.routeEventId=e.target.value;renderRouting();});
  $('#routingViewToggle').addEventListener('click',e=>{const b=e.target.closest('[data-route-view]');if(!b)return;state.routeViewMode=b.dataset.routeView;renderRouting();});
  window.addEventListener('resize',()=>{if(state.routeViewMode==='ecosystem')requestAnimationFrame(drawRouteEcosystemConnections);requestAnimationFrame(drawDemandFlowConnections);});
  $('#productionFactorySelect').addEventListener('change',e=>{state.productionFactory=e.target.value;renderProduction();});
  $('#productionHorizonSelect').addEventListener('change',e=>{state.productionHorizon=Number(e.target.value);renderProduction();});
  $('#productionResourceFilter').addEventListener('change',e=>{state.productionResource=e.target.value;renderProduction();});
  $('#resetDemo').addEventListener('click',()=>{
    clearStored(['ct-events-v3','ct-events-v4','ct-events-v5-empty','ct-events-v6-lt','ct-events-v7-zero','ct-demand-events-v1','ct-demand-events-v2','ct-demand-events-v3','ct-demand-events-v5-empty-select','ct-demand-events-v6-lt','ct-demand-events-v7-zero','ct-tracking-v3','ct-tracking-v4-zero','ct-commits-v3','ct-commits-v4-zero','ct-decisions-v3','ct-decisions-v4-zero','ct-events-v8-resource','ct-demand-events-v8-resource','ct-tracking-v5-resource','ct-commits-v5-resource','ct-decisions-v5-resource','ct-work-orders-v1-resource']);
    state.events=[];state.demandEvents=[];state.tracking=[];state.commits={};state.decisions={};state.workOrders=[];state.simulated=null;state.selectedEventId='';state.selectedScenario=null;state.expandedDemandId='';state.expandedShipmentId='';state.selectedWorkOrderByEvent={};state.selectedFulfillmentByEvent={};state.routeEventId='';state.importPreviewRows=[];state.workOrderImportPreviewRows=[];state.recentImportIds=[];persist();renderAll();toast('所有非主檔交易資料已清除；工時與產能主檔保留');
  });
}
const validDemandSources=['客戶','內部'];
const validDemandTypes=['客戶預測','客戶PO','內部預測'];
function defaultPurpose(source,audience=''){
  if(source==='客戶預測')return '客戶滾動需求預測';
  if(source==='內部預測')return audience||'S&OP內部需求預測';
  return '正式需求訂單';
}
function sourceBatchPrefix(source){return {'客戶預測':'FCST','內部預測':'IFC','客戶PO':'PO'}[source]||'DEM';}
function parseDestination(value=''){
  const parts=String(value).split(/[／/|,，]/).map(x=>x.trim()).filter(Boolean);return {country:parts[0]||'',city:parts[1]||''};
}
function availableFactoriesForSku(sku){const item=skuLookup[sku];return item?productLookup[item.productKey].factories:[];}
function resolveDemandSource(raw){
  const rawType=String(raw.demandType||raw.type||raw.source||'').trim();
  if(!validDemandTypes.includes(rawType))throw new Error(`無效需求類型：${rawType||'未填'}`);
  return {sourceCategory:sourceCategoryFor(rawType),demandType:rawType};
}
function createImportedDemandEvent(raw){
  const item=skuLookup[raw.sku];if(!item)throw new Error(`無效成品料號：${raw.sku}`);
  const factories=availableFactoriesForSku(raw.sku);if(!factories.includes(raw.factory))throw new Error(`${raw.sku} 無法在 ${raw.factory} 生產`);
  const {sourceCategory,demandType}=resolveDemandSource(raw);const source=demandType;
  const qty=Math.round(Number(raw.qty));if(!qty||qty<1)throw new Error('需求數量必須大於0');
  const demandDate=String(raw.demandDate||'').slice(0,10);if(!/^\d{4}-\d{2}-\d{2}$/.test(demandDate))throw new Error('需求日期格式必須為 YYYY-MM-DD');
  const id=nextDemandId(),dest=parseDestination(raw.destination||`${raw.destinationCountry||''}/${raw.destinationCity||''}`);
  const proposer=String(raw.proposer||'需求匯入使用者').trim(),proposerDept=String(raw.proposerDept||'需求管理').trim();
  const assessment=statusForDemand(source,raw.sku,demandDate),customer=sourceCategory==='客戶'?String(raw.customer||raw.audience||'待選客戶').trim():'';
  const poCategory=source==='客戶PO'?(customerPoCategories.includes(raw.poCategory)?raw.poCategory:'外部客戶'):'';
  const plannedStockQty=source==='內部預測'&&assessment.within?qty:source==='客戶預測'&&assessment.within?qty:0;
  const event={id,batchId:`${sourceBatchPrefix(source)}-${raw.factory}-${demandDate.replaceAll('-','')}-${String((hashText(id)%999)+1).padStart(3,'0')}`,
    parentEventId:'',rootEventId:id,childEventIds:[],originMode:'人工／檔案匯入',region:factoryLookup[raw.factory].region,factory:raw.factory,sourceCategory,demandType,source,status:assessment.status,
    demandDate,productKey:item.productKey,product:item.product,sku:item.sku,qty,priority:source==='客戶PO'?2:3,
    orderLeadTime:assessment.orderLeadTime,daysToDemand:assessment.daysToDemand,withinOrderLeadTime:assessment.within,leadTimeShortfall:assessment.shortfall,requiresApproval:assessment.requiresApproval,
    createdDate:TODAY,proposedDate:String(raw.proposedDate||TODAY).slice(0,10),proposer,proposerDept,versionCount:1,currentVersion:'V01',revisionCount:0,lastVersionDate:String(raw.proposedDate||TODAY).slice(0,10),
    purpose:defaultPurpose(source,sourceCategory==='內部'?String(raw.audience||''):''),customer:source==='客戶PO'?customer:'',poCategory,
    destinationRegion:'',destinationCountry:source==='客戶PO'?dest.country:'',destinationCity:source==='客戶PO'?dest.city:'',prospectCustomer:source==='客戶預測'?customer:'',prospectCountry:source==='客戶預測'?dest.country:'',prospectCity:source==='客戶預測'?dest.city:'',
    offsetQty:0,uncoveredQty:qty,offsets:[],forecastOffsetStatus:source==='客戶預測'?'尚無可沖銷PO':'',plannedStockQty,plannedAction:plannedStockQty?`${source}進入凍結期，後台預設轉計畫庫存`:'',
    soNo:'',shippingStatus:'',incoterm:'',transportMode:'',note:'',supplyAllocation:{stockQty:0,wipQty:0,warehouse:`${raw.factory}-FG倉`,lotNo:'尚無庫存批號',wipOrders:[]}
  };
  return event;
}
function applyDemandNetting(po){
  let remaining=Number(po.qty||0);const offsets=[];
  const same=(d)=>d.sku===po.sku&&d.factory===po.factory&&!['已取消'].includes(d.status);
  const customerForecasts=state.demandEvents.filter(d=>same(d)&&d.source==='客戶預測'&&(d.prospectCustomer===po.customer||!d.prospectCustomer)).sort((a,b)=>a.demandDate.localeCompare(b.demandDate));
  for(const f of customerForecasts){if(remaining<=0)break;const available=Math.max(0,Number(f.qty||0)-Number(f.offsetQty||0));if(!available)continue;const used=Math.min(available,remaining);f.offsetQty=Number(f.offsetQty||0)+used;f.uncoveredQty=Math.max(0,Number(f.qty||0)-f.offsetQty);f.forecastOffsetStatus=f.uncoveredQty===0?'已由客戶PO完全沖銷':'已由客戶PO部分沖銷';if(f.uncoveredQty===0)f.status='已沖銷';offsets.push({eventId:f.id,type:'客戶預測',qty:used});remaining-=used;}
  if(remaining>0){const internal=state.demandEvents.filter(d=>same(d)&&d.source==='內部預測').sort((a,b)=>a.demandDate.localeCompare(b.demandDate));for(const f of internal){if(remaining<=0)break;const available=Math.max(0,Number(f.qty||0)-Number(f.offsetQty||0));if(!available)continue;const used=Math.min(available,remaining);f.offsetQty=Number(f.offsetQty||0)+used;f.uncoveredQty=Math.max(0,Number(f.qty||0)-f.offsetQty);f.plannedStockQty=Math.max(0,Number(f.plannedStockQty||f.qty)-used);f.forecastOffsetStatus=f.uncoveredQty===0?'所有計畫行動已轉為支持臨時PO':'部分計畫行動已轉為支持臨時PO';if(f.uncoveredQty===0)f.status='已沖銷';offsets.push({eventId:f.id,type:'內部預測',qty:used});remaining-=used;}}
  po.offsets=offsets;po.offsetQty=Number(po.qty||0)-remaining;po.uncoveredQty=remaining;po.offsetMode=offsets.length?offsets.map(x=>x.type).filter((x,i,a)=>a.indexOf(x)===i).join('＋'):'無預測可沖銷';po.originMode=offsets.length?'匯入PO並執行預測沖銷':'匯入PO／無預測可沖銷';
}
function buildLeadTimeApprovalEvent(event,index=0){
  if(!event?.requiresApproval||!['客戶預測','客戶PO'].includes(event.source))return null;
  const severity=event.leadTimeShortfall>=Math.ceil(event.orderLeadTime*.4)?'red':'yellow';
  return {id:`LT-${event.id}`,approvalType:'ORDER_LT',region:event.region,factory:event.factory,customer:event.customer||event.prospectCustomer||'客戶需求',model:event.sku,product:event.product,
    source:event.source,originSource:event.sourceCategory,originMode:'接單LT內需求',title:`${event.source}落在產品接單 LT 內`,oldQty:event.qty,newQty:event.qty,oldDate:event.demandDate,newDate:event.demandDate,oldPriority:event.priority,priority:event.priority,
    revenue:Math.round(event.qty*.42),impactRevenue:Math.max(120,Math.round(event.qty*.12)),severity,status:'待評估',freeze:true,
    reason:`${event.product} 的標準接單 LT 為 ${event.orderLeadTime} 天；本筆需求距需求日僅 ${event.daysToDemand} 天，短少 ${event.leadTimeShortfall} 天，需由產能、物料與交付責任單位進行審批。`,
    owner:event.proposer,ownerDept:event.proposerDept,versionFrom:event.currentVersion||'V01',versionTo:event.currentVersion||'V01',demandEventId:event.id,upstreamEventId:'',rootDemandEventId:event.id,
    relationChain:`${event.sourceCategory} → ${event.source} → 接單LT審批`,sourceDemandStatus:'新建',targetDemandStatus:event.status,destinationCountry:event.destinationCountry||event.prospectCountry,destinationCity:event.destinationCity||event.prospectCity,batchId:event.batchId,
    orderLeadTime:event.orderLeadTime,daysToDemand:event.daysToDemand,leadTimeShortfall:event.leadTimeShortfall};
}
function appendDemandEvent(event,front=true){
  if(event.source==='客戶PO')applyDemandNetting(event);
  if(front)state.demandEvents.unshift(event);else state.demandEvents.push(event);
  const approval=buildLeadTimeApprovalEvent(event,state.events.length);if(approval){state.events.unshift(approval);state.selectedEventId=approval.id;}
  return event;
}
function selectOptionsHtml(values,formatter=value=>value){return values.map(value=>`<option value="${value}">${formatter(value)}</option>`).join('');}
function syncManualDepartmentFromProposer(){
  const category=sourceCategoryFor($('#manualDemandType')?.value||'客戶預測');const proposer=$('#manualDemandProposer')?.value;const pair=(sourcePeopleMaster[category]||[]).find(item=>item[0]===proposer);
  if($('#manualDemandDept'))$('#manualDemandDept').value=pair?.[1]||'';
}
function renderManualSourceOptions(reset=false){
  const category=$('#manualDemandSource')?.value||'客戶';const typeSelect=$('#manualDemandType'),proposerSelect=$('#manualDemandProposer'),audienceSelect=$('#manualDemandAudience'),destinationSelect=$('#manualDemandDestination');
  const keepType=reset?'':typeSelect?.value,keepProposer=reset?'':proposerSelect?.value,keepAudience=reset?'':audienceSelect?.value,keepDestination=reset?'':destinationSelect?.value;
  const types=demandTypesByCategory[category];typeSelect.innerHTML=selectOptionsHtml(types);if(types.includes(keepType))typeSelect.value=keepType;
  const people=sourcePeopleMaster[category]||[];proposerSelect.innerHTML=selectOptionsHtml(people.map(x=>x[0]));if(people.some(x=>x[0]===keepProposer))proposerSelect.value=keepProposer;syncManualDepartmentFromProposer();
  $('#manualDemandProposerLabel').textContent=category==='客戶'?'業務':'內部提出人';$('#manualDemandAudienceLabel').textContent=category==='客戶'?'客戶':'內部用途';
  if(category==='客戶'){
    audienceSelect.innerHTML=selectOptionsHtml(customers.map(x=>x.name));
    if(customers.some(x=>x.name===keepAudience))audienceSelect.value=keepAudience;
    populateManualDestinations(audienceSelect.value,keepDestination);
    destinationSelect.disabled=false;
  }else{
    audienceSelect.innerHTML=selectOptionsHtml(internalDemandPurposes);if(internalDemandPurposes.includes(keepAudience))audienceSelect.value=keepAudience;
    destinationSelect.innerHTML='<option value="不適用">不適用</option>';destinationSelect.disabled=true;
  }
}
function setupDemandImport(){
  const sku=$('#manualDemandSku');if(!sku)return;
  sku.innerHTML=productCatalog.slice().sort((a,b)=>a.product.localeCompare(b.product,'zh-Hant')||a.sku.localeCompare(b.sku)).map(x=>`<option value="${x.sku}">${x.product}｜${x.sku}｜接單LT ${x.orderLeadTime}天</option>`).join('');
  const targetDate=shiftDate(TODAY,32);$('#manualDemandDate').value=targetDate;$('#manualDemandDate').min=TODAY;$('#manualDemandQty').value='5000';
  const update=()=>{renderManualFactoryOptions();renderManualDemandSummary();};sku.addEventListener('change',update);
  
  $('#manualDemandType').addEventListener('change',()=>{renderManualSourceOptions(true);renderManualDemandSummary();});$('#manualPoCategory')?.addEventListener('change',renderManualDemandSummary);
  $('#manualDemandProposer').addEventListener('change',()=>{syncManualDepartmentFromProposer();renderManualDemandSummary();});
  ['manualDemandFactory','manualDemandQty','manualDemandDate','manualDemandDestination'].forEach(id=>$('#'+id)?.addEventListener('change',renderManualDemandSummary));
  $('#manualDemandAudience')?.addEventListener('change',()=>{if(sourceCategoryFor($('#manualDemandType').value)==='客戶')populateManualDestinations($('#manualDemandAudience').value);renderManualDemandSummary();});
  ['manualDemandQty','manualDemandDate'].forEach(id=>$('#'+id)?.addEventListener('input',renderManualDemandSummary));
  $('#manualDemandForm').addEventListener('submit',e=>{e.preventDefault();saveManualDemand();});
  $('#resetManualDemand').addEventListener('click',()=>setTimeout(()=>{sku.selectedIndex=0;$('#manualDemandType').value='客戶預測';renderManualFactoryOptions();renderManualSourceOptions(true);$('#manualDemandQty').value='5000';$('#manualDemandDate').value=targetDate;renderManualDemandSummary();},0));
  $('#demandFileInput').addEventListener('change',e=>readDemandFile(e.target.files?.[0]));
  const drop=$('#demandFileDrop');['dragenter','dragover'].forEach(evt=>drop.addEventListener(evt,e=>{e.preventDefault();drop.classList.add('dragging');}));['dragleave','drop'].forEach(evt=>drop.addEventListener(evt,e=>{e.preventDefault();drop.classList.remove('dragging');}));drop.addEventListener('drop',e=>{const file=e.dataTransfer.files?.[0];if(file){$('#demandFileInput').files=e.dataTransfer.files;readDemandFile(file);}});
  $('#clearDemandFile').addEventListener('click',clearDemandImportPreview);$('#confirmDemandFileImport').addEventListener('click',commitDemandFileImport);$('#downloadDemandTemplate').addEventListener('click',downloadDemandTemplate);
  renderManualFactoryOptions();renderManualSourceOptions(true);renderManualDemandSummary();
}
function renderManualFactoryOptions(){
  const sku=$('#manualDemandSku')?.value;const select=$('#manualDemandFactory');if(!select)return;const factories=availableFactoriesForSku(sku);const current=select.value;
  select.innerHTML=factories.map(factory=>`<option value="${factory}">${factory}｜${factoryName(factory)}｜${factoryLookup[factory].regionName}</option>`).join('');if(factories.includes(current))select.value=current;
}
function renderManualDemandSummary(){
  const root=$('#manualDemandSummary');if(!root)return;const item=skuLookup[$('#manualDemandSku')?.value];const factory=$('#manualDemandFactory')?.value;const qty=Number($('#manualDemandQty')?.value||0);const type=$('#manualDemandType')?.value;const category=sourceCategoryFor(type);const demandDate=$('#manualDemandDate')?.value;
  if(!item){root.innerHTML='';return;}const assessment=demandDate?statusForDemand(type,item.sku,demandDate):null;
  const chain=type==='客戶預測'?'後台：PO沖銷；凍結期未沖銷量轉計畫庫存':type==='內部預測'?'後台：凍結期轉計畫庫存；臨時PO可沖銷':'後台：先沖銷客戶預測，再沖銷內部預測計畫行動';
  const ltText=assessment?`${assessment.orderLeadTime}天；距需求日 ${assessment.daysToDemand}天`:'—';const approvalText=assessment?.requiresApproval?`落在LT內，短少 ${assessment.shortfall}天，保存後進入審批`:`不需LT例外審批`;
  root.innerHTML=`<div><span>成品</span><strong>${item.product}｜${item.sku}</strong></div><div><span>可生產工廠</span><strong>${factory?plantLabel(factory):'請選擇'}</strong></div><div><span>來源／類型</span><strong>${category}｜${type}</strong></div><div><span>需求關係鏈</span><strong>${chain}</strong></div><div><span>需求量／日期</span><strong>${qty?fmt(qty)+' 件':'請輸入'}・${demandDate?formatDateFull(demandDate):'請選擇'}</strong></div><div><span>提出單位</span><strong>${$('#manualDemandProposer')?.value||'—'}｜${$('#manualDemandDept')?.value||'—'}</strong></div><div><span>建立後狀態</span><strong>${assessment?.status||'—'}</strong></div><div><span>客戶／用途</span><strong>${$('#manualDemandAudience')?.value||'—'}</strong></div><div class="${assessment?.requiresApproval?'lt-alert':'lt-ok'}"><span>產品接單 LT</span><strong>${ltText}</strong><small>${approvalText}</small></div>`;
}
function persistDemandOnly(){
  saveStored('ct-events-v8-resource',state.events);
  saveStored('ct-demand-events-v8-resource',state.demandEvents);
}
function setManualDemandBusy(busy){
  const form=$('#manualDemandForm');
  const submit=form?.querySelector('button[type="submit"]');
  if(form)form.setAttribute('aria-busy',busy?'true':'false');
  if(submit){
    if(!submit.dataset.defaultLabel)submit.dataset.defaultLabel=submit.textContent.trim();
    submit.disabled=!!busy;
    submit.classList.toggle('is-loading',!!busy);
    submit.textContent=busy?'需求建立中…':submit.dataset.defaultLabel;
  }
}
function refreshAfterDemandSave(event){
  renderContext();renderDemandImport();renderProductOverview();renderCustomerOverview();renderDemand();renderEvents();renderOverview();
  switchView(event?.requiresApproval?'events':'demand');
}
function saveManualDemand(){
  const factory=$('#manualDemandFactory')?.value;
  if(!factory){toast('請選擇可生產工廠');return;}
  if($('#manualDemandForm')?.getAttribute('aria-busy')==='true')return;
  setManualDemandBusy(true);
  requestAnimationFrame(()=>setTimeout(()=>{
    try{
      const type=$('#manualDemandType').value;
      const category=sourceCategoryFor(type);
      const event=createImportedDemandEvent({demandType:type,poCategory:$('#manualPoCategory')?.value||'',sku:$('#manualDemandSku').value,factory,qty:$('#manualDemandQty').value,demandDate:$('#manualDemandDate').value,proposer:$('#manualDemandProposer').value,proposerDept:$('#manualDemandDept').value,audience:$('#manualDemandAudience').value,customer:category==='客戶'?$('#manualDemandAudience').value:'',destination:$('#manualDemandDestination').value});
      appendDemandEvent(event,true);
      state.recentImportIds=[event.id,...state.recentImportIds].slice(0,12);
      persistDemandOnly();
      refreshAfterDemandSave(event);
      toast(event.requiresApproval?`已建立 ${event.id}，因落在接單LT內已送事件審批`:`已建立需求事件 ${event.id}`);
    }catch(err){console.error(err);toast(err.message||'需求資料檢核失敗');}
    finally{setManualDemandBusy(false);}
  },0));
}
function parseCsv(text){
  const rows=[];let row=[],cell='',quoted=false;for(let i=0;i<text.length;i++){const ch=text[i],next=text[i+1];if(ch==='"'&&quoted&&next==='"'){cell+='"';i++;}else if(ch==='"'){quoted=!quoted;}else if(ch===','&&!quoted){row.push(cell.trim());cell='';}else if((ch==='\n'||ch==='\r')&&!quoted){if(ch==='\r'&&next==='\n')i++;row.push(cell.trim());cell='';if(row.some(Boolean))rows.push(row);row=[];}else cell+=ch;}row.push(cell.trim());if(row.some(Boolean))rows.push(row);if(rows.length<2)return[];const headers=rows[0].map(x=>x.trim());return rows.slice(1).map(r=>Object.fromEntries(headers.map((h,i)=>[h,r[i]??''])));
}
function normalizeImportRow(row){
  const get=(...keys)=>{for(const k of keys)if(row[k]!==undefined&&row[k]!==null&&String(row[k]).trim()!=='')return row[k];return'';};
  return {demandType:get('demandType','type','需求類型','source','需求來源'),poCategory:get('poCategory','PO類別','客戶PO類別'),sku:get('sku','成品料號','料號'),factory:get('factory','工廠','廠區'),qty:get('qty','quantity','數量','需求數量'),demandDate:get('demandDate','date','需求日期'),proposer:get('proposer','sales','業務','提出者'),proposerDept:get('proposerDept','department','提出部門'),audience:get('audience','customer','客戶','用途'),customer:get('customer','客戶'),destination:get('destination','shipTo','出貨地','目的地')};
}
async function readDemandFile(file){
  if(!file)return;$('#demandFileStatus').textContent=`讀取 ${file.name}…`;try{const text=await file.text();const raw=file.name.toLowerCase().endsWith('.json')?JSON.parse(text):parseCsv(text);const list=Array.isArray(raw)?raw:(Array.isArray(raw.events)?raw.events:[]);state.importPreviewRows=list.map((r,i)=>{const normalized=normalizeImportRow(r);try{return{...normalized,rowNo:i+1,event:createImportedDemandEvent(normalized),valid:true,error:''};}catch(err){return{...normalized,rowNo:i+1,valid:false,error:err.message};}});renderDemandImportPreview();}catch(err){state.importPreviewRows=[];$('#demandFileStatus').textContent=`讀取失敗：${err.message}`;renderDemandImportPreview();}
}
function renderDemandImportPreview(){
  const rows=state.importPreviewRows||[];const valid=rows.filter(r=>r.valid);$('#demandFileStatus').textContent=rows.length?`${rows.length}筆資料・${valid.length}筆通過・${rows.length-valid.length}筆錯誤`:'尚未選擇檔案';$('#confirmDemandFileImport').disabled=!valid.length;
  $('#demandImportPreview').innerHTML=rows.map(r=>`<tr class="${r.valid?'':'risk-row'}"><td>${r.demandType||r.source||'—'}</td><td>${r.poCategory||'—'}</td><td>${r.sku||'—'}</td><td>${r.factory||'—'}</td><td>${fmt(r.qty)}</td><td>${r.demandDate||'—'}</td><td>${r.proposer||'—'}</td><td><span class="tag ${r.valid?'success':'danger'}">${r.valid?'通過':r.error}</span></td></tr>`).join('')||'<tr><td colspan="8">請先選擇檔案</td></tr>';
}
function commitDemandFileImport(){
  const valid=(state.importPreviewRows||[]).filter(r=>r.valid);if(!valid.length)return;
  const button=$('#confirmDemandFileImport');if(button){button.disabled=true;button.textContent='匯入中…';}
  requestAnimationFrame(()=>setTimeout(()=>{
    try{
      const added=[];valid.forEach(r=>{const event=createImportedDemandEvent(r);appendDemandEvent(event,false);added.push(event.id);});
      state.recentImportIds=[...added.reverse(),...state.recentImportIds].slice(0,12);
      state.importPreviewRows=[];if($('#demandFileInput'))$('#demandFileInput').value='';
      persistDemandOnly();
      renderContext();renderDemandImport();renderProductOverview();renderCustomerOverview();renderDemand();renderEvents();renderOverview();
      switchView('demand');toast(`已匯入 ${added.length} 筆需求事件`);
    }catch(err){console.error(err);toast(err.message||'需求匯入失敗');}
    finally{if(button){button.textContent='匯入通過資料';renderDemandImportPreview();}}
  },0));
}
function clearDemandImportPreview(){state.importPreviewRows=[];if($('#demandFileInput'))$('#demandFileInput').value='';renderDemandImportPreview();}
function downloadDemandTemplate(){
  const sample='demandType,poCategory,sku,factory,qty,demandDate,proposer,proposerDept,customer,destination\n客戶預測,,UPS-100,TW01,5000,2026-08-15,林怡君,全球業務規劃,Formosa Data Center,台灣／台北\n客戶PO,外部客戶,UPS-100,TW01,3000,2026-08-15,李佳蓉,訂單管理,Formosa Data Center,台灣／台北';const blob=new Blob(['\ufeff'+sample],{type:'text/csv;charset=utf-8'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='demand-import-template.csv';a.click();URL.revokeObjectURL(a.href);
}
function renderDemandImport(){
  if(!$('#importKpis'))return;const all=state.demandEvents;const today=all.filter(x=>x.proposedDate===TODAY);const factories=new Set(all.map(x=>x.factory));const products=new Set(all.map(x=>x.sku));$('#importKpis').innerHTML=[['需求事件',all.length,'目前系統內資料','D','tone-blue'],['今日新增',today.length,'提出日期為今天','+','tone-green'],['涵蓋工廠',factories.size,'已有需求的廠區','F','tone-yellow'],['成品料號',products.size,'已有需求的成品','SKU','tone-blue']].map(kpiCard).join('');const recent=state.recentImportIds.map(id=>all.find(x=>x.id===id)).filter(Boolean);$('#recentImportCount').textContent=`${recent.length}筆`;$('#recentDemandImports').innerHTML=recent.map(d=>`<button class="recent-import-card" data-import-event="${d.id}"><div><span class="tag ${sourceClass[d.sourceCategory||sourceCategoryFor(d.source)]||'neutral'}">${d.sourceCategory||sourceCategoryFor(d.source)}</span><span class="event-id">${d.source}</span><strong>${d.id}｜${d.product}</strong><small>${d.sku}・${plantLabel(d.factory)}</small></div><div><strong>${fmt(d.qty)} 件</strong><small>${formatDateFull(d.demandDate)}</small></div></button>`).join('')||'<div class="empty-state">尚未匯入需求</div>';$$('[data-import-event]').forEach(b=>b.addEventListener('click',()=>{const d=state.demandEvents.find(x=>x.id===b.dataset.importEvent);state.region=d.region;state.factory=d.factory;$('#regionSelect').value=state.region;updateFactoryOptions();$('#factorySelect').value=state.factory;state.expandedDemandId=d.id;renderAll();switchView('demand');}));renderDemandImportPreview();
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
function selectedEvent(){return state.events.find(e=>e.id===state.selectedEventId)||state.events[0]||null;}
function factoryName(id){return factoryLookup[id]?.name||id;}

function productDemandRows(){
  return productTypes.map(p=>{
    const skus=productCatalog.filter(x=>x.productKey===p.key);
    const events=state.demandEvents.filter(d=>d.productKey===p.key||skus.some(x=>x.sku===d.sku));
    const forecast=events.filter(d=>d.source==='客戶預測').reduce((a,d)=>a+Number(d.qty||0),0);
    const po=events.filter(d=>d.source==='客戶PO').reduce((a,d)=>a+Number(d.qty||0),0);
    const internal=events.filter(d=>d.source==='內部預測').reduce((a,d)=>a+Number(d.qty||0),0);
    const approval=events.filter(d=>d.status==='待審批').length;
    const offset=events.filter(d=>d.source==='客戶預測').reduce((a,d)=>a+Number(d.offsetQty||0),0);
    const planStock=events.reduce((a,d)=>a+Number(d.planStockQty||0),0);
    return {...p,skuCount:skus.length,forecast,po,internal,total:forecast+po+internal,approval,offset,planStock};
  });
}
function renderProductOverview(){
  if(!$('#productOverviewBody'))return;
  const rows=productDemandRows();const total=rows.reduce((a,x)=>a+x.total,0),active=rows.filter(x=>x.total>0).length,risk=rows.reduce((a,x)=>a+x.approval,0);
  $('#productOverviewKpis').innerHTML=[['產品類型',rows.length,'產品主檔','P','tone-blue'],['成品料號',productCatalog.length,'可接單料號','SKU','tone-green'],['目前需求量',total,'三類需求合計','D','tone-yellow'],['LT例外',risk,'待審批事件','!','tone-red']].map(kpiCard).join('');
  $('#productOverviewBody').innerHTML=rows.map(x=>`<tr><td><strong>${x.name}</strong><br><span class="event-id">${x.family}</span></td><td>${x.skuCount}</td><td>${x.orderLeadTime}天</td><td>${x.factories.map(plantLabel).join('<br>')}</td><td>${fmt(x.forecast)}</td><td>${fmt(x.po)}</td><td>${fmt(x.internal)}</td><td>${fmt(x.offset)}</td><td>${fmt(x.planStock)}</td><td>${x.approval?`<span class="tag danger">${x.approval}筆</span>`:'<span class="tag neutral">0筆</span>'}</td></tr>`).join('');
  $('#productOverviewEmpty').classList.toggle('hidden',active>0);
}
function customerSummaryRows(){
  return customers.map(c=>{
    const events=state.demandEvents.filter(d=>(d.customer||d.prospectCustomer)===c.name);
    const forecast=events.filter(d=>d.source==='客戶預測').reduce((a,d)=>a+Number(d.qty||0),0);
    const po=events.filter(d=>d.source==='客戶PO').reduce((a,d)=>a+Number(d.qty||0),0);
    const openPo=events.filter(d=>d.source==='客戶PO'&&!['已轉內部SO','已取消'].includes(d.status)).reduce((a,d)=>a+Number(d.qty||0),0);
    const approval=events.filter(d=>d.status==='待審批').length;
    const products=[...new Set(events.map(d=>d.product).filter(Boolean))];
    const last=events.slice().sort((a,b)=>(b.proposedDate||'').localeCompare(a.proposedDate||''))[0];
    return {...c,forecast,po,openPo,approval,products,lastDate:last?.proposedDate||'',destinations:destinationsForCustomer(c.name)};
  });
}
function renderCustomerOverview(){
  if(!$('#customerOverviewBody'))return;
  const rows=customerSummaryRows();const po=rows.reduce((a,x)=>a+x.po,0),open=rows.reduce((a,x)=>a+x.openPo,0),approval=rows.reduce((a,x)=>a+x.approval,0);
  $('#customerOverviewKpis').innerHTML=[['客戶主檔',rows.length,'可選客戶','C','tone-blue'],['正式PO量',po,'目前客戶PO','PO','tone-green'],['待履行PO',open,'尚未轉SO','O','tone-yellow'],['LT例外',approval,'待審批事件','!','tone-red']].map(kpiCard).join('');
  $('#customerOverviewBody').innerHTML=rows.map(x=>`<tr><td><strong>${x.name}</strong><br><span class="event-id">${x.country}・${x.city}</span></td><td>${x.destinations.map(d=>d.label).join('<br>')}</td><td>${fmt(x.forecast)}</td><td>${fmt(x.po)}</td><td>${fmt(x.openPo)}</td><td>${x.products.length?x.products.slice(0,3).join('、'):'—'}</td><td>${x.approval?`<span class="tag danger">${x.approval}筆</span>`:'<span class="tag neutral">0筆</span>'}</td><td>${x.lastDate?formatDateFull(x.lastDate):'—'}</td></tr>`).join('');
  $('#customerOverviewEmpty').classList.toggle('hidden',rows.some(x=>x.forecast+x.po>0));
}
function renderAll(){renderContext();renderOverview();renderDemandImport();renderProductOverview();renderCustomerOverview();renderWorkOrderImport();renderLaborManagement();renderCapacityManagement();renderDemand();renderShipment();renderEvents();renderSimulation();renderNetwork();renderRouting();renderProduction();renderBottlenecks();renderCommit();renderDecision();renderTracking();}

function renderContext(){
  let label='全球｜18座工廠';
  if(state.factory!=='ALL')label=`${factoryLookup[state.factory].regionName}｜${factoryName(state.factory)}`;
  else if(state.region!=='ALL'){const r=regions.find(x=>x.id===state.region);label=`${r.name}｜${r.factories.length}座工廠`;}
  const e=selectedEvent();$('#currentScope').textContent=label;$('#currentVersion').textContent=e?`Demand ${e.versionTo}`:'Demand V00';
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
  // 將每一個外購料需求拆成「庫存撥料」與「採購 PO」兩種來源，再向上彙總至各階工單。
  purchaseOrders.forEach(po=>{
    const allocationSeed=fulfillmentSeed(event.id,`${po.bomId}-allocation`);
    const stockRatio=[.15,.25,.35,.45,.55][allocationSeed%5];
    po.requiredQty=po.qty;
    po.stockAllocated=Math.min(po.requiredQty-1,Math.round(po.requiredQty*stockRatio));
    po.qty=Math.max(1,po.requiredQty-po.stockAllocated);
    po.received=Math.min(po.qty,Math.round(po.qty*po.progress/100));
    po.consumptionSource=po.stockAllocated>0?'庫存＋採購PO':'採購PO';
  });
  const parentMap=new Map(nodes.map(n=>[n.id,n.parentId||'']));
  const isDescendant=(candidate,ancestor)=>{let cursor=candidate;const seen=new Set();while(cursor&&!seen.has(cursor)){if(cursor===ancestor)return true;seen.add(cursor);cursor=parentMap.get(cursor)||'';}return false;};
  workOrders.forEach(work=>{
    const materials=purchaseOrders.filter(po=>isDescendant(po.parentBomId||po.bomId,work.bomId));
    const stockQty=materials.reduce((s,po)=>s+(po.stockAllocated||0),0);
    const poQty=materials.reduce((s,po)=>s+(po.qty||0),0);
    work.materialSupply={stockQty,poQty,stockItems:materials.filter(po=>po.stockAllocated>0).length,poItems:materials.filter(po=>po.qty>0).length,totalItems:materials.length};
  });
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
function materialSupplyHtml(w){
  const m=w.materialSupply||{stockQty:0,poQty:0,stockItems:0,poItems:0,totalItems:0};
  if(!m.totalItems)return '<div class="material-source-summary empty"><span>本階無直接外購物料</span></div>';
  return `<div class="material-source-summary"><span class="material-source-label">物料耗用</span>${m.stockQty?`<span class="material-source-chip stock">庫存 ${fmt(m.stockQty)}</span>`:''}${m.poQty?`<span class="material-source-chip po">PO ${fmt(m.poQty)}</span>`:''}<small>${m.stockItems}項庫存・${m.poItems}項採購</small></div>`;
}
function materialSupplyText(w){
  const m=w.materialSupply||{stockQty:0,poQty:0,totalItems:0};
  return m.totalItems?`庫存 ${fmt(m.stockQty)}／PO ${fmt(m.poQty)}`:'無直接外購料';
}
function workOrderTile(w,event,context,visual='normal',compact=false,sequence=''){
  return `<button type="button" class="standard-info-tile order-info-tile timeline-order-tile fulfillment-item-link ${visualClass(visual)} ${compact?'compact':''}" data-event="${event.id}" data-item-id="${w.id}" data-item-type="work" data-context="${context}">
    <div class="info-tile-top"><div class="info-tile-badges">${sequence?`<span class="timeline-seq">${sequence}</span>`:''}<span class="tag ${w.kind==='委外工單'?'warning':'info'}">${w.kind}</span><span class="tag neutral">BOM L${w.level}</span></div>${fulfillmentStatusTag(w.status)}</div>
    <div class="info-tile-title"><strong>${w.item}</strong><span>${w.id}</span><small>${w.bomId}</small>${materialSupplyHtml(w)}</div>
    <div class="info-tile-meta-grid">
      ${tileMeta('生產單位',plantLabel(w.plant))}
      ${tileMeta('計畫數量',`${fmt(w.qty)} 件`)}
      ${tileMeta('物料耗用',materialSupplyText(w))}
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
      ${tileMeta('物料需求',`${fmt(po.requiredQty||po.qty)} 件`)}
      ${tileMeta('庫存撥料',`${fmt(po.stockAllocated||0)} 件`)}
      ${tileMeta('PO訂購／已到',`${fmt(po.qty)}／${fmt(po.received)} 件`)}
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
    return `<tr tabindex="0" class="fulfillment-list-row fulfillment-item-link ${visualClass(visual)}" data-event="${event.id}" data-item-id="${r.id}" data-item-type="${r.type}" data-context="${context}"><td>${String(i+1).padStart(2,'0')}</td><td><span class="tag ${r.type==='purchase'?'success':x.kind==='委外工單'?'warning':'info'}">${type}</span><br>${fulfillmentStatusTag(status==='已到料'?'已完成':status==='到料風險'?'延遲風險':status)}</td><td><strong>${r.id}</strong><br><span class="event-id">BOM L${x.level}・${x.bomId}</span></td><td><strong>${x.item}</strong><br><span class="event-id">${x.relationLabel}</span></td><td>${owner}</td><td>${r.type==='work'?materialSupplyText(x):`庫存 ${fmt(x.stockAllocated||0)}／PO ${fmt(x.qty)}`}</td><td>${qty}</td><td><strong>${formatDateFull(r.due)}</strong>${r.type==='work'?`<br><span class="event-id">開始 ${formatDate(x.start)}</span>`:''}</td><td>${progressHtml(progress,r.type==='work'?'生產':'到料')}</td></tr>`;
  }).join('');
  return `<div class="table-wrap fulfillment-list-wrap"><table class="fulfillment-list-table"><thead><tr><th>順序</th><th>類型／狀態</th><th>單號／BOM</th><th>項目</th><th>責任單位／供應商</th><th>物料耗用來源</th><th>數量</th><th>需求時間</th><th>進度</th></tr></thead><tbody>${rows}</tbody></table></div>`;
}
function fulfillmentPanel(event,context){
  const f=buildFulfillment(event);const summary=fulfillmentSummary(f);
  const {records,selected}=fulfillmentSelection(f,event);const states=fulfillmentVisualStates(f,selected);
  const tileHtml=records.map((r,i)=>r.type==='work'?workOrderTile(r.data,event,context,states.get(`work:${r.id}`),false,String(i+1).padStart(2,'0')):purchaseOrderTile(r.data,event,context,states.get(`purchase:${r.id}`),false,String(i+1).padStart(2,'0'))).join('');
  const content=state.fulfillmentViewMode==='list'?fulfillmentList(records,f,event,context,states):`<div class="standard-tile-grid order-tile-grid fulfillment-timeline-grid">${tileHtml||'<div class="empty-state">尚未產生履行單據</div>'}</div>`;
  return `<div class="fulfillment-panel" data-fulfillment-event="${event.id}">
    <div class="fulfillment-head"><div><p class="eyebrow">DEMAND FULFILLMENT TRACE</p><h3>${event.id}｜${event.product} ${event.sku}</h3><p>工單與採購 PO 已依需求時間由上往下排序。點擊任一單據，可突出同一 BOM 分支中的對應工單與採購項目；點擊展開區空白處即可恢復全部項目。</p></div><span class="tag ${summary.risk?'danger':'success'}">${summary.risk?`${summary.risk}項風險`:'履行正常'}</span></div>
    <div class="fulfillment-kpis standard-tile-grid summary-tile-grid">
      ${metricInfoTile('生產平均進度',`${summary.workAvg.toFixed(0)}%`,'所有內製與委外工單','blue')}
      ${metricInfoTile('物料到料率',`${summary.matRate.toFixed(0)}%`,'所有採購 PO 加權','green')}
      ${metricInfoTile('內製工單',summary.internal,'由本廠生產執行','blue')}
      ${metricInfoTile('委外工單',summary.outsource,'友廠或協力廠承接','yellow')}
      ${metricInfoTile('採購 PO',summary.purchase,'外購料與現成模組','green')}
    </div>
    ${demandSupplyAllocationPanel(event,f)}
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
  $$(`${root} .fulfillment-panel`).forEach(panel=>panel.addEventListener('click',ev=>{
    if(ev.target.closest('.fulfillment-item-link,button,a,input,select,textarea,label'))return;
    const eventId=panel.dataset.fulfillmentEvent;
    if(!state.selectedFulfillmentByEvent[eventId])return;
    delete state.selectedFulfillmentByEvent[eventId];delete state.selectedWorkOrderByEvent[eventId];
    context==='demand'?renderDemand():renderShipment();
  }));
}

function routeEligibleEvents(){
  return state.demandEvents.filter(d=>inScope(d.factory)&&d.sku&&skuLookup[d.sku]).sort((a,b)=>{
    const rank=x=>x.source==='客戶PO'?0:x.source==='計畫庫存'?1:x.source==='內部需求'?2:3;
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

function routeEcosystemStatus(progress,risk=false){
  if(risk)return 'risk';
  if(progress>=80)return 'ok';
  if(progress>=55)return 'warning';
  return 'planned';
}
function routeEcosystemNode({id,type,title,subtitle,meta,progress=0,risk=false,targets=[]}){
  const status=routeEcosystemStatus(progress,risk);
  return `<button type="button" class="ecosystem-node ${type} status-${status}" data-eco-node="${id}" data-eco-targets="${targets.join(',')}"><span class="ecosystem-status-dot" aria-hidden="true"></span><span class="ecosystem-node-copy"><small>${subtitle}</small><strong>${title}</strong><em>${meta}</em></span><span class="ecosystem-node-metric"><b>${Math.round(progress)}%</b><small>${risk?'風險':'進度'}</small></span></button>`;
}
function renderRouteEcosystem(stages,event,f){
  const supplyMap=new Map();
  stages.forEach(stage=>{
    [...stage.supplies,...stage.works.filter(w=>w.kind==='委外工單')].forEach(item=>{
      const id=`supply-${item.id}`;
      const rec=supplyMap.get(id)||{item,targets:new Set()};
      rec.targets.add(`stage-${stage.key}`);
      supplyMap.set(id,rec);
    });
  });
  const supplyNodes=[...supplyMap.entries()].map(([id,{item,targets}])=>routeEcosystemNode({
    id,type:item.id.startsWith('PO-')?'purchase':'partner',title:item.item,
    subtitle:item.id.startsWith('PO-')?'外部採購／現成模組':'友廠／委外製造',
    meta:`${item.id.startsWith('PO-')?item.vendor:plantLabel(item.plant)}・需求 ${formatDate(item.due)}`,
    progress:item.progress,risk:item.risk,targets:[...targets]
  })).join('');
  const stageNode=(stage,index,next)=>routeEcosystemNode({
    id:`stage-${stage.key}`,type:'stage',title:stage.name,
    subtitle:`途程 ${String(index+1).padStart(2,'0')}・${plantLabel(stage.plant)}`,
    meta:`${stage.resource}・${formatDate(stage.start)}～${formatDate(stage.due)}`,
    progress:stage.progress,risk:stage.risk,targets:next?[`stage-${next.key}`]:[`market-${event.id}`]
  });
  const marketNode=routeEcosystemNode({
    id:`market-${event.id}`,type:'market',title:event.customer||event.purpose||'內部需求',
    subtitle:event.source==='客戶PO'?'客戶／出貨目的地':'需求終點',
    meta:`${event.destinationCity||plantLabel(event.factory)}・${fmt(event.qty)} 件・${formatDate(event.demandDate)}`,
    progress:event.status==='已轉內部SO'?100:event.source==='客戶PO'?75:55,risk:false,targets:[]
  });
  const columns=[
    {title:'供應來源',subtitle:'SUPPLIERS & PARTNERS',body:supplyNodes||'<div class="ecosystem-empty">目前沒有外部採購或委外供給</div>'},
    {title:'前段製造',subtitle:'FABRICATION',body:stages.slice(0,2).map((x,i)=>stageNode(x,i,stages[i+1])).join('')},
    {title:'模組與總裝',subtitle:'FORMATION & ASSEMBLY',body:stages.slice(2,4).map((x,i)=>stageNode(x,i+2,stages[i+3])).join('')},
    {title:'測試與配送',subtitle:'TEST / PACKAGING',body:stages.slice(4,6).map((x,i)=>stageNode(x,i+4,stages[i+5])).join('')},
    {title:'需求終點',subtitle:'END MARKET',body:marketNode}
  ];
  return `<div class="ecosystem-toolbar"><div><strong>站點生態圖</strong><span>由左向右閱讀；點擊任一節點可聚焦其上下游關聯，點擊網路圖空白處可恢復。</span></div><div class="ecosystem-legend"><span><i class="ok"></i>正常</span><span><i class="warning"></i>進度偏低</span><span><i class="risk"></i>齊套風險</span></div></div><div class="route-ecosystem-scroll"><div class="route-ecosystem-canvas"><svg class="route-ecosystem-lines" id="routeEcosystemSvg" aria-hidden="true"></svg>${columns.map((col,i)=>`<section class="ecosystem-column ecosystem-column-${i}"><header><small>${col.subtitle}</small><h3>${col.title}</h3></header><div class="ecosystem-column-body">${col.body}</div></section>`).join('')}</div></div><div class="ecosystem-footnote"><strong>${event.product}｜${event.sku}</strong><span>線條代表供給或途程前後依賴；節點顏色代表目前完成與齊套風險。</span></div>`;
}
function drawRouteEcosystemConnections(){
  const root=$('#productionSupplyEcosystem');
  const canvas=root?.querySelector('.route-ecosystem-canvas');
  const svg=root?.querySelector('#routeEcosystemSvg');
  if(!root||root.hidden||!canvas||!svg)return;
  const box=canvas.getBoundingClientRect();
  const width=canvas.scrollWidth,height=canvas.scrollHeight;
  svg.setAttribute('viewBox',`0 0 ${width} ${height}`);
  svg.setAttribute('width',width);svg.setAttribute('height',height);
  const paths=[];
  canvas.querySelectorAll('[data-eco-node]').forEach(node=>{
    const from=node.getBoundingClientRect();
    const fromId=node.dataset.ecoNode;
    const targets=(node.dataset.ecoTargets||'').split(',').filter(Boolean);
    targets.forEach(targetId=>{
      const target=canvas.querySelector(`[data-eco-node="${targetId}"]`);
      if(!target)return;
      const to=target.getBoundingClientRect();
      const x1=from.right-box.left,y1=from.top-box.top+from.height/2;
      const x2=to.left-box.left,y2=to.top-box.top+to.height/2;
      const bend=Math.max(42,(x2-x1)*.42);
      paths.push(`<path class="ecosystem-link" data-from="${fromId}" data-to="${targetId}" d="M ${x1} ${y1} C ${x1+bend} ${y1}, ${x2-bend} ${y2}, ${x2} ${y2}"/>`);
    });
  });
  svg.innerHTML=`<defs><marker id="ecoArrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z"></path></marker></defs>${paths.join('')}`;
}
function bindRouteEcosystemFocus(){
  const root=$('#productionSupplyEcosystem');
  const canvas=root?.querySelector('.route-ecosystem-canvas');
  if(!canvas)return;
  const reset=()=>{
    canvas.querySelectorAll('.ecosystem-node').forEach(n=>n.classList.remove('is-selected','is-related','is-dimmed'));
    canvas.querySelectorAll('.ecosystem-link').forEach(p=>p.classList.remove('is-selected','is-related','is-dimmed'));
  };
  canvas.querySelectorAll('.ecosystem-node').forEach(node=>node.addEventListener('click',ev=>{
    ev.stopPropagation();
    const id=node.dataset.ecoNode;
    const already=node.classList.contains('is-selected');
    reset();if(already)return;
    const connected=new Set([id]);
    canvas.querySelectorAll('.ecosystem-link').forEach(path=>{
      if(path.dataset.from===id||path.dataset.to===id){connected.add(path.dataset.from);connected.add(path.dataset.to);path.classList.add('is-related');}
    });
    canvas.querySelectorAll('.ecosystem-node').forEach(n=>{
      if(n.dataset.ecoNode===id)n.classList.add('is-selected');
      else if(connected.has(n.dataset.ecoNode))n.classList.add('is-related');
      else n.classList.add('is-dimmed');
    });
    canvas.querySelectorAll('.ecosystem-link').forEach(path=>{if(!path.classList.contains('is-related'))path.classList.add('is-dimmed');});
  }));
  canvas.addEventListener('click',ev=>{if(!ev.target.closest('.ecosystem-node'))reset();});
}

function renderRouting(){
  const options=routeEligibleEvents();
  if(!options.length){$('#routingEventSelect').innerHTML='';$('#routingKpis').innerHTML='';$('#routingContext').innerHTML='<div class="empty-state">目前範圍沒有可呈現的需求事件</div>';$('#productionSupplyRoute').innerHTML='';$('#productionSupplyNetwork').innerHTML='';$('#productionSupplyEcosystem').innerHTML='';return;}
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
  $('#productionSupplyEcosystem').innerHTML=renderRouteEcosystem(stages,event,f);
  $$('#routingViewToggle [data-route-view]').forEach(b=>b.classList.toggle('active',b.dataset.routeView===state.routeViewMode));
  $('#productionSupplyRoute').hidden=state.routeViewMode!=='sequence';
  $('#productionSupplyNetwork').hidden=state.routeViewMode!=='network';
  $('#productionSupplyEcosystem').hidden=state.routeViewMode!=='ecosystem';
  if(state.routeViewMode==='ecosystem')requestAnimationFrame(()=>{drawRouteEcosystemConnections();bindRouteEcosystemFocus();});
}

const demandFlowEdges=[['客戶預測','客戶PO'],['客戶預測','計畫庫存行動'],['內部預測','計畫庫存行動'],['計畫庫存行動','客戶PO']];
function demandFlowCount(events,source){if(source==='計畫庫存行動')return events.filter(e=>Number(e.plannedStockQty||0)>0).length;return events.filter(e=>e.source===source).length;}
function demandTransitionCount(events,from,to){
  if(from==='客戶預測'&&to==='客戶PO')return events.filter(e=>e.source==='客戶PO'&&(e.offsets||[]).some(x=>x.type==='客戶預測')).length;
  if(from==='客戶預測'&&to==='計畫庫存行動')return events.filter(e=>e.source==='客戶預測'&&Number(e.plannedStockQty||0)>0).length;
  if(from==='內部預測'&&to==='計畫庫存行動')return events.filter(e=>e.source==='內部預測'&&Number(e.plannedStockQty||0)>0).length;
  if(from==='計畫庫存行動'&&to==='客戶PO')return events.filter(e=>e.source==='客戶PO'&&(e.offsets||[]).some(x=>x.type==='內部預測')).length;return 0;
}
function demandFlowNode(source,events,subtitle){const count=demandFlowCount(events,source);const qty=source==='計畫庫存行動'?events.reduce((s,e)=>s+Number(e.plannedStockQty||0),0):events.filter(e=>e.source===source).reduce((s,e)=>s+Number(e.qty||0),0);const clickable=source!=='計畫庫存行動';return `<button type="button" class="demand-flow-node ${state.demandType===source?'active':''}" ${clickable?`data-demand-flow-source="${source}"`:''} data-flow-node="${source}"><span class="tag ${source==='計畫庫存行動'?'warning':sourceClass[source]||'neutral'}">${source}</span><strong>${count}</strong><small>${source==='計畫庫存行動'?'計畫行動':'需求事件'}</small><em>${fmt(qty)} 件・${subtitle}</em></button>`;}
function renderDemandConversionGraph(events){const root=$('#demandConversionGraph');if(!root)return;root.innerHTML=`<div class="demand-flow-scroll"><div class="demand-flow-canvas demand-flow-canvas-v2"><svg id="demandFlowSvg" class="demand-flow-svg" aria-hidden="true"></svg><section class="demand-flow-column signal"><header><small>Forecast Signals</small><h3>預測輸入</h3></header>${demandFlowNode('客戶預測',events,'預設等待正式PO沖銷')}${demandFlowNode('內部預測',events,'凍結期轉計畫庫存')}</section><section class="demand-flow-column stock"><header><small>Frozen Supply Action</small><h3>計畫庫存行動</h3></header>${demandFlowNode('計畫庫存行動',events,'未轉PO預測的供給準備')}</section><section class="demand-flow-column order"><header><small>Firm Demand</small><h3>客戶PO</h3></header>${demandFlowNode('客戶PO',events,'外部／內部／專案／維修')}</section></div></div><div class="demand-flow-edge-summary">${demandFlowEdges.map(([from,to])=>`<span>${from} → ${to}<strong>${demandTransitionCount(events,from,to)}</strong></span>`).join('')}</div>`;root.querySelectorAll('[data-demand-flow-source]').forEach(node=>node.addEventListener('click',()=>{state.demandType=state.demandType===node.dataset.demandFlowSource?'all':node.dataset.demandFlowSource;renderDemand();}));$('#resetDemandSourceGraph')?.addEventListener('click',()=>{state.demandSource='all';state.demandType='all';renderDemand();});requestAnimationFrame(drawDemandFlowConnections);}
function drawDemandFlowConnections(){
  const canvas=$('#demandConversionGraph .demand-flow-canvas');const svg=$('#demandFlowSvg');if(!canvas||!svg)return;
  const box=canvas.getBoundingClientRect(),width=canvas.scrollWidth,height=canvas.scrollHeight;svg.setAttribute('viewBox',`0 0 ${width} ${height}`);svg.setAttribute('width',width);svg.setAttribute('height',height);
  const paths=[];demandFlowEdges.forEach(([from,to])=>{const a=canvas.querySelector(`[data-flow-node="${from}"]`),b=canvas.querySelector(`[data-flow-node="${to}"]`);if(!a||!b)return;const ar=a.getBoundingClientRect(),br=b.getBoundingClientRect();const x1=ar.right-box.left,y1=ar.top-box.top+ar.height/2,x2=br.left-box.left,y2=br.top-box.top+br.height/2,bend=Math.max(46,(x2-x1)*.42);paths.push(`<path class="demand-flow-link" d="M ${x1} ${y1} C ${x1+bend} ${y1}, ${x2-bend} ${y2}, ${x2} ${y2}"/>`);});
  svg.innerHTML=`<defs><marker id="demandArrow" markerWidth="9" markerHeight="9" refX="8" refY="4.5" orient="auto"><path d="M0,0 L9,4.5 L0,9 z"></path></marker></defs>${paths.join('')}`;
}

function demandScopeRows(){
  return state.demandEvents.filter(d=>inScope(d.factory)).filter(d=>state.demandSource==='all'||(d.sourceCategory||sourceCategoryFor(d.source))===state.demandSource).filter(d=>state.demandType==='all'||d.source===state.demandType).filter(d=>state.demandStatus==='all'||d.status===state.demandStatus).filter(d=>{
    if(state.demandHorizon==='all')return true;return dateDiff(d.demandDate,TODAY)<=Number(state.demandHorizon)&&dateDiff(d.demandDate,TODAY)>=0;
  }).sort((a,b)=>a.factory.localeCompare(b.factory)||a.demandDate.localeCompare(b.demandDate));
}
function renderDemand(){
  $('#demandSourceFilter').value=state.demandSource;$('#demandStatusFilter').value=state.demandStatus;$('#demandHorizonFilter').value=state.demandHorizon;
  const all=state.demandEvents.filter(d=>inScope(d.factory));const rows=demandScopeRows();
  const categories=['客戶','內部'];
  $('#demandKpis').innerHTML=categories.map((category,i)=>{const items=all.filter(d=>(d.sourceCategory||sourceCategoryFor(d.source))===category);const approvals=items.filter(d=>d.status==='待審批').length;return kpiCard([`${category}需求`,items.length,`${fmt(items.reduce((s,d)=>s+d.qty,0))} 件${approvals?`・${approvals}筆待審批`:''}`,category==='客戶'?'C':'I',i===0?'tone-blue':'tone-green']);}).concat([kpiCard(['LT內待審批',all.filter(d=>d.status==='待審批').length,'客戶預測／PO例外','LT','tone-red']),kpiCard(['無PO可沖銷預測',all.filter(d=>d.source==='客戶預測'&&!(d.offsetQty>0)).length,'待PO或凍結期計畫庫存','F','tone-yellow'])]).join('');
  $('#demandEventCount').textContent=`${rows.length}筆日期事件`;
  renderDemandConversionGraph(all);
  const grouped=Object.groupBy?Object.groupBy(rows,r=>r.factory):rows.reduce((a,r)=>((a[r.factory]??=[]).push(r),a),{});
  $('#demandEventTable').innerHTML=Object.entries(grouped).map(([factory,items])=>{
    const total=items.reduce((s,x)=>s+x.qty,0);
    const header=`<tr class="factory-group-row"><td colspan="12"><div><strong>${factory}｜${factoryName(factory)}</strong><span>${items.length}筆事件・${fmt(total)}件</span></div></td></tr>`;
    return header+items.map(d=>demandRow(d)+(state.expandedDemandId===d.id?`<tr class="fulfillment-expand-row"><td colspan="12">${fulfillmentPanel(d,'demand')}</td></tr>`:'')).join('');
  }).join('')||'<tr><td colspan="12">沒有符合條件的需求事件</td></tr>';
  $$('.demand-action').forEach(b=>b.addEventListener('click',ev=>{ev.stopPropagation();handleDemandAction(b.dataset.id,b.dataset.action);}));
  bindFulfillmentInteractions('demand');
}
function demandChain(d){
  const chain=[];const seen=new Set();let cursor=d;
  while(cursor&&!seen.has(cursor.id)){seen.add(cursor.id);chain.unshift(cursor);cursor=cursor.parentEventId?state.demandEvents.find(x=>x.id===cursor.parentEventId):null;}
  return chain;
}
function relationChainHtml(d){
  if(d.source==='客戶PO'){const detail=(d.offsets||[]).map(x=>`${x.type} ${x.eventId}：${fmt(x.qty)}`).join('；');return `<div class="chain-cell"><strong>${d.offsetQty?`已沖銷 ${fmt(d.offsetQty)} 件`:'無預測可沖銷'}</strong><span>${d.offsetMode||'後台沖銷檢查'}</span><small>${detail||`未覆蓋 ${fmt(d.uncoveredQty||d.qty)} 件`}</small></div>`;}
  const planned=Number(d.plannedStockQty||0);return `<div class="chain-cell"><strong>${d.forecastOffsetStatus||'尚無沖銷PO'}</strong><span>${planned?`凍結期計畫庫存 ${fmt(planned)} 件`:'等待後台轉換判斷'}</span><small>${d.plannedAction||'依需求日期與接單LT每日計算'}</small></div>`;
}
function demandAudienceHtml(d){
  if(d.source==='客戶PO')return `<strong>${d.customer}</strong><br><span class="event-id">${d.poCategory||'外部客戶'}・${d.destinationCountry}・${d.destinationCity}</span>`;
  if(d.source==='客戶預測')return `<strong>${d.prospectCustomer||'待指定客戶'}</strong><br><span class="event-id">預測需求・尚未形成正式出貨</span>`;
  return `<strong>${d.purpose||'內部規劃用途'}</strong><br><span class="event-id">內部預測・無正式出貨目的地</span>`;
}
function demandSupplyAllocation(event,fulfillment=null){
  if(event.supplyAllocation){
    const a=event.supplyAllocation;const total=Number(event.qty||0);const f=fulfillment||buildFulfillment(event);const active=f.workOrders.filter(w=>w.progress>0&&w.progress<100).slice(0,2);
    const wipOrders=(a.wipOrders||[]).length?a.wipOrders:active.map(w=>({id:w.id,item:w.item,qty:Math.max(1,Math.round(Number(a.wipQty||0)/Math.max(1,active.length))),progress:w.progress}));
    return {...a,wipOrders,total,gapQty:Math.max(0,total-Number(a.stockQty||0)-Number(a.wipQty||0))};
  }
  const total=Number(event.qty||0);const seed=hashText(`${event.id}|${event.sku}|supply`);
  const stockRatio=[.08,.14,.2,.26,.32][seed%5];const wipRatio=[.18,.24,.3,.36,.42][(seed>>3)%5];
  const stockQty=Math.min(total,Math.round(total*stockRatio));const wipQty=Math.min(total-stockQty,Math.round(total*wipRatio));
  const f=fulfillment||buildFulfillment(event);const active=f.workOrders.filter(w=>w.progress>0&&w.progress<100).slice(0,2);
  return {total,stockQty,wipQty,gapQty:Math.max(0,total-stockQty-wipQty),warehouse:`${event.factory}-FG倉`,lotNo:`LOT-${event.factory}-${String(seed%9999).padStart(4,'0')}`,wipOrders:active.map(w=>({id:w.id,item:w.item,qty:Math.max(1,Math.round(wipQty/Math.max(1,active.length))),progress:w.progress}))};
}
function demandSupplySummaryHtml(d){
  const a=demandSupplyAllocation(d);
  return `<div class="demand-supply-summary"><span class="supply-chip stock">庫存 ${fmt(a.stockQty)}</span><span class="supply-chip wip">在製 ${fmt(a.wipQty)}</span>${a.gapQty?`<span class="supply-chip gap">待生產 ${fmt(a.gapQty)}</span>`:'<span class="supply-chip covered">已覆蓋</span>'}<small>${a.total?((a.stockQty+a.wipQty)/a.total*100).toFixed(0):0}% 由既有供給覆蓋</small></div>`;
}
function demandSupplyAllocationPanel(event,f){
  const a=demandSupplyAllocation(event,f);const wips=(a.wipOrders||[]).map(w=>`<div class="allocation-link"><strong>${w.id}</strong><span>${w.item||'生產中工單'}・${fmt(w.qty)} 件・進度 ${Math.round(w.progress||0)}%</span></div>`).join('');
  return `<section class="demand-allocation-panel"><div class="panel-subheader"><div><p class="eyebrow">DEMAND SUPPLY ALLOCATION</p><h4>本筆需求供給耗用關係</h4><p>先耗用既有成品庫存，再連結生產中工單；剩餘缺口才建立或調整後續生產。</p></div><span class="tag ${a.gapQty?'warning':'success'}">${a.gapQty?'仍有供給缺口':'供給已覆蓋'}</span></div><div class="allocation-tile-grid"><article class="allocation-tile stock"><span>既有成品庫存</span><strong>${fmt(a.stockQty)} 件</strong><small>${a.warehouse||event.factory+'-FG倉'}・${a.lotNo||'待分配批號'}</small></article><article class="allocation-tile wip"><span>生產中工單</span><strong>${fmt(a.wipQty)} 件</strong><small>${(a.wipOrders||[]).length}張工單承接</small>${wips}</article><article class="allocation-tile gap"><span>待新增／調整生產</span><strong>${fmt(a.gapQty)} 件</strong><small>${a.gapQty?'需由有限排程建立供給':'不需新增生產'}</small></article><article class="allocation-tile coverage"><span>既有供給覆蓋率</span><strong>${a.total?((a.stockQty+a.wipQty)/a.total*100).toFixed(1):'0.0'}%</strong><small>庫存＋已開工在製</small></article></div></section>`;
}
function demandRow(d){
  let action=['—','none'];
  if(d.status==='待審批')action=['進入審批','viewApproval'];
  else if(d.status==='詢單評估')action=['確認詢單','confirmInquiry'];
  else if(d.status==='待整合')action=['送確認','confirmQueue'];
  else if(d.status==='待確認')action=['確認需求','confirm'];
  else if(d.status==='已確認'||d.status==='已轉計畫庫存'){if(d.source==='客戶PO')action=['轉內部SO','toSo'];else action=['後台計算完成','none'];}else if(d.source==='客戶PO'&&d.status==='已轉內部SO')action=['查看SO','viewSo'];
  else if((d.childEventIds||[]).length)action=['查看下游','viewDownstream'];
  const expanded=state.expandedDemandId===d.id;
  return `<tr class="demand-main-row expandable-data-row ${expanded?'expanded':''}" data-event-id="${d.id}"><td><button class="fulfillment-toggle row-expand-toggle" data-id="${d.id}" data-context="demand" aria-label="${expanded?'收合':'展開'}需求履行">${expanded?'−':'+'}</button><strong>${d.id}</strong><br><span class="event-id">批次 ${d.batchId}</span></td><td><strong>${formatDateFull(d.demandDate)}</strong><br><span class="event-id">建立 ${formatDate(d.createdDate)}</span></td><td><span class="tag ${sourceClass[d.sourceCategory||sourceCategoryFor(d.source)]||'neutral'}">${d.sourceCategory||sourceCategoryFor(d.source)}</span><br><span class="event-id">${d.source}</span></td><td><span class="tag ${statusClass[d.status]||'neutral'}">${d.status}</span>${d.withinOrderLeadTime?`<br><span class="event-id lt-inline">LT ${d.orderLeadTime}天・短少${d.leadTimeShortfall}天</span>`:''}</td><td><div class="demand-audit-cell"><strong>${d.proposer}</strong><span>${d.proposerDept}</span><small>提出 ${formatDateFull(d.proposedDate)}・最後改版 ${formatDateFull(d.lastVersionDate||d.proposedDate)}</small><em>${d.currentVersion||`V${String(d.versionCount||1).padStart(2,'0')}`}・更換 ${Math.max(0,(d.versionCount||1)-1)} 次</em></div></td><td>${relationChainHtml(d)}</td><td>${demandAudienceHtml(d)}</td><td><strong>${d.product}</strong><br><span class="event-id">${d.sku}</span></td><td><strong>${fmt(d.qty)} 件</strong>${d.source==='計畫庫存'&&d.remainingQty!==null?`<br><span class="event-id">剩餘 ${fmt(d.remainingQty)} 件</span>`:`<br><span class="event-id">P${d.priority}</span>`}</td><td>${demandSupplySummaryHtml(d)}</td><td>${d.soNo?`<strong>${d.soNo}</strong>`:'<span class="event-id">尚未建立</span>'}</td><td><button class="action-link demand-action" data-id="${d.id}" data-action="${action[1]}" ${action[1]==='none'?'disabled':''}>${action[0]}</button></td></tr>`;
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
  const common={id,region:parent.region,factory:parent.factory,demandDate:parent.demandDate,productKey:parent.productKey,product:parent.product,sku:parent.sku,priority:parent.priority,createdDate:TODAY,parentEventId:parent.id,rootEventId:parent.rootEventId||parent.id,childEventIds:[],soNo:'',shippingStatus:'',incoterm:'',transportMode:'',supplyAllocation:null,orderLeadTime:getOrderLeadTime(parent.sku)};
  let child;
  if(targetSource==='內部需求'){
    child={...common,batchId:`IDM-${parent.factory}-${String(hashText(id)%999).padStart(3,'0')}`,sourceCategory:'內部',demandType:'內部需求',source:'內部需求',status:'已確認',qty:parent.qty,remainingQty:null,originMode:'內部預測轉內部需求',purpose:'經核准的內部補庫／調撥需求',customer:'',destinationRegion:'',destinationCountry:'',destinationCity:''};
    parent.status='已轉換';
  }else if(targetSource==='計畫庫存'){
    child={...common,batchId:`STK-${parent.factory}-${String(hashText(id)%999).padStart(3,'0')}`,sourceCategory:'內部',demandType:'計畫庫存',source:'計畫庫存',status:'已確認',qty:parent.qty,remainingQty:parent.qty,originMode:'內部需求轉庫存',purpose:'區域成品安全庫存',customer:'',destinationRegion:'',destinationCountry:'',destinationCity:''};
    parent.status='已轉換';
  }else{
    const available=parent.source==='計畫庫存'?(parent.remainingQty??parent.qty):parent.qty;
    const qty=parent.source==='計畫庫存'?Math.max(100,Math.round(available*.6)):parent.qty;
    const originMode=parent.source==='客戶預測'?'預測完整轉換':parent.source==='緊急詢單'?'緊急詢單轉單':'計畫庫存消耗';
    const assessment=statusForDemand('客戶PO',parent.sku,parent.demandDate);child={...common,batchId:`PO-${parent.factory}-${String(hashText(id)%999).padStart(3,'0')}`,sourceCategory:'客戶',demandType:'客戶PO',source:'客戶PO',status:assessment.status,requiresApproval:assessment.requiresApproval,withinOrderLeadTime:assessment.within,daysToDemand:assessment.daysToDemand,leadTimeShortfall:assessment.shortfall,qty,remainingQty:null,originMode,purpose:'正式客戶訂單',customer:customer.name,destinationRegion:customer.region,destinationCountry:customer.country,destinationCity:customer.city,priority:parent.source==='緊急詢單'?1:2};
    if(parent.source==='計畫庫存'){
      parent.remainingQty=Math.max(0,available-qty);parent.status=parent.remainingQty===0?'已被PO消耗':'部分消耗';
    }else parent.status='已轉換';
  }
  touchDemandEvent(parent);enrichDemandAudit(child,hashText(id));parent.childEventIds=[...(parent.childEventIds||[]),child.id];state.demandEvents.push(child);return child;
}
function handleDemandActionLegacyMRP15(id,action){
  const d=state.demandEvents.find(x=>x.id===id);if(!d)return;
  if(action==='viewApproval'){const approval=state.events.find(e=>e.demandEventId===d.id&&e.approvalType==='ORDER_LT');if(approval){state.selectedEventId=approval.id;renderAll();switchView('events');toast(`已進入 ${approval.id} 接單LT審批`);}return;}
  if(action==='confirmInquiry'){d.status='已確認';touchDemandEvent(d);}
  if(action==='confirmQueue'){d.status='待確認';touchDemandEvent(d);}
  if(action==='confirm'){d.status=d.source==='內部預測'&&d.withinOrderLeadTime?'已轉計畫庫存':'已確認';if(d.source==='客戶預測'&&d.withinOrderLeadTime)d.plannedStockQty=Math.max(0,d.qty-(d.offsetQty||0));touchDemandEvent(d);}
  if(action==='toCustomerPo'||action==='consumeStock'){
    const child=createDerivedDemandEvent(d,'客戶PO');const change=buildChangeEventFromDemand(state.demandEvents,child,state.events.length);if(change){state.events.unshift(change);state.selectedEventId=change.id;}persist();renderAll();toast(`已建立客戶PO事件 ${child.id}，並產生需求變更事件 ${change?.id||''}`);return;
  }
  if(action==='toInternalDemand'){
    const child=createDerivedDemandEvent(d,'內部需求');persist();renderAll();toast(`已建立內部需求事件 ${child.id}`);return;
  }
  if(action==='toPlannedStock'){
    const child=createDerivedDemandEvent(d,'計畫庫存');persist();renderAll();toast(`已建立計畫庫存事件 ${child.id}`);return;
  }
  if(action==='toSo'){
    if(d.source!=='客戶PO'){toast('只有客戶PO可以轉成內部SO');return;}
    d.status='已轉內部SO';touchDemandEvent(d);const linkedChange=state.events.find(e=>e.demandEventId===d.id);if(linkedChange){linkedChange.targetDemandStatus=d.status;linkedChange.status='已核准';}d.soNo=`SO-${d.factory}-${String(90000+hashText(d.id)%9999).slice(-5)}`;d.shippingStatus='待排程';
    const trade=d.destinationRegion===d.region?'內銷':'外銷';d.incoterm=trade==='內銷'?'DAP':['FOB','CIF','DDP','FCA'][hashText(d.id)%4];d.transportMode=chooseTransportMode(d,trade);
  }
  if(action==='viewSo'){state.shipmentTrade='all';state.shipmentTransport='all';state.shipmentStatus='all';renderShipment();switchView('shipment');toast(`已定位 ${d.soNo}`);return;}
  if(action==='viewDownstream'){
    const child=state.demandEvents.find(x=>x.id===(d.childEventIds||[])[0]);if(child){state.demandSource=child.sourceCategory||sourceCategoryFor(child.source);state.demandType=child.source;state.demandStatus='all';renderDemand();toast(`下游事件：${child.id}｜${child.source}`);}return;
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
  $('#shipmentTable').innerHTML=rows.map(s=>{const expanded=state.expandedShipmentId===s.id;return `<tr class="shipment-main-row expandable-data-row ${s.shippingStatus==='延遲風險'?'risk-row':''} ${expanded?'expanded':''}" data-event-id="${s.id}"><td><button class="fulfillment-toggle row-expand-toggle" data-id="${s.id}" data-context="shipment" aria-label="${expanded?'收合':'展開'}需求履行">${expanded?'−':'+'}</button><strong>${s.soNo}</strong><br><button class="link-button shipment-demand-link" data-id="${s.id}">${s.id}</button><br><span class="event-id">${s.originMode}</span></td><td><strong>${s.factory}</strong><br><span class="event-id">${factoryName(s.factory)}</span></td><td><span class="tag ${s.trade==='內銷'?'info':'success'}">${s.trade}</span></td><td><strong>${s.customer}</strong><br><span class="event-id">${s.poCategory||'外部客戶'}・${s.destinationCountry}・${s.destinationCity}</span></td><td><strong>${s.product}</strong><br><span class="event-id">${s.sku}</span></td><td><strong>${fmt(s.qty)} 件</strong></td><td>${formatDateFull(s.demandDate)}</td><td>${formatDateFull(s.plannedShipDate)}</td><td>${transportModeTag(s.transportMode)}</td><td>${s.incoterm}</td><td>${shipmentStatusTag(s.shippingStatus)}</td></tr>${expanded?`<tr class="fulfillment-expand-row"><td colspan="12">${fulfillmentPanel(s,'shipment')}</td></tr>`:''}`;}).join('')||'<tr><td colspan="12">目前沒有符合條件的客戶PO內部SO出貨資料</td></tr>';
  $$('.shipment-demand-link').forEach(b=>b.addEventListener('click',ev=>{ev.stopPropagation();const d=state.demandEvents.find(x=>x.id===b.dataset.id);state.region=d.region;state.factory=d.factory;$('#regionSelect').value=state.region;updateFactoryOptions();$('#factorySelect').value=state.factory;state.demandSource='客戶';state.demandType='客戶PO';state.demandStatus='已轉內部SO';renderAll();switchView('demand');}));
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
  const e=selectedEvent();if(!e){$('#eventDetail').innerHTML='<div class="empty-state">尚無待審批事件。客戶預測或客戶 PO 落在產品接單 LT 內時，系統會自動建立審批事件。</div>';return;}const demand=state.demandEvents.find(d=>d.id===e.demandEventId);const upstream=state.demandEvents.find(d=>d.id===e.upstreamEventId);const qtyDelta=e.newQty-e.oldQty;const days=dateDiff(e.newDate,e.oldDate);
  const audience=demand?.customer||demand?.purpose||e.customer;const destination=demand?.source==='客戶PO'?`${demand.destinationCountry}・${demand.destinationCity}`:'尚無正式出貨目的地';
  $('#eventDetail').innerHTML=`<div class="detail-hero"><p class="eyebrow">${e.id}・${e.factory} ${factoryName(e.factory)}</p><h2>${audience}｜${e.product}</h2><p>${e.title}</p></div><div class="event-row"><div><span class="event-id">事件狀態／需求來源鏈</span><div style="margin-top:5px"><span class="tag neutral">${e.status}</span> <span class="tag ${sourceClass[e.originSource]||'info'}">${e.originSource}</span> <span class="chain-arrow">→</span> <span class="tag ${sourceClass[e.source]||'success'}">${e.source}</span> ${e.freeze?'<span class="tag danger">需求日進入凍結區</span>':'<span class="tag info">需求日位於彈性區</span>'}</div></div>${sevTag(e.severity)}</div><div class="demand-link-box"><div><span>需求總覽關聯</span><strong>${e.upstreamEventId||'—'} → ${e.demandEventId}</strong></div><div><span>來源批次</span><strong>${upstream?.batchId||'—'} → ${demand?.batchId||e.batchId}</strong></div><div><span>事件關係鏈</span><strong>${e.relationChain}</strong></div><button class="secondary-button event-action" data-action="viewDemand">在需求總覽查看</button></div><div class="detail-grid" style="margin-top:16px"><div class="detail-stat"><span>需求數量變化</span><strong class="${qtyDelta>=0?'delta-up':'delta-down'}">${qtyDelta>=0?'+':''}${fmt(qtyDelta)} 件</strong><span>${fmt(e.oldQty)} → ${fmt(e.newQty)}</span></div><div class="detail-stat"><span>需求日期變化</span><strong>${days===0?'同一需求日期':days<0?`提前 ${Math.abs(days)} 天`:`延後 ${days} 天`}</strong><span>${formatDateFull(e.newDate)}</span></div><div class="detail-stat"><span>需求事件狀態</span><strong>${e.sourceDemandStatus} → ${e.targetDemandStatus}</strong><span>${e.originMode}</span></div><div class="detail-stat"><span>客戶／目的地</span><strong>${audience}</strong><span>${destination}</span></div></div><h3>需求事件差異</h3><table class="version-compare"><thead><tr><th>項目</th><th>${e.upstreamEventId||'上游事件'}</th><th>${e.demandEventId}</th><th>變化</th></tr></thead><tbody><tr><td>需求來源</td><td>${upstream?.source||e.originSource}</td><td>${demand?.source||e.source}</td><td>${e.originMode}</td></tr><tr><td>事件狀態</td><td>${e.sourceDemandStatus}</td><td>${e.targetDemandStatus}</td><td>形成正式需求</td></tr><tr><td>需求數量</td><td>${fmt(e.oldQty)}</td><td>${fmt(e.newQty)}</td><td>${qtyDelta>=0?'+':''}${fmt(qtyDelta)}</td></tr><tr><td>需求日期</td><td>${formatDateFull(e.oldDate)}</td><td>${formatDateFull(e.newDate)}</td><td>${days===0?'同日':days<0?`提前${Math.abs(days)}天`:`延後${days}天`}</td></tr><tr><td>正式客戶</td><td>${upstream?.source==='客戶PO'?upstream.customer:'尚未形成'}</td><td>${demand?.customer||'—'}</td><td>${destination}</td></tr></tbody></table><div class="reason-box"><strong>事件說明：</strong>${e.reason}</div><div class="detail-actions">${e.approvalType==='ORDER_LT'?`<button class="primary-button event-action" data-action="approveLt">核准進入供需計畫</button><button class="secondary-button event-action" data-action="待補件">退回補件</button><button class="danger-button event-action" data-action="待決策">升級決策</button>`:`<button class="primary-button event-action" data-action="模擬中">接受進入模擬</button><button class="secondary-button event-action" data-action="待補件">退回補充理由</button><button class="secondary-button event-action" data-action="下期處理">併入下次週期</button><button class="danger-button event-action" data-action="待決策">緊急升級</button>`}</div>`;
  $$('.event-action').forEach(b=>b.addEventListener('click',()=>{
    const action=b.dataset.action;
    if(action==='viewDemand'){state.region=e.region;state.factory=e.factory;$('#regionSelect').value=state.region;updateFactoryOptions();$('#factorySelect').value=state.factory;state.demandSource='all';state.demandType='all';state.demandStatus='all';switchView('demand');toast(`已切換至 ${e.demandEventId} 所屬需求總覽`);return;}
    if(action==='approveLt'){
      if(state.mrpBusy){toast('MRP 尚在計算，請稍候完成後再核准');return;}
      setApprovalBusy(true,'核准處理中…');
      requestAnimationFrame(()=>setTimeout(()=>{
        const linked=state.demandEvents.find(d=>d.id===e.demandEventId);if(linked){linked.status='已確認';linked.requiresApproval=false;touchDemandEvent(linked);}state.expandedDemandId='';state.selectedFulfillmentByEvent={};state.selectedWorkOrderByEvent={};
        e.status='已核准';e.targetDemandStatus='已確認';persistApprovalOnly();renderEvents();toast('接單LT例外已核准，正在更新供需計畫');
        scheduleMrpRecalculation(`審批核准 ${e.id}`,()=>{setApprovalBusy(false);switchView('demand');toast('審批完成，MRP供給計畫已更新');});
      },0));return;
    }
    e.status=action;persistApprovalOnly();renderEvents();toast(`事件已更新為「${e.status}」`);if(e.status==='模擬中')switchView('simulation');
  }));
}

function renderSimulation(){
  const e=selectedEvent();if(!e){$('#simulationSubtitle').textContent='尚無可模擬的需求變更事件';$('#unlimitedMetrics').innerHTML='<div class="empty-state">請先建立需求事件並形成客戶 PO</div>';$('#finiteMetrics').innerHTML='<div class="empty-state">尚無有限計畫</div>';$('#gapAnalysis').innerHTML='<div class="empty-state">尚無差異分析</div>';$('#gapTag').textContent='缺口 0 件';renderSimulationBreakdown();return;}$('#simulationSubtitle').textContent=`${e.id}｜${e.demandEventId}｜${e.customer} ${e.model}｜${e.relationChain}｜需求 ${e.versionFrom} → ${e.versionTo}`;
  const delta=Math.max(0,e.newQty-e.oldQty);$('#quantitySlider').value=state.simulated?.eventId===e.id?state.simulated.extra:delta;$('#dateSlider').value=state.simulated?.eventId===e.id?state.simulated.earlier:Math.max(0,-dateDiff(e.newDate,e.oldDate));$('#prioritySelect').value=String(e.priority);updateSimulationOutputs();runSimulation(false);
}
function updateSimulationOutputs(){$('#quantityOutput').textContent=`+${fmt(Number($('#quantitySlider').value))} 件`;$('#dateOutput').textContent=`提前 ${$('#dateSlider').value} 天`;}
function runSimulation(showToast=false){
  const e=selectedEvent();if(!e)return;const extra=Number($('#quantitySlider').value),earlier=Number($('#dateSlider').value),priority=Number($('#prioritySelect').value);const demand=Math.max(100,e.oldQty+extra);const pressure=1+extra/Math.max(1,e.oldQty)*.72+earlier*.022+(4-priority)*.035;const baseCapacity=e.oldQty*.94;const finite=Math.min(demand,Math.round(baseCapacity/pressure+e.oldQty*.10));const gap=Math.max(0,demand-finite);const completionDelay=Math.ceil(gap/Math.max(300,e.oldQty*.06));const capHours=Math.round(demand*.08),mat=demand,test=Math.round(demand*.04);state.simulated={eventId:e.id,extra,earlier,priority,demand,finite,gap,completionDelay,capHours,mat,test};
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
  const resources=capacityResourcesForFactory(factory);const demands=effectiveFactoryDemands(factory);
  const days=Array.from({length:horizon},(_,i)=>shiftDate(TODAY,i));
  const rows=resources.map((resource,ri)=>{
    const cells=days.map((date,di)=>{
      const seed=hashText(`${factory}-${resource.id}-${date}`);const demand=demands.length?demands[(seed+ri+di)%demands.length]:null;const item=demand?skuLookup[demand.sku]:null;
      if(!demand)return {date,kind:'idle',load:0,hours:0,title:'尚無排程',sku:'—',product:'未排產',qty:0,demandId:'—',source:'尚無需求'};
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
  const avg=summaries.length?summaries.reduce((s,x)=>s+x.avg,0)/summaries.length:0;const over=summaries.reduce((s,x)=>s+x.over,0);const tight=summaries.reduce((s,x)=>s+x.tight,0);const max=summaries.find(x=>x.avg>0)||null;
  $('#productionKpis').innerHTML=[['平均 Loading',`${avg.toFixed(1)}%`,`${factories.length}座工廠／未來${state.productionHorizon}天`,'L','tone-blue'],['超載資源日',over,'每日資源負荷超過100%','!','tone-red'],['吃緊資源日',tight,'負荷介於85%至100%','△','tone-yellow'],['最高負荷工廠',max?`${max.factory} ${max.avg.toFixed(0)}%`:'—',max?factoryName(max.factory):'目前無資料','F','tone-green']].map(kpiCard).join('');
  $('#factoryLoadingCards').innerHTML=summaries.map(x=>`<button class="factory-loading-card ${x.factory===state.productionFactory?'active':''} ${loadClass(x.avg)}" data-factory="${x.factory}"><div class="event-row"><span class="event-id">${x.factory}</span><span class="loading-percent">${x.avg.toFixed(0)}%</span></div><strong>${factoryName(x.factory)}</strong><div class="loading-bar"><i style="width:${Math.min(100,x.avg)}%"></i></div><div class="loading-card-meta"><span>超載 ${x.over}</span><span>吃緊 ${x.tight}</span><span>${fmt(x.plannedHours)}h</span></div></button>`).join('');
  $$('.factory-loading-card').forEach(b=>b.addEventListener('click',()=>{state.productionFactory=b.dataset.factory;renderProduction();}));
  const rows=selected.rows.filter(r=>state.productionResource==='all'||r.resource.type===state.productionResource);$('#capacityGridTitle').textContent=`${selected.factory}｜${factoryName(selected.factory)} 產能資源逐日排程`;$('#capacityGridSubtitle').textContent=`平均 Loading ${selected.avg.toFixed(1)}%，計畫工時 ${fmt(selected.plannedHours)}／可用 ${fmt(selected.capacityHours)} 小時。`;
  $('#capacityGridCount').textContent=`${rows.length}項資源 × ${selected.days.length}天`;
  $('#capacityGridHead').innerHTML=`<tr><th class="resource-sticky">產能資源</th>${selected.days.map(d=>`<th><strong>${formatDate(d)}</strong><span>週${weekdayLabel(d)}</span></th>`).join('')}</tr>`;
  $('#capacityGridBody').innerHTML=rows.map(r=>`<tr><th class="resource-sticky"><strong>${r.resource.name}</strong><span>${r.resource.id}・${r.resource.capacity}h／日</span><em>${r.resource.type}</em></th>${r.cells.map(c=>`<td><button class="capacity-cell ${c.kind}" data-resource="${r.resource.name}" data-date="${c.date}" data-product="${c.product}" data-sku="${c.sku}" data-load="${c.load}" data-hours="${c.hours}" data-qty="${c.qty}" data-demand="${c.demandId}" data-source="${c.source}"><span class="cell-load">${c.load}%</span><strong>${c.product}</strong><small>${c.sku}</small>${c.qty?`<em>${fmt(c.qty)}件</em>`:`<em>${c.title}</em>`}</button></td>`).join('')}</tr>`).join('');
  $$('.capacity-cell').forEach(c=>c.addEventListener('click',()=>toast(`${c.dataset.date}｜${c.dataset.resource}｜${c.dataset.product} ${c.dataset.sku}｜${c.dataset.qty}件｜${c.dataset.hours}h／${c.dataset.load}%｜${c.dataset.source} ${c.dataset.demand}`)));
}

function scenarioBottlenecks(){const e=selectedEvent();if(!e)return[];return bottleneckTemplates.map((b,i)=>({...b,factory:i===0?e.factory:i===1?productLookup[skuLookup[e.model]?.productKey]?.factories?.[1]||e.factory:i===2?productLookup[skuLookup[e.model]?.productKey]?.factories?.[2]||e.factory:e.factory,impactQty:Math.max(100,Math.round((state.simulated?.gap||e.newQty*.12)*[.52,.25,.15,.08][i]))}));}
function renderBottlenecks(){const list=scenarioBottlenecks();if(!list.length){$('#bottleneckMatrix').innerHTML='<div class="empty-state">尚無需求瓶頸資料</div>';$('#bottleneckTable').innerHTML='<tr><td colspan="7">請先匯入需求並完成模擬</td></tr>';return;}$('#bottleneckMatrix').innerHTML=`<span class="axis-y">交付與營收影響 ↑</span><span class="axis-x">處理難度 →</span>`+list.map(x=>`<div class="matrix-dot ${x.severity}" style="left:${x.difficulty}%;top:${100-x.impact}%">${x.name}</div>`).join('');$('#bottleneckTable').innerHTML=list.map(x=>`<tr><td><strong>${x.name}</strong><br><span class="event-id">${x.type}</span></td><td>${x.factory}<br><span class="event-id">${factoryName(x.factory)}</span></td><td>${x.gap}</td><td>${fmt(x.impactQty)}件</td><td>${money(x.revenue)}</td><td class="owner-cell"><strong>${x.owner}</strong><span>${x.dept}</span></td><td>${sevTag(x.severity)}</td></tr>`).join('');}
function renderHotspot(sel,list){$(sel).innerHTML=list.map(x=>`<div class="hotspot-node ${x.severity}" style="left:${Math.min(86,x.difficulty)}%;top:${Math.max(12,100-x.impact)}%"><strong>${x.name}</strong><span>${x.gap}</span></div>`).join('');}

function networkRows(){return supplyRelations.filter(r=>inScope(r.destination)).filter(r=>state.networkProduct==='all'||r.productKey===state.networkProduct).filter(r=>state.networkSku==='all'||r.sku===state.networkSku).filter(r=>state.networkRelation==='all'||r.type===state.networkRelation);}
function renderNetwork(){
  $('#networkProductSelect').value=state.networkProduct;$('#networkSkuSelect').value=state.networkSku;$('#networkRelationSelect').value=state.networkRelation;
  const rows=networkRows();const risk=rows.filter(r=>r.demand>0&&r.supply/r.demand<.9);const external=rows.filter(r=>r.type==='external').length;const interplant=rows.filter(r=>['module','smt','transfer'].includes(r.type)).length;
  $('#networkKpis').innerHTML=[['供應關係',rows.length,'目前篩選範圍','N','tone-blue'],['友廠協同',interplant,'模組／SMT／調撥','↔','tone-green'],['外部供應',external,'料件與現成模組','E','tone-yellow'],['供給風險',risk.length,'覆蓋率低於90%','!','tone-red']].map(kpiCard).join('');
  const selectedSku=state.networkSku!=='all'?skuLookup[state.networkSku]:rows[0]?skuLookup[rows[0].sku]:productCatalog[0];
  const mapRows=rows.filter(r=>!selectedSku||r.sku===selectedSku.sku).slice(0,8);const dest=selectedSku?.factory||mapRows[0]?.destination;
  $('#supplyNetworkMap').innerHTML=`<div class="network-center"><span>生產工廠</span><strong>${dest||'—'}</strong><small>${factoryName(dest)}</small></div><div class="network-source-grid">${mapRows.map(r=>`<button class="network-source ${r.type}" data-source="${r.source}"><span>${relationLabel(r.type)}</span><strong>${r.source}</strong><small>${r.item}</small><i>${r.demand?Math.round(r.supply/r.demand*100)+'%':'尚無需求'}</i></button>`).join('')}</div>`;
  const bom=selectedSku?.bom;$('#bomSummary').innerHTML=bom?`<strong>${selectedSku.sku}</strong><span>${selectedSku.product}・${selectedSku.factory}</span>`:'<span>請選擇成品料號</span>';$('#bomTree').innerHTML=bom?renderBomNode(bom,0):'<div class="empty-state">沒有BOM資料</div>';
  $('#networkRelationCount').textContent=`${rows.length}條供應關係`;
  $('#networkRelationTable').innerHTML=rows.slice(0,120).map(r=>{const hasDemand=r.demand>0;const rate=hasDemand?r.supply/r.demand*100:0;const sev=!hasDemand?'neutral':rate<85?'red':rate<95?'yellow':'green';const coverage=hasDemand?`<div class="coverage-cell"><strong>${rate.toFixed(0)}%</strong><div class="mini-progress ${sev}"><i style="width:${Math.min(100,rate)}%"></i></div></div>`:'<span class="event-id">尚無需求</span>';const riskTag=hasDemand?sevTag(sev):'<span class="tag neutral">未啟用</span>';return `<tr><td><strong>${r.source}</strong></td><td><span class="tag ${r.type==='external'?'info':r.type==='module'?'success':r.type==='smt'?'warning':'neutral'}">${relationLabel(r.type)}</span></td><td><strong>${r.item}</strong><br><span class="event-id">${r.sku}</span></td><td>${r.destination}<br><span class="event-id">${factoryName(r.destination)}</span></td><td>${fmt(r.demand)}</td><td>${fmt(r.supply)}</td><td>${coverage}</td><td>${r.lead}天</td><td>${riskTag}</td></tr>`;}).join('')||'<tr><td colspan="9">沒有符合條件的供應關係</td></tr>';
  $$('.bom-toggle').forEach(b=>b.addEventListener('click',()=>b.closest('.bom-node').classList.toggle('collapsed')));
}
function relationLabel(t){return{external:'外部供應商',module:'友廠模組',smt:'友廠SMT',transfer:'跨廠調撥'}[t]||t;}
function renderBomNode(node,level){const children=node.children||[];return `<div class="bom-node level-${level}"><div class="bom-node-row"><button class="bom-toggle" ${children.length?'':'disabled'}>${children.length?'−':'•'}</button><div><strong>${node.id}</strong><span>${node.name}</span></div><em>${node.source}</em></div>${children.length?`<div class="bom-children">${children.map(c=>renderBomNode(c,level+1)).join('')}</div>`:''}</div>`;}

function renderCommit(){const tasks=scenarioBottlenecks();if(!tasks.length){$('#commitTaskCount').textContent='0項待處理';$('#commitTaskList').innerHTML='<div class="empty-state">尚無瓶頸任務</div>';$('#commitWorkbench').innerHTML='<div class="empty-state">請先建立需求並執行模擬</div>';return;}$('#commitTaskCount').textContent=`${tasks.length}項待處理`;$('#commitTaskList').innerHTML=tasks.map(t=>`<div class="task-card ${state.selectedTaskId===t.id?'active':''}" data-task="${t.id}"><div class="event-row"><span class="event-id">${t.id}・${t.factory}</span>${sevTag(t.severity)}</div><h3>${t.name}</h3><p>${t.owner}・${t.dept}｜影響 ${fmt(t.impactQty)} 件</p></div>`).join('');$$('.task-card').forEach(c=>c.addEventListener('click',()=>{state.selectedTaskId=c.dataset.task;renderCommit();}));const task=tasks.find(t=>t.id===state.selectedTaskId)||tasks[0];renderCommitWorkbench(task);}
function renderCommitWorkbench(task){if(!task){$('#commitWorkbench').innerHTML='<div class="empty-state">請選擇一項瓶頸任務</div>';return;}const e=selectedEvent();const saved=state.commits[`${e.id}-${task.id}`];$('#commitWorkbench').innerHTML=`<div class="workbench-hero"><p class="eyebrow">${e.id}・${task.factory}</p><h2>${task.name}</h2><p>${task.owner}需針對${task.gap}缺口，提交含數量、日期、成本及前提的條件式承諾。</p></div><h3>選擇處理方案</h3><div class="option-grid">${task.options.map(o=>`<label class="option-card ${saved?.selected?.includes(o.id)?'selected':''}"><input type="checkbox" value="${o.id}" ${saved?.selected?.includes(o.id)?'checked':''}><h3>${o.name}</h3><p>${o.desc}</p><div class="option-metrics"><span>+${fmt(o.qty)}件</span><span>${money(o.cost)}</span><span>風險${o.risk}</span></div></label>`).join('')}</div><div id="commitPreview" class="commit-preview"></div><h3>承諾前提</h3><ul class="assumption-list"><li>承諾綁定 Demand ${e.versionTo} 與需求日期 ${formatDate(e.newDate)}。</li><li>友廠模組、SMT代工與跨廠調料須完成品質及客戶核可。</li></ul><div class="detail-actions"><button class="primary-button" id="submitCommit">提交 Commit</button><button class="secondary-button" id="clearCommit">清除選擇</button></div>`;
  $$('.option-card input').forEach(inp=>inp.addEventListener('change',()=>{inp.closest('.option-card').classList.toggle('selected',inp.checked);updateCommitPreview(task);}));$('#clearCommit').addEventListener('click',()=>{$$('.option-card input').forEach(i=>{i.checked=false;i.closest('.option-card').classList.remove('selected');});updateCommitPreview(task);});$('#submitCommit').addEventListener('click',()=>{const selected=$$('.option-card input:checked').map(x=>x.value);if(!selected.length){toast('請至少選擇一個處理方案');return;}const calc=calcCommit(task,selected);state.commits[`${e.id}-${task.id}`]={selected,...calc,submitted:true};persist();renderCommit();toast(`${task.owner} 的 Commit 已提交`);});updateCommitPreview(task);
}
function calcCommit(task,selected){const opts=task.options.filter(o=>selected.includes(o.id)),recovered=opts.reduce((s,o)=>s+o.qty,0),cost=opts.reduce((s,o)=>s+o.cost,0),maxDays=Math.max(0,...opts.map(o=>o.days));const e=selectedEvent(),base=state.simulated?.eventId===e.id?state.simulated.finite:Math.round(e.oldQty*.92),commitQty=Math.min(e.newQty,base+recovered);return{recovered,cost,maxDays,commitQty,remaining:Math.max(0,e.newQty-commitQty)};}
function updateCommitPreview(task){const selected=$$('.option-card input:checked').map(x=>x.value),c=calcCommit(task,selected),e=selectedEvent();$('#commitPreview').innerHTML=`<div class="commit-preview-grid"><div><span>可回收缺口</span><strong>+${fmt(c.recovered)} 件</strong></div><div><span>承諾數量</span><strong>${fmt(c.commitQty)} 件</strong></div><div><span>剩餘缺口</span><strong>${fmt(c.remaining)} 件</strong></div><div><span>額外成本</span><strong>${money(c.cost)}</strong></div></div><p class="muted" style="margin:10px 0 0">建議承諾：${formatDate(e.newDate)}前完成${fmt(c.commitQty)}件；剩餘${fmt(c.remaining)}件於${formatDate(shiftDate(e.newDate,c.maxDays+2))}前完成。</p>`;}

function buildScenarios(){const e=selectedEvent();if(!e)return[];const sim=state.simulated?.eventId===e.id?state.simulated:null,finite=sim?.finite||Math.round(e.oldQty*.92),demand=sim?.demand||e.newQty,commits=Object.entries(state.commits).filter(([k,v])=>k.startsWith(`${e.id}-`)&&v.submitted).map(([,v])=>v),recovery=commits.reduce((s,c)=>s+c.recovered,0),cost=commits.reduce((s,c)=>s+c.cost,0);return[{id:'S1',name:'維持現有資源',desc:'不增加成本，以現有產能與物料分批交付。',qty:finite,date:shiftDate(e.newDate,Math.ceil(Math.max(0,demand-finite)/500)),cost:0,customer:'高',other:'低',score:2},{id:'S2',name:'友廠協同＋材料加急',desc:'使用友廠模組、SMT代工及材料加急，平衡交付與成本。',qty:Math.min(demand,finite+Math.max(1200,recovery)),date:shiftDate(e.newDate,Math.max(1,Math.ceil(Math.max(0,demand-finite-recovery)/700))),cost:Math.max(67,cost),customer:'中低',other:'低',score:4,recommended:true},{id:'S3',name:'調整其他客戶順位',desc:'犧牲低優先訂單，優先滿足策略客戶。',qty:demand,date:e.newDate,cost:42,customer:'低',other:'高',score:3}];}
function renderDecision(){const e=selectedEvent();if(!e){$('#decisionSummary').innerHTML='<div class="empty-state">尚無待決策需求事件</div>';$('#scenarioGrid').innerHTML='';$('#approveScenario').disabled=true;return;}const scenarios=buildScenarios();$('#decisionSummary').innerHTML=`<div class="decision-summary-grid"><div><p class="eyebrow">${e.id}・DECISION PACKAGE</p><h2>${e.customer}｜${e.product}－${e.title}</h2><p class="muted">請在交付、跨廠供應、成本與既有客戶影響之間作出取捨。</p></div><div class="summary-value"><span>新需求</span><strong>${fmt(e.newQty)}件</strong></div><div class="summary-value"><span>需求日期</span><strong>${formatDate(e.newDate)}</strong></div><div class="summary-value"><span>有限計畫缺口</span><strong>${fmt(state.simulated?.eventId===e.id?state.simulated.gap:Math.max(0,e.newQty-Math.round(e.oldQty*.92)))}件</strong></div><div class="summary-value"><span>版本</span><strong>${e.versionFrom}→${e.versionTo}</strong></div></div>`;$('#scenarioGrid').innerHTML=scenarios.map(s=>`<article class="scenario-card ${state.selectedScenario===s.id?'selected':''}" data-scenario="${s.id}">${s.recommended?'<span class="recommended">系統建議</span>':''}<p class="eyebrow">${s.id}</p><h2>${s.name}</h2><p>${s.desc}</p><div class="scenario-metrics"><div class="scenario-metric"><span>可交數量</span><strong>${fmt(s.qty)} 件</strong></div><div class="scenario-metric"><span>完成日期</span><strong>${formatDate(s.date)}</strong></div><div class="scenario-metric"><span>額外成本</span><strong>${money(s.cost)}</strong></div><div class="scenario-metric"><span>策略客戶風險</span><strong>${s.customer}</strong></div><div class="scenario-metric"><span>其他客戶影響</span><strong>${s.other}</strong></div></div><div class="event-row"><span class="event-id">綜合評分</span><div class="score-row">${[1,2,3,4,5].map(i=>`<i class="${i<=s.score?'on':''}"></i>`).join('')}</div></div></article>`).join('');$$('.scenario-card').forEach(c=>c.addEventListener('click',()=>{state.selectedScenario=c.dataset.scenario;renderDecision();}));$('#approveScenario').disabled=!state.selectedScenario;}
function approveSelectedScenario(){const e=selectedEvent();if(!e)return;const scenario=buildScenarios().find(s=>s.id===state.selectedScenario);if(!scenario)return;const btn=$('#approveScenario');if(btn){btn.disabled=true;btn.textContent='核准處理中…';}requestAnimationFrame(()=>setTimeout(()=>{state.decisions[e.id]={scenario:scenario.id,name:scenario.name,note:$('#decisionNote').value,approvedAt:new Date().toISOString()};e.status='已核准';state.tracking.unshift({id:`T-${Date.now()}`,factory:e.factory,item:`${e.customer} ${e.model} 新承諾`,owner:e.owner,target:`${fmt(scenario.qty)} 件／${formatDate(scenario.date)}`,actual:'待執行',reason:`已核准「${scenario.name}」。`,severity:'green',action:'開始執行'});persistApprovalOnly();toast(`已核准「${scenario.name}」，建立新版本`);switchView('tracking');if(btn){btn.disabled=false;btn.textContent='核准選定方案並建立新版本';}},0));}

function renderTracking(){const rows=state.tracking.filter(t=>inScope(t.factory)),red=rows.filter(x=>x.severity==='red').length,yellow=rows.filter(x=>x.severity==='yellow').length,green=rows.filter(x=>x.severity==='green').length;const completed=rows.filter(x=>x.actual&&x.actual!=='待執行').length;const attainment=rows.length?`${(completed/rows.length*100).toFixed(1)}%`:'—';$('#trackingKpis').innerHTML=[['紅燈異常',red,'需要立即升級','!','tone-red'],['黃燈風險',yellow,'已有對策持續追蹤','△','tone-yellow'],['正常執行',green,'依承諾進行中','✓','tone-green'],['承諾追蹤達成率',attainment,rows.length?'依已建立追蹤項目計算':'尚無追蹤資料','%','tone-blue']].map(kpiCard).join('');const filtered=rows.filter(r=>state.trackingFilter==='all'||r.severity===state.trackingFilter);$('#trackingTable').innerHTML=filtered.map(r=>`<tr><td><strong>${r.item}</strong><br><span class="event-id">${r.id}</span></td><td>${r.factory}<br><span class="event-id">${factoryName(r.factory)}</span></td><td>${r.owner}</td><td>${r.target}</td><td>${r.actual}</td><td class="reason-text">${r.reason}</td><td>${sevTag(r.severity)}</td><td><button class="action-link tracking-action">${r.action}</button></td></tr>`).join('')||'<tr><td colspan="8">沒有符合條件的追蹤項目</td></tr>';$$('.tracking-filter').forEach(b=>{b.classList.toggle('active',b.dataset.status===state.trackingFilter);b.onclick=()=>{state.trackingFilter=b.dataset.status;renderTracking();};});$$('.tracking-action').forEach(b=>b.addEventListener('click',()=>toast(`已建立處置任務：${b.textContent}`)));}

function persist(){saveStored('ct-events-v8-resource',state.events);saveStored('ct-demand-events-v8-resource',state.demandEvents);saveStored('ct-tracking-v5-resource',state.tracking);saveStored('ct-commits-v5-resource',state.commits);saveStored('ct-decisions-v5-resource',state.decisions);saveStored('ct-work-orders-v1-resource',state.workOrders||[]);saveStored('ct-labor-standards-v1-resource',state.laborStandards||{});saveStored('ct-capacity-calendar-v1-resource',state.capacityCalendar||{});}
function toast(msg){const t=$('#toast');t.textContent=msg;t.classList.add('show');clearTimeout(toast.timer);toast.timer=setTimeout(()=>t.classList.remove('show'),2600);}
function closeOverlays(){$('#sidebar').classList.remove('open');$('#overlay').classList.remove('show');$('#tourModal').classList.remove('show');}
function parseDate(v){return new Date(`${String(v).replaceAll('/','-')}T00:00:00`);}
function dateDiff(a,b){return Math.round((parseDate(a)-parseDate(b))/86400000);}
function shiftDate(date,days){const d=parseDate(date);d.setDate(d.getDate()+days);return d.toISOString().slice(0,10);}
function formatDate(d){const x=parseDate(d);return `${x.getMonth()+1}/${x.getDate()}`;}
function formatDateFull(d){const x=parseDate(d);return `${x.getFullYear()}/${String(x.getMonth()+1).padStart(2,'0')}/${String(x.getDate()).padStart(2,'0')}`;}

function setupTour(){
  const steps=[
    {view:'import',title:'1. 需求匯入',text:'從空白環境開始，以檔案批次匯入或人工單筆KEY單建立需求日期事件。',path:['選成品料號','選可生產工廠','保存需求事件']},
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



/* RESOURCE11: resource master, work order intake and capacity-linked production */
const productionRouteMaster=[
  {key:'material',seq:1,name:'來料檢驗與齊套',resourceType:'IQC',defaultHours:.004,note:'IQC、收料與線邊齊套'},
  {key:'smt',seq:2,name:'SMT／PCBA製造',resourceType:'SMT',defaultHours:.018,note:'印刷、貼片、回焊、AOI與電測'},
  {key:'module',seq:3,name:'核心模組製造',resourceType:'MODULE',defaultHours:.026,note:'功率、控制、馬達或光學模組製造'},
  {key:'assembly',seq:4,name:'成品總裝',resourceType:'ASSEMBLY',defaultHours:.040,note:'模組、機構與附件總裝'},
  {key:'test',seq:5,name:'功能測試與校正',resourceType:'TEST',defaultHours:.030,note:'功能、安規、老化與校正'},
  {key:'pack',seq:6,name:'包裝與出貨準備',resourceType:'PACK',defaultHours:.010,note:'包裝、標示與成品入庫'}
];
function laborKey(sku,routeKey){return `${sku}|${routeKey}`;}
function buildLaborStandards(){const out={};productCatalog.forEach((item,i)=>{const complexity=1+(i%7)*.055+(['電動車動力','新能源'].includes(item.family)?.22:0);productionRouteMaster.forEach(r=>out[laborKey(item.sku,r.key)]=Number((r.defaultHours*complexity).toFixed(4)));});return out;}
function resourceCalendarKey(factory,resourceId,date){return `${factory}|${resourceId}|${date}`;}
function capacityResourcesForFactory(factory){
  const families=new Set((factoryProducts[factory]||[]).map(p=>p.family));
  const resources=[{id:'IQC-01',name:'來料檢驗／物料齊套',type:'IQC',capacity:16},{id:'SMT-01',name:'SMT 高速線',type:'SMT',capacity:20}];
  if([...families].some(f=>['電源系統','車用電力電子','電動車動力','充電基礎設施','新能源'].includes(f)))resources.push({id:'MOD-01',name:'功率／動力模組製造線',type:'MODULE',capacity:18});
  else if([...families].some(f=>f==='熱管理與馬達'))resources.push({id:'MOD-01',name:'馬達繞線／轉子線',type:'MODULE',capacity:18});
  else if([...families].some(f=>f==='影像與安控'))resources.push({id:'MOD-01',name:'光學／影像模組線',type:'MODULE',capacity:16});
  else resources.push({id:'MOD-01',name:'控制模組製造線',type:'MODULE',capacity:18});
  resources.push({id:'ASM-01',name:'最終組裝線 A',type:'ASSEMBLY',capacity:20},{id:'ASM-02',name:'最終組裝線 B',type:'ASSEMBLY',capacity:16});
  const testName=[...families].some(f=>['電源系統','車用電力電子','新能源'].includes(f))?'老化／功能測試線':[...families].some(f=>f==='影像與安控')?'影像校正／功能測試線':'功能測試／校正線';
  resources.push({id:'TST-01',name:testName,type:'TEST',capacity:18},{id:'PKG-01',name:'包裝／成品入庫線',type:'PACK',capacity:16});return resources;
}
function defaultCalendarEntry(factory,resource,date){const dow=parseDate(date).getDay();const available=dow!==0;const factor=dow===6?.7:1;return{factory,resourceId:resource.id,date,available,hours:available?Number((resource.capacity*factor).toFixed(1)):0,reason:available?(dow===6?'週六減班':''):'週日停線'};}
function calendarEntry(factory,resourceId,date){const r=capacityResourcesForFactory(factory).find(x=>x.id===resourceId);if(!r)return{available:false,hours:0,reason:'資源不存在'};const key=resourceCalendarKey(factory,resourceId,date);if(!state.capacityCalendar[key])state.capacityCalendar[key]=defaultCalendarEntry(factory,r,date);return state.capacityCalendar[key];}
function getUnitHours(sku,routeKey){return Number(state.laborStandards[laborKey(sku,routeKey)]??productionRouteMaster.find(x=>x.key===routeKey)?.defaultHours??0);}
function routeMaster(routeKey){return productionRouteMaster.find(x=>x.key===routeKey)||productionRouteMaster[0];}
function workOrderRequiredHours(w){return Number(w.qty||0)*getUnitHours(w.sku,w.routeKey);}

state.workOrders=loadStored('ct-work-orders-v1-resource',[]);
state.laborStandards=loadStored('ct-labor-standards-v1-resource',buildLaborStandards());
state.capacityCalendar=loadStored('ct-capacity-calendar-v1-resource',{});
state.workOrderImportPreviewRows=[];
state.laborProduct=productTypes[0]?.key||'all';
state.laborSku=productCatalog[0]?.sku||'';
state.capacityFactory=allFactories[0];state.capacityHorizon=14;state.selectedCapacityCell=null;
if(state.navGroups.resource===undefined)state.navGroups.resource=false;

function setupResourceManagement(){
  setupWorkOrderImportControls();
  $('#laborProductFilter')?.addEventListener('change',e=>{state.laborProduct=e.target.value;const sku=productCatalog.find(x=>x.productKey===state.laborProduct)?.sku||productCatalog[0]?.sku;state.laborSku=sku;renderLaborManagement();});
  $('#laborSkuFilter')?.addEventListener('change',e=>{state.laborSku=e.target.value;renderLaborManagement();});
  $('#saveLaborStandards')?.addEventListener('click',()=>{$$('#laborStandardsBody [data-labor-key]').forEach(inp=>state.laborStandards[inp.dataset.laborKey]=Math.max(0,Number(inp.value)||0));persist();renderAll();toast('單件工時主檔已保存，Loading 已重新計算');});
  $('#capacityFactorySelect')?.addEventListener('change',e=>{state.capacityFactory=e.target.value;state.selectedCapacityCell=null;renderCapacityManagement();});
  $('#capacityHorizonSelect')?.addEventListener('change',e=>{state.capacityHorizon=Number(e.target.value);state.selectedCapacityCell=null;renderCapacityManagement();});
  $('#capacityEditorForm')?.addEventListener('submit',e=>{e.preventDefault();const s=state.selectedCapacityCell;if(!s)return;const entry=calendarEntry(s.factory,s.resourceId,s.date);entry.available=$('#capacityEditorAvailable').checked;entry.hours=entry.available?Math.max(0,Number($('#capacityEditorHours').value)||0):0;entry.reason=$('#capacityEditorReason').value;persist();renderCapacityManagement();renderProduction();toast('產能資源可用行事曆已保存');});
}
function setupWorkOrderImportControls(){
  const sku=$('#manualWorkOrderSku'),route=$('#manualWorkOrderRoute'),factory=$('#manualWorkOrderFactory');if(!sku)return;
  sku.innerHTML=productCatalog.map(x=>`<option value="${x.sku}">${x.product}｜${x.sku}</option>`).join('');
  route.innerHTML=productionRouteMaster.map(x=>`<option value="${x.key}">${String(x.seq).padStart(2,'0')}｜${x.name}</option>`).join('');
  const refreshFactories=()=>{const item=skuLookup[sku.value];factory.innerHTML=(productLookup[item?.productKey]?.factories||allFactories).map(f=>`<option value="${f}">${f}｜${factoryName(f)}</option>`).join('');refreshWorkOrderResources();};
  const refreshWorkOrderResources=()=>{const f=factory.value||allFactories[0],type=routeMaster(route.value).resourceType;const resources=capacityResourcesForFactory(f).filter(r=>r.type===type);$('#manualWorkOrderResource').innerHTML=resources.map(r=>`<option value="${r.id}">${r.id}｜${r.name}</option>`).join('')||'<option value="">無符合資源</option>';updateManualWorkOrderEstimate();};
  sku.onchange=refreshFactories;route.onchange=refreshWorkOrderResources;factory.onchange=refreshWorkOrderResources;['manualWorkOrderQty','manualWorkOrderStart','manualWorkOrderDue'].forEach(id=>$('#'+id)?.addEventListener('input',updateManualWorkOrderEstimate));
  $('#manualWorkOrderDemand').innerHTML='<option value="">不指定需求事件</option>'+state.demandEvents.map(d=>`<option value="${d.id}">${d.id}｜${d.sku}｜${fmt(d.qty)}件｜${d.demandDate}</option>`).join('');
  refreshFactories();
  $('#manualWorkOrderForm').addEventListener('submit',e=>{e.preventDefault();const w=normalizeWorkOrder({kind:$('#manualWorkOrderKind').value,status:$('#manualWorkOrderStatus').value,sku:sku.value,routeKey:route.value,factory:factory.value,resourceId:$('#manualWorkOrderResource').value,qty:$('#manualWorkOrderQty').value,progress:$('#manualWorkOrderProgress').value,startDate:$('#manualWorkOrderStart').value,dueDate:$('#manualWorkOrderDue').value,demandEventId:$('#manualWorkOrderDemand').value});state.workOrders.unshift(w);persist();renderAll();toast(`已建立工單 ${w.id}`);});
  $('#workOrderFileInput').addEventListener('change',e=>readWorkOrderFile(e.target.files?.[0]));
  $('#workOrderFileDrop').addEventListener('dragover',e=>{e.preventDefault();e.currentTarget.classList.add('dragging');});$('#workOrderFileDrop').addEventListener('dragleave',e=>e.currentTarget.classList.remove('dragging'));$('#workOrderFileDrop').addEventListener('drop',e=>{e.preventDefault();e.currentTarget.classList.remove('dragging');readWorkOrderFile(e.dataTransfer.files?.[0]);});
  $('#confirmWorkOrderImport').addEventListener('click',()=>{const rows=state.workOrderImportPreviewRows.filter(x=>x.valid).map(x=>x.order);state.workOrders.unshift(...rows);state.workOrderImportPreviewRows=[];$('#workOrderFileInput').value='';persist();renderAll();toast(`已匯入 ${rows.length} 張工單`);});
  $('#clearWorkOrderFile').addEventListener('click',()=>{state.workOrderImportPreviewRows=[];$('#workOrderFileInput').value='';renderWorkOrderImportPreview();});
  $('#downloadWorkOrderTemplate').addEventListener('click',()=>{const text='kind,sku,factory,routeKey,resourceId,qty,startDate,dueDate,status,progress,demandEventId\n內製工單,UPS-100,TW01,assembly,ASM-01,1000,2026-07-15,2026-07-25,待開工,0,\n';const a=document.createElement('a');a.href=URL.createObjectURL(new Blob(['\ufeff'+text],{type:'text/csv'}));a.download='work-order-import-template.csv';a.click();URL.revokeObjectURL(a.href);});
}
function normalizeWorkOrder(raw){const sku=String(raw.sku||'').trim(),item=skuLookup[sku];if(!item)throw new Error(`成品料號不存在：${sku}`);const routeKey=String(raw.routeKey||raw.route||'').trim();if(!productionRouteMaster.some(x=>x.key===routeKey))throw new Error(`途程不存在：${routeKey}`);const factory=String(raw.factory||'').trim();if(!factoryLookup[factory])throw new Error(`工廠不存在：${factory}`);const resourceId=String(raw.resourceId||'').trim();if(!capacityResourcesForFactory(factory).some(r=>r.id===resourceId))throw new Error(`產能資源不存在：${factory}/${resourceId}`);const qty=Math.round(Number(raw.qty));if(!(qty>0))throw new Error('工單數量必須大於0');const startDate=String(raw.startDate||'').slice(0,10),dueDate=String(raw.dueDate||'').slice(0,10);if(!startDate||!dueDate||dateDiff(dueDate,startDate)<0)throw new Error('工單期間不正確');const progress=Math.min(100,Math.max(0,Number(raw.progress)||0));return{id:raw.id||`WO-${factory}-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2,5).toUpperCase()}`,kind:raw.kind==='委外工單'?'委外工單':'內製工單',status:String(raw.status||'待開工'),sku,product:item.product,productKey:item.productKey,factory,routeKey,resourceId,qty,startDate,dueDate,progress,demandEventId:String(raw.demandEventId||''),createdDate:TODAY};}
async function readWorkOrderFile(file){if(!file)return;$('#workOrderFileStatus').textContent=`讀取 ${file.name}…`;try{const text=await file.text();const raw=file.name.toLowerCase().endsWith('.json')?JSON.parse(text):parseCsv(text);const list=Array.isArray(raw)?raw:(raw.workOrders||[]);state.workOrderImportPreviewRows=list.map((r,i)=>{try{return{rowNo:i+1,order:normalizeWorkOrder(r),valid:true,error:''};}catch(err){return{rowNo:i+1,raw:r,valid:false,error:err.message};}});renderWorkOrderImportPreview();}catch(err){state.workOrderImportPreviewRows=[];$('#workOrderFileStatus').textContent=`讀取失敗：${err.message}`;renderWorkOrderImportPreview();}}
function renderWorkOrderImportPreview(){const rows=state.workOrderImportPreviewRows||[];if(!$('#workOrderImportPreview'))return;$('#workOrderFileStatus').textContent=rows.length?`${rows.length}列；${rows.filter(x=>x.valid).length}列可匯入`:'尚未選擇檔案';$('#confirmWorkOrderImport').disabled=!rows.some(x=>x.valid);$('#workOrderImportPreview').innerHTML=rows.map(x=>{const w=x.order||x.raw||{};return`<tr><td>${w.kind||'—'}</td><td>${w.sku||'—'}</td><td>${w.routeKey||'—'}</td><td>${w.factory||'—'}／${w.resourceId||'—'}</td><td>${fmt(w.qty)}</td><td>${w.startDate||'—'} → ${w.dueDate||'—'}</td><td>${x.valid?'<span class="tag success">通過</span>':`<span class="tag danger">${x.error}</span>`}</td></tr>`;}).join('')||'<tr><td colspan="7">請先選擇檔案</td></tr>';}
function updateManualWorkOrderEstimate(){if(!$('#manualWorkOrderEstimate'))return;const sku=$('#manualWorkOrderSku').value,routeKey=$('#manualWorkOrderRoute').value,qty=Number($('#manualWorkOrderQty').value)||0;const unit=getUnitHours(sku,routeKey),hours=qty*unit;$('#manualWorkOrderEstimate').innerHTML=`<div><span>單件標準工時</span><strong>${unit.toFixed(4)} 小時／件</strong></div><div><span>工單總需求工時</span><strong>${hours.toFixed(1)} 小時</strong></div><div><span>計算來源</span><strong>工時管理主檔</strong></div>`;}
function renderWorkOrderImport(){if(!$('#workOrderImportKpis'))return;const rows=state.workOrders||[],active=rows.filter(w=>!['已完成','取消'].includes(w.status)),outs=rows.filter(w=>w.kind==='委外工單'),hours=rows.reduce((s,w)=>s+workOrderRequiredHours(w),0);$('#workOrderImportKpis').innerHTML=[['工單總數',rows.length,'由使用者匯入或KEY單','WO','tone-blue'],['執行中／待開工',active.length,'可進入需求與產能配置','▶','tone-yellow'],['委外工單',outs.length,'友廠或協力廠承接','↗','tone-green'],['總需求工時',`${fmt(hours)}h`,'數量 × 單件工時','H','tone-blue']].map(kpiCard).join('');$('#workOrderCount').textContent=`${rows.length}張`;$('#workOrderTable').innerHTML=rows.sort((a,b)=>a.dueDate.localeCompare(b.dueDate)).map(w=>`<tr><td><strong>${w.id}</strong><br><span class="event-id">${w.createdDate}</span></td><td><span class="tag ${w.kind==='委外工單'?'warning':'info'}">${w.kind}</span><br>${fulfillmentStatusTag(w.status)}</td><td><strong>${w.product}｜${w.sku}</strong><br><span class="event-id">${routeMaster(w.routeKey).name}</span></td><td>${w.factory}｜${factoryName(w.factory)}<br><span class="event-id">${w.resourceId}</span></td><td>${fmt(w.qty)}</td><td>${getUnitHours(w.sku,w.routeKey).toFixed(4)}h</td><td><strong>${workOrderRequiredHours(w).toFixed(1)}h</strong></td><td>${formatDateFull(w.startDate)}<br>→ ${formatDateFull(w.dueDate)}</td><td>${w.demandEventId||'未指定'}</td></tr>`).join('')||'<tr><td colspan="9">目前沒有工單；新增需求不會自動產生在製工單。</td></tr>';renderWorkOrderImportPreview();updateManualWorkOrderEstimate();if($('#manualWorkOrderDemand'))$('#manualWorkOrderDemand').innerHTML='<option value="">不指定需求事件</option>'+state.demandEvents.map(d=>`<option value="${d.id}">${d.id}｜${d.sku}｜${fmt(d.qty)}件</option>`).join('');}

function renderLaborManagement(){if(!$('#laborKpis'))return;$('#laborProductFilter').innerHTML=productTypes.map(p=>`<option value="${p.key}">${p.name}</option>`).join('');$('#laborProductFilter').value=state.laborProduct;const skus=productCatalog.filter(x=>x.productKey===state.laborProduct);if(!skus.some(x=>x.sku===state.laborSku))state.laborSku=skus[0]?.sku||productCatalog[0].sku;$('#laborSkuFilter').innerHTML=skus.map(x=>`<option value="${x.sku}">${x.sku}</option>`).join('');$('#laborSkuFilter').value=state.laborSku;const item=skuLookup[state.laborSku],total=productionRouteMaster.reduce((s,r)=>s+getUnitHours(state.laborSku,r.key),0);$('#laborKpis').innerHTML=[['工時主檔',productCatalog.length*productionRouteMaster.length,'成品 × 途程節點','T','tone-blue'],['目前成品',state.laborSku,item?.product||'—','SKU','tone-green'],['總單件工時',`${total.toFixed(4)}h`,'六段標準途程合計','Σ','tone-yellow'],['每千件工時',`${fmt(total*1000)}h`,'產能需求估算基礎','K','tone-blue']].map(kpiCard).join('');$('#laborTableTitle').textContent=`${item?.product||''}｜${state.laborSku} 單件工時`;$('#laborStandardsBody').innerHTML=productionRouteMaster.map(r=>{const val=getUnitHours(state.laborSku,r.key);return`<tr><td>${String(r.seq).padStart(2,'0')}</td><td><strong>${r.name}</strong></td><td><span class="tag neutral">${r.resourceType}</span></td><td><input class="labor-hour-input" data-labor-key="${laborKey(state.laborSku,r.key)}" type="number" min="0" step="0.0001" value="${val.toFixed(4)}" /></td><td><strong>${(val*1000).toFixed(1)}h</strong></td><td>${r.note}</td></tr>`;}).join('');}

function renderCapacityManagement(){if(!$('#capacityKpis'))return;const factories=scopeFactoryIds();if(!factories.includes(state.capacityFactory))state.capacityFactory=factories[0]||allFactories[0];$('#capacityFactorySelect').innerHTML=factories.map(f=>`<option value="${f}">${f}｜${factoryName(f)}</option>`).join('');$('#capacityFactorySelect').value=state.capacityFactory;$('#capacityHorizonSelect').value=String(state.capacityHorizon);const resources=capacityResourcesForFactory(state.capacityFactory),days=Array.from({length:state.capacityHorizon},(_,i)=>shiftDate(TODAY,i));const entries=resources.flatMap(r=>days.map(d=>calendarEntry(state.capacityFactory,r.id,d)));const unavailable=entries.filter(x=>!x.available).length,reduced=entries.filter(x=>x.available&&x.hours<(capacityResourcesForFactory(state.capacityFactory).find(r=>r.id===x.resourceId)?.capacity||0)).length,totalHours=entries.reduce((s,x)=>s+x.hours,0);$('#capacityKpis').innerHTML=[['產能資源',resources.length,`${state.capacityFactory}｜${factoryName(state.capacityFactory)}`,'R','tone-blue'],['可用工時',`${fmt(totalHours)}h`,`${state.capacityHorizon}天行事曆`,'H','tone-green'],['不可用資源日',unavailable,'停機、假日或維修','×','tone-red'],['減班資源日',reduced,'可用工時低於標準','△','tone-yellow']].map(kpiCard).join('');$('#capacityCalendarTitle').textContent=`${state.capacityFactory}｜${factoryName(state.capacityFactory)} 每日可用行事曆`;$('#capacityCalendarHead').innerHTML=`<tr><th class="resource-sticky">產能資源</th>${days.map(d=>`<th><strong>${formatDate(d)}</strong><span>週${weekdayLabel(d)}</span></th>`).join('')}</tr>`;$('#capacityCalendarBody').innerHTML=resources.map(r=>`<tr><th class="resource-sticky"><strong>${r.name}</strong><span>${r.id}・標準${r.capacity}h／日</span><em>${r.type}</em></th>${days.map(d=>{const e=calendarEntry(state.capacityFactory,r.id,d),cls=!e.available?'unavailable':e.hours<r.capacity?'reduced':'available',sel=state.selectedCapacityCell?.resourceId===r.id&&state.selectedCapacityCell?.date===d?'selected':'';return`<td><button class="capacity-maintain-cell ${cls} ${sel}" data-resource-id="${r.id}" data-date="${d}"><strong>${e.available?`${e.hours}h`:'停用'}</strong><small>${e.reason||'正常'}</small></button></td>`;}).join('')}</tr>`).join('');$$('.capacity-maintain-cell').forEach(b=>b.addEventListener('click',()=>{state.selectedCapacityCell={factory:state.capacityFactory,resourceId:b.dataset.resourceId,date:b.dataset.date};renderCapacityManagement();}));renderCapacityEditor();}
function renderCapacityEditor(){const s=state.selectedCapacityCell,form=$('#capacityEditorForm'),empty=$('#capacityEditorEmpty');if(!s){form.hidden=true;empty.hidden=false;return;}const r=capacityResourcesForFactory(s.factory).find(x=>x.id===s.resourceId),e=calendarEntry(s.factory,s.resourceId,s.date);empty.hidden=true;form.hidden=false;$('#capacityEditorResource').value=`${s.factory}｜${r.name}（${r.id}）`;$('#capacityEditorDate').value=formatDateFull(s.date);$('#capacityEditorAvailable').checked=e.available;$('#capacityEditorHours').value=e.hours;$('#capacityEditorHours').disabled=!e.available;$('#capacityEditorReason').value=e.reason||'';$('#capacityEditorAvailable').onchange=ev=>{$('#capacityEditorHours').disabled=!ev.target.checked;if(ev.target.checked&&Number($('#capacityEditorHours').value)===0)$('#capacityEditorHours').value=r.capacity;};}

function activeImportedWorkOrdersForEvent(event){return(state.workOrders||[]).filter(w=>w.demandEventId===event.id&&!['已完成','取消'].includes(w.status));}
function demandSupplyAllocation(event){const total=Number(event.qty||0),orders=activeImportedWorkOrdersForEvent(event).filter(w=>w.progress>0&&w.progress<100);const wipQty=Math.min(total,orders.reduce((s,w)=>s+Math.max(0,Math.round(w.qty)),0));const unitTotal=productionRouteMaster.reduce((s,r)=>s+getUnitHours(event.sku,r.key),0),requiredHours=total*unitTotal,capacityPerDay=capacityResourcesForFactory(event.factory).reduce((s,r)=>s+r.capacity,0),capacityDays=Math.max(1,Math.ceil(requiredHours/Math.max(1,capacityPerDay))),standardLT=getOrderLeadTime(event.sku),estimateDays=Math.max(standardLT,capacityDays);return{total,stockQty:0,wipQty,gapQty:Math.max(0,total-wipQty),warehouse:'無既有庫存',lotNo:'—',wipOrders:orders.map(w=>({id:w.id,item:routeMaster(w.routeKey).name,qty:w.qty,progress:w.progress})),requiredHours,capacityDays,standardLT,estimatedCompletion:shiftDate(TODAY,estimateDays),estimateDays};}
function demandSupplySummaryHtml(d){const a=demandSupplyAllocation(d);return`<div class="demand-supply-summary"><span class="supply-chip stock">庫存 0</span><span class="supply-chip wip">在製 ${fmt(a.wipQty)}</span><span class="supply-chip gap">待規劃 ${fmt(a.gapQty)}</span><small>預估最早完工 ${formatDateFull(a.estimatedCompletion)}（標準LT ${a.standardLT}天）</small></div>`;}
function demandSupplyAllocationPanel(event){const a=demandSupplyAllocation(event),wips=a.wipOrders.map(w=>`<div class="allocation-link"><strong>${w.id}</strong><span>${w.item}・${fmt(w.qty)}件・進度${Math.round(w.progress)}%</span></div>`).join('');return`<section class="demand-allocation-panel"><div class="panel-subheader"><div><p class="eyebrow">ZERO-START SUPPLY ESTIMATE</p><h4>本筆需求供給與前置時間估算</h4><p>新增需求不會自動耗用不存在的庫存或在製工單。只有「工單匯入」中明確關聯本需求的執行中工單才可列為在製供給；其餘數量依產品接單LT、單件工時與產能行事曆估算。</p></div><span class="tag warning">需建立供給</span></div><div class="allocation-tile-grid"><article class="allocation-tile stock"><span>既有成品庫存</span><strong>0 件</strong><small>零起點，不預設庫存</small></article><article class="allocation-tile wip"><span>已匯入且關聯的在製</span><strong>${fmt(a.wipQty)} 件</strong><small>${a.wipOrders.length}張工單</small>${wips}</article><article class="allocation-tile gap"><span>待建立生產供給</span><strong>${fmt(a.gapQty)} 件</strong><small>總需求工時 ${fmt(a.requiredHours)}h</small></article><article class="allocation-tile coverage"><span>前置時間估算</span><strong>${a.estimateDays} 天</strong><small>預估最早完工 ${formatDateFull(a.estimatedCompletion)}</small></article></div></section>`;}

function buildFulfillment(event){const orders=(state.workOrders||[]).filter(w=>w.demandEventId===event.id).map((w,i)=>({id:w.id,eventId:event.id,bomId:`${event.sku}-${w.routeKey}`,parentBomId:i?`${event.sku}-${productionRouteMaster[Math.max(0,productionRouteMaster.findIndex(r=>r.key===w.routeKey)-1)].key}`:'',level:productionRouteMaster.findIndex(r=>r.key===w.routeKey),item:routeMaster(w.routeKey).name,kind:w.kind,source:w.kind==='委外工單'?'友廠／協力廠':'自製',nodeType:'route',plant:w.factory,qty:w.qty,start:w.startDate,due:w.dueDate,progress:w.progress,risk:w.status==='暫停'||dateDiff(w.dueDate,TODAY)<0&&w.progress<100,status:w.status,relationType:w.kind==='委外工單'?'module':'internal',relationLabel:w.kind==='委外工單'?'委外生產':'廠內生產',materialStockQty:0,materialPoQty:0,materialItems:0,stockItems:0,poItems:0,resourceId:w.resourceId,routeKey:w.routeKey}));return{event,workOrders:orders,purchaseOrders:[],nodes:[],item:skuLookup[event.sku]||null};}

function workOrderAvailableDates(w){const dates=[];const first=dateDiff(w.startDate,TODAY)>0?w.startDate:TODAY;for(let d=first;dateDiff(w.dueDate,d)>=0;d=shiftDate(d,1)){const e=calendarEntry(w.factory,w.resourceId,d);if(e.available&&e.hours>0)dates.push(d);}return dates;}
function productionPlanFor(factory,horizon=14){const resources=capacityResourcesForFactory(factory),days=Array.from({length:horizon},(_,i)=>shiftDate(TODAY,i)),orders=(state.workOrders||[]).filter(w=>w.factory===factory&&!['已完成','取消'].includes(w.status));const rows=resources.map(resource=>{const cells=days.map(date=>{const cal=calendarEntry(factory,resource.id,date);if(!cal.available||cal.hours<=0)return{date,kind:'maintenance',load:0,hours:0,title:cal.reason||'不可用',sku:'—',product:'資源不可用',qty:0,demandId:'—',source:'產能行事曆'};const tasks=orders.filter(w=>w.resourceId===resource.id&&dateDiff(date,w.startDate)>=0&&dateDiff(w.dueDate,date)>=0);if(!tasks.length)return{date,kind:'idle',load:0,hours:0,title:'尚無排程',sku:'—',product:'未排產',qty:0,demandId:'—',source:'工單匯入'};const allocations=tasks.map(w=>{const dates=workOrderAvailableDates(w),remaining=workOrderRequiredHours(w)*Math.max(0,1-(Number(w.progress)||0)/100),hours=remaining/Math.max(1,dates.length);return{w,hours};});const hours=allocations.reduce((s,x)=>s+x.hours,0),load=cal.hours?hours/cal.hours*100:0,primary=allocations.sort((a,b)=>b.hours-a.hours)[0],unit=getUnitHours(primary.w.sku,primary.w.routeKey),qty=unit?Math.round(primary.hours/unit):0;return{date,kind:load>100?'over':load>=85?'tight':'normal',load:Number(load.toFixed(1)),hours:Number(hours.toFixed(1)),title:tasks.length>1?`${primary.w.product}＋${tasks.length-1}項`:`${primary.w.product}`,sku:primary.w.sku,product:routeMaster(primary.w.routeKey).name,qty,demandId:primary.w.demandEventId||'未指定需求',source:`${primary.w.kind} ${primary.w.id}`,availableHours:cal.hours};});return{resource,cells};});const cells=rows.flatMap(r=>r.cells),working=cells.filter(c=>!['idle','maintenance'].includes(c.kind)),avg=working.length?working.reduce((s,c)=>s+c.load,0)/working.length:0;return{factory,days,rows,avg,over:cells.filter(c=>c.load>100).length,tight:cells.filter(c=>c.load>=85&&c.load<=100).length,maintenance:cells.filter(c=>c.kind==='maintenance').length,plannedHours:cells.reduce((s,c)=>s+c.hours,0),capacityHours:rows.reduce((s,r)=>s+r.cells.reduce((a,c)=>a+(c.availableHours||0),0),0)};}

function availableRouteHours(factory,routeKey,endDate){const type=routeMaster(routeKey).resourceType,resources=capacityResourcesForFactory(factory).filter(r=>r.type===type);if(!resources.length)return 0;let total=0;for(let d=TODAY;dateDiff(endDate,d)>=0;d=shiftDate(d,1))resources.forEach(r=>{const e=calendarEntry(factory,r.id,d);if(e.available)total+=e.hours;});const reserved=(state.workOrders||[]).filter(w=>w.factory===factory&&routeMaster(w.routeKey).resourceType===type&&!['已完成','取消'].includes(w.status)&&dateDiff(w.startDate,endDate)<=0&&dateDiff(w.dueDate,TODAY)>=0).reduce((sum,w)=>sum+workOrderRequiredHours(w)*Math.max(0,1-(Number(w.progress)||0)/100),0);return Math.max(0,total-reserved);}
function finiteCapacityUnits(sku,factory,endDate){const item=skuLookup[sku];if(!item||dateDiff(endDate,TODAY)<0)return{units:0,bottleneck:'需求日期已過',requiredUnitHours:0,routeCaps:[]};const routeCaps=productionRouteMaster.map(r=>{const unit=getUnitHours(sku,r.key),hours=availableRouteHours(factory,r.key,endDate),units=unit>0?Math.floor(hours/unit):Number.MAX_SAFE_INTEGER;return{route:r,unit,hours,units};});const min=routeCaps.sort((a,b)=>a.units-b.units)[0];return{units:Math.max(0,min?.units||0),bottleneck:min?.route?.name||'產能行事曆',requiredUnitHours:productionRouteMaster.reduce((s,r)=>s+getUnitHours(sku,r.key),0),routeCaps};}
function runSimulation(showToast=false){const e=selectedEvent();if(!e)return;const extra=Number($('#quantitySlider').value),earlier=Number($('#dateSlider').value),priority=Number($('#prioritySelect').value),demand=Math.max(1,e.oldQty+extra),targetDate=shiftDate(e.oldDate,-earlier),cap=finiteCapacityUnits(e.model||e.sku,e.factory,targetDate),finite=Math.min(demand,cap.units),gap=Math.max(0,demand-finite),completionDelay=gap?Math.max(1,Math.ceil(gap/Math.max(1,finite||Math.round(demand*.1)))):0,totalHours=demand*cap.requiredUnitHours,finiteHours=finite*cap.requiredUnitHours;state.simulated={eventId:e.id,extra,earlier,priority,demand,finite,gap,completionDelay,capHours:totalHours,mat:demand,test:demand*getUnitHours(e.model||e.sku,'test'),bottleneck:cap.bottleneck};$('#unlimitedMetrics').innerHTML=metricRows([['需求完成數量',`${fmt(demand)} 件`,100],['目標完成日期',formatDate(targetDate),100],['總需求工時',`${fmt(totalHours)} 小時`,100],['單件總工時',`${cap.requiredUnitHours.toFixed(4)} 小時`,80],['關鍵途程',cap.bottleneck,75]]);$('#finiteMetrics').innerHTML=metricRows([['有限可達數量',`${fmt(finite)} 件`,demand?finite/demand*100:0],['估算完成日期',formatDate(shiftDate(targetDate,completionDelay)),Math.max(25,100-completionDelay*8)],['可承接工時',`${fmt(finiteHours)} 小時`,demand?finite/demand*100:0],['產能計算來源','工時主檔＋可用行事曆',100],['已匯入工單扣抵','已扣除未完工需求工時',85]]);$('#gapTag').textContent=`缺口 ${fmt(gap)} 件`;const b=scenarioBottlenecks();$('#gapAnalysis').innerHTML=`<div class="gap-summary"><div class="gap-card"><span>需求量</span><strong>${fmt(demand)}</strong></div><div class="gap-card"><span>有限可達</span><strong>${fmt(finite)}</strong></div><div class="gap-card"><span>未滿足缺口</span><strong>${fmt(gap)}</strong></div><div class="gap-card"><span>滿足率</span><strong>${demand?(finite/demand*100).toFixed(1):'0.0'}%</strong></div></div><div class="reason-box"><strong>產能估算：</strong>依 ${e.factory} 每日資源可用行事曆，扣除已匯入未完工工單，再以 ${e.model||e.sku} 各途程單件工時換算。主要限制為「${cap.bottleneck}」。</div><div class="impact-list">${b.map(x=>`<div class="impact-row"><div><h3>${x.name}</h3><p>${x.dept}・${x.owner}</p></div><div class="bar-track"><i style="width:${x.impact}%"></i></div>${sevTag(x.severity)}</div>`).join('')}</div>`;renderSimulationBreakdown();renderBottlenecks();renderCommit();renderDecision();if(showToast)toast('已依工時主檔與產能行事曆完成有限／無限模擬');}
function renderSimulationBreakdown(){$$('#simulationDimension .segment').forEach(b=>b.classList.toggle('active',b.dataset.dimension===state.simDimension));const activeRows=state.demandEvents.filter(d=>inScope(d.factory)&&!['已取消','已轉換','已被PO消耗'].includes(d.status)).map(d=>({...d,analysisQty:d.source==='計畫庫存'?(d.remainingQty??d.qty):d.qty})).filter(d=>d.analysisQty>0);const rows=state.simDimension==='customer'?activeRows.filter(d=>d.source==='客戶PO'&&d.customer):activeRows,key=state.simDimension==='product'?'product':'customer',groups=rows.reduce((a,d)=>{const k=d[key]||'未指定';(a[k]??=[]).push(d);return a;},{});const data=Object.entries(groups).map(([name,items])=>{let demand=0,finite=0,constraints=[];items.forEach(x=>{demand+=x.analysisQty;const c=finiteCapacityUnits(x.sku,x.factory,x.demandDate);finite+=Math.min(x.analysisQty,c.units);constraints.push(c.bottleneck);});finite=Math.min(demand,finite);const gap=demand-finite,rate=demand?finite/demand*100:0;return{name,demand,finite,gap,rate,secondary:state.simDimension==='product'?[...new Set(items.map(x=>x.factory))].join('、'):[...new Set(items.map(x=>x.product))].slice(0,3).join('、'),constraint:[...new Set(constraints)].slice(0,2).join('／')||'可用產能'};}).sort((a,b)=>b.gap-a.gap).slice(0,18);$('#simulationBreakdownHead').innerHTML=`<tr><th>${state.simDimension==='product'?'產品':'客戶'}</th><th>${state.simDimension==='product'?'生產工廠':'產品組合'}</th><th>無限需求</th><th>有限可達</th><th>缺口</th><th>滿足率</th><th>主要限制</th></tr>`;$('#simulationBreakdownBody').innerHTML=data.map(x=>`<tr><td><strong>${x.name}</strong></td><td class="reason-text">${x.secondary}</td><td>${fmt(x.demand)}</td><td>${fmt(x.finite)}</td><td class="${x.gap?'delta-up':'delta-down'}">${fmt(x.gap)}</td><td><div class="coverage-cell"><strong>${x.rate.toFixed(1)}%</strong><div class="mini-progress"><i style="width:${x.rate}%"></i></div></div></td><td>${x.constraint}</td></tr>`).join('')||'<tr><td colspan="7">此範圍沒有需求資料</td></tr>';}



/* DEMAND13: demand master entry, destination master and backend transformation rules */
function renderManualSourceOptions(reset=false){
  const type=$('#manualDemandType')?.value||'客戶預測';
  const isCustomer=type!=='內部預測',isPo=type==='客戶PO';
  const poField=$('#manualPoCategoryField');if(poField)poField.hidden=!isPo;
  $('#manualDemandProposerLabel').textContent=isCustomer?'業務':'提出者';
  $('#manualDemandAudienceLabel').textContent=isCustomer?'客戶':'內部用途';
  const people=demandProposers[type]||[];const proposer=$('#manualDemandProposer');
  const keepProposer=reset?'':proposer?.value;
  if(proposer){proposer.innerHTML=people.map(x=>`<option value="${x[0]}">${x[0]}</option>`).join('');if(people.some(x=>x[0]===keepProposer))proposer.value=keepProposer;}
  syncManualDepartmentFromProposer();
  const audience=$('#manualDemandAudience'),destination=$('#manualDemandDestination');
  if(isCustomer){
    const keepCustomer=reset?'':audience?.value,keepDestination=reset?'':destination?.value;
    audience.innerHTML=customers.map(x=>`<option value="${x.name}">${x.name}</option>`).join('');
    if(customers.some(x=>x.name===keepCustomer))audience.value=keepCustomer;
    populateManualDestinations(audience.value,keepDestination);
    destination.disabled=false;
  }else{
    audience.innerHTML=internalDemandPurposes.map(x=>`<option value="${x}">${x}</option>`).join('');
    destination.innerHTML='<option value="不適用">不適用</option>';destination.disabled=true;
  }
  renderManualDemandSummary();
}
function renderManualDemandSummary(){
  const sku=$('#manualDemandSku')?.value,type=$('#manualDemandType')?.value||'客戶預測',date=$('#manualDemandDate')?.value||TODAY,qty=Number($('#manualDemandQty')?.value||0);if(!sku||!$('#manualDemandSummary'))return;
  const a=leadTimeAssessment(sku,date),isPo=type==='客戶PO';let rule=type==='客戶預測'?'先等待客戶PO沖銷；進入凍結期仍未沖銷的數量，後台轉為計畫庫存。':type==='內部預測'?'進入凍結期後台轉為計畫庫存；臨時客戶PO可沖銷並將計畫行動轉為支援該PO。':'匯入後先沖銷同客戶預測；剩餘量再沖銷同料號內部預測的計畫行動。';
  const customerText=type==='內部預測'?($('#manualDemandAudience')?.value||'—'):`${$('#manualDemandAudience')?.value||'—'}・${$('#manualDemandDestination')?.value||'—'}`;
  $('#manualDemandSummary').innerHTML=`<div><span>需求類型</span><strong>${type}${isPo?`・${$('#manualPoCategory')?.value||'外部客戶'}`:''}</strong></div><div><span>客戶／用途</span><strong>${customerText}</strong></div><div><span>標準接單 LT</span><strong>${a.orderLeadTime} 天</strong></div><div><span>距需求日</span><strong>${a.daysToDemand} 天</strong></div><div><span>建立狀態</span><strong>${statusForDemand(type,sku,date).status}</strong></div><p>${fmt(qty)} 件｜${rule}</p>`;
}


document.addEventListener('DOMContentLoaded',init);


/* ==========================================================
   MRP15 — Multi-level MRP, planned orders and async recalculation
   ========================================================== */
state.plannedOrders=loadStored('ct-planned-orders-v1-mrp15',[]);
state.purchaseOrders=loadStored('ct-purchase-orders-v1-mrp15',[]);
state.mrpRuns=loadStored('ct-mrp-runs-v1-mrp15',[]);
state.mrpBusy=false;
state.mrpProgress={done:0,total:0,label:'等待需求'};
let mrpRecalcToken=0;
let deferredMasterSaveHandle=null;
const idleTask=window.requestIdleCallback?cb=>requestIdleCallback(cb,{timeout:300}):cb=>setTimeout(()=>cb({timeRemaining:()=>8,didTimeout:true}),0);

function mrpSaveSmall(){
  saveStored('ct-events-v8-resource',state.events);
  saveStored('ct-demand-events-v8-resource',state.demandEvents);
  saveStored('ct-tracking-v5-resource',state.tracking);
  saveStored('ct-commits-v5-resource',state.commits);
  saveStored('ct-decisions-v5-resource',state.decisions);
  saveStored('ct-work-orders-v1-resource',state.workOrders||[]);
  saveStored('ct-planned-orders-v1-mrp15',state.plannedOrders||[]);
  saveStored('ct-purchase-orders-v1-mrp15',state.purchaseOrders||[]);
  saveStored('ct-mrp-runs-v1-mrp15',(state.mrpRuns||[]).slice(0,30));
}
function scheduleMasterSave(){
  if(deferredMasterSaveHandle)return;
  deferredMasterSaveHandle=idleTask(()=>{
    deferredMasterSaveHandle=null;
    saveStored('ct-labor-standards-v1-resource',state.laborStandards||{});
    saveStored('ct-capacity-calendar-v1-resource',state.capacityCalendar||{});
  });
}
function persist(){mrpSaveSmall();scheduleMasterSave();}
function persistDemandOnly(){mrpSaveSmall();}

function sourceFactoryFromNode(node,defaultFactory){
  const src=String(node.source||'');
  const match=src.match(/(?:友廠模組|友廠SMT)｜([A-Z]{2}\d{2})/);
  return match?.[1]||defaultFactory;
}
function routeForBomNode(node,isRoot=false){
  if(isRoot)return 'assembly';
  if(node.type==='smt')return 'smt';
  if(node.type==='module'||node.type==='internal')return 'module';
  return 'material';
}
function supplyModeForNode(node,isRoot=false){
  if(isRoot||node.source==='自製'||node.type==='internal')return 'internal';
  if(String(node.source||'').startsWith('友廠'))return 'outsource';
  return 'purchase';
}
function bomQuantityFactor(node,level,index){
  if(node.type==='fg')return 1;
  if(node.type==='external')return 1+(index%3);
  return 1;
}
function mrpLeadDays(node,mode,level,sku){
  if(mode==='purchase'){
    const rel=supplyRelations.find(r=>r.sku===sku&&r.type==='external');
    return Math.max(7,Number(rel?.lead||14)+level*2);
  }
  if(mode==='outsource')return Math.max(4,6+level*2);
  return Math.max(2,3+level*2);
}
function calendarCapacityMemo(){const memo=new Map();return function(factory,routeKey,endDate){const key=`${factory}|${routeKey}|${endDate}`;if(memo.has(key))return memo.get(key);const value=availableRouteHours(factory,routeKey,endDate);memo.set(key,value);return value;};}
function mrpEffectivePlanBuckets(){
  const buckets=[];
  const active=state.demandEvents.filter(d=>!['已取消'].includes(d.status));
  active.forEach(d=>{
    const qty=Number(d.qty||0),offset=Number(d.offsetQty||0),remaining=Math.max(0,qty-offset);
    if(d.source==='客戶PO'){
      const uncovered=Math.max(0,Number(d.uncoveredQty??qty));
      if(uncovered>0)buckets.push({event:d,qty:uncovered,purpose:'正式PO增量供給',stock:false,supportDemandIds:[d.id]});
      return;
    }
    if(!['客戶預測','內部預測'].includes(d.source))return;
    const frozen=dateDiff(d.demandDate,TODAY)<=getOrderLeadTime(d.sku);
    if(offset>0)buckets.push({event:d,qty:offset,purpose:'已由客戶PO沖銷／沿用預測供給',stock:false,supportDemandIds:state.demandEvents.filter(po=>po.source==='客戶PO'&&(po.offsets||[]).some(x=>x.eventId===d.id)).map(po=>po.id)});
    if(remaining>0)buckets.push({event:d,qty:remaining,purpose:frozen?'計畫庫存':'預測供給準備',stock:frozen,supportDemandIds:[d.id]});
  });
  return buckets;
}
function explodeBucket(bucket,capFn,runId){
  const event=bucket.event,item=skuLookup[event.sku],planned=[],purchases=[],nodes=[];
  if(!item||bucket.qty<=0)return{planned,purchases,nodes};
  const due=event.demandDate;
  const addPlanned=(node,level,parentId,isRoot=false)=>{
    const mode=supplyModeForNode(node,isRoot),routeKey=routeForBomNode(node,isRoot),factory=sourceFactoryFromNode(node,event.factory);
    const qty=Math.max(1,Math.round(bucket.qty*bomQuantityFactor(node,level,level)));
    const lead=mrpLeadDays(node,mode,level,event.sku),nodeDue=shiftDate(due,-Math.max(0,level*2)),start=shiftDate(nodeDue,-lead);
    if(mode==='purchase'){
      const requiredQty=qty,stockAllocated=0,poQty=requiredQty;
      purchases.push({id:`PPO-${runId}-${event.id}-${node.id}`,eventId:event.id,demandEventId:event.id,runId,bomId:node.id,parentBomId:parentId||item.bom.id,level,item:node.name,vendor:node.source||'外部供應商',qty:poQty,requiredQty,stockAllocated,received:0,due:nodeDue,releaseDate:start,progress:0,status:'計畫採購',risk:dateDiff(nodeDue,TODAY)<lead,relationType:'purchase',relationLabel:'MRP 外購需求',purpose:bucket.purpose,supportDemandIds:bucket.supportDemandIds});
    }else{
      const resourceType=routeMaster(routeKey).resourceType,resource=capacityResourcesForFactory(factory).find(r=>r.type===resourceType)||capacityResourcesForFactory(factory)[0];
      const unitHours=getUnitHours(event.sku,routeKey),requiredHours=qty*unitHours,availableHours=capFn(factory,routeKey,nodeDue),capacityShortfall=Math.max(0,requiredHours-availableHours);
      planned.push({id:`PWO-${runId}-${event.id}-${node.id}`,eventId:event.id,demandEventId:event.id,runId,bomId:node.id,parentBomId:parentId||'',level,item:node.name,kind:mode==='outsource'?'委外計畫工單':'內製計畫工單',source:mode==='outsource'?'友廠／協力廠':'自製',plant:factory,factory,routeKey,resourceId:resource?.id||'',qty,start,due:nodeDue,progress:0,status:bucket.stock?'計畫庫存工單':capacityShortfall>0?'能力不足待調整':'計畫工單',risk:capacityShortfall>0,requiredHours:Number(requiredHours.toFixed(2)),availableHours:Number(availableHours.toFixed(2)),capacityShortfall:Number(capacityShortfall.toFixed(2)),relationType:mode==='outsource'?'module':'internal',relationLabel:mode==='outsource'?'友廠／委外供給':'廠內自製',purpose:bucket.purpose,isPlannedStock:bucket.stock,supportDemandIds:bucket.supportDemandIds,materialSupply:{stockQty:0,poQty:0,stockItems:0,poItems:0,totalItems:0}});
    }
    nodes.push({id:node.id,bomId:node.id,parentBomId:parentId||'',level,name:node.name,type:node.type,source:node.source,mode,qty});
    (node.children||[]).forEach((child,i)=>addPlanned(child,level+1,node.id,false));
  };
  // Root production uses six standard routes so capacity and loading follow the resource master.
  productionRouteMaster.forEach((route,idx)=>{
    const factory=event.factory,resource=capacityResourcesForFactory(factory).find(r=>r.type===route.resourceType)||capacityResourcesForFactory(factory)[0];
    const routeDue=shiftDate(due,-Math.max(0,(productionRouteMaster.length-1-idx)*2));
    const start=shiftDate(routeDue,-Math.max(1,Math.ceil(bucket.qty*getUnitHours(event.sku,route.key)/Math.max(1,resource?.capacity||8))));
    const requiredHours=bucket.qty*getUnitHours(event.sku,route.key),availableHours=capFn(factory,route.key,routeDue),capacityShortfall=Math.max(0,requiredHours-availableHours);
    planned.push({id:`PWO-${runId}-${event.id}-ROUTE-${route.key}`,eventId:event.id,demandEventId:event.id,runId,bomId:`${item.bom.id}-${route.key}`,parentBomId:idx?`${item.bom.id}-${productionRouteMaster[idx-1].key}`:item.bom.id,level:idx,item:route.name,kind:'內製計畫工單',source:'自製',plant:factory,factory,routeKey:route.key,resourceId:resource?.id||'',qty:bucket.qty,start,due:routeDue,progress:0,status:bucket.stock?'計畫庫存工單':capacityShortfall>0?'能力不足待調整':'計畫工單',risk:capacityShortfall>0,requiredHours:Number(requiredHours.toFixed(2)),availableHours:Number(availableHours.toFixed(2)),capacityShortfall:Number(capacityShortfall.toFixed(2)),relationType:'internal',relationLabel:'標準生產途程',purpose:bucket.purpose,isPlannedStock:bucket.stock,supportDemandIds:bucket.supportDemandIds,materialSupply:{stockQty:0,poQty:0,stockItems:0,poItems:0,totalItems:0}});
  });
  (item.bom.children||[]).forEach(child=>addPlanned(child,1,item.bom.id,false));
  const poByParent=new Map();purchases.forEach(po=>{const a=poByParent.get(po.parentBomId)||[];a.push(po);poByParent.set(po.parentBomId,a);});
  planned.forEach(w=>{const direct=poByParent.get(w.bomId)||[];w.materialSupply={stockQty:0,poQty:direct.reduce((s,x)=>s+x.qty,0),stockItems:0,poItems:direct.length,totalItems:direct.length};});
  return{planned,purchases,nodes};
}
function updateDemandMrpSummaries(){
  const byEvent=new Map();
  const row=id=>{if(!byEvent.has(id))byEvent.set(id,{plannedOrderCount:0,purchaseOrderCount:0,requiredHours:0,capacityShortfall:0,purchaseQty:0,levels:0});return byEvent.get(id);};
  (state.plannedOrders||[]).forEach(x=>{const r=row(x.eventId);r.plannedOrderCount++;r.requiredHours+=Number(x.requiredHours||0);r.capacityShortfall+=Number(x.capacityShortfall||0);r.levels=Math.max(r.levels,Number(x.level||0));});
  (state.purchaseOrders||[]).forEach(x=>{const r=row(x.eventId);r.purchaseOrderCount++;r.purchaseQty+=Number(x.qty||0);r.levels=Math.max(r.levels,Number(x.level||0));});
  const stamp=new Date().toISOString();
  state.demandEvents.forEach(d=>{const r=byEvent.get(d.id)||{plannedOrderCount:0,purchaseOrderCount:0,requiredHours:0,capacityShortfall:0,purchaseQty:0,levels:0};d.mrpSummary={...r,requiredHours:Number(r.requiredHours.toFixed(2)),capacityShortfall:Number(r.capacityShortfall.toFixed(2)),lastRunAt:stamp};});
}
function renderMrpEngineStatus(){
  const status=$('#mrpEngineStatus'),root=$('#mrpEngineKpis');if(!status||!root)return;
  const planned=state.plannedOrders||[],pos=state.purchaseOrders||[],risks=planned.filter(x=>x.capacityShortfall>0).length;
  status.className=`tag ${state.mrpBusy?'warning':risks?'danger':planned.length?'success':'neutral'}`;
  status.textContent=state.mrpBusy?`計算中 ${state.mrpProgress.done}/${state.mrpProgress.total}`:planned.length?`MRP 已展開・${risks}項能力風險`:'等待需求';
  root.innerHTML=[['計畫工單',planned.length,'自製＋委外','WO',planned.length?'tone-blue':'tone-neutral'],['計畫採購單',pos.length,'多階外購需求','PO',pos.length?'tone-green':'tone-neutral'],['能力不足節點',risks,'依工時與可用行事曆','! ',risks?'tone-red':'tone-green'],['MRP 執行',state.mrpRuns?.length||0,'最近30次保留','R','tone-yellow']].map(kpiCard).join('');
}
async function recalculateMrpAsync(reason='需求更新'){
  const token=++mrpRecalcToken;state.mrpBusy=true;const buckets=mrpEffectivePlanBuckets();state.mrpProgress={done:0,total:buckets.length,label:reason};renderMrpEngineStatus();
  const planned=[],purchases=[],baseCapFn=calendarCapacityMemo(),reservedHours=new Map(),runId=`MRP-${Date.now().toString(36).toUpperCase()}`;
  const capFn=(factory,routeKey,endDate)=>{const key=`${factory}|${routeKey}|${endDate}`;return Math.max(0,baseCapFn(factory,routeKey,endDate)-(reservedHours.get(key)||0));};
  for(let i=0;i<buckets.length;i++){
    if(token!==mrpRecalcToken)return false;
    const result=explodeBucket(buckets[i],capFn,runId);planned.push(...result.planned);purchases.push(...result.purchases);
    result.planned.forEach(w=>{const key=`${w.factory}|${w.routeKey}|${w.due}`;reservedHours.set(key,(reservedHours.get(key)||0)+Number(w.requiredHours||0));});
    state.mrpProgress.done=i+1;
    if(i%2===1){renderMrpEngineStatus();await new Promise(resolve=>idleTask(()=>resolve()));}
  }
  if(token!==mrpRecalcToken)return false;
  state.plannedOrders=planned;state.purchaseOrders=purchases;updateDemandMrpSummaries();
  state.mrpRuns.unshift({id:runId,reason,createdAt:new Date().toISOString(),demandCount:buckets.length,plannedOrders:planned.length,purchaseOrders:purchases.length,capacityRisks:planned.filter(x=>x.capacityShortfall>0).length});state.mrpRuns=state.mrpRuns.slice(0,30);
  state.mrpBusy=false;state.mrpProgress={done:buckets.length,total:buckets.length,label:'完成'};scheduleMrpResultSave();renderMrpEngineStatus();return true;
}
function scheduleMrpRecalculation(reason='需求更新',after){
  const button=$('#manualDemandForm button[type="submit"]');if(button)button.disabled=true;
  const start=()=>setTimeout(async()=>{
    try{
      await recalculateMrpAsync(reason);
      renderMrpEngineStatus();
      const active=activeViewName();
      if(active==='import')renderDemandImport();
      else if(active==='events')renderEvents();
      else if(active==='demand')renderDemand();
      else if(active==='workorders')renderWorkOrderImport();
      after?.();
    }catch(err){console.error(err);toast('MRP 計算失敗：'+err.message);}
    finally{if(button)button.disabled=false;}
  },0);
  requestAnimationFrame(()=>requestAnimationFrame(start));
}

// Demand append now triggers netting first. MRP is scheduled by save/import actions to avoid blocking the UI.
function appendDemandEvent(event,front=true){
  if(event.source==='客戶PO')applyDemandNetting(event);
  if(front)state.demandEvents.unshift(event);else state.demandEvents.push(event);
  const approval=buildLeadTimeApprovalEvent(event,state.events.length);if(approval){state.events.unshift(approval);state.selectedEventId=approval.id;}
  return event;
}
function saveManualDemand(){
  const factory=$('#manualDemandFactory')?.value;if(!factory){toast('請選擇可生產工廠');return;}if($('#manualDemandForm')?.getAttribute('aria-busy')==='true')return;
  setManualDemandBusy(true);
  requestAnimationFrame(()=>setTimeout(()=>{
    try{
      const type=$('#manualDemandType').value,category=sourceCategoryFor(type);
      const event=createImportedDemandEvent({demandType:type,poCategory:$('#manualPoCategory')?.value||'',sku:$('#manualDemandSku').value,factory,qty:$('#manualDemandQty').value,demandDate:$('#manualDemandDate').value,proposer:$('#manualDemandProposer').value,proposerDept:$('#manualDemandDept').value,audience:$('#manualDemandAudience').value,customer:category==='客戶'?$('#manualDemandAudience').value:'',destination:$('#manualDemandDestination').value});
      appendDemandEvent(event,true);state.expandedDemandId='';state.expandedShipmentId='';state.selectedFulfillmentByEvent={};state.selectedWorkOrderByEvent={};state.recentImportIds=[event.id,...state.recentImportIds].slice(0,12);
      saveDemandWorkflowOnly();renderDemandImport();renderMrpEngineStatus();
      toast(`已建立 ${event.id}，MRP 將在畫面更新後開始`);
      scheduleMrpRecalculation(`新增需求 ${event.id}`,()=>{setManualDemandBusy(false);switchView(event.requiresApproval?'events':'demand');toast('MRP 完成：計畫工單與採購單已建立');});
    }catch(err){console.error(err);toast(err.message||'需求資料檢核失敗');setManualDemandBusy(false);}
  },0));
}
function commitDemandFileImport(){
  const valid=(state.importPreviewRows||[]).filter(r=>r.valid);if(!valid.length)return;const button=$('#confirmDemandFileImport');if(button){button.disabled=true;button.textContent='建立需求與MRP…';}
  requestAnimationFrame(()=>setTimeout(()=>{
    try{
      const added=[];valid.forEach(r=>{const event=createImportedDemandEvent(r);appendDemandEvent(event,false);added.push(event.id);});
      state.recentImportIds=[...added.reverse(),...state.recentImportIds].slice(0,12);state.importPreviewRows=[];if($('#demandFileInput'))$('#demandFileInput').value='';
      saveDemandWorkflowOnly();renderDemandImport();renderMrpEngineStatus();
      scheduleMrpRecalculation(`批次匯入 ${added.length} 筆需求`,()=>{if(button){button.disabled=false;button.textContent='匯入通過資料';}renderDemandImportPreview();switchView('demand');toast(`已匯入 ${added.length} 筆並完成多階 MRP`);});
    }catch(err){console.error(err);toast(err.message||'需求匯入失敗');if(button){button.disabled=false;button.textContent='匯入通過資料';}}
  },0));
}

function plannedToFulfillmentWork(w){return{id:w.id,eventId:w.eventId,bomId:w.bomId,parentBomId:w.parentBomId,level:w.level,item:w.item,kind:w.kind.includes('委外')?'委外工單':'內製工單',source:w.source,nodeType:'route',plant:w.plant,qty:w.qty,start:w.start,due:w.due,progress:w.progress,risk:w.risk,status:w.status,relationType:w.relationType,relationLabel:w.relationLabel,materialSupply:w.materialSupply,resourceId:w.resourceId,routeKey:w.routeKey,requiredHours:w.requiredHours,capacityShortfall:w.capacityShortfall,purpose:w.purpose};}
function plannedToFulfillmentPo(po){return{id:po.id,eventId:po.eventId,bomId:po.bomId,parentBomId:po.parentBomId,level:po.level,item:po.item,vendor:po.vendor,qty:po.qty,requiredQty:po.requiredQty,stockAllocated:po.stockAllocated,received:po.received,due:po.due,progress:po.progress,risk:po.risk,status:po.status,relationType:'purchase',relationLabel:po.relationLabel,purpose:po.purpose};}
function buildFulfillment(event){
  const imported=(state.workOrders||[]).filter(w=>w.demandEventId===event.id).map((w,i)=>({id:w.id,eventId:event.id,bomId:`${event.sku}-${w.routeKey}`,parentBomId:i?`${event.sku}-${productionRouteMaster[Math.max(0,productionRouteMaster.findIndex(r=>r.key===w.routeKey)-1)].key}`:'',level:productionRouteMaster.findIndex(r=>r.key===w.routeKey),item:routeMaster(w.routeKey).name,kind:w.kind,source:w.kind==='委外工單'?'友廠／協力廠':'自製',nodeType:'route',plant:w.factory,qty:w.qty,start:w.startDate,due:w.dueDate,progress:w.progress,risk:w.status==='暫停'||dateDiff(w.dueDate,TODAY)<0&&w.progress<100,status:w.status,relationType:w.kind==='委外工單'?'module':'internal',relationLabel:w.kind==='委外工單'?'委外生產':'廠內生產',materialSupply:{stockQty:0,poQty:0,materialItems:0,stockItems:0,poItems:0},resourceId:w.resourceId,routeKey:w.routeKey}));
  const planned=(state.plannedOrders||[]).filter(w=>w.eventId===event.id).map(plannedToFulfillmentWork),purchase=(state.purchaseOrders||[]).filter(po=>po.eventId===event.id).map(plannedToFulfillmentPo);
  const nodes=[...(skuLookup[event.sku]?.bom?[skuLookup[event.sku].bom]:[])];return{event,workOrders:[...imported,...planned],purchaseOrders:purchase,nodes,item:skuLookup[event.sku]||null};
}
function demandSupplyAllocation(event){
  const total=Number(event.qty||0),orders=activeImportedWorkOrdersForEvent(event).filter(w=>w.progress>0&&w.progress<100),wipQty=Math.min(total,orders.reduce((s,w)=>s+Math.max(0,Math.round(w.qty)),0));
  const planned=(state.plannedOrders||[]).filter(w=>w.eventId===event.id),po=(state.purchaseOrders||[]).filter(x=>x.eventId===event.id),requiredHours=planned.reduce((s,w)=>s+Number(w.requiredHours||0),0),capacityShortfall=planned.reduce((s,w)=>s+Number(w.capacityShortfall||0),0);
  return{total,stockQty:0,wipQty,gapQty:Math.max(0,total-wipQty),warehouse:'無既有庫存',lotNo:'—',wipOrders:orders.map(w=>({id:w.id,item:routeMaster(w.routeKey).name,qty:w.qty,progress:w.progress})),requiredHours,capacityShortfall,plannedOrderCount:planned.length,purchaseOrderCount:po.length,estimatedCompletion:planned.length?planned.map(x=>x.due).sort().at(-1):shiftDate(TODAY,getOrderLeadTime(event.sku)),estimateDays:getOrderLeadTime(event.sku)};
}
function mrpLevelSummaryHtml(event){
  const rows=[...(state.plannedOrders||[]).filter(x=>x.eventId===event.id).map(x=>({level:x.level,type:x.kind,item:x.item,qty:x.qty,due:x.due,risk:x.risk})),...(state.purchaseOrders||[]).filter(x=>x.eventId===event.id).map(x=>({level:x.level,type:'計畫採購單',item:x.item,qty:x.qty,due:x.due,risk:x.risk}))].sort((a,b)=>a.level-b.level||a.due.localeCompare(b.due));
  if(!rows.length)return '<div class="empty-state">MRP 尚未執行或本筆需求已完全被其他供給沖銷。</div>';
  const groups=rows.reduce((m,x)=>{(m[x.level]??=[]).push(x);return m;},{});
  return `<section class="mrp-level-panel"><div class="panel-subheader"><div><p class="eyebrow">MULTI-LEVEL SUPPLY PLAN</p><h4>BOM 各階供需與供給文件</h4><p>依需求時間由上往下排列；自製與委外轉計畫工單，外購項目轉計畫採購單。</p></div></div><div class="mrp-level-grid">${Object.entries(groups).map(([level,items])=>`<article class="mrp-level-card"><header><span>BOM L${level}</span><strong>${items.length}項</strong></header>${items.map(x=>`<div class="mrp-level-row ${x.risk?'risk':''}"><div><strong>${x.item}</strong><small>${x.type}</small></div><div><b>${fmt(x.qty)}件</b><small>${formatDate(x.due)}</small></div></div>`).join('')}</article>`).join('')}</div></section>`;
}
function demandSupplyAllocationPanel(event,f){
  const a=demandSupplyAllocation(event,f),wips=(a.wipOrders||[]).map(w=>`<div class="allocation-link"><strong>${w.id}</strong><span>${w.item||'生產中工單'}・${fmt(w.qty)} 件・進度 ${Math.round(w.progress||0)}%</span></div>`).join('');
  return `<section class="demand-allocation-panel"><div class="panel-subheader"><div><p class="eyebrow">DEMAND SUPPLY ALLOCATION</p><h4>本筆需求供給與前置時間估算</h4><p>零起點不預設庫存或在製；系統依多階 BOM、工時與每日可用產能建立計畫供給。</p></div><span class="tag ${a.capacityShortfall?'danger':'info'}">${a.capacityShortfall?`能力短缺 ${fmt(a.capacityShortfall)}h`:'已建立供給計畫'}</span></div><div class="allocation-tile-grid"><article class="allocation-tile stock"><span>既有成品庫存</span><strong>0 件</strong><small>零起點</small></article><article class="allocation-tile wip"><span>已匯入在製工單</span><strong>${fmt(a.wipQty)} 件</strong><small>${(a.wipOrders||[]).length}張人工匯入工單</small>${wips}</article><article class="allocation-tile gap"><span>MRP 計畫工單</span><strong>${fmt(a.plannedOrderCount)} 張</strong><small>需求工時 ${fmt(a.requiredHours)}h</small></article><article class="allocation-tile coverage"><span>MRP 計畫採購單</span><strong>${fmt(a.purchaseOrderCount)} 張</strong><small>依BOM外購節點展開</small></article></div></section>${mrpLevelSummaryHtml(event)}`;
}
function demandSupplySummaryHtml(d){const m=d.mrpSummary||{},a=demandSupplyAllocation(d);return `<div class="demand-supply-summary"><span class="supply-chip stock">庫存 0</span><span class="supply-chip wip">在製 ${fmt(a.wipQty)}</span><span class="supply-chip gap">計畫工單 ${fmt(m.plannedOrderCount||0)}</span><span class="supply-chip po">採購單 ${fmt(m.purchaseOrderCount||0)}</span><small>${m.capacityShortfall?`能力短缺 ${fmt(m.capacityShortfall)}h`:'依主檔完成前置時間估算'}</small></div>`;}

// Recompute supply plans after PO netting or demand workflow actions.
function handleDemandAction(id,action){
  handleDemandActionLegacyMRP15(id,action);
  if(['confirm','confirmQueue','confirmInquiry','toPo','toSo'].includes(action))scheduleMrpRecalculation(`需求事件 ${id} 狀態／沖銷更新`);
}
function rollingFreezeEvaluation(){
  let changed=false;state.demandEvents.forEach(d=>{if(!['客戶預測','內部預測'].includes(d.source)||['已取消'].includes(d.status))return;const frozen=dateDiff(d.demandDate,TODAY)<=getOrderLeadTime(d.sku),remaining=Math.max(0,Number(d.qty||0)-Number(d.offsetQty||0));if(frozen&&remaining>0){if(Number(d.plannedStockQty||0)!==remaining){d.plannedStockQty=remaining;d.plannedAction='計畫工單 Rolling 進入生產凍結期，未轉PO數量改列計畫庫存';changed=true;}}else if(!frozen&&d.plannedStockQty){d.plannedStockQty=0;changed=true;}});return changed;
}

// Production loading includes imported and MRP planned work orders.
function allCapacityWorkOrders(){return[...(state.workOrders||[]),...(state.plannedOrders||[]).map(w=>({id:w.id,kind:w.kind.includes('委外')?'委外工單':'內製工單',status:w.status,sku:state.demandEvents.find(d=>d.id===w.eventId)?.sku||'',product:state.demandEvents.find(d=>d.id===w.eventId)?.product||w.item,factory:w.factory,routeKey:w.routeKey,resourceId:w.resourceId,qty:w.qty,startDate:w.start,dueDate:w.due,progress:w.progress,demandEventId:w.eventId}))];}
function productionPlanFor(factory,horizon=14){
  const resources=capacityResourcesForFactory(factory),days=Array.from({length:horizon},(_,i)=>shiftDate(TODAY,i)),orders=allCapacityWorkOrders().filter(w=>w.factory===factory&&!['已完成','取消'].includes(w.status));
  const rows=resources.map(resource=>{const cells=days.map(date=>{const cal=calendarEntry(factory,resource.id,date);if(!cal.available||cal.hours<=0)return{date,kind:'maintenance',load:0,hours:0,title:cal.reason||'不可用',sku:'—',product:'資源不可用',qty:0,demandId:'—',source:'產能行事曆'};const tasks=orders.filter(w=>w.resourceId===resource.id&&dateDiff(date,w.startDate)>=0&&dateDiff(w.dueDate,date)>=0);if(!tasks.length)return{date,kind:'idle',load:0,hours:0,title:'尚無排程',sku:'—',product:'未排產',qty:0,demandId:'—',source:'工單／MRP'};const allocations=tasks.map(w=>{const dates=[];for(let d=w.startDate;dateDiff(w.dueDate,d)>=0;d=shiftDate(d,1)){const e=calendarEntry(w.factory,w.resourceId,d);if(e.available&&e.hours>0)dates.push(d);}const remaining=(Number(w.qty)||0)*getUnitHours(w.sku,w.routeKey)*Math.max(0,1-(Number(w.progress)||0)/100),hours=remaining/Math.max(1,dates.length);return{w,hours};});const hours=allocations.reduce((s,x)=>s+x.hours,0),load=cal.hours?hours/cal.hours*100:0,primary=allocations.sort((a,b)=>b.hours-a.hours)[0],unit=getUnitHours(primary.w.sku,primary.w.routeKey),qty=unit?Math.round(primary.hours/unit):0;return{date,kind:load>100?'over':load>=85?'tight':'normal',load:Number(load.toFixed(1)),hours:Number(hours.toFixed(1)),title:tasks.length>1?`${primary.w.product}＋${tasks.length-1}項`:`${primary.w.product}`,sku:primary.w.sku,product:routeMaster(primary.w.routeKey).name,qty,demandId:primary.w.demandEventId||'未指定需求',source:`${primary.w.kind} ${primary.w.id}`,availableHours:cal.hours};});return{resource,cells};});const cells=rows.flatMap(r=>r.cells),working=cells.filter(c=>!['idle','maintenance'].includes(c.kind)),avg=working.length?working.reduce((s,c)=>s+c.load,0)/working.length:0;return{factory,days,rows,avg,over:cells.filter(c=>c.load>100).length,tight:cells.filter(c=>c.load>=85&&c.load<=100).length,maintenance:cells.filter(c=>c.kind==='maintenance').length,plannedHours:cells.reduce((s,c)=>s+c.hours,0),capacityHours:rows.reduce((s,r)=>s+r.cells.reduce((a,c)=>a+(c.availableHours||0),0),0)};
}

// Only active view is fully rendered during general navigation to avoid long tasks.
function activeViewName(){return document.querySelector('.view.active')?.id?.replace('view-','')||'overview';}
const renderMapMRP15={import:renderDemandImport,products:renderProductOverview,customers:renderCustomerOverview,workorders:renderWorkOrderImport,labor:renderLaborManagement,capacity:renderCapacityManagement,overview:renderOverview,demand:renderDemand,shipment:renderShipment,events:renderEvents,simulation:renderSimulation,network:renderNetwork,routing:renderRouting,production:renderProduction,bottlenecks:renderBottlenecks,commit:renderCommit,decision:renderDecision,tracking:renderTracking};
function renderAll(){renderContext();const fn=renderMapMRP15[activeViewName()]||renderOverview;fn();renderMrpEngineStatus();}
function switchView(view,preserveOverlay=false){switchViewLegacyMRP15(view,preserveOverlay);requestAnimationFrame(()=>{renderContext();renderMapMRP15[view]?.();renderMrpEngineStatus();});}


function renderWorkOrderImport(){
  if(!$('#workOrderImportKpis'))return;
  const imported=state.workOrders||[],planned=state.plannedOrders||[],all=[...imported.map(w=>({...w,documentType:'匯入工單',displayKind:w.kind,displayStatus:w.status,displayStart:w.startDate,displayDue:w.dueDate,requiredHours:workOrderRequiredHours(w),purpose:'人工匯入／既有工單'})),...planned.map(w=>({...w,documentType:'MRP計畫',displayKind:w.kind,displayStatus:w.status,displayStart:w.start,displayDue:w.due,sku:state.demandEvents.find(d=>d.id===w.eventId)?.sku||'',product:state.demandEvents.find(d=>d.id===w.eventId)?.product||w.item}))];
  const active=all.filter(w=>!['已完成','取消'].includes(w.displayStatus)),outs=all.filter(w=>String(w.displayKind).includes('委外')),hours=all.reduce((sum,w)=>sum+Number(w.requiredHours||0),0);
  $('#workOrderImportKpis').innerHTML=[['工單／計畫總數',all.length,`${imported.length}張匯入・${planned.length}張MRP計畫`,'WO','tone-blue'],['待執行／進行中',active.length,'納入產能Loading','▶','tone-yellow'],['委外計畫',outs.length,'友廠或協力廠承接','↗','tone-green'],['總需求工時',`${fmt(hours)}h`,'依單件標準工時','H','tone-blue']].map(kpiCard).join('');
  $('#workOrderCount').textContent=`${all.length}張`;
  $('#workOrderTable').innerHTML=all.sort((a,b)=>String(a.displayDue).localeCompare(String(b.displayDue))).map(w=>`<tr><td><strong>${w.id}</strong><br><span class="event-id">${w.documentType}・${w.createdDate||w.runId||TODAY}</span></td><td><span class="tag ${String(w.displayKind).includes('委外')?'warning':'info'}">${w.displayKind}</span><br>${fulfillmentStatusTag(w.displayStatus)}</td><td><strong>${w.product}｜${w.sku}</strong><br><span class="event-id">${routeMaster(w.routeKey).name}${w.purpose?`・${w.purpose}`:''}</span></td><td>${w.factory}｜${factoryName(w.factory)}<br><span class="event-id">${w.resourceId||'待指定資源'}</span></td><td>${fmt(w.qty)}</td><td>${getUnitHours(w.sku,w.routeKey).toFixed(4)}h</td><td><strong>${Number(w.requiredHours||0).toFixed(1)}h</strong>${w.capacityShortfall?`<br><span class="event-id lt-inline">短缺 ${Number(w.capacityShortfall).toFixed(1)}h</span>`:''}</td><td>${formatDateFull(w.displayStart)}<br>→ ${formatDateFull(w.displayDue)}</td><td>${w.demandEventId||w.eventId||'未指定'}</td></tr>`).join('')||'<tr><td colspan="9">目前沒有工單或MRP計畫工單。</td></tr>';
  renderWorkOrderImportPreview();updateManualWorkOrderEstimate();
  if($('#manualWorkOrderDemand'))$('#manualWorkOrderDemand').innerHTML='<option value="">不指定需求事件</option>'+state.demandEvents.map(d=>`<option value="${d.id}">${d.id}｜${d.sku}｜${fmt(d.qty)}件</option>`).join('');
}

// Initialize rolling/frozen status and reconstruct plans without blocking first paint.

/* ==========================================================
   MRP16 — non-blocking demand save and approval performance
   ========================================================== */
function saveDemandWorkflowOnly(){
  saveStored('ct-events-v8-resource',state.events||[]);
  saveStored('ct-demand-events-v8-resource',state.demandEvents||[]);
  saveStored('ct-tracking-v5-resource',state.tracking||[]);
  saveStored('ct-commits-v5-resource',state.commits||{});
  saveStored('ct-decisions-v5-resource',state.decisions||{});
}
function scheduleMrpResultSave(){
  idleTask(()=>{
    saveStored('ct-planned-orders-v1-mrp15',state.plannedOrders||[]);
    idleTask(()=>{
      saveStored('ct-purchase-orders-v1-mrp15',state.purchaseOrders||[]);
      saveStored('ct-mrp-runs-v1-mrp15',(state.mrpRuns||[]).slice(0,30));
      saveStored('ct-demand-events-v8-resource',state.demandEvents||[]);
    });
  });
}
function weekdayCounts(startDate,endDate){
  const days=dateDiff(endDate,startDate)+1;if(days<=0)return{weekday:0,saturday:0,sunday:0};
  const full=Math.floor(days/7),rem=days%7,start=parseDate(startDate).getDay();
  let weekday=full*5,saturday=full,sunday=full;
  for(let i=0;i<rem;i++){const d=(start+i)%7;if(d===0)sunday++;else if(d===6)saturday++;else weekday++;}
  return{weekday,saturday,sunday};
}
function availableRouteHours(factory,routeKey,endDate){
  if(!endDate||dateDiff(endDate,TODAY)<0)return 0;
  const type=routeMaster(routeKey).resourceType,resources=capacityResourcesForFactory(factory).filter(r=>r.type===type);if(!resources.length)return 0;
  const boundedEnd=dateDiff(endDate,TODAY)>1095?shiftDate(TODAY,1095):endDate;
  const counts=weekdayCounts(TODAY,boundedEnd);let total=0;
  resources.forEach(r=>{
    let resourceTotal=r.capacity*counts.weekday+r.capacity*.7*counts.saturday;
    const prefix=`${factory}|${r.id}|`;
    Object.entries(state.capacityCalendar||{}).forEach(([key,e])=>{
      if(!key.startsWith(prefix))return;const date=key.slice(prefix.length);if(dateDiff(date,TODAY)<0||dateDiff(boundedEnd,date)<0)return;
      const def=defaultCalendarEntry(factory,r,date);resourceTotal+=Number(e?.available?e.hours:0)-Number(def.available?def.hours:0);
    });
    total+=resourceTotal;
  });
  const reserved=(state.workOrders||[]).filter(w=>w.factory===factory&&routeMaster(w.routeKey).resourceType===type&&!['已完成','取消'].includes(w.status)&&dateDiff(w.startDate,boundedEnd)<=0&&dateDiff(w.dueDate,TODAY)>=0).reduce((sum,w)=>sum+workOrderRequiredHours(w)*Math.max(0,1-(Number(w.progress)||0)/100),0);
  return Math.max(0,total-reserved);
}
function persistApprovalOnly(){saveDemandWorkflowOnly();}
function setApprovalBusy(busy,text='處理中…'){
  $$('.event-action').forEach(b=>{b.disabled=busy;if(busy&&b.dataset.action!=='viewDemand')b.dataset.originalText=b.textContent;else if(!busy&&b.dataset.originalText){b.textContent=b.dataset.originalText;delete b.dataset.originalText;}});
  const primary=$('.event-action[data-action="approveLt"]');if(primary&&busy)primary.textContent=text;
}

function init(){initLegacyMRP15();renderMrpEngineStatus();setTimeout(()=>{const changed=rollingFreezeEvaluation();if(changed||(!(state.plannedOrders||[]).length&&state.demandEvents.length))scheduleMrpRecalculation('系統啟動／凍結期 Rolling');},80);}
