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
  const sources = ['客戶預測','客戶PO','內部預測','計畫庫存','緊急詢單','客戶預測'];
  const statusCycle = ['待整合','待確認','已確認','已轉內部SO','已確認','已轉內部SO'];
  const events = [];
  let serial = 1;
  allFactories.forEach((factory,fi) => {
    sources.forEach((source,si) => {
      const item = productForFactory(factory,fi+si);
      const localCustomer = customers.find(c => c.region===factoryLookup[factory].region);
      const exportCustomer = customers[(fi*2+si+6)%customers.length];
      const isInternal = ['內部預測','計畫庫存'].includes(source);
      const customer = isInternal ? (source==='計畫庫存'?'區域成品倉':'內部S&OP預測') : (si%3===0?exportCustomer:localCustomer);
      const customerName = typeof customer==='string'?customer:customer.name;
      const destRegion = isInternal?factoryLookup[factory].region:customer.region;
      const country = isInternal?factoryLookup[factory].regionName:customer.country;
      const city = isInternal?factoryName(factory):customer.city;
      const batchType = source==='客戶預測'?'FCST':source==='客戶PO'?'PO':source==='內部預測'?'IFC':source==='計畫庫存'?'STK':'RFQ';
      const batchId = source==='客戶預測' ? `FCST-${factory}-001` : `${batchType}-${factory}-${String(si+1).padStart(3,'0')}`;
      const demandDate = shiftDate('2026-07-22', fi*2 + si*6 + (si===5?14:0));
      let status = statusCycle[(fi+si)%statusCycle.length];
      if(source==='計畫庫存' && status==='已轉內部SO') status='已確認';
      if(source==='緊急詢單' && fi%4===0) status='待確認';
      const qty = 600 + ((fi+3)*(si+5)*173)%8400;
      const id = `DE-${String(serial++).padStart(4,'0')}`;
      events.push({
        id,batchId,region:factoryLookup[factory].region,factory,source,status,
        demandDate,customer:customerName,destinationRegion:destRegion,destinationCountry:country,destinationCity:city,
        productKey:item.productKey,product:item.product,sku:item.sku,qty,priority:source==='緊急詢單'?1:source==='客戶PO'?2:3,
        createdDate:shiftDate(TODAY,-((fi+si)%9)),
        soNo:status==='已轉內部SO'?`SO-${factory}-${String(88000+serial).slice(-5)}`:'',
        shippingStatus:status==='已轉內部SO'?['備料中','待出貨','已出貨','延遲風險'][(fi+si)%4]:'',
        incoterm:destRegion===factoryLookup[factory].region?'DAP':(['FOB','CIF','DDP','FCA'][(fi+si)%4])
      });
    });
  });
  return events;
}

const baseDemandEvents = buildDemandEvents();

const changeEventSeeds = [
  ['TW01','Formosa Data Center','UPS','資料中心UPS增量並提前交期','客戶PO'],
  ['TW02','Pacific Telecom','RTR','路由器策略客戶插單','緊急詢單'],
  ['TW03','NorthStar Systems','FAN','AI伺服器風扇需求上修','客戶預測'],
  ['TW04','Thai Automotive','OBC','車載充電器產品組合改變','客戶PO'],
  ['CN01','EuroGrid GmbH','ESS','ESS專案提前轉量產','客戶PO'],
  ['CN02','Sakura Automation','EVSE','充電樁交期提前','緊急詢單'],
  ['CN03','Dragon Cloud','PLC','工業MCU到料延遲','客戶PO'],
  ['CN04','ASEAN Distribution','CAM','安控攝影機促銷需求增加','客戶預測'],
  ['CN05','Dragon Cloud','LED','LED法規包材變更','客戶PO'],
  ['CN06','Shenzhen Mobility','MCU','馬達控制器長交期料短缺','客戶PO'],
  ['TH01','EuroGrid GmbH','EPS','嵌入式電源海外轉單','內部預測'],
  ['TH02','Siam Energy','VFD','變頻器專案需求提前','客戶PO'],
  ['TH03','Thai Automotive','INV','牽引逆變器爬坡不足','客戶PO'],
  ['TH04','ASEAN Distribution','FAS','新風系統區域促銷','客戶預測'],
  ['TH05','Siam Energy','SOL','太陽能逆變器新品切量產','客戶PO'],
  ['TH06','NorthStar Systems','TRF','變壓器銅材交期風險','客戶PO'],
  ['TH07','Pacific Telecom','RTR','路由器晶片供應延遲','客戶預測'],
  ['TH08','Sakura Automation','PRJ','投影機光學模組變更','客戶PO']
];

const baseEvents = changeEventSeeds.map((x,i) => {
  const [factory,customer,productKey,title,source] = x;
  const product = productLookup[productKey];
  const sku = productCatalog.find(s=>s.productKey===productKey && s.factory===factory)?.sku || productCatalog.find(s=>s.productKey===productKey).sku;
  const oldQty = 1800 + (i*977)%11200;
  const increase = i%5===3?0:500+(i*263)%3600;
  const oldDate = shiftDate('2026-08-12',i%18);
  const newDate = i%6===4?shiftDate(oldDate,5):shiftDate(oldDate,-(1+i%7));
  return {
    id:`CE-20260714-${String(i+1).padStart(3,'0')}`,region:factoryLookup[factory].region,factory,customer,
    model:sku,product:product.name,source,title,oldQty,newQty:oldQty+increase,oldDate,newDate,
    oldPriority:3,priority:i%3===0?1:2,revenue:Math.round((oldQty+increase)*.42),impactRevenue:Math.round(increase*.42+300),
    severity:i%4===0?'red':i%4===1?'yellow':i%4===2?'yellow':'green',
    status:i%5===0?'待決策':i%5===1?'模擬中':i%5===2?'待評估':i%5===3?'已核准':'待決策',
    freeze:i%3===0,reason:`${source}發生變化，需重新確認${product.name}的產能、物料、跨廠模組與交付承諾。`,
    owner:['陳建宏','林怡君','王磊','Narin S.','Kanya P.'][i%5],ownerDept:['供應鏈規劃','工廠生管','區域計畫','採購管理','專案管理'][i%5],
    versionFrom:`V${String(10+i).padStart(2,'0')}`,versionTo:`V${String(11+i).padStart(2,'0')}`
  };
});

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
  demandSource:'all',demandStatus:'all',demandHorizon:'all',shipmentTrade:'all',shipmentStatus:'all',
  networkProduct:'all',networkSku:'all',networkRelation:'all',
  events:loadStored('ct-events-v3',structuredClone(baseEvents)),
  demandEvents:loadStored('ct-demand-events-v1',structuredClone(baseDemandEvents)),
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
const statusClass={'待整合':'neutral','待確認':'warning','已確認':'info','已轉內部SO':'success','已取消':'danger'};

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
  $$('.nav-item').forEach(btn=>btn.addEventListener('click',()=>switchView(btn.dataset.view)));
  $$('.jump-view').forEach(btn=>btn.addEventListener('click',()=>switchView(btn.dataset.target)));
  $('#menuToggle').addEventListener('click',()=>{$('#sidebar').classList.toggle('open');$('#overlay').classList.toggle('show');});
  $('#overlay').addEventListener('click',closeOverlays);
}
function switchView(view,preserveOverlay=false){
  $$('.nav-item').forEach(x=>x.classList.toggle('active',x.dataset.view===view));
  $$('.view').forEach(x=>x.classList.toggle('active',x.id===`view-${view}`));
  const titles={overview:'總覽控制塔',demand:'需求總覽',shipment:'出貨總覽',events:'需求變更事件',simulation:'有限／無限模擬',network:'供應網路與 BOM',bottlenecks:'瓶頸分析',commit:'責任人 Commit',decision:'跨部門決策室',tracking:'執行追蹤與 Highlight'};
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
  $('#shipmentStatusFilter').addEventListener('change',e=>{state.shipmentStatus=e.target.value;renderShipment();});
  $('#resetDemo').addEventListener('click',()=>{
    clearStored(['ct-events-v3','ct-demand-events-v1','ct-tracking-v3','ct-commits-v3','ct-decisions-v3']);
    state.events=structuredClone(baseEvents);state.demandEvents=structuredClone(baseDemandEvents);state.tracking=structuredClone(trackingBase);state.commits={};state.decisions={};state.selectedEventId=baseEvents[0].id;state.selectedScenario=null;renderAll();toast('示範資料已重設');
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
function renderAll(){renderContext();renderOverview();renderDemand();renderShipment();renderEvents();renderSimulation();renderNetwork();renderBottlenecks();renderCommit();renderDecision();renderTracking();}

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
    const header=`<tr class="factory-group-row"><td colspan="9"><div><strong>${factory}｜${factoryName(factory)}</strong><span>${items.length}筆事件・${fmt(total)}件</span></div></td></tr>`;
    return header+items.map(demandRow).join('');
  }).join('')||'<tr><td colspan="9">沒有符合條件的需求事件</td></tr>';
  $$('.demand-action').forEach(b=>b.addEventListener('click',()=>handleDemandAction(b.dataset.id,b.dataset.action)));
}
function demandRow(d){
  const action=d.status==='待整合'?['送確認','confirmQueue']:d.status==='待確認'?['確認需求','confirm']:d.status==='已確認'?['轉內部SO','toSo']:d.status==='已轉內部SO'?['查看SO','viewSo']:['—','none'];
  return `<tr><td><strong>${d.id}</strong><br><span class="event-id">批次 ${d.batchId}</span></td><td><strong>${formatDateFull(d.demandDate)}</strong><br><span class="event-id">建立 ${formatDate(d.createdDate)}</span></td><td><span class="tag ${sourceClass[d.source]}">${d.source}</span></td><td><span class="tag ${statusClass[d.status]}">${d.status}</span></td><td><strong>${d.customer}</strong><br><span class="event-id">${d.destinationCountry}・${d.destinationCity}</span></td><td><strong>${d.product}</strong><br><span class="event-id">${d.sku}</span></td><td><strong>${fmt(d.qty)} 件</strong><br><span class="event-id">P${d.priority}</span></td><td>${d.soNo?`<strong>${d.soNo}</strong>`:'<span class="event-id">尚未建立</span>'}</td><td><button class="action-link demand-action" data-id="${d.id}" data-action="${action[1]}" ${action[1]==='none'?'disabled':''}>${action[0]}</button></td></tr>`;
}
function handleDemandAction(id,action){
  const d=state.demandEvents.find(x=>x.id===id);if(!d)return;
  if(action==='confirmQueue')d.status='待確認';
  if(action==='confirm')d.status='已確認';
  if(action==='toSo'){d.status='已轉內部SO';d.soNo=`SO-${d.factory}-${String(90000+hashText(d.id)%9999).slice(-5)}`;d.shippingStatus='待排程';d.incoterm=d.destinationRegion===d.region?'DAP':['FOB','CIF','DDP','FCA'][hashText(d.id)%4];}
  if(action==='viewSo'){state.shipmentTrade='all';state.shipmentStatus='all';renderShipment();switchView('shipment');toast(`已定位 ${d.soNo}`);return;}
  persist();renderAll();toast(action==='toSo'?`已建立內部SO：${d.soNo}`:`需求事件已更新為「${d.status}」`);
}

function buildShipments(){
  return state.demandEvents.filter(d=>d.status==='已轉內部SO').map(d=>{
    const trade=d.destinationRegion===d.region?'內銷':'外銷';const shipLead=trade==='內銷'?2:7;
    return {...d,trade,plannedShipDate:shiftDate(d.demandDate,-shipLead),deliveryDate:d.demandDate,shippingStatus:d.shippingStatus||'待排程',incoterm:d.incoterm||(trade==='內銷'?'DAP':'FOB')};
  });
}
function renderShipment(){
  $('#shipmentTradeFilter').value=state.shipmentTrade;$('#shipmentStatusFilter').value=state.shipmentStatus;
  const all=buildShipments().filter(s=>inScope(s.factory));
  const rows=all.filter(s=>state.shipmentTrade==='all'||s.trade===state.shipmentTrade).filter(s=>state.shipmentStatus==='all'||s.shippingStatus===state.shipmentStatus).sort((a,b)=>a.plannedShipDate.localeCompare(b.plannedShipDate));
  const domestic=all.filter(x=>x.trade==='內銷'),exports=all.filter(x=>x.trade==='外銷'),risk=all.filter(x=>x.shippingStatus==='延遲風險'),ready=all.filter(x=>['待出貨','已出貨'].includes(x.shippingStatus));
  $('#shipmentKpis').innerHTML=[['內銷 SO',domestic.length,`${fmt(domestic.reduce((s,x)=>s+x.qty,0))} 件`,'內','tone-blue'],['外銷 SO',exports.length,`${fmt(exports.reduce((s,x)=>s+x.qty,0))} 件`,'外','tone-green'],['待出貨／已出貨',ready.length,'已具備交運排程','↗','tone-yellow'],['延遲風險',risk.length,'需確認生產與物流','!','tone-red']].map(kpiCard).join('');
  $('#shipmentCount').textContent=`${rows.length}筆內部SO`;
  $('#shipmentTable').innerHTML=rows.map(s=>`<tr class="${s.shippingStatus==='延遲風險'?'risk-row':''}"><td><strong>${s.soNo}</strong><br><button class="link-button shipment-demand-link" data-id="${s.id}">${s.id}</button></td><td><strong>${s.factory}</strong><br><span class="event-id">${factoryName(s.factory)}</span></td><td><span class="tag ${s.trade==='內銷'?'info':'success'}">${s.trade}</span></td><td><strong>${s.customer}</strong><br><span class="event-id">${s.destinationCountry}・${s.destinationCity}</span></td><td><strong>${s.product}</strong><br><span class="event-id">${s.sku}</span></td><td><strong>${fmt(s.qty)} 件</strong></td><td>${formatDateFull(s.demandDate)}</td><td>${formatDateFull(s.plannedShipDate)}</td><td>${s.incoterm}</td><td>${shipmentStatusTag(s.shippingStatus)}</td></tr>`).join('')||'<tr><td colspan="10">目前沒有符合條件的內部 SO 出貨資料</td></tr>';
  $$('.shipment-demand-link').forEach(b=>b.addEventListener('click',()=>{const d=state.demandEvents.find(x=>x.id===b.dataset.id);state.region=d.region;state.factory=d.factory;$('#regionSelect').value=state.region;updateFactoryOptions();$('#factorySelect').value=state.factory;state.demandSource='all';state.demandStatus='已轉內部SO';renderAll();switchView('demand');}));
}
function shipmentStatusTag(status){const cls=status==='延遲風險'?'danger':status==='已出貨'?'success':status==='待出貨'?'info':status==='備料中'?'warning':'neutral';return `<span class="tag ${cls}">${status}</span>`;}

function eventCard(e){return `<div class="event-item ${e.id===state.selectedEventId?'active':''}" data-event-id="${e.id}"><div class="event-row"><span class="event-id">${e.id}</span>${sevTag(e.severity)}</div><div class="event-title">${e.customer}｜${e.model}－${e.title}</div><div class="event-meta"><span>${e.factory} ${factoryName(e.factory)}</span><span>${e.source}</span><span>${e.status}</span><span>${e.versionFrom} → ${e.versionTo}</span></div></div>`;}
function bindEventCards(scope){$$(`${scope} .event-item`).forEach(el=>el.addEventListener('click',()=>{state.selectedEventId=el.dataset.eventId;state.selectedScenario=null;renderAll();if(scope==='#overviewEventList')switchView('events');}));}
function renderEvents(){
  const items=filteredEvents().filter(e=>(state.eventSeverity==='all'||e.severity===state.eventSeverity)&&(state.eventStatus==='all'||e.status===state.eventStatus));
  $('#eventSeverityFilter').value=state.eventSeverity;$('#eventStatusFilter').value=state.eventStatus;$('#eventList').innerHTML=items.map(eventCard).join('')||'<div class="empty-state">沒有符合條件的事件</div>';bindEventCards('#eventList');
  const e=selectedEvent();const qtyDelta=e.newQty-e.oldQty;const days=dateDiff(e.newDate,e.oldDate);
  $('#eventDetail').innerHTML=`<div class="detail-hero"><p class="eyebrow">${e.id}・${e.factory} ${factoryName(e.factory)}</p><h2>${e.customer}｜${e.product}</h2><p>${e.title}</p></div><div class="event-row"><div><span class="event-id">事件狀態／來源</span><div style="margin-top:5px"><span class="tag neutral">${e.status}</span> <span class="tag ${sourceClass[e.source]||'info'}">${e.source}</span> ${e.freeze?'<span class="tag danger">進入凍結區</span>':'<span class="tag info">彈性區</span>'}</div></div>${sevTag(e.severity)}</div><div class="detail-grid" style="margin-top:16px"><div class="detail-stat"><span>數量變化</span><strong class="${qtyDelta>=0?'delta-up':'delta-down'}">${qtyDelta>=0?'+':''}${fmt(qtyDelta)} 件</strong></div><div class="detail-stat"><span>交期變化</span><strong>${days===0?'不變':days<0?`提前 ${Math.abs(days)} 天`:`延後 ${days} 天`}</strong></div><div class="detail-stat"><span>預估營收影響</span><strong>${money(e.impactRevenue)}</strong></div><div class="detail-stat"><span>事件負責人</span><strong>${e.owner}</strong><span>${e.ownerDept}</span></div></div><h3>需求版本差異</h3><table class="version-compare"><thead><tr><th>項目</th><th>${e.versionFrom}</th><th>${e.versionTo}</th><th>差異</th></tr></thead><tbody><tr><td>需求數量</td><td>${fmt(e.oldQty)}</td><td>${fmt(e.newQty)}</td><td>${qtyDelta>=0?'+':''}${fmt(qtyDelta)}</td></tr><tr><td>需求日期</td><td>${formatDate(e.oldDate)}</td><td>${formatDate(e.newDate)}</td><td>${days===0?'—':days<0?`提前${Math.abs(days)}天`:`延後${days}天`}</td></tr><tr><td>優先順序</td><td>P${e.oldPriority}</td><td>P${e.priority}</td><td>${e.priority<e.oldPriority?'提高':'不變'}</td></tr><tr><td>正式版本</td><td>Demand ${e.versionFrom}</td><td>Demand ${e.versionTo}</td><td>待決策</td></tr></tbody></table><div class="reason-box"><strong>變更原因：</strong>${e.reason}</div><div class="detail-actions"><button class="primary-button event-action" data-action="模擬中">接受進入模擬</button><button class="secondary-button event-action" data-action="待補件">退回補充理由</button><button class="secondary-button event-action" data-action="下期處理">併入下次週期</button><button class="danger-button event-action" data-action="待決策">緊急升級</button></div>`;
  $$('.event-action').forEach(b=>b.addEventListener('click',()=>{e.status=b.dataset.action;persist();renderAll();toast(`事件已更新為「${e.status}」`);if(e.status==='模擬中')switchView('simulation');}));
}

function renderSimulation(){
  const e=selectedEvent();$('#simulationSubtitle').textContent=`${e.id}｜${e.customer} ${e.model}｜${e.source}｜需求 ${e.versionFrom} → ${e.versionTo}`;
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
  const rows=state.demandEvents.filter(d=>inScope(d.factory)&&d.status!=='已取消');const key=state.simDimension==='product'?'product':'customer';const groups=rows.reduce((a,d)=>{const k=d[key];(a[k]??=[]).push(d);return a;},{});
  const data=Object.entries(groups).map(([name,items])=>{const demand=items.reduce((s,x)=>s+x.qty,0);const factor=.79+(hashText(name)%19)/100;const finite=Math.round(demand*Math.min(.98,factor));const gap=demand-finite;return{name,demand,finite,gap,rate:finite/demand*100,secondary:state.simDimension==='product'?[...new Set(items.map(x=>x.factory))].join('、'):[...new Set(items.map(x=>x.product))].slice(0,3).join('、'),constraint:['材料供應','SMT能力','組裝產能','測試設備','無重大限制'][hashText(name)%5]};}).sort((a,b)=>b.gap-a.gap).slice(0,18);
  $('#simulationBreakdownHead').innerHTML=`<tr><th>${state.simDimension==='product'?'產品':'客戶'}</th><th>${state.simDimension==='product'?'生產工廠':'產品組合'}</th><th>無限需求</th><th>有限可達</th><th>缺口</th><th>滿足率</th><th>主要限制</th></tr>`;
  $('#simulationBreakdownBody').innerHTML=data.map(x=>`<tr><td><strong>${x.name}</strong></td><td class="reason-text">${x.secondary}</td><td>${fmt(x.demand)}</td><td>${fmt(x.finite)}</td><td class="${x.gap?'delta-up':'delta-down'}">${fmt(x.gap)}</td><td><div class="coverage-cell"><strong>${x.rate.toFixed(1)}%</strong><div class="mini-progress"><i style="width:${x.rate}%"></i></div></div></td><td>${x.constraint}</td></tr>`).join('')||'<tr><td colspan="7">此範圍沒有需求資料</td></tr>';
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

function persist(){saveStored('ct-events-v3',state.events);saveStored('ct-demand-events-v1',state.demandEvents);saveStored('ct-tracking-v3',state.tracking);saveStored('ct-commits-v3',state.commits);saveStored('ct-decisions-v3',state.decisions);}
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
    {view:'shipment',title:'3. 內部SO出貨總覽',text:'只列出已轉內部SO的需求事件，並依出貨工廠與目的地判斷內銷或外銷。',path:['內部SO','內外銷','出貨狀態']},
    {view:'events',title:'4. 需求變更事件',text:'重大變更不直接覆蓋舊版本，而是保留數量、日期、來源與原因差異。',path:['版本差異','門檻判定','接受／退回／升級']},
    {view:'simulation',title:'5. 有限與無限模擬',text:'以相同快照比較需求與實際可達量，並可切換BY產品或BY客戶。',path:['無限需求','有限可達','產品／客戶檢視']},
    {view:'network',title:'6. 供應網路與BOM',text:'展開多階BOM，查看外部供應、友廠模組、SMT代工與跨廠調撥。',path:['多階BOM','友廠協同','供給覆蓋率']},
    {view:'bottlenecks',title:'7. 瓶頸與責任',text:'找出產能、材料、SMT及人力瓶頸並指派責任人。',path:['風險矩陣','責任人','Commit']},
    {view:'decision',title:'8. 決策與追蹤',text:'主管比較跨廠協同、加急與客戶取捨方案，核准後進入執行追蹤。',path:['比較方案','核准版本','Highlight']}
  ];let idx=0;const show=()=>{const s=steps[idx];$('#tourStep').innerHTML=`<h3>${s.title}</h3><p>${s.text}</p><div class="step-path">${s.path.map(x=>`<span>${x}</span>`).join('')}</div>`;$('#tourProgress').textContent=`${idx+1} / ${steps.length}`;$('#tourPrev').disabled=idx===0;$('#tourNext').textContent=idx===steps.length-1?'完成':'下一步';switchView(s.view,true);};$('#guidedTour').addEventListener('click',()=>{idx=0;$('#overlay').classList.add('show');$('#tourModal').classList.add('show');show();});$('#tourClose').addEventListener('click',closeOverlays);$('#tourPrev').addEventListener('click',()=>{if(idx>0){idx--;show();}});$('#tourNext').addEventListener('click',()=>{if(idx<steps.length-1){idx++;show();}else closeOverlays();});
}

document.addEventListener('DOMContentLoaded',init);
