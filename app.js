'use strict';
const $=id=>document.getElementById(id);
const presets=[
 ['ror','Rörmokarsnus','Tack för alla år, Janne!','#813e28'],
 ['max','Max','Max en åt gången.','#1e474a'],
 ['gnaget','Gnagetsnus','Samma plats, varje match.','#433823'],
 ['bajen','Bajensnus','Vi ses på Söder.','#285039'],
 ['gardar','Gårdarsnus','Till min bästa matchkompis.','#253f62']
];
const s={step:0,type:'Nikotinfritt',flavor:'Mentol',strength:'',preset:1,title:'Max',line:'Max en åt gången.',gift:true,qty:1,card:'',signature:'',mode:'Mall',brief:'',upload:'',uploadName:'',done:false};
const initial={...s};
const names=['Design','Innehåll','Present','Översikt'];
const papers=['#ecd5b0','#f3dacb','#e1e8db','#efe9bd','#efd9e3','#f9e7bd'];
const colors=[['Skogsgrön','#254632'],['Indigo','#1b365a'],['Tegel','#993e2e'],['Plommon','#653548']];
let sourceShown=false, color='',view='tin';
try {
 const stored=JSON.parse(sessionStorage.getItem('dosverkstan-portratt')||'null');
 if(stored && Number.isInteger(stored.preset) && presets[stored.preset]){
 for(const k of ['title','line','flavor','type','strength','card','signature','brief'])if(typeof stored[k]==='string')s[k]=stored[k];
 s.preset=stored.preset;s.qty=Math.max(1,Math.min(10,parseInt(stored.qty)||1));s.gift=stored.gift!==false;
 color=colors.some(x=>x[1]===stored.color)?stored.color:'';
 }
} catch {}
function save(){try {const {upload,uploadName,...rest}=s;sessionStorage.setItem('dosverkstan-portratt',JSON.stringify({...rest,color}))}catch{}}

const panel=$('panel');
function el(tag,text,cls){const n=document.createElement(tag);if(text!=null)n.textContent=text;if(cls)n.className=cls;return n}
function flavors(){return s.type==='Nikotinfritt'?['Mentol','Citrus']:['Menthol Crush','Blueberry Chili','Polar Wintergreen']}
function preview(){
 const p=presets[s.preset], uploaded=s.mode==='Eget foto'&&s.upload;
 const custom=s.title!==p[1]||s.line!==p[2]||color||uploaded||s.type==='Med nikotin';
 const lid=view==='tin',stage=$('stageImage');stage.classList.toggle('withPortrait',Boolean(uploaded));
 stage.style.setProperty('--print',color||p[3]);stage.style.setProperty('--paper',papers[s.preset]);
 stage.classList.toggle('wrapMode',!lid);
 const showSource=s.preset===1&&lid&&!custom;
 $('sourceToggle').hidden=!showSource;
 if(!showSource)sourceShown=false;
 $('sourceToggle').setAttribute('aria-pressed',sourceShown);
 $('sourceToggle').querySelector('span').textContent=sourceShown?'Visa dosan':'Originalfoto';
 $('sourceToggle').setAttribute('aria-label',sourceShown?'Visa Max-dosan':'Se fotot bakom Max-dosan');
 const path=sourceShown?'assets/max-source.webp':lid&&custom?'assets/blank.webp':'assets/'+p[0]+'-tin.webp';
 if($('scene').getAttribute('src')!==path)$('scene').src=path;
 $('scene').alt=sourceShown?'Max på originalfotot':custom?'Fotografisk dosmodell med din etikett':p[1]+' med tryckt, illustrerat lock';
 $('label').hidden=!lid||!custom;$('wrap').hidden=lid;
 $('labelTitle').textContent=$('wrapTitle').textContent=s.title||'Din dosa';
 $('labelLine').textContent=$('wrapLine').textContent=s.line;
 $('labelKind').textContent=s.type==='Med nikotin'?'NIKOTINPORTIONER':'NIKOTINFRIA PORTIONER';
 $('art').src=uploaded||'assets/'+p[0]+'-art.webp';
 $('art').alt=uploaded?'Ditt uppladdade motiv':'Illustration ur '+p[1];
 $('labelTitle').style.fontSize=s.title.length>20?'3.8cqw':'';
 $('caption').textContent=(s.title||'Din dosa')+' · '+s.qty*10+' dosor';
 $('tinTab').setAttribute('aria-pressed',lid);$('wrapTab').setAttribute('aria-pressed',!lid);
 save();
}
function field(title,input){let l=el('label',null,'field');l.append(document.createTextNode(title),input);panel.append(l);return input}
function edit(title,key,max){let i=el('input');i.value=s[key];i.maxLength=max;field(title,i);i.oninput=()=>{s[key]=i.value;preview()}}
function select(title,items,value,fn){let n=el('select');for(const x of items)n.add(new Option(x,x));n.value=value;field(title,n);n.onchange=()=>fn(n.value)}
function choose(values,current,fn){let row=el('div',null,'choices');values.forEach(x=>{let b=el('button',x);b.setAttribute('aria-pressed',x===current);b.onclick=()=>fn(x);row.append(b)});panel.append(row)}
function hint(t){panel.append(el('p',t,'hint'))}
function setPreset(i){const old=presets[s.preset];if(!s.title||s.title===old[1])s.title=presets[i][1];if(!s.line||s.line===old[2])s.line=presets[i][2];s.preset=i;}
function go(i){s.step=i;s.done=false;render()}
let photoOriginal=null, photoVersion=0, photoStyle='Färgtryck', photoY=0.5;
const photoPalettes={
 'Färgtryck':[[17,45,49],[33,73,76],[137,77,52],[219,133,81],[235,187,139],[250,233,199]],
 'Svartvitt':[[23,23,23],[58,58,57],[96,96,92],[144,143,136],[196,192,181],[244,240,225]]
};
function generatePortrait(){
 if(!photoOriginal)return;
 const canvas=document.createElement('canvas');
 canvas.width=canvas.height=560;
 const ctx=canvas.getContext('2d'),img=photoOriginal;
 const size=Math.min(img.width,img.height);
 ctx.drawImage(img,(img.width-size)/2,(img.height-size)*photoY,size,size,0,0,560,560);
 const frame=ctx.getImageData(0,0,560,560),pixels=frame.data,palette=photoPalettes[photoStyle];
 if(palette){
  for(let i=0;i<pixels.length;i+=4){
   const light=.27*pixels[i]+.62*pixels[i+1]+.11*pixels[i+2];
   const ink=palette[Math.min(5,Math.floor(light*6/256))];
   for(let ch=0;ch<3;ch++)pixels[i+ch]=ink[ch];
  }
  ctx.putImageData(frame,0,0);
 }
 s.upload=canvas.toDataURL('image/jpeg',.92);view='tin';preview();
}
function photoControls(){
 const f=el('input');f.type='file';f.accept='image/png,image/jpeg,image/webp';
 field('Välj ditt porträtt',f);
 hint('Ta ett foto framifrån, gärna mot en lugn bakgrund. JPG, PNG eller WebP, högst 8 MB. Ditt foto bearbetas på din enhet.');
 const status=el('p',s.uploadName||'','hint');status.setAttribute('role','status');panel.append(status);
 f.onchange=async()=>{
  const file=f.files[0];if(!file)return;
  const version=++photoVersion;
  if(file.size>8388608){status.textContent='Bilden är för stor. Välj en mindre fil.';return}
  const src=URL.createObjectURL(file),img=new Image();
  try{
   img.src=src;await img.decode();
   if(version!==photoVersion || s.mode!=='Eget foto')return;
   photoOriginal=img;photoY=.5;s.uploadName=file.name;
   if(s.title===presets[s.preset][1])s.title='Din dosa';
   if(s.line===presets[s.preset][2])s.line='';
   generatePortrait();render();
  }catch{status.textContent='Bilden gick inte att läsa. Prova en JPG eller PNG.'}
  finally{URL.revokeObjectURL(src)}
 };
 if(photoOriginal){
  select('Bildstil',['Färgtryck','Svartvitt','Fotografi'],photoStyle,v=>{photoStyle=v;generatePortrait()});
  if(photoOriginal.height>photoOriginal.width){
   const offset=el('input');offset.type='range';offset.min=0;offset.max=100;offset.value=Math.round(photoY*100);
   field('Flytta beskärningen i höjdled',offset);
   offset.oninput=()=>{photoY=Number(offset.value)/100;generatePortrait()};
  }
 }
}

function render(){panel.replaceChildren();$('steps').replaceChildren();names.forEach((v,i)=>{const b=el('button',v,i===s.step?'current':'');b.onclick=()=>go(i);$('steps').append(b)});
 $('back').disabled=s.step===0;$('next').textContent=s.done?'Skapa en ny design':['Välj innehåll','Välj presentutförande','Granska min stock','Godkänn demokorrektur'][s.step];
 if(s.done){panel.append(el('h3','Ditt korrektur är klart.'));hint('Visningen är avslutad. Ingen order eller betalning har skickats.');}
 else if(s.step===1){panel.append(el('h3','Vad ska vara i dosan?'));choose(['Nikotinfritt','Med nikotin'],s.type,v=>{s.type=v;s.flavor=flavors()[0];s.strength=v==='Med nikotin'?'11,2 mg/påse':'';render()});
 select('Smak',flavors(),s.flavor,v=>{s.flavor=v;preview()});if(s.type==='Med nikotin'){select('Styrka',['11,2 mg/påse'],s.strength,v=>s.strength=v);hint('Denna produkt innehåller nikotin som är ett mycket beroendeframkallande ämne. 18 år.')}
 hint('Exempelsortiment för presentationen. Tillgängliga smaker och styrkor för Dosverkstan bekräftas med producenten.');}
 else if(s.step===0){
 if(s.mode==='Mall'&&s.preset===1){let intro=el('div',null,'photoIntro');
 intro.append(el('h3','Vem vill du sätta på locket?'),el('p','Max-dosan är ett illustrerat exempel. Prova själv genom att välja ett foto, skapa ett färgtryck och skriva din egen text.'));
 let btn=el('button','Prova med ditt foto','primary');btn.onclick=()=>{s.mode='Eget foto';view='tin';render();panel.querySelector('input[type=file]').focus()};intro.append(btn);panel.append(intro)}
 choose(['Mall','Eget foto','Beskriv motiv'],s.mode,v=>{s.mode=v;render()});
 if(s.mode==='Mall')select('Välj motiv',presets.map(p=>p[1]),presets[s.preset][1],v=>{setPreset(presets.findIndex(p=>p[1]===v));render()});
 if(s.mode==='Eget foto')photoControls();
 if(s.mode==='Beskriv motiv'){edit('Vad vill du avbilda?','brief',180);const suggest=el('button','Prova ett illustrerat förslag','secondary try');suggest.onclick=()=>{const words=s.brief.toLocaleLowerCase('sv');const matches=[/rör|verktyg|jour|vvs/,/porträtt|max|foto|ansikte/,/aik|gnag|solna/,/bajen|hammarby|söder/,/gårdar|djurgård|dif/];let idx=matches.findIndex(re=>re.test(words));setPreset(idx<0?(s.preset+1)%presets.length:idx);render()};panel.append(suggest);hint('Demon väljer ett färdigt illustrationsförslag ur kollektionen. Beskrivningen följer med i ditt korrektur.')}
 edit('Namn på din dosa','title',30);edit('Din hälsning','line',65);
 let pal=el('div',null,'palette');pal.append(el('span','Tryckfärg'));for(const [name,hex] of [['Original',presets[s.preset][3]],...colors]){
 const btn=el('button');btn.style.setProperty('--swatch',hex);btn.title=name;btn.setAttribute('aria-label',name);const val=name==='Original'?'':hex;
 btn.setAttribute('aria-pressed',color===val);btn.onclick=()=>{color=val;render()};pal.append(btn)}panel.append(pal);}
 else if(s.step===2){panel.append(el('h3','Hur ska den ges bort?'));select('Antal stockar',Array.from({length:10},(_,i)=>String(i+1)),String(s.qty),v=>{s.qty=Number(v);preview()});
 choose(['Standardomslag','Presentkartong'],s.gift?'Presentkartong':'Standardomslag',v=>{s.gift=v==='Presentkartong';render()});if(s.gift){edit('Hälsning på kortet','card',120);edit('Från (valfritt)','signature',45);hint('Tom avsändare ger ett osignerat kort.')}else hint('Stocken får ditt personliga pappersomslag runt skyddsplasten.')}
 else{panel.append(el('h3','Ditt demokorrektur'));let dl=el('dl');const rows=[['Innehåll',[s.type,s.flavor,s.strength].filter(Boolean).join(' · ')],['Omfattning',s.qty+' × 10 dosor'],['Omslag',[s.title||'Din dosa',s.line].filter(Boolean).join(' · ')],['Förpackning',s.gift?'Presentkartong med kort':'Stock med personligt omslag']];if(s.gift)rows.push(['Kort',[s.card,s.signature||'Osignerat'].join(' · ')]);if(s.mode==='Beskriv motiv')rows.push(['Motivbeskrivning',s.brief||'Ej angiven']);for(const [k,v] of rows)dl.append(el('dt',k),el('dd',v));panel.append(dl);hint('Endast presentation. Korrekturet skickas inte till produktion.')}
 preview()}
$('back').onclick=()=>go(Math.max(0,s.step-1));$('next').onclick=()=>{if(s.done){photoOriginal=null;photoVersion++;Object.assign(s,initial);color='';view='tin';render();return}if(s.step<3)go(s.step+1);else{s.done=true;render()}};
$('tinTab').onclick=()=>{view='tin';preview()};
$('wrapTab').onclick=()=>{view='wrap';preview()};
function useDesign(i){
 setPreset(i);s.title=presets[i][1];s.line=presets[i][2];s.mode='Mall';color='';view='tin';go(0);$('verkstan').scrollIntoView()
}
$('sourceToggle').onclick=()=>{sourceShown=!sourceShown;preview()};
$('useRor').onclick=()=>useDesign(0);
const captions=['AIK · Svart och guld','Hammarby · Grönt och vitt','Djurgården · Blå ränder'];
presets.slice(2).forEach((p,i)=>{
 const b=el('button',null,'card'),img=el('img');
 img.alt=p[1]+' med illustrerat supporterlock';img.loading='lazy';img.src='assets/'+p[0]+'-tin.webp';
 b.append(img,el('strong',p[1]),el('small',captions[i]));
 b.setAttribute('aria-label','Använd '+p[1]);b.onclick=()=>useDesign(i);$('cards').append(b)
});
let showBox=true;
$('giftView').onclick=()=>{showBox=!showBox;$('giftPhoto').src=showBox?'assets/hero.webp':'assets/stock.webp';$('giftPhoto').alt=showBox?'Öppen presentkartong med illustrerade prillor':'Stock med personligt pappersomslag';$('giftView').textContent=showBox?'Visa standardomslag':'Visa presentkartong'};
render();
