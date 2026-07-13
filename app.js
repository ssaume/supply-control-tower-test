const regions = [
  { id: 'TW', name: '台灣', factories: [['TW01','桃園一廠'],['TW02','新竹二廠'],['TW03','台中三廠'],['TW04','台南四廠']] },
  { id: 'CN', name: '中國', factories: [['CN01','上海一廠'],['CN02','蘇州二廠'],['CN03','昆山三廠'],['CN04','深圳四廠'],['CN05','成都五廠'],['CN06','重慶六廠']] },
  { id: 'TH', name: '泰國', factories: [['TH01','曼谷一廠'],['TH02','春武里二廠'],['TH03','羅勇三廠'],['TH04','大城四廠'],['TH05','巴吞他尼五廠'],['TH06','北欖六廠'],['TH07','巴真武里七廠'],['TH08','清邁八廠']] }
];

const factoryLookup = Object.fromEntries(regions.flatMap(r => r.factories.map(([id,name]) => [id,{ id,name,region:r.id,regionName:r.name }])));

const productTypes = [
  {id:'UPS',code:'UPS',name:'UPS不斷電系統',category:'電源系統',factories:['TW01','CN01','TH01']},
  {id:'EPS',code:'EPS',name:'嵌入式電源供應器',category:'電源系統',factories:['TW01','CN01','TH01']},
  {id:'TRF',code:'TRF',name:'變壓器',category:'電源系統',factories:['TW01','CN01','TH01']},
  {id:'RTR',code:'RTR',name:'路由器',category:'資通訊與影像',factories:['TW04','CN02','TH07']},
  {id:'FAN',code:'FAN',name:'散熱風扇模組',category:'熱管理與馬達',factories:['CN03','TH02','TH08']},
  {id:'BLM',code:'BLM',name:'直流無刷馬達',category:'熱管理與馬達',factories:['CN03','TH02','TH04']},
  {id:'OBC',code:'OBC',name:'車載充電器',category:'車用電力電子',factories:['TW03','CN04','TH03']},
  {id:'DCDC',code:'DCD',name:'直流電能轉換器',category:'車用電力電子',factories:['TW03','CN04','TH03']},
  {id:'TINV',code:'TIV',name:'牽引逆變器',category:'電動車動力',factories:['TW03','CN04','TH04']},
  {id:'EDM',code:'EDM',name:'電動車驅動馬達',category:'電動車動力',factories:['CN04','TH04','TW03']},
  {id:'MCU',code:'MCU',name:'馬達控制器',category:'電動車動力',factories:['TW03','CN04','TH04']},
  {id:'EVSE',code:'EVC',name:'直流/交流電動車充電樁設備',category:'車用電力電子',factories:['TW03','TH03','CN04']},
  {id:'VFD',code:'VFD',name:'變頻器',category:'工業自動化',factories:['TW02','CN06','TH05']},
  {id:'PLC',code:'PLC',name:'PLC控制器',category:'工業自動化',factories:['TW02','CN06','TH05']},
  {id:'LED',code:'LED',name:'LED 照明模組',category:'能源與照明',factories:['CN06','TH06','TW02']},
  {id:'SINV',code:'SIV',name:'太陽能逆變器',category:'能源與照明',factories:['TW02','CN05','TH06']},
  {id:'ESS',code:'ESS',name:'儲能系統（ESS）',category:'能源與照明',factories:['TW02','CN05','TH06','TH08']},
  {id:'MGC',code:'MGC',name:'微電網控制器',category:'能源與照明',factories:['TW02','CN05','TH08']},
  {id:'FAS',code:'FAS',name:'新風系統',category:'熱管理與馬達',factories:['CN03','TH08','TH02']},
  {id:'CAM',code:'CAM',name:'安控攝影機',category:'資通訊與影像',factories:['TW04','CN02','TH07']},
  {id:'PRJ',code:'PRJ',name:'投影機',category:'資通訊與影像',factories:['TW04','CN02','TH07']}
];

const categoryModules = {
  '電源系統':['功率模組','磁性元件模組','控制板組件'],
  '資通訊與影像':['主控板組件','通訊模組','光學／感測模組'],
  '熱管理與馬達':['驅動板組件','馬達定轉子組','風道與機構模組'],
  '車用電力電子':['功率模組','車規控制板','高壓連接模組'],
  '電動車動力':['IGBT／SiC功率模組','馬達定轉子組','車規控制板'],
  '工業自動化':['控制板組件','I/O模組','功率驅動模組'],
  '能源與照明':['功率轉換模組','能源控制板','電池／照明模組']
};

const externalSuppliers = ['晶曜半導體','聯磁電子','泰盛連接器','華南機構件','東亞電容','暹羅線材','新科PCB','環球電池科技'];
const seriesNames = ['Core','Plus','Pro','Edge','Max','X'];

function makeBom(product, sku, seed){
  const mods = categoryModules[product.category];
  const ext1 = externalSuppliers[seed % externalSuppliers.length];
  const ext2 = externalSuppliers[(seed + 3) % externalSuppliers.length];
  const smtFactory = ['TW02','CN03','TH02','CN06'][seed % 4];
  const moduleFactory = product.factories[(seed + 1) % product.factories.length];
  const depth5 = seed % 3 !== 0;
  const componentBranch = {
    id:`${sku.id}-L3-PCBA`, name:`${mods[1]} PCBA`, kind:'半成品', supplyType:'smt', source:smtFactory, children:[
      {id:`${sku.id}-L4-PCB`,name:'多層裸板',kind:'原材料',supplyType:'external',source:'新科PCB',children: depth5 ? [
        {id:`${sku.id}-L5-CU`,name:'高頻銅箔／基材',kind:'基礎材料',supplyType:'external',source:'華南機構件',children:[]}
      ]:[]},
      {id:`${sku.id}-L4-IC`,name:'控制IC與功率元件套件',kind:'電子料',supplyType:'external',source:ext1,children:[]},
      {id:`${sku.id}-L4-PAS`,name:'被動元件套件',kind:'電子料',supplyType:'external',source:'東亞電容',children:[]}
    ]
  };
  return {
    id:sku.id,name:`${sku.name}`,kind:'成品',supplyType:'make',source:sku.factory,children:[
      {id:`${sku.id}-L2-CTL`,name:mods[2],kind:'模組',supplyType:'module',source:moduleFactory,children:[componentBranch,{id:`${sku.id}-L3-FW`,name:'韌體與參數包',kind:'軟體',supplyType:'internal',source:'研發中心',children:[]}]},
      {id:`${sku.id}-L2-PWR`,name:mods[0],kind:'模組',supplyType:'module',source:moduleFactory,children:[
        {id:`${sku.id}-L3-MAG`,name:'磁性／功率子組件',kind:'半成品',supplyType:'module',source:moduleFactory,children:[
          {id:`${sku.id}-L4-MAT`,name:'磁芯、繞線與絕緣材料',kind:'原材料',supplyType:'external',source:ext2,children:[]}
        ]},
        {id:`${sku.id}-L3-CON`,name:'連接器與線束組',kind:'半成品',supplyType:'external',source:'泰盛連接器',children:[]}
      ]},
      {id:`${sku.id}-L2-MEC`,name:'機構外殼與散熱件',kind:'模組',supplyType:'external',source:'華南機構件',children:[]},
      {id:`${sku.id}-L2-PKG`,name:'標籤、包材與附件',kind:'包材',supplyType:'external',source:'區域包材供應商',children:[]}
    ]
  };
}

const finishedGoods = [];
productTypes.forEach((p, pi) => {
  const count = 3 + (pi % 4);
  p.skus = [];
  for(let i=0;i<count;i++){
    const sku = {
      id:`${p.code}-${100+i}`,
      name:`${p.name} ${seriesNames[i]}-${10 + pi + i}`,
      productId:p.id,
      productName:p.name,
      category:p.category,
      factory:p.factories[i % p.factories.length],
      alternateFactories:p.factories.filter(f=>f!==p.factories[i % p.factories.length]),
      weeklyDemand:900 + ((pi*337 + i*521) % 4100),
      unitRevenue:1.2 + ((pi*7+i*3)%18)*0.35
    };
    sku.bom = makeBom(p, sku, pi*7+i);
    p.skus.push(sku);
    finishedGoods.push(sku);
  }
});

const productLookup = Object.fromEntries(productTypes.map(p=>[p.id,p]));
const skuLookup = Object.fromEntries(finishedGoods.map(s=>[s.id,s]));

function makeSupplyRelations(){
  const rows=[];
  finishedGoods.forEach((sku, i)=>{
    const p=productLookup[sku.productId];
    const target=sku.factory;
    const moduleSource=sku.alternateFactories[i % sku.alternateFactories.length];
    const smtCandidates=['TW02','CN03','TH02','CN06'].filter(f=>f!==target);
    const smtSource=smtCandidates[i % smtCandidates.length];
    const demand=sku.weeklyDemand;
    const coverageBase=.82 + (i%9)*.025;
    rows.push({id:`R-${sku.id}-EXT`,productId:p.id,skuId:sku.id,type:'external',source:externalSuppliers[i%externalSuppliers.length],target,item:'IC／功率元件套件',demand:Math.round(demand*1.02),supply:Math.round(demand*1.02*coverageBase),lead:14+(i%5)*7});
    rows.push({id:`R-${sku.id}-MOD`,productId:p.id,skuId:sku.id,type:'module',source:moduleSource,target,item:categoryModules[p.category][0],demand:Math.round(demand*.96),supply:Math.round(demand*.96*(.88+(i%6)*.025)),lead:3+(i%4)});
    rows.push({id:`R-${sku.id}-SMT`,productId:p.id,skuId:sku.id,type:'smt',source:smtSource,target,item:`${categoryModules[p.category][1]} SMT`,demand:Math.round(demand*1.01),supply:Math.round(demand*1.01*(.86+(i%7)*.022)),lead:2+(i%3)});
    if(i%2===0){
      const transferSource=sku.alternateFactories[(i+1)%sku.alternateFactories.length];
      rows.push({id:`R-${sku.id}-TRN`,productId:p.id,skuId:sku.id,type:'transfer',source:transferSource,target,item:'成品／半成品備援調撥',demand:Math.round(demand*.22),supply:Math.round(demand*.22*(.78+(i%5)*.04)),lead:4+(i%5)});
    }
  });
  return rows.map(r=>{
    const coverage=r.supply/r.demand;
    return {...r,coverage,severity:coverage<.9?'red':coverage<.98?'yellow':'green'};
  });
}
const supplyRelations=makeSupplyRelations();

function eventFrom(id, productId, skuIndex, cfg){
  const sku=productLookup[productId].skus[skuIndex % productLookup[productId].skus.length];
  return {id,region:factoryLookup[sku.factory].region,factory:sku.factory,customer:cfg.customer,productId,product:productLookup[productId].name,sku:sku.id,model:sku.id,title:cfg.title,oldQty:cfg.oldQty,newQty:cfg.newQty,oldDate:cfg.oldDate,newDate:cfg.newDate,oldPriority:cfg.oldPriority,priority:cfg.priority,revenue:cfg.revenue,impactRevenue:cfg.impactRevenue,severity:cfg.severity,status:cfg.status,freeze:cfg.freeze,reason:cfg.reason,owner:cfg.owner,ownerDept:cfg.ownerDept,versionFrom:cfg.versionFrom,versionTo:cfg.versionTo};
}

const baseEvents = [
  eventFrom('CE-20260713-001','UPS',0,{customer:'CloudGrid Data Center',title:'資料中心擴建提前，UPS增量並提前交期',oldQty:10000,newQty:13000,oldDate:'2026/08/15',newDate:'2026/08/10',oldPriority:3,priority:1,revenue:6500,impactRevenue:1500,severity:'red',status:'待決策',freeze:true,reason:'客戶新機房提前上線，要求首批追加3,000台並提前5天。',owner:'陳建宏',ownerDept:'全球供應鏈規劃',versionFrom:'V12',versionTo:'V13'}),
  eventFrom('CE-20260713-002','FAN',1,{customer:'AeroCompute',title:'AI伺服器需求上修造成風扇測試產能缺口',oldQty:6200,newQty:7800,oldDate:'2026/08/22',newDate:'2026/08/20',oldPriority:2,priority:2,revenue:3900,impactRevenue:800,severity:'yellow',status:'模擬中',freeze:false,reason:'AI伺服器通路銷售優於預期，兩週Forecast上修25.8%。',owner:'林怡君',ownerDept:'區域生管',versionFrom:'V08',versionTo:'V09'}),
  eventFrom('CE-20260713-003','RTR',2,{customer:'GlobalTel',title:'電信客戶插單影響既有路由器承諾',oldQty:14000,newQty:17600,oldDate:'2026/08/18',newDate:'2026/08/13',oldPriority:3,priority:1,revenue:7200,impactRevenue:1800,severity:'red',status:'待評估',freeze:true,reason:'電信專案提前驗收，要求插單並取代一般訂單順位。',owner:'王磊',ownerDept:'中國區計畫',versionFrom:'V21',versionTo:'V22'}),
  eventFrom('CE-20260713-004','CAM',0,{customer:'SafeCity Integrator',title:'安控專案取消造成感測模組呆滯風險',oldQty:9500,newQty:4200,oldDate:'2026/08/25',newDate:'2026/08/25',oldPriority:2,priority:2,revenue:2100,impactRevenue:-2650,severity:'yellow',status:'待評估',freeze:false,reason:'市政標案延後，取消尚未投產的5,300台。',owner:'李娜',ownerDept:'需求管理',versionFrom:'V15',versionTo:'V16'}),
  eventFrom('CE-20260713-005','PLC',1,{customer:'AutoFab Systems',title:'長交期工業MCU延遲影響PLC交付',oldQty:8000,newQty:8000,oldDate:'2026/08/12',newDate:'2026/08/19',oldPriority:1,priority:1,revenue:4800,impactRevenue:1200,severity:'red',status:'待決策',freeze:true,reason:'關鍵工業MCU供應商良率異常，確認到料晚7天。',owner:'周敏',ownerDept:'採購管理',versionFrom:'V17',versionTo:'V18'}),
  eventFrom('CE-20260713-006','OBC',2,{customer:'E-Motion Motors',title:'車載充電器產品組合改變造成換線增加',oldQty:12000,newQty:12000,oldDate:'2026/08/28',newDate:'2026/08/24',oldPriority:3,priority:2,revenue:5100,impactRevenue:900,severity:'yellow',status:'模擬中',freeze:false,reason:'總量不變，但800V高複雜度機種占比由20%升至55%。',owner:'Narin S.',ownerDept:'泰國區計畫',versionFrom:'V10',versionTo:'V11'}),
  eventFrom('CE-20260713-007','ESS',3,{customer:'GreenIsland Utility',title:'儲能系統試產提前轉量產',oldQty:1500,newQty:6200,oldDate:'2026/09/10',newDate:'2026/08/30',oldPriority:3,priority:1,revenue:3100,impactRevenue:2350,severity:'red',status:'待決策',freeze:false,reason:'電網認證提前完成，客戶要求立即切換量產。',owner:'Kanya P.',ownerDept:'新能源專案',versionFrom:'V05',versionTo:'V06'}),
  eventFrom('CE-20260713-008','MGC',0,{customer:'Siam Microgrid',title:'微電網控制器一般需求小幅調整',oldQty:4500,newQty:4750,oldDate:'2026/09/05',newDate:'2026/09/04',oldPriority:3,priority:3,revenue:1450,impactRevenue:80,severity:'green',status:'已核准',freeze:false,reason:'客戶依最新專案排程小幅增加250台。',owner:'Somchai T.',ownerDept:'清邁生管',versionFrom:'V03',versionTo:'V04'}),
  eventFrom('CE-20260713-009','LED',2,{customer:'Metro Lighting',title:'LED照明模組包材與法規標示臨時變更',oldQty:7200,newQty:7200,oldDate:'2026/08/17',newDate:'2026/08/17',oldPriority:2,priority:2,revenue:2800,impactRevenue:500,severity:'yellow',status:'待評估',freeze:true,reason:'市場法規標示更新，已備包材無法直接使用。',owner:'黃郁婷',ownerDept:'區域採購',versionFrom:'V11',versionTo:'V12'}),
  eventFrom('CE-20260713-010','VFD',1,{customer:'Dragon Automation',title:'變頻器區域促銷需求提前',oldQty:11000,newQty:13500,oldDate:'2026/09/02',newDate:'2026/08/26',oldPriority:3,priority:2,revenue:4600,impactRevenue:1000,severity:'yellow',status:'模擬中',freeze:false,reason:'中國區設備節能補助檔期提前一週，需求增加2,500台。',owner:'趙偉',ownerDept:'區域生管',versionFrom:'V06',versionTo:'V07'})
];

// 為其餘廠區補上示範事件，確保全球18廠皆可切換並查看完整流程。
const eventFactories=new Set(baseEvents.map(e=>e.factory));
regions.flatMap(r=>r.factories.map(([id])=>id)).filter(fid=>!eventFactories.has(fid)).forEach((fid,idx)=>{
  const sku=finishedGoods.find(s=>s.factory===fid)||finishedGoods[idx];
  const p=productLookup[sku.productId];
  const skuIndex=p.skus.findIndex(s=>s.id===sku.id);
  const n=11+idx,oldQty=4800+idx*620,newQty=oldQty+(idx%3===0?-900:700+idx*110);
  baseEvents.push(eventFrom(`CE-20260713-${String(n).padStart(3,'0')}`,p.id,skuIndex,{customer:['Regional OEM','Smart Energy Partner','Industrial Channel','Mobility Tier-1'][idx%4],title:idx%3===0?'客戶需求下修造成跨廠模組重新分配':'區域需求提前造成供應網路負荷上升',oldQty,newQty,oldDate:'2026/09/12',newDate:idx%3===0?'2026/09/12':'2026/09/07',oldPriority:3,priority:idx%2?2:3,revenue:2600+idx*310,impactRevenue:420+idx*95,severity:idx%4===0?'red':idx%3===0?'green':'yellow',status:idx%4===0?'待決策':'待評估',freeze:idx%2===0,reason:idx%3===0?'客戶調整專案規模，需要重新分配已備模組與外購料。':'區域專案提前，需同步評估友廠模組、SMT代工與外部料件供給。',owner:'區域計畫主管',ownerDept:`${factoryLookup[fid].regionName}供應鏈`,versionFrom:'V04',versionTo:'V05'}));
});

const bottleneckTemplates = [
  { id:'B01', type:'capacity', name:'最終組裝線 L3', gap:'240 小時', impactQty:1500, revenue:12000, difficulty:78, impact:88, severity:'red', dept:'製造一部', owner:'張志明', options:[
    {id:'overtime',name:'增加兩班加班',desc:'連續6日增加有效工時。',qty:750,cost:42,days:0,risk:'中'},
    {id:'outsource',name:'友廠代工組裝',desc:'由同產品族友廠處理部分半成品。',qty:650,cost:58,days:2,risk:'中'},
    {id:'resequence',name:'調整其他客戶順位',desc:'釋放共用產線與治具。',qty:1000,cost:8,days:0,risk:'客戶中'},
    {id:'extraShift',name:'臨時增開夜班',desc:'調用跨線認證人力。',qty:600,cost:51,days:0,risk:'品質中'}
  ]},
  { id:'B02', type:'material', name:'關鍵功率元件／IC', gap:'700 件', impactQty:700, revenue:3500, difficulty:64, impact:68, severity:'red', dept:'採購部', owner:'陳美玲', options:[
    {id:'expedite',name:'外部供應商加急',desc:'原供應商提前交付500件。',qty:500,cost:18,days:2,risk:'中'},
    {id:'air',name:'友廠空運調料',desc:'由區域友廠調撥可用庫存。',qty:300,cost:25,days:0,risk:'低'},
    {id:'secondSource',name:'第二供應商',desc:'啟動已完成初驗的替代供應商。',qty:700,cost:32,days:1,risk:'品質中'},
    {id:'substitute',name:'核准替代料',desc:'工程確認可替代，需客戶同意。',qty:400,cost:12,days:1,risk:'認證中'}
  ]},
  { id:'B03', type:'smt', name:'友廠 SMT 產能', gap:'36 小時', impactQty:480, revenue:1050, difficulty:52, impact:56, severity:'yellow', dept:'電子製造協同', owner:'吳家豪', options:[
    {id:'smtShift',name:'友廠SMT加班',desc:'委託友廠增開週末SMT班次。',qty:300,cost:14,days:0,risk:'人力中'},
    {id:'smtRoute',name:'切換第二SMT廠',desc:'使用已完成工藝認證的友廠線別。',qty:420,cost:22,days:1,risk:'切線中'},
    {id:'panelOptimize',name:'拼板最佳化',desc:'調整拼板與換線順序提高產出。',qty:220,cost:5,days:0,risk:'低'}
  ]},
  { id:'B04', type:'module', name:'跨廠功率模組供應', gap:'520 件', impactQty:520, revenue:1600, difficulty:58, impact:61, severity:'yellow', dept:'跨廠供應協同', owner:'許雅雯', options:[
    {id:'moduleTransfer',name:'友廠模組調撥',desc:'由同產品族友廠移轉可用模組。',qty:360,cost:16,days:1,risk:'物流低'},
    {id:'moduleOT',name:'供應廠加班',desc:'供應模組工廠增加兩日加班。',qty:300,cost:21,days:1,risk:'品質中'}
  ]}
];

const trackingBase = [
  {id:'T01',factory:'TW01',item:'UPS最終組裝加班工時',owner:'張志明',target:'120 小時',actual:'96 小時',reason:'夜班人力到位率80%，預估缺24小時。',severity:'yellow',action:'調用TW02支援'},
  {id:'T02',factory:'TW01',item:'功率元件到料',owner:'陳美玲',target:'12,600 件',actual:'12,100 件',reason:'外部供應商原承諾500件，最新確認只能提供200件。',severity:'red',action:'啟動第二供應商'},
  {id:'T03',factory:'CN03',item:'風扇控制板SMT產出',owner:'吳家豪',target:'7,800 件',actual:'7,640 件',reason:'換線與校驗晚4小時，缺口可於週末追回。',severity:'yellow',action:'核准週末班'},
  {id:'T04',factory:'CN02',item:'路由器策略插單',owner:'王磊',target:'17,600 件',actual:'預估 15,900 件',reason:'友廠通訊模組供給不足，跨廠調撥尚未核准。',severity:'red',action:'升級區域協調'},
  {id:'T05',factory:'TH06',item:'LED取消訂單材料處置',owner:'李娜',target:'呆料低於 ฿120萬',actual:'฿84萬',reason:'已轉用其他料號，剩餘包材待客戶確認。',severity:'green',action:'持續追蹤'},
  {id:'T06',factory:'TH03',item:'OBC換線次數控制',owner:'Narin S.',target:'≤ 14 次',actual:'13 次',reason:'已合併相近工藝批次。',severity:'green',action:'無需升級'},
  {id:'T07',factory:'CN05',item:'ESS量產爬坡',owner:'Kanya P.',target:'良率 95%',actual:'93.8%',reason:'新功率模組參數仍在優化，影響日產出約180台。',severity:'yellow',action:'工程駐線'}
];

function loadStored(key, fallback){ try { const raw=localStorage.getItem(key); return raw ? JSON.parse(raw) : fallback; } catch { return fallback; } }
function saveStored(key, value){ try { localStorage.setItem(key, JSON.stringify(value)); } catch {} }
function clearStored(keys){ try { keys.forEach(k=>localStorage.removeItem(k)); } catch {} }

const state = {
  region:'ALL',factory:'ALL',selectedEventId:baseEvents[0].id,selectedTaskId:'B01',selectedScenario:null,
  eventSeverity:'all',eventStatus:'all',trackingFilter:'all',simulated:null,simulationDimension:'product',
  networkProductId:baseEvents[0].productId,networkSkuId:baseEvents[0].sku,networkRelation:'all',
  events:loadStored('ct2-events',structuredClone(baseEvents)),tracking:loadStored('ct2-tracking',structuredClone(trackingBase)),
  commits:loadStored('ct2-commits',{}),decisions:loadStored('ct2-decisions',{})
};

const $=s=>document.querySelector(s);
const $$=s=>[...document.querySelectorAll(s)];
const fmt=n=>new Intl.NumberFormat('zh-TW').format(Math.round(Number(n)||0));
const money=n=>`${fmt(n)} 萬`;
const sevLabel={red:'紅燈',yellow:'黃燈',green:'綠燈'};
const typeLabel={external:'外部供應商',module:'友廠模組',smt:'友廠 SMT',transfer:'跨廠調撥'};
const sevTag=s=>`<span class="tag ${s==='red'?'danger':s==='yellow'?'warning':'success'}"><i class="signal ${s}"></i>${sevLabel[s]}</span>`;
const relationTag=t=>`<span class="relation-tag ${t}">${typeLabel[t]||t}</span>`;

function init(){ setupFilters();setupNavigation();setupInteractions();setupNetworkControls();renderAll();setupTour(); }

function setupFilters(){
  $('#regionSelect').innerHTML=`<option value="ALL">全球｜18座工廠</option>`+regions.map(r=>`<option value="${r.id}">${r.name}｜${r.factories.length}座工廠</option>`).join('');
  $('#regionSelect').value=state.region;
  $('#regionSelect').addEventListener('change',e=>{state.region=e.target.value;state.factory='ALL';updateFactoryOptions();ensureSelectedEvent();syncNetworkSelectionToScope();renderAll();});
  updateFactoryOptions();
  $('#factorySelect').addEventListener('change',e=>{state.factory=e.target.value;ensureSelectedEvent();syncNetworkSelectionToScope();renderAll();});
}
function updateFactoryOptions(){
  const factories=state.region==='ALL'?regions.flatMap(r=>r.factories):regions.find(r=>r.id===state.region).factories;
  $('#factorySelect').innerHTML=`<option value="ALL">全部工廠</option>`+factories.map(([id,name])=>`<option value="${id}">${id}｜${name}</option>`).join('');
  $('#factorySelect').value=state.factory;
}
function setupNavigation(){
  $$('.nav-item').forEach(btn=>btn.addEventListener('click',()=>switchView(btn.dataset.view)));
  $$('.jump-view').forEach(btn=>btn.addEventListener('click',()=>switchView(btn.dataset.target)));
  $('#menuToggle').addEventListener('click',()=>{$('#sidebar').classList.add('open');$('#overlay').classList.add('show');});
  $('#overlay').addEventListener('click',closeOverlays);
}
function switchView(view,preserveOverlay=false){
  $$('.nav-item').forEach(n=>n.classList.toggle('active',n.dataset.view===view));
  $$('.view').forEach(v=>v.classList.toggle('active',v.id===`view-${view}`));
  const names={overview:'總覽控制塔',events:'需求變更事件',simulation:'有限／無限模擬',network:'供應網路與 BOM',bottlenecks:'瓶頸分析',commit:'責任人 Commit',decision:'跨部門決策室',tracking:'執行追蹤與 Highlight'};
  $('#pageTitle').textContent=names[view];
  if(!preserveOverlay)closeOverlays();
  window.scrollTo({top:0,behavior:'smooth'});
}
function setupInteractions(){
  $('#eventSeverityFilter').addEventListener('change',e=>{state.eventSeverity=e.target.value;renderEvents();});
  $('#eventStatusFilter').addEventListener('change',e=>{state.eventStatus=e.target.value;renderEvents();});
  $('#quantitySlider').addEventListener('input',updateSimulationOutputs);
  $('#dateSlider').addEventListener('input',updateSimulationOutputs);
  $('#runSimulation').addEventListener('click',()=>runSimulation(true));
  $('#approveScenario').addEventListener('click',approveSelectedScenario);
  $$('#simulationDimension .segment').forEach(b=>b.addEventListener('click',()=>{state.simulationDimension=b.dataset.dimension;renderSimulationBreakdown();}));
  $('#resetDemo').addEventListener('click',()=>{
    clearStored(['ct2-events','ct2-tracking','ct2-commits','ct2-decisions']);
    state.events=structuredClone(baseEvents);state.tracking=structuredClone(trackingBase);state.commits={};state.decisions={};
    state.selectedEventId=baseEvents[0].id;state.selectedScenario=null;state.simulated=null;state.networkProductId=baseEvents[0].productId;state.networkSkuId=baseEvents[0].sku;
    renderAll();toast('示範資料已重設');
  });
}
function setupNetworkControls(){
  $('#networkProductSelect').addEventListener('change',e=>{state.networkProductId=e.target.value;state.networkSkuId=productLookup[state.networkProductId].skus[0].id;renderNetwork();});
  $('#networkSkuSelect').addEventListener('change',e=>{state.networkSkuId=e.target.value;renderNetwork();});
  $('#networkRelationSelect').addEventListener('change',e=>{state.networkRelation=e.target.value;renderNetwork();});
}

function filteredEvents(){return state.events.filter(e=>(state.region==='ALL'||e.region===state.region)&&(state.factory==='ALL'||e.factory===state.factory));}
function ensureSelectedEvent(){const f=filteredEvents();if(f.length&&!f.some(e=>e.id===state.selectedEventId))state.selectedEventId=f[0].id;}
function selectedEvent(){return state.events.find(e=>e.id===state.selectedEventId)||state.events[0];}
function factoryName(id){return factoryLookup[id]?.name||id;}
function inScopeFactory(fid){return (state.region==='ALL'||factoryLookup[fid]?.region===state.region)&&(state.factory==='ALL'||fid===state.factory);}
function scopeProducts(){
  const ids=new Set(finishedGoods.filter(s=>inScopeFactory(s.factory)||s.alternateFactories.some(inScopeFactory)).map(s=>s.productId));
  return productTypes.filter(p=>ids.has(p.id));
}
function syncNetworkSelectionToScope(){
  const products=scopeProducts();
  if(!products.some(p=>p.id===state.networkProductId))state.networkProductId=(products[0]||productTypes[0]).id;
  const skus=productLookup[state.networkProductId].skus.filter(s=>state.factory==='ALL'||s.factory===state.factory||s.alternateFactories.includes(state.factory));
  if(!skus.some(s=>s.id===state.networkSkuId))state.networkSkuId=(skus[0]||productLookup[state.networkProductId].skus[0]).id;
}

function renderAll(){renderContext();renderOverview();renderEvents();renderSimulation();renderNetwork();renderBottlenecks();renderCommit();renderDecision();renderTracking();}
function renderContext(){
  let label='全球｜18座工廠';
  if(state.factory!=='ALL')label=`${factoryLookup[state.factory].regionName}｜${factoryName(state.factory)}`;
  else if(state.region!=='ALL'){const r=regions.find(x=>x.id===state.region);label=`${r.name}｜${r.factories.length}座工廠`;}
  $('#currentScope').textContent=label;$('#currentVersion').textContent=`Demand ${selectedEvent().versionTo}`;
  $('#lastUpdated').textContent=new Intl.DateTimeFormat('zh-TW',{year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hour12:false,timeZone:'Asia/Taipei'}).format(new Date());
}

function renderOverview(){
  const ev=filteredEvents(),red=ev.filter(x=>x.severity==='red').length,impact=ev.reduce((s,e)=>s+Math.max(0,e.impactRevenue),0);
  const plantCount=state.factory!=='ALL'?1:state.region==='ALL'?18:regions.find(r=>r.id===state.region).factories.length;
  const productCount=scopeProducts().length;
  const kpis=[['重大變更事件',ev.length,'本期進入管理流程','⚡','tone-blue'],['紅燈承諾風險',red,'需跨部門或高階決策','!','tone-red'],['預估營收影響',money(impact),`涵蓋 ${plantCount} 座工廠`,'$','tone-yellow'],['產品與成品料號',`${productCount}／${finishedGoods.filter(s=>inScopeFactory(s.factory)).length}`,`產品類型／主要生產料號`,'▦','tone-green']];
  $('#kpiGrid').innerHTML=kpis.map(([l,v,n,i,t])=>`<article class="kpi-card ${t}"><div class="kpi-top"><div><div class="kpi-label">${l}</div><div class="kpi-value">${v}</div><div class="kpi-note">${n}</div></div><div class="kpi-icon">${i}</div></div></article>`).join('');
  $('#overviewEventList').innerHTML=ev.slice(0,5).map(eventCard).join('')||'<div class="empty-state">此範圍目前沒有需求變更</div>';bindEventCards('#overviewEventList');
  const factories=[...new Set(ev.map(e=>e.factory))].map(fid=>{const items=ev.filter(e=>e.factory===fid);return{fid,score:items.reduce((s,e)=>s+Math.max(0,e.impactRevenue)+(e.severity==='red'?900:200),0),events:items.length};}).sort((a,b)=>b.score-a.score).slice(0,6);
  const max=Math.max(...factories.map(x=>x.score),1);
  $('#factoryRiskList').innerHTML=factories.map((x,i)=>`<div class="rank-item"><div class="rank-no">${i+1}</div><div class="rank-name"><strong>${x.fid}｜${factoryName(x.fid)}</strong><span>${x.events}件變更事件</span><div class="progress"><i style="width:${x.score/max*100}%"></i></div></div><div class="rank-value">${money(x.score)}</div></div>`).join('')||'<div class="empty-state">沒有風險資料</div>';
  renderHotspot('#overviewHotspot',bottleneckTemplates);
  const dq=ev.filter(e=>e.status==='待決策').slice(0,4);$('#decisionCountTag').textContent=`${dq.length}件待核准`;
  $('#decisionQueue').innerHTML=dq.map(e=>`<div class="decision-item"><div><strong>${e.customer}｜${e.product}</strong><span>${e.factory}・${e.sku}</span></div><button class="action-link decision-jump" data-id="${e.id}">進入決策</button></div>`).join('')||'<div class="empty-state">目前沒有待決策事項</div>';
  $$('.decision-jump').forEach(b=>b.addEventListener('click',()=>{state.selectedEventId=b.dataset.id;state.selectedScenario=null;renderAll();switchView('decision');}));
}
function eventCard(e){return `<div class="event-item ${e.id===state.selectedEventId?'active':''}" data-event-id="${e.id}"><div class="event-row"><span class="event-id">${e.id}</span>${sevTag(e.severity)}</div><div class="event-title">${e.customer}｜${e.product}</div><div class="event-meta"><span>${e.factory} ${factoryName(e.factory)}</span><span>${e.sku}</span><span>${e.status}</span><span>${e.versionFrom} → ${e.versionTo}</span></div></div>`;}
function bindEventCards(scope){$$(`${scope} .event-item`).forEach(el=>el.addEventListener('click',()=>{state.selectedEventId=el.dataset.eventId;state.selectedScenario=null;const e=selectedEvent();state.networkProductId=e.productId;state.networkSkuId=e.sku;renderAll();if(scope==='#overviewEventList')switchView('events');}));}

function renderEvents(){
  const items=filteredEvents().filter(e=>(state.eventSeverity==='all'||e.severity===state.eventSeverity)&&(state.eventStatus==='all'||e.status===state.eventStatus));
  $('#eventSeverityFilter').value=state.eventSeverity;$('#eventStatusFilter').value=state.eventStatus;
  $('#eventList').innerHTML=items.map(eventCard).join('')||'<div class="empty-state">沒有符合條件的事件</div>';bindEventCards('#eventList');
  const e=selectedEvent(),qtyDelta=e.newQty-e.oldQty,days=dateDiff(e.newDate,e.oldDate);
  $('#eventDetail').innerHTML=`
    <div class="detail-hero"><p class="eyebrow">${e.id}・${e.factory} ${factoryName(e.factory)}</p><h2>${e.product}</h2><p>${e.customer}｜${e.sku}｜${e.title}</p></div>
    <div class="event-row"><div><span class="event-id">事件狀態</span><div style="margin-top:5px"><span class="tag neutral">${e.status}</span> ${e.freeze?'<span class="tag danger">進入凍結區</span>':'<span class="tag info">彈性區</span>'}</div></div>${sevTag(e.severity)}</div>
    <div class="detail-grid" style="margin-top:16px"><div class="detail-stat"><span>數量變化</span><strong class="${qtyDelta>=0?'delta-up':'delta-down'}">${qtyDelta>=0?'+':''}${fmt(qtyDelta)} 件</strong></div><div class="detail-stat"><span>交期變化</span><strong class="${days<0?'delta-up':''}">${days===0?'不變':days<0?`提前 ${Math.abs(days)} 天`:`延後 ${days} 天`}</strong></div><div class="detail-stat"><span>預估營收影響</span><strong>${money(e.impactRevenue)}</strong></div><div class="detail-stat"><span>事件負責人</span><strong>${e.owner}</strong><span>${e.ownerDept}</span></div></div>
    <h3>需求版本差異</h3><table class="version-compare"><thead><tr><th>項目</th><th>${e.versionFrom}</th><th>${e.versionTo}</th><th>差異</th></tr></thead><tbody><tr><td>成品料號</td><td>${e.sku}</td><td>${e.sku}</td><td>${e.product}</td></tr><tr><td>需求數量</td><td>${fmt(e.oldQty)}</td><td>${fmt(e.newQty)}</td><td class="${qtyDelta>=0?'delta-up':'delta-down'}">${qtyDelta>=0?'+':''}${fmt(qtyDelta)}</td></tr><tr><td>需求日期</td><td>${formatDate(e.oldDate)}</td><td>${formatDate(e.newDate)}</td><td>${days===0?'—':days<0?`提前${Math.abs(days)}天`:`延後${days}天`}</td></tr><tr><td>優先順序</td><td>P${e.oldPriority}</td><td>P${e.priority}</td><td>${e.priority<e.oldPriority?'提高':'不變'}</td></tr></tbody></table>
    <div class="reason-box"><strong>變更原因：</strong>${e.reason}</div>
    <div class="detail-actions"><button class="primary-button event-action" data-action="模擬中">接受進入模擬</button><button class="secondary-button event-action" data-action="待補件">退回補充理由</button><button class="secondary-button event-action" data-action="下期處理">併入下次週期</button><button class="danger-button event-action" data-action="待決策">緊急升級</button><button class="secondary-button" id="openEventNetwork">查看供應網路</button></div>`;
  $$('.event-action').forEach(b=>b.addEventListener('click',()=>{e.status=b.dataset.action;persist();renderAll();toast(`事件已更新為「${e.status}」`);if(e.status==='模擬中')switchView('simulation');}));
  $('#openEventNetwork').addEventListener('click',()=>{state.networkProductId=e.productId;state.networkSkuId=e.sku;renderNetwork();switchView('network');});
}

function renderSimulation(){
  const e=selectedEvent();
  $('#simulationSubtitle').textContent=`${e.id}｜${e.customer}｜${e.product} ${e.sku}｜需求 ${e.versionFrom} → ${e.versionTo}`;
  const delta=Math.max(0,e.newQty-e.oldQty);
  $('#quantitySlider').value=state.simulated?.eventId===e.id?state.simulated.extra:delta;$('#dateSlider').value=state.simulated?.eventId===e.id?state.simulated.earlier:Math.max(0,-dateDiff(e.newDate,e.oldDate));$('#prioritySelect').value=String(e.priority);
  updateSimulationOutputs();runSimulation(false);
}
function updateSimulationOutputs(){$('#quantityOutput').textContent=`+${fmt(Number($('#quantitySlider').value))} 件`;$('#dateOutput').textContent=`提前 ${$('#dateSlider').value} 天`;}
function runSimulation(showToast=false){
  const e=selectedEvent(),extra=Number($('#quantitySlider').value),earlier=Number($('#dateSlider').value),priority=Number($('#prioritySelect').value),demand=Math.max(100,e.oldQty+extra);
  const skuRelations=supplyRelations.filter(r=>r.skuId===e.sku);const supplyFactor=skuRelations.reduce((s,r)=>s+r.coverage,0)/Math.max(1,skuRelations.length);
  const pressure=1+extra/Math.max(1,e.oldQty)*.72+earlier*.022+(4-priority)*.035;
  const baseCapacity=e.oldQty*(.91+Math.min(1.04,supplyFactor)*.05);const finite=Math.min(demand,Math.round(baseCapacity/pressure+e.oldQty*.10));const gap=Math.max(0,demand-finite);const completionDelay=Math.ceil(gap/Math.max(300,e.oldQty*.06));
  const capHours=Math.round(demand*.08),mat=demand,test=Math.round(demand*.04);
  state.simulated={eventId:e.id,extra,earlier,priority,demand,finite,gap,completionDelay,capHours,mat,test};
  $('#unlimitedMetrics').innerHTML=metricRows([['需求完成數量',`${fmt(demand)} 件`,100],['理論完成日期',formatDate(shiftDate(e.oldDate,-earlier)),100],['成品與模組所需工時',`${fmt(capHours)} 小時`,Math.min(100,pressure*72)],['關鍵料件需求',`${fmt(mat)} 件`,100],['友廠SMT需求',`${fmt(test)} 小時`,Math.min(100,pressure*78)]]);
  $('#finiteMetrics').innerHTML=metricRows([['可完成數量',`${fmt(finite)} 件`,finite/demand*100],['預估完成日期',formatDate(shiftDate(e.newDate,completionDelay)),Math.max(30,100-completionDelay*8)],['可用產能',`${fmt(Math.round(capHours*(finite/demand)))} 小時`,finite/demand*100],['可用關鍵料件',`${fmt(Math.round(mat*(finite/demand+.015)))} 件`,Math.min(100,(finite/demand+.015)*100)],['可取得SMT產能',`${fmt(Math.round(test*(finite/demand+.03)))} 小時`,Math.min(100,(finite/demand+.03)*100)]]);
  $('#gapTag').textContent=`缺口 ${fmt(gap)} 件`;const lost=Math.round(gap*(e.revenue/Math.max(1,e.newQty)));
  $('#gapAnalysis').innerHTML=`<div class="gap-summary"><div class="gap-card"><span>未滿足需求</span><strong class="delta-up">${fmt(gap)} 件</strong></div><div class="gap-card"><span>預估延遲</span><strong>${completionDelay} 天</strong></div><div class="gap-card"><span>營收曝險</span><strong>${money(lost)}</strong></div><div class="gap-card"><span>受影響供應關係</span><strong>${skuRelations.filter(r=>r.severity!=='green').length} 條</strong></div></div><div class="impact-list">${scenarioBottlenecks().map((b,i)=>`<div class="impact-row"><div><h3>${i+1}. ${b.name}</h3><p>${b.dept}｜${b.owner}</p></div><div><div class="progress"><i style="width:${Math.min(100,b.impact)}%;background:${b.severity==='red'?'#c83b49':'#bd8211'}"></i></div><p>缺口 ${b.gap}，影響 ${fmt(Math.round(b.impactQty*(gap/Math.max(1,3000)+.5)))} 件</p></div>${sevTag(b.severity)}</div>`).join('')}</div>`;
  renderSimulationBreakdown();if(showToast)toast('情境模擬已重新計算；尚未成為正式計畫');
}
function metricRows(items){return items.map(([l,v,p])=>`<div class="metric-row"><div class="metric-line"><span>${l}</span><strong>${v}</strong></div><div class="bar-track"><i style="width:${Math.max(4,Math.min(100,p))}%"></i></div></div>`).join('');}
function simulationProductRows(){
  const e=selectedEvent(),products=scopeProducts();
  return products.map((p,idx)=>{
    const skus=p.skus.filter(s=>inScopeFactory(s.factory)||s.alternateFactories.some(inScopeFactory));
    const base=skus.reduce((s,x)=>s+x.weeklyDemand,0);const demand=Math.round(base*(1.45+(idx%4)*.14)+(p.id===e.productId?(state.simulated?.extra||0):0));
    const rel=supplyRelations.filter(r=>r.productId===p.id&&(state.region==='ALL'||inScopeFactory(r.target)));const coverage=rel.reduce((s,r)=>s+r.coverage,0)/Math.max(1,rel.length);
    const finite=Math.min(demand,Math.round(demand*(.81+Math.min(1,coverage)*.16-(idx%3)*.018)));const gap=Math.max(0,demand-finite);
    const bottleneck=rel.sort((a,b)=>a.coverage-b.coverage)[0];return{name:p.name,sub:`${p.category}｜${skus.length}個料號`,demand,finite,gap,rate:finite/demand,bottleneck:bottleneck?.item||'共用產能'};
  }).sort((a,b)=>b.gap-a.gap).slice(0,14);
}
function simulationCustomerRows(){
  const customers=['CloudGrid Data Center','GlobalTel','E-Motion Motors','AutoFab Systems','GreenIsland Utility','AeroCompute','SafeCity Integrator','Metro Lighting','Dragon Automation','Siam Microgrid'];
  return customers.map((c,idx)=>{
    const evs=state.events.filter(e=>e.customer===c&&(state.region==='ALL'||e.region===state.region)&&(state.factory==='ALL'||e.factory===state.factory));
    const demand=evs.length?evs.reduce((s,e)=>s+e.newQty,0):4200+((idx*1873)%8600);const priority=evs[0]?.priority||((idx%3)+1);
    const finite=Math.round(demand*(.79+(idx%5)*.035+(4-priority)*.018));const gap=Math.max(0,demand-finite);
    const mix=evs.length?[...new Set(evs.map(e=>e.product))].join('、'):productTypes[(idx*2)%productTypes.length].name;
    return{name:c,sub:`P${priority}｜${mix}`,demand,finite,gap,rate:finite/demand,bottleneck:gap/demand>.15?'跨廠模組／物料':'最終產能'};
  }).filter(r=>r.demand>0).sort((a,b)=>b.gap-a.gap);
}
function renderSimulationBreakdown(){
  $$('#simulationDimension .segment').forEach(b=>b.classList.toggle('active',b.dataset.dimension===state.simulationDimension));
  const byProduct=state.simulationDimension==='product',rows=byProduct?simulationProductRows():simulationCustomerRows();
  $('#simulationBreakdownHead').innerHTML=`<tr><th>${byProduct?'產品類型':'客戶'}</th><th>無限需求</th><th>有限可達</th><th>缺口</th><th>滿足率</th><th>主要限制</th><th>狀態</th></tr>`;
  $('#simulationBreakdownBody').innerHTML=rows.map(r=>{const sev=r.rate<.88?'red':r.rate<.96?'yellow':'green';return `<tr><td><strong>${r.name}</strong><br><span class="event-id">${r.sub}</span></td><td>${fmt(r.demand)}</td><td>${fmt(r.finite)}</td><td class="${r.gap?'delta-up':'delta-down'}">${fmt(r.gap)}</td><td><div class="coverage-cell"><strong>${(r.rate*100).toFixed(1)}%</strong><div class="progress"><i style="width:${r.rate*100}%"></i></div></div></td><td>${r.bottleneck}</td><td>${sevTag(sev)}</td></tr>`;}).join('');
}

function networkProductOptions(){return scopeProducts();}
function renderNetwork(){
  syncNetworkSelectionToScope();const products=networkProductOptions();
  $('#networkProductSelect').innerHTML=products.map(p=>`<option value="${p.id}">${p.category}｜${p.name}</option>`).join('');$('#networkProductSelect').value=state.networkProductId;
  const p=productLookup[state.networkProductId];const skuOptions=p.skus.filter(s=>state.factory==='ALL'||s.factory===state.factory||s.alternateFactories.includes(state.factory));
  $('#networkSkuSelect').innerHTML=(skuOptions.length?skuOptions:p.skus).map(s=>`<option value="${s.id}">${s.id}｜${s.name}</option>`).join('');if(!skuLookup[state.networkSkuId]||skuLookup[state.networkSkuId].productId!==p.id)state.networkSkuId=(skuOptions[0]||p.skus[0]).id;$('#networkSkuSelect').value=state.networkSkuId;$('#networkRelationSelect').value=state.networkRelation;
  const sku=skuLookup[state.networkSkuId];let rels=supplyRelations.filter(r=>r.skuId===sku.id);if(state.networkRelation!=='all')rels=rels.filter(r=>r.type===state.networkRelation);
  if(state.region!=='ALL')rels=rels.filter(r=>factoryLookup[r.target]?.region===state.region||factoryLookup[r.source]?.region===state.region);if(state.factory!=='ALL')rels=rels.filter(r=>r.target===state.factory||r.source===state.factory);
  const allSkuRels=supplyRelations.filter(r=>r.skuId===sku.id);const ext=allSkuRels.filter(r=>r.type==='external').length,inter=allSkuRels.filter(r=>['module','transfer'].includes(r.type)).length,smt=allSkuRels.filter(r=>r.type==='smt').length,avg=allSkuRels.reduce((s,r)=>s+r.coverage,0)/Math.max(1,allSkuRels.length);
  $('#networkKpis').innerHTML=[['外部供應商',ext,'關鍵料與現成模組','E','tone-blue'],['友廠供應關係',inter,'模組供應與備援調撥','↔','tone-green'],['友廠 SMT 代工',smt,'跨廠電子製造協同','S','tone-yellow'],['整體供給覆蓋率',`${(avg*100).toFixed(1)}%`,`${allSkuRels.filter(r=>r.severity==='red').length}條紅燈關係`,'% ',avg<.9?'tone-red':'tone-green']].map(([l,v,n,i,t])=>`<article class="kpi-card ${t}"><div class="kpi-top"><div><div class="kpi-label">${l}</div><div class="kpi-value">${v}</div><div class="kpi-note">${n}</div></div><div class="kpi-icon">${i}</div></div></article>`).join('');
  renderSupplyMap(sku,rels.length?rels:allSkuRels);renderBom(sku);
  $('#networkRelationCount').textContent=`${rels.length}條關係｜${sku.factory}主要生產`;
  $('#networkRelationTable').innerHTML=rels.sort((a,b)=>a.coverage-b.coverage).map(r=>`<tr><td><strong>${factoryLookup[r.source]?`${r.source}｜${factoryName(r.source)}`:r.source}</strong></td><td>${relationTag(r.type)}</td><td>${r.item}<br><span class="event-id">${r.skuId}</span></td><td>${r.target}<br><span class="event-id">${factoryName(r.target)}</span></td><td>${fmt(r.demand)}</td><td>${fmt(r.supply)}</td><td><div class="coverage-cell"><strong>${(r.coverage*100).toFixed(1)}%</strong><div class="progress"><i style="width:${Math.min(100,r.coverage*100)}%"></i></div></div></td><td>${r.lead}天</td><td>${sevTag(r.severity)}</td></tr>`).join('')||'<tr><td colspan="9">此篩選條件沒有供應關係</td></tr>';
}
function renderSupplyMap(sku,rels){
  const limited=rels.slice(0,10),cx=500,cy=235,radiusX=375,radiusY=165;
  const lineColor={external:'#64748b',module:'#1976d2',smt:'#8b5cf6',transfer:'#16936b'};
  const lines=[],nodes=[];
  limited.forEach((rel,i)=>{const angle=(Math.PI*2*i/limited.length)-Math.PI/2,x=cx+Math.cos(angle)*radiusX,y=cy+Math.sin(angle)*radiusY;lines.push(`<line x1="${x}" y1="${y}" x2="${cx}" y2="${cy}" class="network-edge ${rel.type}"/><text x="${(x+cx)/2}" y="${(y+cy)/2-5}" class="edge-label">${(rel.coverage*100).toFixed(0)}%</text>`);const label=factoryLookup[rel.source]?`${rel.source} ${factoryName(rel.source)}`:rel.source;nodes.push(`<g class="network-svg-node source-node" data-type="${rel.type}"><circle cx="${x}" cy="${y}" r="34" fill="${lineColor[rel.type]}"/><text x="${x}" y="${y-3}" text-anchor="middle">${truncate(label,12)}</text><text x="${x}" y="${y+12}" text-anchor="middle" class="node-sub">${truncate(rel.item,10)}</text><title>${label} → ${rel.target}\n${rel.item}\n供給覆蓋率 ${(rel.coverage*100).toFixed(1)}%</title></g>`);});
  $('#supplyNetworkMap').innerHTML=`<svg viewBox="0 0 1000 470" role="img" aria-label="${sku.name}供應網路"><defs><marker id="arrow" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto"><path d="M0,0 L0,6 L7,3 z" fill="#7f8fa3"/></marker></defs>${lines.join('')}<g class="network-svg-node target-node"><circle cx="${cx}" cy="${cy}" r="62"/><text x="${cx}" y="${cy-10}" text-anchor="middle">${sku.factory}</text><text x="${cx}" y="${cy+8}" text-anchor="middle" class="node-sub">${truncate(sku.id,14)}</text><text x="${cx}" y="${cy+25}" text-anchor="middle" class="node-sub">${truncate(productLookup[sku.productId].name,12)}</text><title>${sku.factory}｜${factoryName(sku.factory)}\n${sku.name}</title></g>${nodes.join('')}</svg>`;
  $$('.network-svg-node.source-node').forEach(n=>n.addEventListener('click',()=>{state.networkRelation=n.dataset.type;$('#networkRelationSelect').value=state.networkRelation;renderNetwork();}));
}
function maxBomDepth(node,level=1){return node.children?.length?Math.max(...node.children.map(c=>maxBomDepth(c,level+1))):level;}
function countBomNodes(node){return 1+(node.children||[]).reduce((s,c)=>s+countBomNodes(c),0);}
function renderBom(sku){
  const depth=maxBomDepth(sku.bom);$('#bomDepthTag').textContent=`最深 ${depth} 階`;
  $('#bomSummary').innerHTML=`<div><span>成品料號</span><strong>${sku.id}</strong></div><div><span>主要工廠</span><strong>${sku.factory}｜${factoryName(sku.factory)}</strong></div><div><span>BOM節點</span><strong>${countBomNodes(sku.bom)}項</strong></div>`;
  $('#bomTree').innerHTML=bomNodeHtml(sku.bom,1);
}
function bomNodeHtml(node,level){
  const children=node.children||[],has=children.length>0;const source=sourceDisplay(node.source);const badge=node.supplyType&&node.supplyType!=='make'?`<span class="bom-source ${node.supplyType}">${node.supplyType==='external'?'外購':node.supplyType==='module'?'友廠模組':node.supplyType==='smt'?'友廠SMT':node.supplyType==='internal'?'內部':'自製'}</span>`:'';
  if(!has)return `<div class="bom-leaf level-${level}"><span class="bom-level">L${level}</span><div><strong>${node.name}</strong><span>${node.id}｜${node.kind}｜${source}</span></div>${badge}</div>`;
  return `<details class="bom-branch level-${level}" ${level<=2?'open':''}><summary><span class="bom-level">L${level}</span><div><strong>${node.name}</strong><span>${node.id}｜${node.kind}｜${source}</span></div>${badge}</summary><div class="bom-children">${children.map(c=>bomNodeHtml(c,level+1)).join('')}</div></details>`;
}
function sourceDisplay(source){return factoryLookup[source]?`${source} ${factoryName(source)}`:source;}
function truncate(text,n){const t=String(text);return t.length>n?`${t.slice(0,n)}…`:t;}

function scenarioBottlenecks(){const e=selectedEvent();return bottleneckTemplates.map((b,i)=>({...b,id:`${b.id}-${e.factory}`,location:e.factory,gap:i===0?`${Math.max(36,Math.round((state.simulated?.gap||2200)*.109))} 小時`:b.gap}));}
function renderBottlenecks(){
  const list=scenarioBottlenecks();$('#bottleneckMatrix').innerHTML='<span class="axis-y">營收與交付影響 ↑</span><span class="axis-x">處理難度 →</span>'+list.map(b=>`<div class="matrix-dot ${b.severity}" title="${b.name}" style="left:${b.difficulty}%;bottom:${b.impact}%">${b.name.replace(' ','<br>')}</div>`).join('');
  $('#bottleneckTable').innerHTML=list.map(b=>`<tr><td><strong>${b.name}</strong><br><span class="event-id">${b.type.toUpperCase()}</span></td><td>${b.location}<br><span class="event-id">${factoryName(b.location)}</span></td><td>${b.gap}</td><td>${fmt(b.impactQty)} 件</td><td>${money(b.revenue)}</td><td class="owner-cell"><strong>${b.owner}</strong><span>${b.dept}</span></td><td>${sevTag(b.severity)}</td></tr>`).join('');
}
function renderHotspot(sel,list){$(sel).innerHTML=list.map(b=>`<span class="hotspot-dot ${b.severity}" style="left:${b.difficulty}%;bottom:${b.impact}%">${b.name}</span>`).join('');}

function renderCommit(){
  const tasks=scenarioBottlenecks();$('#commitTaskCount').textContent=`${tasks.length}項待處理`;
  $('#commitTaskList').innerHTML=tasks.map(t=>`<div class="task-card ${state.selectedTaskId.startsWith(t.id.split('-')[0])?'active':''}" data-task="${t.id}"><div class="event-row"><span class="event-id">${t.id}</span>${sevTag(t.severity)}</div><h3>${t.name}</h3><p>${t.location} ${factoryName(t.location)}｜${t.dept}・${t.owner}</p><p>缺口 ${t.gap}｜影響 ${fmt(t.impactQty)}件</p></div>`).join('');
  $$('.task-card').forEach(x=>x.addEventListener('click',()=>{state.selectedTaskId=x.dataset.task;renderCommit();}));let task=tasks.find(t=>t.id===state.selectedTaskId);if(!task){task=tasks[0];state.selectedTaskId=task.id;}renderCommitWorkbench(task);
}
function renderCommitWorkbench(task){
  const e=selectedEvent(),saved=state.commits[`${e.id}-${task.id}`]||{selected:[]};
  $('#commitWorkbench').innerHTML=`<div class="workbench-hero"><p class="eyebrow">${e.id}｜${task.id}</p><h2>${e.product}－${task.name}處理承諾</h2><p>${e.customer}｜${e.sku}｜原始承諾 ${fmt(e.oldQty)}件／${formatDate(e.oldDate)}；新增要求 ${fmt(Math.max(0,e.newQty-e.oldQty))}件</p></div><div class="detail-grid"><div class="detail-stat"><span>目前缺口</span><strong>${task.gap}</strong></div><div class="detail-stat"><span>影響數量</span><strong>${fmt(task.impactQty)} 件</strong></div><div class="detail-stat"><span>責任人</span><strong>${task.owner}</strong><span>${task.dept}</span></div><div class="detail-stat"><span>需求版本</span><strong>${e.versionTo}</strong><span>承諾須綁定版本</span></div></div><h3>選擇處理方案</h3><div class="option-grid">${task.options.map(o=>`<label class="option-card ${saved.selected.includes(o.id)?'selected':''}"><input type="checkbox" value="${o.id}" ${saved.selected.includes(o.id)?'checked':''}><h3>${o.name}</h3><p>${o.desc}</p><div class="option-metrics"><span>＋${fmt(o.qty)}件</span><span>成本 ${money(o.cost)}</span><span>風險 ${o.risk}</span></div></label>`).join('')}</div><div class="commit-preview" id="commitPreview"></div><h3>承諾前提</h3><ul class="assumption-list"><li>需求版本維持 ${e.versionTo}，數量與優先順序不再變更。</li><li>相關加班、空運、友廠SMT或模組代工成本由決策主管核准。</li><li>跨廠調料、替代料與工藝路徑已完成品質及客戶核可。</li></ul><div class="detail-actions"><button class="primary-button" id="submitCommit">提交 Commit</button><button class="secondary-button" id="clearCommit">清除選擇</button></div>`;
  $$('.option-card input').forEach(inp=>inp.addEventListener('change',()=>{inp.closest('.option-card').classList.toggle('selected',inp.checked);updateCommitPreview(task);}));
  $('#clearCommit').addEventListener('click',()=>{$$('.option-card input').forEach(i=>{i.checked=false;i.closest('.option-card').classList.remove('selected');});updateCommitPreview(task);});
  $('#submitCommit').addEventListener('click',()=>{const selected=$$('.option-card input:checked').map(x=>x.value);if(!selected.length){toast('請至少選擇一個處理方案');return;}const calc=calcCommit(task,selected);state.commits[`${e.id}-${task.id}`]={selected,...calc,submitted:true};persist();renderCommit();toast(`${task.owner} 的 Commit 已提交`);});updateCommitPreview(task);
}
function calcCommit(task,selected){const opts=task.options.filter(o=>selected.includes(o.id)),recovered=opts.reduce((s,o)=>s+o.qty,0),cost=opts.reduce((s,o)=>s+o.cost,0),maxDays=Math.max(0,...opts.map(o=>o.days));const e=selectedEvent(),base=state.simulated?.finite||Math.round(e.oldQty*.92),commitQty=Math.min(e.newQty,base+recovered);return{recovered,cost,maxDays,commitQty,remaining:Math.max(0,e.newQty-commitQty)};}
function updateCommitPreview(task){const selected=$$('.option-card input:checked').map(x=>x.value),c=calcCommit(task,selected),e=selectedEvent();$('#commitPreview').innerHTML=`<div class="commit-preview-grid"><div><span>可回收缺口</span><strong>+${fmt(c.recovered)} 件</strong></div><div><span>承諾數量</span><strong>${fmt(c.commitQty)} 件</strong></div><div><span>剩餘缺口</span><strong class="${c.remaining?'delta-up':'delta-down'}">${fmt(c.remaining)} 件</strong></div><div><span>額外成本</span><strong>${money(c.cost)}</strong></div></div><p class="muted" style="margin:10px 0 0">建議承諾：${formatDate(e.newDate)} 前完成 ${fmt(c.commitQty)} 件；剩餘 ${fmt(c.remaining)} 件於 ${formatDate(shiftDate(e.newDate,c.maxDays+2))} 前完成。</p>`;}

function buildScenarios(){
  const e=selectedEvent(),sim=state.simulated?.eventId===e.id?state.simulated:null,finite=sim?.finite||Math.round(e.oldQty*.92),demand=sim?.demand||e.newQty,commits=Object.entries(state.commits).filter(([k,v])=>k.startsWith(`${e.id}-`)&&v.submitted).map(([,v])=>v),committedRecovery=commits.reduce((s,c)=>s+c.recovered,0),committedCost=commits.reduce((s,c)=>s+c.cost,0);
  return [{id:'S1',name:'維持現有資源',desc:'不增加成本，以現有產能與物料分批交付。',qty:finite,date:shiftDate(e.newDate,Math.ceil((demand-finite)/500)),cost:0,customer:'高',other:'低',score:2},{id:'S2',name:'友廠協同＋材料加急',desc:'結合友廠模組、SMT代工與外部供應商加急。',qty:Math.min(demand,finite+Math.max(1400,committedRecovery)),date:shiftDate(e.newDate,Math.max(1,Math.ceil(Math.max(0,demand-finite-committedRecovery)/800))),cost:Math.max(74,committedCost),customer:'中低',other:'低',score:5,recommended:true},{id:'S3',name:'調整其他客戶順位',desc:'犧牲低優先訂單，優先滿足策略客戶全部需求。',qty:demand,date:e.newDate,cost:42,customer:'低',other:'高',score:3}];
}
function renderDecision(){
  const e=selectedEvent(),scenarios=buildScenarios();$('#decisionSummary').innerHTML=`<div class="decision-summary-grid"><div><p class="eyebrow">${e.id}・DECISION PACKAGE</p><h2>${e.customer}｜${e.product}</h2><p class="muted">${e.sku}｜請在交付、跨廠供應、成本與既有客戶影響間作出取捨。</p></div><div class="summary-value"><span>新需求</span><strong>${fmt(e.newQty)}件</strong></div><div class="summary-value"><span>需求日期</span><strong>${formatDate(e.newDate)}</strong></div><div class="summary-value"><span>有限計畫缺口</span><strong>${fmt(state.simulated?.gap||Math.max(0,e.newQty-Math.round(e.oldQty*.92)))}件</strong></div><div class="summary-value"><span>版本</span><strong>${e.versionFrom}→${e.versionTo}</strong></div></div>`;
  $('#scenarioGrid').innerHTML=scenarios.map(s=>`<article class="scenario-card ${state.selectedScenario===s.id?'selected':''}" data-scenario="${s.id}">${s.recommended?'<span class="recommended">系統建議</span>':''}<p class="eyebrow">${s.id}</p><h2>${s.name}</h2><p>${s.desc}</p><div class="scenario-metrics"><div class="scenario-metric"><span>可交數量</span><strong>${fmt(s.qty)} 件</strong></div><div class="scenario-metric"><span>完成日期</span><strong>${formatDate(s.date)}</strong></div><div class="scenario-metric"><span>額外成本</span><strong>${money(s.cost)}</strong></div><div class="scenario-metric"><span>策略客戶風險</span><strong>${s.customer}</strong></div><div class="scenario-metric"><span>其他客戶影響</span><strong>${s.other}</strong></div></div><div class="event-row"><span class="event-id">綜合評分</span><div class="score-row">${[1,2,3,4,5].map(i=>`<i class="${i<=s.score?'on':''}"></i>`).join('')}</div></div></article>`).join('');
  $$('.scenario-card').forEach(c=>c.addEventListener('click',()=>{state.selectedScenario=c.dataset.scenario;renderDecision();}));$('#approveScenario').disabled=!state.selectedScenario;
}
function approveSelectedScenario(){const e=selectedEvent(),scenario=buildScenarios().find(s=>s.id===state.selectedScenario);if(!scenario)return;state.decisions[e.id]={scenario:scenario.id,name:scenario.name,note:$('#decisionNote').value,approvedAt:new Date().toISOString()};e.status='已核准';state.tracking.unshift({id:`T-${Date.now()}`,factory:e.factory,item:`${e.customer} ${e.product} 新承諾`,owner:e.owner,target:`${fmt(scenario.qty)} 件／${formatDate(scenario.date)}`,actual:'待執行',reason:`已核准「${scenario.name}」，跨廠供應與正式版本建立中。`,severity:'green',action:'開始執行'});persist();renderAll();toast(`已核准「${scenario.name}」，建立 Demand／MPS／MRP／Commit 新版本`);switchView('tracking');}

function renderTracking(){
  const rows=state.tracking.filter(t=>(state.region==='ALL'||factoryLookup[t.factory]?.region===state.region)&&(state.factory==='ALL'||t.factory===state.factory)),red=rows.filter(x=>x.severity==='red').length,yellow=rows.filter(x=>x.severity==='yellow').length,green=rows.filter(x=>x.severity==='green').length;
  $('#trackingKpis').innerHTML=[['紅燈異常',red,'需要立即升級','!','tone-red'],['黃燈風險',yellow,'已有對策持續追蹤','△','tone-yellow'],['正常執行',green,'依承諾進行中','✓','tone-green'],['原始承諾達成率','91.6%','排除需求版本變更','%','tone-blue']].map(([l,v,n,i,t])=>`<article class="kpi-card ${t}"><div class="kpi-top"><div><div class="kpi-label">${l}</div><div class="kpi-value">${v}</div><div class="kpi-note">${n}</div></div><div class="kpi-icon">${i}</div></div></article>`).join('');
  const filtered=rows.filter(r=>state.trackingFilter==='all'||r.severity===state.trackingFilter);$('#trackingTable').innerHTML=filtered.map(r=>`<tr><td><strong>${r.item}</strong><br><span class="event-id">${r.id}</span></td><td>${r.factory}<br><span class="event-id">${factoryName(r.factory)}</span></td><td>${r.owner}</td><td>${r.target}</td><td>${r.actual}</td><td class="reason-text">${r.reason}</td><td>${sevTag(r.severity)}</td><td><button class="action-link tracking-action" data-id="${r.id}">${r.action}</button></td></tr>`).join('')||'<tr><td colspan="8">沒有符合條件的追蹤項目</td></tr>';
  $$('.tracking-filter').forEach(b=>{b.classList.toggle('active',b.dataset.status===state.trackingFilter);b.onclick=()=>{state.trackingFilter=b.dataset.status;renderTracking();};});$$('.tracking-action').forEach(b=>b.addEventListener('click',()=>toast(`已建立處置任務：${b.textContent}`)));
}

function persist(){saveStored('ct2-events',state.events);saveStored('ct2-tracking',state.tracking);saveStored('ct2-commits',state.commits);saveStored('ct2-decisions',state.decisions);}
function toast(msg){const t=$('#toast');t.textContent=msg;t.classList.add('show');clearTimeout(toast.timer);toast.timer=setTimeout(()=>t.classList.remove('show'),2600);}
function closeOverlays(){$('#sidebar').classList.remove('open');$('#overlay').classList.remove('show');$('#tourModal').classList.remove('show');}
function parseDate(value){return new Date(`${String(value).replaceAll('/','-')}T00:00:00`);}
function dateDiff(a,b){return Math.round((parseDate(a)-parseDate(b))/86400000);}
function shiftDate(date,days){const d=parseDate(date);d.setDate(d.getDate()+days);return d.toISOString().slice(0,10);}
function formatDate(d){const x=parseDate(d);return `${x.getMonth()+1}/${x.getDate()}`;}

function setupTour(){
  const steps=[
    {view:'overview',title:'1. 控制塔總覽',text:'從全球、地區或單一工廠查看需求變更、產品組合、紅燈風險與待決策事項。',path:['18座工廠','21類產品','93個成品料號']},
    {view:'events',title:'2. 需求變更事件',text:'新需求保留產品、成品料號、數量、日期、優先級與版本差異。',path:['需求版本','凍結區','事件流程']},
    {view:'simulation',title:'3. 有限與無限同時模擬',text:'除單一事件外，可切換BY產品與BY客戶檢視缺口，辨識風險集中在哪個產品族或客戶。',path:['無限需求','有限可達','BY產品／客戶']},
    {view:'network',title:'4. 供應網路與多階BOM',text:'展開成品多階BOM，查看外部供應商、友廠模組、友廠SMT與跨廠調撥關係。',path:['多階BOM','供應圖','可供量']},
    {view:'bottlenecks',title:'5. 找出真正瓶頸',text:'將產能、物料、友廠SMT與跨廠模組限制指派給明確責任人。',path:['風險矩陣','跨廠瓶頸','責任人']},
    {view:'commit',title:'6. 責任人提出 Commit',text:'責任人選擇加班、友廠代工、調料或替代供應方案，承諾包含數量、日期、成本與前提。',path:['處理方案','缺口回收','條件式承諾']},
    {view:'decision',title:'7. 跨部門決策',text:'比較維持資源、友廠協同或調整其他客戶順位等方案。',path:['比較方案','選擇取捨','核准版本']},
    {view:'tracking',title:'8. 執行追蹤與 Highlight',text:'追蹤承諾、跨廠供應與實際結果；紅燈用於升級支援與決策。',path:['承諾 vs 實際','原因歸屬','升級處置']}
  ];
  let idx=0;const show=()=>{const s=steps[idx];$('#tourStep').innerHTML=`<h3>${s.title}</h3><p>${s.text}</p><div class="step-path">${s.path.map(x=>`<span>${x}</span>`).join('')}</div>`;$('#tourProgress').textContent=`${idx+1} / ${steps.length}`;$('#tourPrev').disabled=idx===0;$('#tourNext').textContent=idx===steps.length-1?'完成':'下一步';switchView(s.view,true);};
  $('#guidedTour').addEventListener('click',()=>{idx=0;$('#overlay').classList.add('show');$('#tourModal').classList.add('show');show();});$('#tourClose').addEventListener('click',closeOverlays);$('#tourPrev').addEventListener('click',()=>{if(idx>0){idx--;show();}});$('#tourNext').addEventListener('click',()=>{if(idx<steps.length-1){idx++;show();}else closeOverlays();});
}

document.addEventListener('DOMContentLoaded',init);
