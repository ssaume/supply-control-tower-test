const regions = [
  {
    id: 'TW', name: '台灣', factories: [
      ['TW01','桃園一廠'],['TW02','新竹二廠'],['TW03','台中三廠'],['TW04','台南四廠']
    ]
  },
  {
    id: 'CN', name: '中國', factories: [
      ['CN01','上海一廠'],['CN02','蘇州二廠'],['CN03','昆山三廠'],['CN04','深圳四廠'],['CN05','成都五廠'],['CN06','重慶六廠']
    ]
  },
  {
    id: 'TH', name: '泰國', factories: [
      ['TH01','曼谷一廠'],['TH02','春武里二廠'],['TH03','羅勇三廠'],['TH04','大城四廠'],['TH05','巴吞他尼五廠'],['TH06','北欖六廠'],['TH07','巴真武里七廠'],['TH08','清邁八廠']
    ]
  }
];

const factoryLookup = Object.fromEntries(regions.flatMap(r => r.factories.map(([id,name]) => [id,{ id,name,region:r.id,regionName:r.name }])));

const baseEvents = [
  { id:'CE-20260713-001', region:'TW', factory:'TW01', customer:'Customer X', model:'Model A', title:'策略客戶增量並提前交期', oldQty:10000, newQty:13000, oldDate:'2026/08/15', newDate:'2026/08/10', oldPriority:3, priority:1, revenue:6500, impactRevenue:1500, severity:'red', status:'待決策', freeze:true, reason:'客戶新產品上市提前，要求首批追加3,000件並提前5天。', owner:'陳建宏', ownerDept:'供應鏈規劃', versionFrom:'V12', versionTo:'V13' },
  { id:'CE-20260713-002', region:'TW', factory:'TW03', customer:'Customer Q', model:'Model D', title:'Forecast上修造成測試產能缺口', oldQty:6200, newQty:7800, oldDate:'2026/08/22', newDate:'2026/08/20', oldPriority:2, priority:2, revenue:3900, impactRevenue:800, severity:'yellow', status:'模擬中', freeze:false, reason:'通路銷售優於預期，兩週Forecast上修25.8%。', owner:'林怡君', ownerDept:'台中生管', versionFrom:'V08', versionTo:'V09' },
  { id:'CE-20260713-003', region:'CN', factory:'CN02', customer:'Customer Y', model:'Model B', title:'客戶插單影響既有承諾', oldQty:14000, newQty:17600, oldDate:'2026/08/18', newDate:'2026/08/13', oldPriority:3, priority:1, revenue:7200, impactRevenue:1800, severity:'red', status:'待評估', freeze:true, reason:'大客戶專案提前驗收，要求插單並取代一般訂單順位。', owner:'王磊', ownerDept:'蘇州計畫', versionFrom:'V21', versionTo:'V22' },
  { id:'CE-20260713-004', region:'CN', factory:'CN04', customer:'Customer R', model:'Model H', title:'訂單取消產生材料呆滯風險', oldQty:9500, newQty:4200, oldDate:'2026/08/25', newDate:'2026/08/25', oldPriority:2, priority:2, revenue:2100, impactRevenue:-2650, severity:'yellow', status:'待評估', freeze:false, reason:'客戶終端庫存過高，取消尚未投產的5,300件。', owner:'李娜', ownerDept:'深圳需求管理', versionFrom:'V15', versionTo:'V16' },
  { id:'CE-20260713-005', region:'CN', factory:'CN06', customer:'Customer C', model:'Model J', title:'長交期晶片供應商延遲', oldQty:8000, newQty:8000, oldDate:'2026/08/12', newDate:'2026/08/19', oldPriority:1, priority:1, revenue:4800, impactRevenue:1200, severity:'red', status:'待決策', freeze:true, reason:'關鍵晶片供應商良率異常，確認到料晚7天。', owner:'周敏', ownerDept:'重慶採購', versionFrom:'V17', versionTo:'V18' },
  { id:'CE-20260713-006', region:'TH', factory:'TH03', customer:'Customer Z', model:'Model C', title:'產品組合改變造成換線增加', oldQty:12000, newQty:12000, oldDate:'2026/08/28', newDate:'2026/08/24', oldPriority:3, priority:2, revenue:5100, impactRevenue:900, severity:'yellow', status:'模擬中', freeze:false, reason:'總量不變，但高複雜度機種占比由20%升至55%。', owner:'Narin S.', ownerDept:'羅勇計畫', versionFrom:'V10', versionTo:'V11' },
  { id:'CE-20260713-007', region:'TH', factory:'TH05', customer:'Customer M', model:'Model F', title:'新品試產轉量產需求', oldQty:1500, newQty:6200, oldDate:'2026/09/10', newDate:'2026/08/30', oldPriority:3, priority:1, revenue:3100, impactRevenue:2350, severity:'red', status:'待決策', freeze:false, reason:'新品認證提前完成，客戶要求立即切換量產。', owner:'Kanya P.', ownerDept:'巴吞他尼專案', versionFrom:'V05', versionTo:'V06' },
  { id:'CE-20260713-008', region:'TH', factory:'TH08', customer:'Customer N', model:'Model K', title:'一般需求小幅調整', oldQty:4500, newQty:4750, oldDate:'2026/09/05', newDate:'2026/09/04', oldPriority:3, priority:3, revenue:1450, impactRevenue:80, severity:'green', status:'已核准', freeze:false, reason:'客戶依最新銷售預測小幅增加250件。', owner:'Somchai T.', ownerDept:'清邁生管', versionFrom:'V03', versionTo:'V04' },
  { id:'CE-20260713-009', region:'TW', factory:'TW04', customer:'Customer P', model:'Model G', title:'包材規格臨時變更', oldQty:7200, newQty:7200, oldDate:'2026/08/17', newDate:'2026/08/17', oldPriority:2, priority:2, revenue:2800, impactRevenue:500, severity:'yellow', status:'待評估', freeze:true, reason:'客戶法規標示更新，已備包材無法直接使用。', owner:'黃郁婷', ownerDept:'台南採購', versionFrom:'V11', versionTo:'V12' },
  { id:'CE-20260713-010', region:'CN', factory:'CN05', customer:'Customer A', model:'Model E', title:'區域促銷需求提前', oldQty:11000, newQty:13500, oldDate:'2026/09/02', newDate:'2026/08/26', oldPriority:3, priority:2, revenue:4600, impactRevenue:1000, severity:'yellow', status:'模擬中', freeze:false, reason:'中國區促銷檔期提前一週，需求增加2,500件。', owner:'趙偉', ownerDept:'成都生管', versionFrom:'V06', versionTo:'V07' }
];

const bottleneckTemplates = [
  { id:'B01', type:'capacity', name:'組裝線 L3', gap:'240 小時', impactQty:1500, revenue:12000, difficulty:78, impact:88, severity:'red', dept:'製造一部', owner:'張志明', options:[
    {id:'overtime',name:'增加兩班加班',desc:'連續6日各增加20小時有效工時。',qty:750,cost:42,days:0,risk:'中'},
    {id:'outsource',name:'委外加工',desc:'委由已認證合作廠處理部分半成品。',qty:500,cost:65,days:2,risk:'中'},
    {id:'resequence',name:'調整其他客戶順位',desc:'Customer Y 延後2天，釋放共用產線。',qty:1000,cost:8,days:0,risk:'客戶中'},
    {id:'extraShift',name:'臨時增開夜班',desc:'調用跨線人力，需主管核准。',qty:600,cost:51,days:0,risk:'品質中'}
  ]},
  { id:'B02', type:'material', name:'關鍵材料 P100', gap:'700 件', impactQty:700, revenue:3500, difficulty:64, impact:68, severity:'red', dept:'採購部', owner:'陳美玲', options:[
    {id:'expedite',name:'供應商加急',desc:'原供應商提前交付500件。',qty:500,cost:18,days:2,risk:'中'},
    {id:'air',name:'海外空運調料',desc:'由中國廠調撥可用庫存。',qty:300,cost:25,days:0,risk:'低'},
    {id:'secondSource',name:'第二供應商',desc:'啟動已完成初驗的替代供應商。',qty:700,cost:32,days:1,risk:'品質中'},
    {id:'substitute',name:'核准替代料',desc:'工程確認可替代，需客戶同意。',qty:400,cost:12,days:1,risk:'認證中'}
  ]},
  { id:'B03', type:'equipment', name:'測試設備 T2', gap:'36 小時', impactQty:300, revenue:800, difficulty:38, impact:42, severity:'yellow', dept:'測試工程部', owner:'吳家豪', options:[
    {id:'pmMove',name:'調整保養窗口',desc:'將非關鍵保養延後至下週。',qty:180,cost:3,days:0,risk:'設備低'},
    {id:'parallel',name:'平行站點認證',desc:'臨時開放T4設備執行部分測項。',qty:260,cost:9,days:0,risk:'品質低'},
    {id:'weekend',name:'週末加班測試',desc:'增加兩個週末班次。',qty:300,cost:14,days:0,risk:'人力中'}
  ]},
  { id:'B04', type:'labor', name:'特殊技能人力', gap:'18 人日', impactQty:420, revenue:1100, difficulty:48, impact:50, severity:'yellow', dept:'製造工程', owner:'許雅雯', options:[
    {id:'crossTrain',name:'跨線支援',desc:'由相鄰產線調度6名認證人員。',qty:280,cost:7,days:0,risk:'原線中'},
    {id:'agency',name:'派遣人力',desc:'補充一般作業人力，釋放熟練人員。',qty:190,cost:11,days:1,risk:'訓練中'}
  ]}
];

const trackingBase = [
  {id:'T01',factory:'TW01',item:'製造加班工時',owner:'張志明',target:'120 小時',actual:'96 小時',reason:'夜班人力到位率80%，預估缺24小時。',severity:'yellow',action:'調用TW02支援'},
  {id:'T02',factory:'TW01',item:'材料 P100 到料',owner:'陳美玲',target:'12,600 件',actual:'12,100 件',reason:'供應商原承諾500件，最新確認只能提供200件。',severity:'red',action:'啟動第二供應商'},
  {id:'T03',factory:'TW03',item:'測試 T2 產出',owner:'吳家豪',target:'7,800 件',actual:'7,640 件',reason:'設備校驗晚4小時，缺口可於週末追回。',severity:'yellow',action:'核准週末班'},
  {id:'T04',factory:'CN02',item:'Customer Y 插單',owner:'王磊',target:'17,600 件',actual:'預估 15,900 件',reason:'共用模具衝突尚未取得跨廠支援。',severity:'red',action:'升級區域協調'},
  {id:'T05',factory:'CN04',item:'取消訂單材料處置',owner:'李娜',target:'呆料低於 ¥30萬',actual:'¥21萬',reason:'已轉用其他Model，剩餘包材待客戶確認。',severity:'green',action:'持續追蹤'},
  {id:'T06',factory:'TH03',item:'換線次數控制',owner:'Narin S.',target:'≤ 14 次',actual:'13 次',reason:'已合併相近工藝批次。',severity:'green',action:'無需升級'},
  {id:'T07',factory:'TH05',item:'新品量產爬坡',owner:'Kanya P.',target:'良率 95%',actual:'93.8%',reason:'新治具參數仍在優化，影響日產出約180件。',severity:'yellow',action:'工程駐線'}
];

function loadStored(key, fallback){ try { const raw=localStorage.getItem(key); return raw ? JSON.parse(raw) : fallback; } catch { return fallback; } }
function saveStored(key, value){ try { localStorage.setItem(key, JSON.stringify(value)); } catch {} }
function clearStored(keys){ try { keys.forEach(k=>localStorage.removeItem(k)); } catch {} }

const state = {
  region:'ALL', factory:'ALL', selectedEventId:'CE-20260713-001', selectedTaskId:'B01', selectedScenario:null,
  eventSeverity:'all', eventStatus:'all', trackingFilter:'all', simulated:null,
  events: loadStored('ct-events', structuredClone(baseEvents)),
  tracking: loadStored('ct-tracking', structuredClone(trackingBase)),
  commits: loadStored('ct-commits', {}),
  decisions: loadStored('ct-decisions', {})
};

const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const fmt = n => new Intl.NumberFormat('zh-TW').format(Math.round(n));
const money = n => `${fmt(n)} 萬`;
const sevLabel = {red:'紅燈',yellow:'黃燈',green:'綠燈'};
const sevTag = s => `<span class="tag ${s==='red'?'danger':s==='yellow'?'warning':'success'}"><i class="signal ${s}"></i>${sevLabel[s]}</span>`;

function init(){
  setupFilters(); setupNavigation(); setupInteractions(); renderAll(); setupTour();
}

function setupFilters(){
  const regionSelect = $('#regionSelect');
  regionSelect.innerHTML = `<option value="ALL">全球｜18座工廠</option>` + regions.map(r=>`<option value="${r.id}">${r.name}｜${r.factories.length}座工廠</option>`).join('');
  regionSelect.value = state.region;
  regionSelect.addEventListener('change', e=>{ state.region=e.target.value; state.factory='ALL'; updateFactoryOptions(); ensureSelectedEvent(); renderAll(); });
  updateFactoryOptions();
  $('#factorySelect').addEventListener('change', e=>{ state.factory=e.target.value; ensureSelectedEvent(); renderAll(); });
}

function updateFactoryOptions(){
  const sel=$('#factorySelect');
  const factories = state.region==='ALL' ? regions.flatMap(r=>r.factories) : regions.find(r=>r.id===state.region).factories;
  sel.innerHTML=`<option value="ALL">全部工廠</option>`+factories.map(([id,name])=>`<option value="${id}">${id}｜${name}</option>`).join('');
  sel.value=state.factory;
}

function setupNavigation(){
  $$('.nav-item').forEach(btn=>btn.addEventListener('click',()=>switchView(btn.dataset.view)));
  $$('.jump-view').forEach(btn=>btn.addEventListener('click',()=>switchView(btn.dataset.target)));
  $('#menuToggle').addEventListener('click',()=>{$('#sidebar').classList.add('open');$('#overlay').classList.add('show')});
  $('#overlay').addEventListener('click',closeOverlays);
}

function switchView(view, preserveOverlay=false){
  $$('.nav-item').forEach(n=>n.classList.toggle('active',n.dataset.view===view));
  $$('.view').forEach(v=>v.classList.toggle('active',v.id===`view-${view}`));
  const names={overview:'總覽控制塔',events:'需求變更事件',simulation:'有限／無限模擬',bottlenecks:'瓶頸分析',commit:'責任人 Commit',decision:'跨部門決策室',tracking:'執行追蹤與 Highlight'};
  $('#pageTitle').textContent=names[view];
  if(!preserveOverlay) closeOverlays();
  window.scrollTo({top:0,behavior:'smooth'});
}

function setupInteractions(){
  $('#eventSeverityFilter').addEventListener('change',e=>{state.eventSeverity=e.target.value;renderEvents();});
  $('#eventStatusFilter').addEventListener('change',e=>{state.eventStatus=e.target.value;renderEvents();});
  $('#quantitySlider').addEventListener('input',updateSimulationOutputs);
  $('#dateSlider').addEventListener('input',updateSimulationOutputs);
  $('#prioritySelect').addEventListener('change',()=>{});
  $('#runSimulation').addEventListener('click',()=>{ runSimulation(true); });
  $('#approveScenario').addEventListener('click',approveSelectedScenario);
  $('#resetDemo').addEventListener('click',()=>{
    clearStored(['ct-events','ct-tracking','ct-commits','ct-decisions']);
    state.events=structuredClone(baseEvents);state.tracking=structuredClone(trackingBase);state.commits={};state.decisions={};state.selectedEventId=baseEvents[0].id;state.selectedScenario=null;renderAll();toast('示範資料已重設');
  });
}

function filteredEvents(){
  return state.events.filter(e=>(state.region==='ALL'||e.region===state.region)&&(state.factory==='ALL'||e.factory===state.factory));
}
function ensureSelectedEvent(){
  const f=filteredEvents(); if(!f.some(e=>e.id===state.selectedEventId) && f.length) state.selectedEventId=f[0].id;
}
function selectedEvent(){ return state.events.find(e=>e.id===state.selectedEventId) || state.events[0]; }
function factoryName(id){return factoryLookup[id]?.name||id;}

function renderAll(){
  renderContext();renderOverview();renderEvents();renderSimulation();renderBottlenecks();renderCommit();renderDecision();renderTracking();
}

function renderContext(){
  let label='全球｜18座工廠';
  if(state.factory!=='ALL') label=`${factoryLookup[state.factory].regionName}｜${factoryName(state.factory)}`;
  else if(state.region!=='ALL'){const r=regions.find(x=>x.id===state.region);label=`${r.name}｜${r.factories.length}座工廠`;}
  $('#currentScope').textContent=label;
  $('#currentVersion').textContent=`Demand ${selectedEvent().versionTo}`;
  $('#lastUpdated').textContent=new Intl.DateTimeFormat('zh-TW',{year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hour12:false,timeZone:'Asia/Taipei'}).format(new Date()).replaceAll('/','/');
}

function renderOverview(){
  const ev=filteredEvents();
  const red=ev.filter(x=>x.severity==='red').length;
  const pending=ev.filter(x=>['待決策','待評估'].includes(x.status)).length;
  const impact=ev.reduce((s,e)=>s+Math.max(0,e.impactRevenue),0);
  const plantCount=state.factory!=='ALL'?1:state.region==='ALL'?18:regions.find(r=>r.id===state.region).factories.length;
  const kpis=[
    ['重大變更事件',ev.length,'本期進入管理流程','⚡','tone-blue'],
    ['紅燈承諾風險',red,'需跨部門或高階決策','!','tone-red'],
    ['預估營收影響',money(impact),`涵蓋 ${plantCount} 座工廠`,'$','tone-yellow'],
    ['Commit 達成率','91.6%','排除後續新增需求','✓','tone-green']
  ];
  $('#kpiGrid').innerHTML=kpis.map(([l,v,n,i,t])=>`<article class="kpi-card ${t}"><div class="kpi-top"><div><div class="kpi-label">${l}</div><div class="kpi-value">${v}</div><div class="kpi-note">${n}</div></div><div class="kpi-icon">${i}</div></div></article>`).join('');
  $('#overviewEventList').innerHTML=ev.slice(0,5).map(eventCard).join('')||'<div class="empty-state">此範圍目前沒有需求變更</div>';
  bindEventCards('#overviewEventList');

  const factories=[...new Set(ev.map(e=>e.factory))].map(fid=>{
    const items=ev.filter(e=>e.factory===fid);return{fid,score:items.reduce((s,e)=>s+Math.max(0,e.impactRevenue)+(e.severity==='red'?900:200),0),events:items.length};
  }).sort((a,b)=>b.score-a.score).slice(0,6);
  const max=Math.max(...factories.map(x=>x.score),1);
  $('#factoryRiskList').innerHTML=factories.map((x,i)=>`<div class="rank-item"><div class="rank-no">${i+1}</div><div class="rank-name"><strong>${x.fid}｜${factoryName(x.fid)}</strong><span>${x.events}件變更事件</span><div class="progress"><i style="width:${x.score/max*100}%"></i></div></div><div class="rank-value">${money(x.score)}</div></div>`).join('')||'<div class="empty-state">沒有風險資料</div>';
  renderHotspot('#overviewHotspot',bottleneckTemplates.slice(0,4));
  const dq=ev.filter(e=>e.status==='待決策').slice(0,4);
  $('#decisionCountTag').textContent=`${dq.length}件待核准`;
  $('#decisionQueue').innerHTML=dq.map(e=>`<div class="decision-item"><div><strong>${e.customer}｜${e.model}</strong><span>${e.factory}・${e.title}</span></div><button class="action-link decision-jump" data-id="${e.id}">進入決策</button></div>`).join('')||'<div class="empty-state">目前沒有待決策事項</div>';
  $$('.decision-jump').forEach(b=>b.addEventListener('click',()=>{state.selectedEventId=b.dataset.id;state.selectedScenario=null;renderAll();switchView('decision')}));
}

function eventCard(e){
  return `<div class="event-item ${e.id===state.selectedEventId?'active':''}" data-event-id="${e.id}"><div class="event-row"><span class="event-id">${e.id}</span>${sevTag(e.severity)}</div><div class="event-title">${e.customer}｜${e.model}－${e.title}</div><div class="event-meta"><span>${e.factory} ${factoryName(e.factory)}</span><span>${e.status}</span><span>${e.versionFrom} → ${e.versionTo}</span></div></div>`;
}
function bindEventCards(scope){
  $$(`${scope} .event-item`).forEach(el=>el.addEventListener('click',()=>{state.selectedEventId=el.dataset.eventId;state.selectedScenario=null;renderAll();if(scope==='#overviewEventList')switchView('events');}));
}

function renderEvents(){
  const items=filteredEvents().filter(e=>(state.eventSeverity==='all'||e.severity===state.eventSeverity)&&(state.eventStatus==='all'||e.status===state.eventStatus));
  $('#eventSeverityFilter').value=state.eventSeverity;$('#eventStatusFilter').value=state.eventStatus;
  $('#eventList').innerHTML=items.map(eventCard).join('')||'<div class="empty-state">沒有符合條件的事件</div>';
  bindEventCards('#eventList');
  const e=selectedEvent();
  const qtyDelta=e.newQty-e.oldQty; const days=dateDiff(e.newDate,e.oldDate);
  $('#eventDetail').innerHTML=`
    <div class="detail-hero"><p class="eyebrow">${e.id}・${e.factory} ${factoryName(e.factory)}</p><h2>${e.customer}｜${e.model}</h2><p>${e.title}</p></div>
    <div class="event-row"><div><span class="event-id">事件狀態</span><div style="margin-top:5px"><span class="tag neutral">${e.status}</span> ${e.freeze?'<span class="tag danger">進入凍結區</span>':'<span class="tag info">彈性區</span>'}</div></div>${sevTag(e.severity)}</div>
    <div class="detail-grid" style="margin-top:16px">
      <div class="detail-stat"><span>數量變化</span><strong class="${qtyDelta>=0?'delta-up':'delta-down'}">${qtyDelta>=0?'+':''}${fmt(qtyDelta)} 件</strong></div>
      <div class="detail-stat"><span>交期變化</span><strong class="${days<0?'delta-up':''}">${days===0?'不變':days<0?`提前 ${Math.abs(days)} 天`:`延後 ${days} 天`}</strong></div>
      <div class="detail-stat"><span>預估營收影響</span><strong>${money(e.impactRevenue)}</strong></div>
      <div class="detail-stat"><span>事件負責人</span><strong>${e.owner}</strong><span>${e.ownerDept}</span></div>
    </div>
    <h3>需求版本差異</h3>
    <table class="version-compare"><thead><tr><th>項目</th><th>${e.versionFrom}</th><th>${e.versionTo}</th><th>差異</th></tr></thead><tbody>
      <tr><td>需求數量</td><td>${fmt(e.oldQty)}</td><td>${fmt(e.newQty)}</td><td class="${qtyDelta>=0?'delta-up':'delta-down'}">${qtyDelta>=0?'+':''}${fmt(qtyDelta)}</td></tr>
      <tr><td>需求日期</td><td>${formatDate(e.oldDate)}</td><td>${formatDate(e.newDate)}</td><td>${days===0?'—':days<0?`提前${Math.abs(days)}天`:`延後${days}天`}</td></tr>
      <tr><td>優先順序</td><td>P${e.oldPriority}</td><td>P${e.priority}</td><td>${e.priority<e.oldPriority?'提高':'不變'}</td></tr>
      <tr><td>正式版本</td><td>Demand ${e.versionFrom}</td><td>Demand ${e.versionTo}</td><td>待決策</td></tr>
    </tbody></table>
    <div class="reason-box"><strong>變更原因：</strong>${e.reason}</div>
    <div class="detail-actions">
      <button class="primary-button event-action" data-action="模擬中">接受進入模擬</button>
      <button class="secondary-button event-action" data-action="待補件">退回補充理由</button>
      <button class="secondary-button event-action" data-action="下期處理">併入下次週期</button>
      <button class="danger-button event-action" data-action="待決策">緊急升級</button>
    </div>`;
  $$('.event-action').forEach(b=>b.addEventListener('click',()=>{
    e.status=b.dataset.action; persist(); renderAll(); toast(`事件已更新為「${e.status}」`);
    if(e.status==='模擬中') switchView('simulation');
  }));
}

function renderSimulation(){
  const e=selectedEvent();
  $('#simulationSubtitle').textContent=`${e.id}｜${e.customer} ${e.model}｜需求 ${e.versionFrom} → ${e.versionTo}`;
  const delta=Math.max(0,e.newQty-e.oldQty);
  $('#quantitySlider').value=state.simulated?.eventId===e.id?state.simulated.extra:delta;
  $('#dateSlider').value=state.simulated?.eventId===e.id?state.simulated.earlier:Math.max(0,-dateDiff(e.newDate,e.oldDate));
  $('#prioritySelect').value=String(e.priority);
  updateSimulationOutputs();
  runSimulation(false);
}
function updateSimulationOutputs(){
  $('#quantityOutput').textContent=`+${fmt(Number($('#quantitySlider').value))} 件`;
  $('#dateOutput').textContent=`提前 ${$('#dateSlider').value} 天`;
}
function runSimulation(showToast=false){
  const e=selectedEvent(); const extra=Number($('#quantitySlider').value); const earlier=Number($('#dateSlider').value); const priority=Number($('#prioritySelect').value);
  const demand=Math.max(100,e.oldQty+extra);
  const pressure=1+extra/Math.max(1,e.oldQty)*.72+earlier*.022+(4-priority)*.035;
  const baseCapacity=e.oldQty*.94;
  const finite=Math.min(demand,Math.round(baseCapacity/pressure + e.oldQty*.10));
  const gap=Math.max(0,demand-finite);
  const completionDelay=Math.ceil(gap/Math.max(300,e.oldQty*.06));
  const capHours=Math.round(demand*.08); const mat=demand; const test=Math.round(demand*.04);
  state.simulated={eventId:e.id,extra,earlier,priority,demand,finite,gap,completionDelay,capHours,mat,test};
  $('#unlimitedMetrics').innerHTML=metricRows([
    ['需求完成數量',`${fmt(demand)} 件`,100],['理論完成日期',formatDate(shiftDate(e.oldDate,-earlier)),100],['組裝所需工時',`${fmt(capHours)} 小時`,Math.min(100,pressure*72)],['關鍵材料需求',`${fmt(mat)} 件`,100],['測試設備需求',`${fmt(test)} 小時`,Math.min(100,pressure*78)]
  ]);
  $('#finiteMetrics').innerHTML=metricRows([
    ['可完成數量',`${fmt(finite)} 件`,finite/demand*100],['預估完成日期',formatDate(shiftDate(e.newDate,completionDelay)),Math.max(30,100-completionDelay*8)],['可用組裝工時',`${fmt(Math.round(capHours*(finite/demand)))} 小時`,finite/demand*100],['可用關鍵材料',`${fmt(Math.round(mat*(finite/demand+.015)))} 件`,Math.min(100,(finite/demand+.015)*100)],['可用測試能力',`${fmt(Math.round(test*(finite/demand+.03)))} 小時`,Math.min(100,(finite/demand+.03)*100)]
  ]);
  $('#gapTag').textContent=`缺口 ${fmt(gap)} 件`;
  const lost=Math.round(gap*(e.revenue/Math.max(1,e.newQty)));
  $('#gapAnalysis').innerHTML=`<div class="gap-summary"><div class="gap-card"><span>未滿足需求</span><strong class="delta-up">${fmt(gap)} 件</strong></div><div class="gap-card"><span>預估延遲</span><strong>${completionDelay} 天</strong></div><div class="gap-card"><span>營收曝險</span><strong>${money(lost)}</strong></div><div class="gap-card"><span>受影響承諾</span><strong>${Math.max(1,Math.ceil(gap/700))} 張</strong></div></div><div class="impact-list">${scenarioBottlenecks().map((b,i)=>`<div class="impact-row"><div><h3>${i+1}. ${b.name}</h3><p>${b.dept}｜${b.owner}</p></div><div><div class="progress"><i style="width:${Math.min(100,b.impact)}%;background:${b.severity==='red'?'#c83b49':'#bd8211'}"></i></div><p>缺口 ${b.gap}，影響 ${fmt(Math.round(b.impactQty*(gap/Math.max(1,3000)+.5)))} 件</p></div>${sevTag(b.severity)}</div>`).join('')}</div>`;
  if(showToast) toast('情境模擬已重新計算；尚未成為正式計畫');
}
function metricRows(items){return items.map(([l,v,p])=>`<div class="metric-row"><div class="metric-line"><span>${l}</span><strong>${v}</strong></div><div class="bar-track"><i style="width:${Math.max(4,Math.min(100,p))}%"></i></div></div>`).join('');}
function scenarioBottlenecks(){
  const e=selectedEvent(); return bottleneckTemplates.map((b,i)=>({...b,id:`${b.id}-${e.factory}`,location:e.factory,gap:i===0?`${Math.max(36,Math.round((state.simulated?.gap||2200)*.109))} 小時`:b.gap}));
}

function renderBottlenecks(){
  const list=scenarioBottlenecks();
  const matrix=$('#bottleneckMatrix');
  matrix.innerHTML='<span class="axis-y">營收與交付影響 ↑</span><span class="axis-x">處理難度 →</span>'+list.map(b=>`<div class="matrix-dot ${b.severity}" title="${b.name}" style="left:${b.difficulty}%;bottom:${b.impact}%">${b.name.replace(' ','<br>')}</div>`).join('');
  $('#bottleneckTable').innerHTML=list.map(b=>`<tr><td><strong>${b.name}</strong><br><span class="event-id">${b.type.toUpperCase()}</span></td><td>${b.location}<br><span class="event-id">${factoryName(b.location)}</span></td><td>${b.gap}</td><td>${fmt(b.impactQty)} 件</td><td>${money(b.revenue)}</td><td class="owner-cell"><strong>${b.owner}</strong><span>${b.dept}</span></td><td>${sevTag(b.severity)}</td></tr>`).join('');
}
function renderHotspot(sel,list){
  $(sel).innerHTML=list.map(b=>`<span class="hotspot-dot ${b.severity}" style="left:${b.difficulty}%;bottom:${b.impact}%">${b.name}</span>`).join('');
}

function renderCommit(){
  const tasks=scenarioBottlenecks();
  $('#commitTaskCount').textContent=`${tasks.length}項待處理`;
  $('#commitTaskList').innerHTML=tasks.map(t=>`<div class="task-card ${state.selectedTaskId.startsWith(t.id.split('-')[0])?'active':''}" data-task="${t.id}"><div class="event-row"><span class="event-id">${t.id}</span>${sevTag(t.severity)}</div><h3>${t.name}</h3><p>${t.location} ${factoryName(t.location)}｜${t.dept}・${t.owner}</p><p>缺口 ${t.gap}｜影響 ${fmt(t.impactQty)}件</p></div>`).join('');
  $$('.task-card').forEach(x=>x.addEventListener('click',()=>{state.selectedTaskId=x.dataset.task;renderCommit();}));
  let task=tasks.find(t=>t.id===state.selectedTaskId);
  if(!task){task=tasks[0];state.selectedTaskId=task.id;}
  renderCommitWorkbench(task);
}
function renderCommitWorkbench(task){
  const e=selectedEvent(); const saved=state.commits[`${e.id}-${task.id}`]||{selected:[]};
  $('#commitWorkbench').innerHTML=`
    <div class="workbench-hero"><p class="eyebrow">${e.id}｜${task.id}</p><h2>${task.name}處理承諾</h2><p>原始承諾 ${fmt(e.oldQty)}件／${formatDate(e.oldDate)}；新增要求 ${fmt(Math.max(0,e.newQty-e.oldQty))}件，需求版本 ${e.versionTo}</p></div>
    <div class="detail-grid"><div class="detail-stat"><span>目前缺口</span><strong>${task.gap}</strong></div><div class="detail-stat"><span>影響數量</span><strong>${fmt(task.impactQty)} 件</strong></div><div class="detail-stat"><span>責任人</span><strong>${task.owner}</strong><span>${task.dept}</span></div><div class="detail-stat"><span>需求版本</span><strong>${e.versionTo}</strong><span>承諾須綁定版本</span></div></div>
    <h3>選擇處理方案</h3><div class="option-grid">${task.options.map(o=>`<label class="option-card ${saved.selected.includes(o.id)?'selected':''}"><input type="checkbox" value="${o.id}" ${saved.selected.includes(o.id)?'checked':''}><h3>${o.name}</h3><p>${o.desc}</p><div class="option-metrics"><span>＋${fmt(o.qty)}件</span><span>成本 ${money(o.cost)}</span><span>風險 ${o.risk}</span></div></label>`).join('')}</div>
    <div class="commit-preview" id="commitPreview"></div>
    <h3>承諾前提</h3><ul class="assumption-list"><li>需求版本維持 ${e.versionTo}，數量與優先順序不再變更。</li><li>相關加班、空運或外包成本由決策主管核准。</li><li>跨廠調料與替代料須完成品質及客戶核可。</li></ul>
    <div class="detail-actions"><button class="primary-button" id="submitCommit">提交 Commit</button><button class="secondary-button" id="clearCommit">清除選擇</button></div>`;
  $$('.option-card input').forEach(inp=>inp.addEventListener('change',()=>{
    inp.closest('.option-card').classList.toggle('selected',inp.checked);updateCommitPreview(task);
  }));
  $('#clearCommit').addEventListener('click',()=>{$$('.option-card input').forEach(i=>{i.checked=false;i.closest('.option-card').classList.remove('selected')});updateCommitPreview(task);});
  $('#submitCommit').addEventListener('click',()=>{
    const selected=$$('.option-card input:checked').map(x=>x.value);
    if(!selected.length){toast('請至少選擇一個處理方案');return;}
    const calc=calcCommit(task,selected);state.commits[`${e.id}-${task.id}`]={selected,...calc,submitted:true};persist();renderCommit();toast(`${task.owner} 的 Commit 已提交`);
  });
  updateCommitPreview(task);
}
function calcCommit(task,selected){
  const opts=task.options.filter(o=>selected.includes(o.id)); const recovered=opts.reduce((s,o)=>s+o.qty,0); const cost=opts.reduce((s,o)=>s+o.cost,0); const maxDays=Math.max(0,...opts.map(o=>o.days));
  const e=selectedEvent(); const base=state.simulated?.finite||Math.round(e.oldQty*.92); const commitQty=Math.min(e.newQty,base+recovered); return{recovered,cost,maxDays,commitQty,remaining:Math.max(0,e.newQty-commitQty)};
}
function updateCommitPreview(task){
  const selected=$$('.option-card input:checked').map(x=>x.value); const c=calcCommit(task,selected); const e=selectedEvent();
  $('#commitPreview').innerHTML=`<div class="commit-preview-grid"><div><span>可回收缺口</span><strong>+${fmt(c.recovered)} 件</strong></div><div><span>承諾數量</span><strong>${fmt(c.commitQty)} 件</strong></div><div><span>剩餘缺口</span><strong class="${c.remaining?'delta-up':'delta-down'}">${fmt(c.remaining)} 件</strong></div><div><span>額外成本</span><strong>${money(c.cost)}</strong></div></div><p class="muted" style="margin:10px 0 0">建議承諾：${formatDate(e.newDate)} 前完成 ${fmt(c.commitQty)} 件；剩餘 ${fmt(c.remaining)} 件於 ${formatDate(shiftDate(e.newDate,c.maxDays+2))} 前完成。</p>`;
}

function buildScenarios(){
  const e=selectedEvent(); const sim=state.simulated?.eventId===e.id?state.simulated:null; const finite=sim?.finite||Math.round(e.oldQty*.92); const demand=sim?.demand||e.newQty; const commits=Object.entries(state.commits).filter(([k,v])=>k.startsWith(`${e.id}-`)&&v.submitted).map(([,v])=>v);
  const committedRecovery=commits.reduce((s,c)=>s+c.recovered,0); const committedCost=commits.reduce((s,c)=>s+c.cost,0);
  return [
    {id:'S1',name:'維持現有資源',desc:'不增加成本，以現有產能與物料分批交付。',qty:finite,date:shiftDate(e.newDate,Math.ceil((demand-finite)/500)),cost:0,customer:'高',other:'低',score:2},
    {id:'S2',name:'加班＋材料加急',desc:'採用責任人已提交方案，平衡交付與成本。',qty:Math.min(demand,finite+Math.max(1200,committedRecovery)),date:shiftDate(e.newDate,Math.max(1,Math.ceil(Math.max(0,demand-finite-committedRecovery)/700))),cost:Math.max(67,committedCost),customer:'中低',other:'低',score:4,recommended:true},
    {id:'S3',name:'調整其他客戶順位',desc:'犧牲低優先訂單，優先滿足策略客戶全部需求。',qty:demand,date:e.newDate,cost:42,customer:'低',other:'高',score:3}
  ];
}
function renderDecision(){
  const e=selectedEvent(); const scenarios=buildScenarios();
  $('#decisionSummary').innerHTML=`<div class="decision-summary-grid"><div><p class="eyebrow">${e.id}・DECISION PACKAGE</p><h2>${e.customer}｜${e.model}－${e.title}</h2><p class="muted">請在交付、成本、既有客戶影響與風險之間作出明確取捨。</p></div><div class="summary-value"><span>新需求</span><strong>${fmt(e.newQty)}件</strong></div><div class="summary-value"><span>需求日期</span><strong>${formatDate(e.newDate)}</strong></div><div class="summary-value"><span>有限計畫缺口</span><strong>${fmt(state.simulated?.gap||Math.max(0,e.newQty-Math.round(e.oldQty*.92)))}件</strong></div><div class="summary-value"><span>版本</span><strong>${e.versionFrom}→${e.versionTo}</strong></div></div>`;
  $('#scenarioGrid').innerHTML=scenarios.map(s=>`<article class="scenario-card ${state.selectedScenario===s.id?'selected':''}" data-scenario="${s.id}">${s.recommended?'<span class="recommended">系統建議</span>':''}<p class="eyebrow">${s.id}</p><h2>${s.name}</h2><p>${s.desc}</p><div class="scenario-metrics"><div class="scenario-metric"><span>可交數量</span><strong>${fmt(s.qty)} 件</strong></div><div class="scenario-metric"><span>完成日期</span><strong>${formatDate(s.date)}</strong></div><div class="scenario-metric"><span>額外成本</span><strong>${money(s.cost)}</strong></div><div class="scenario-metric"><span>策略客戶風險</span><strong>${s.customer}</strong></div><div class="scenario-metric"><span>其他客戶影響</span><strong>${s.other}</strong></div></div><div class="event-row"><span class="event-id">綜合評分</span><div class="score-row">${[1,2,3,4,5].map(i=>`<i class="${i<=s.score?'on':''}"></i>`).join('')}</div></div></article>`).join('');
  $$('.scenario-card').forEach(c=>c.addEventListener('click',()=>{state.selectedScenario=c.dataset.scenario;renderDecision();}));
  $('#approveScenario').disabled=!state.selectedScenario;
}
function approveSelectedScenario(){
  const e=selectedEvent(); const scenario=buildScenarios().find(s=>s.id===state.selectedScenario); if(!scenario)return;
  state.decisions[e.id]={scenario:scenario.id,name:scenario.name,note:$('#decisionNote').value,approvedAt:new Date().toISOString()};
  e.status='已核准';
  const id=`T-${Date.now()}`;state.tracking.unshift({id,factory:e.factory,item:`${e.customer} ${e.model} 新承諾`,owner:e.owner,target:`${fmt(scenario.qty)} 件／${formatDate(scenario.date)}`,actual:'待執行',reason:`已核准「${scenario.name}」，正式版本建立中。`,severity:'green',action:'開始執行'});
  persist();renderAll();toast(`已核准「${scenario.name}」，建立 Demand／MPS／MRP／Commit 新版本`);switchView('tracking');
}

function renderTracking(){
  const rows=state.tracking.filter(t=>(state.region==='ALL'||factoryLookup[t.factory]?.region===state.region)&&(state.factory==='ALL'||t.factory===state.factory));
  const red=rows.filter(x=>x.severity==='red').length,yellow=rows.filter(x=>x.severity==='yellow').length,green=rows.filter(x=>x.severity==='green').length;
  $('#trackingKpis').innerHTML=[['紅燈異常',red,'需要立即升級','!','tone-red'],['黃燈風險',yellow,'已有對策持續追蹤','△','tone-yellow'],['正常執行',green,'依承諾進行中','✓','tone-green'],['原始承諾達成率','91.6%','排除需求版本變更','%','tone-blue']].map(([l,v,n,i,t])=>`<article class="kpi-card ${t}"><div class="kpi-top"><div><div class="kpi-label">${l}</div><div class="kpi-value">${v}</div><div class="kpi-note">${n}</div></div><div class="kpi-icon">${i}</div></div></article>`).join('');
  const filtered=rows.filter(r=>state.trackingFilter==='all'||r.severity===state.trackingFilter);
  $('#trackingTable').innerHTML=filtered.map(r=>`<tr><td><strong>${r.item}</strong><br><span class="event-id">${r.id}</span></td><td>${r.factory}<br><span class="event-id">${factoryName(r.factory)}</span></td><td>${r.owner}</td><td>${r.target}</td><td>${r.actual}</td><td class="reason-text">${r.reason}</td><td>${sevTag(r.severity)}</td><td><button class="action-link tracking-action" data-id="${r.id}">${r.action}</button></td></tr>`).join('')||'<tr><td colspan="8">沒有符合條件的追蹤項目</td></tr>';
  $$('.tracking-filter').forEach(b=>{b.classList.toggle('active',b.dataset.status===state.trackingFilter);b.onclick=()=>{state.trackingFilter=b.dataset.status;renderTracking();};});
  $$('.tracking-action').forEach(b=>b.addEventListener('click',()=>toast(`已建立處置任務：${b.textContent}`)));
}

function persist(){
  saveStored('ct-events',state.events);saveStored('ct-tracking',state.tracking);saveStored('ct-commits',state.commits);saveStored('ct-decisions',state.decisions);
}
function toast(msg){ const t=$('#toast');t.textContent=msg;t.classList.add('show');clearTimeout(toast.timer);toast.timer=setTimeout(()=>t.classList.remove('show'),2600); }
function closeOverlays(){ $('#sidebar').classList.remove('open');$('#overlay').classList.remove('show');$('#tourModal').classList.remove('show'); }
function parseDate(value){ return new Date(`${String(value).replaceAll('/','-')}T00:00:00`); }
function dateDiff(a,b){ return Math.round((parseDate(a)-parseDate(b))/86400000); }
function shiftDate(date,days){ const d=parseDate(date);d.setDate(d.getDate()+days);return d.toISOString().slice(0,10); }
function formatDate(d){ const x=parseDate(d);return `${x.getMonth()+1}/${x.getDate()}`; }

function setupTour(){
  const steps=[
    {view:'overview',title:'1. 控制塔總覽',text:'先從全球、地區或單一工廠查看重大變更、紅燈風險、營收曝險與待決策事項。',path:['選地區／工廠','看事件與KPI','進入重大項目']},
    {view:'events',title:'2. 需求變更事件',text:'新需求不直接覆蓋舊版本。系統保留數量、日期、優先級與原因差異，並依凍結區及影響程度決定流程。',path:['V12→V13','門檻判定','接受／退回／升級']},
    {view:'simulation',title:'3. 有限與無限同時模擬',text:'調整新增數量與提前天數，觀察完整需求與實際可達結果的缺口；模擬結果不等於正式計畫。',path:['無限需求','有限可達','缺口分析']},
    {view:'bottlenecks',title:'4. 找出真正瓶頸',text:'系統依交付及營收影響、處理難度排序，將產能、物料、設備與人力問題指派給明確責任人。',path:['風險矩陣','影響訂單','責任人']},
    {view:'commit',title:'5. 責任人提出 Commit',text:'責任人選擇加班、外包、調料或替代料等方案，承諾必須包含數量、日期、成本與前提。',path:['選處理方案','計算缺口','提交條件式承諾']},
    {view:'decision',title:'6. 跨部門決策',text:'主管比較不加成本、加急資源或犧牲其他訂單等方案，明確承擔取捨，而不是要求現場自行吸收。',path:['比較方案','選擇取捨','核准新版本']},
    {view:'tracking',title:'7. 執行追蹤與 Highlight',text:'追蹤原承諾、目前結果及差異原因。紅燈是升級決策與資源支援，不是單純公開處罰。',path:['承諾 vs 實際','原因歸屬','升級處置']}
  ];
  let idx=0;
  const show=()=>{const s=steps[idx];$('#tourStep').innerHTML=`<h3>${s.title}</h3><p>${s.text}</p><div class="step-path">${s.path.map(x=>`<span>${x}</span>`).join('')}</div>`;$('#tourProgress').textContent=`${idx+1} / ${steps.length}`;$('#tourPrev').disabled=idx===0;$('#tourNext').textContent=idx===steps.length-1?'完成':'下一步';switchView(s.view, true);};
  $('#guidedTour').addEventListener('click',()=>{idx=0;$('#overlay').classList.add('show');$('#tourModal').classList.add('show');show();});
  $('#tourClose').addEventListener('click',closeOverlays);
  $('#tourPrev').addEventListener('click',()=>{if(idx>0){idx--;show();}});
  $('#tourNext').addEventListener('click',()=>{if(idx<steps.length-1){idx++;show();}else closeOverlays();});
}

document.addEventListener('DOMContentLoaded',init);
