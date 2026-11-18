'use strict';
const $=id=>document.getElementById(id);
const presets=[
 ['ror','Rörmokarsnus','Tack för alla år, Janne!','#813e28'],
 ['max','Max','Max en åt gången.','#1e474a'],
 ['gnaget','Gnagetsnus','Samma plats, varje match.','#433823'],
 ['bajen','Bajensnus','Vi ses på Söder.','#285039'],
 ['gardar','Gårdarsnus','Till min bästa matchkompis.','#253f62']
];
const s={step:0,empty:false,type:'Nikotinfritt',flavor:'Mentol',strength:'',preset:1,title:'Max',line:'Max en åt gången.',gift:true,qty:1,card:'',signature:'',mode:'Mall',brief:'',upload:'',uploadName:'',done:false};
const initial={...s};
const names=['Design','Innehåll','Present','Översikt'];
// Stock and lid use the same paper and ink, including when the customer changes the ink.
const labels={
 ror:    {paper:'#f1dfb9', ink:'#573225', foil:'#ad6940'},
 max:    {paper:'#193638', ink:'#ffe0aa', foil:'#d98c59'},
 gnaget: {paper:'#1c1b19', ink:'#f3d58a', foil:'#bd963e'},
 bajen:  {paper:'#f4e8cd', ink:'#19452e', foil:'#b39142'},
 gardar: {paper:'#152a48', ink:'#f2deb2', foil:'#79aacf'}
};
const colors=[['Skogsgrön','#254632'],['Indigo','#1b365a'],['Tegel','#993e2e'],['Plommon','#653548']];
let sourceShown=false, color='',view='tin';
try {
 const stored=JSON.parse(sessionStorage.getItem('dosverkstan-portratt')||'null');
 if(stored && Number.isInteger(stored.preset) && presets[stored.preset]){
 for(const k of ['title','line','flavor','type','strength','card','signature','brief'])if(typeof stored[k]==='string')s[k]=stored[k];
 s.mode=['Mall','Eget foto','Beskriv motiv'].includes(stored.mode)?stored.mode:'Mall';
 s.step=s.mode==='Eget foto'?0:Math.max(0,Math.min(3,Number(stored.step)||0));
 s.done=s.step===3 && stored.done===true;
 s.empty=stored.empty===true;
 if(s.empty && s.step===1)s.step=2;
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
 const pendingPhoto=s.mode==='Eget foto'&&!uploaded;
 const custom=s.empty||s.title!==p[1]||s.line!==p[2]||color||uploaded||(s.type==='Med nikotin'&&s.preset<2);
 const lid=view==='tin',stage=$('stageImage');stage.classList.toggle('withPortrait',Boolean(uploaded));
 const palette=labels[p[0]];
 stage.style.setProperty('--print',color||palette.ink);
 stage.style.setProperty('--paper',color?'#f5ecd9':palette.paper);
 stage.style.setProperty('--foil',color||palette.foil);
 stage.dataset.design=p[0];
 stage.classList.toggle('wrapMode',!lid);
 stage.classList.toggle('pendingPhoto',pendingPhoto&&lid);
 $('photoPlaceholder').hidden=!(pendingPhoto&&lid);
 const showSource=s.mode==='Mall'&&s.preset===1&&lid&&!custom;
 $('sourceToggle').hidden=!showSource;
 if(!showSource)sourceShown=false;
 $('sourceToggle').setAttribute('aria-pressed',sourceShown);
 $('sourceToggle').querySelector('span').textContent=sourceShown?'Visa dosan':'Originalfoto';
 $('sourceToggle').setAttribute('aria-label',sourceShown?'Visa Max-dosan':'Se fotot bakom Max-dosan');
 const path=pendingPhoto&&lid?'assets/blank.webp':sourceShown?'assets/max-source.webp':lid&&custom?'assets/blank.webp':'assets/'+p[0]+'-tin.webp';
 if($('scene').getAttribute('src')!==path)$('scene').src=path;
 $('scene').alt=pendingPhoto?'Dosa som väntar på ditt foto':sourceShown?'Max på originalfotot':custom?'Fotografisk dosmodell med din etikett':p[1]+' med tryckt, illustrerat lock';
 $('label').hidden=!lid||!custom||pendingPhoto;$('wrap').hidden=lid;
 $('labelTitle').textContent=$('wrapTitle').textContent=s.title||'Din dosa';
 $('labelLine').textContent=$('wrapLine').textContent=s.line;
 $('labelKind').textContent=s.empty?'PERSONLIG DOSA':s.type==='Med nikotin'?'NIKOTINPORTIONER':'NIKOTINFRIA PORTIONER';
 const artwork=uploaded||'assets/'+p[0]+'-art.webp';
 for(const id of ['art','wrapArt','sleeveTexture']){
  const image=$(id);
  if(pendingPhoto){image.removeAttribute('src');image.hidden=true;}
  else{image.hidden=false;if(image.getAttribute('src')!==artwork)image.src=artwork;}
 }
 $('wrapArt').alt=uploaded?'Ditt foto på stockomslaget':'Stockomslag med motiv från '+p[1];
 $('wrapEmpty').hidden=!pendingPhoto;
 $('wrap').classList.toggle('longTitle',s.title.length>16);
 $('wrap').classList.toggle('longGreeting',s.line.length>35);
 $('art').alt=uploaded?'Ditt uppladdade motiv':'Illustration ur '+p[1];
 $('labelTitle').style.fontSize=s.title.length>20?'3.8cqw':'';
 $('caption').textContent=(s.title||'Din dosa')+(s.empty?' · 1 tom dosa':' · '+s.qty*10+' dosor');
 $('tinTab').setAttribute('aria-pressed',lid);$('wrapTab').setAttribute('aria-pressed',!lid);
 save();
}
function field(title,input){let l=el('label',null,'field');l.append(document.createTextNode(title),input);panel.append(l);return input}
function edit(title,key,max){let i=el('input');i.value=s[key];i.maxLength=max;field(title,i);i.oninput=()=>{s[key]=i.value;preview()}}
function select(title,items,value,fn){let n=el('select');for(const x of items)n.add(new Option(x,x));n.value=value;field(title,n);n.onchange=()=>fn(n.value)}
function choose(values,current,fn){let row=el('div',null,'choices');values.forEach(x=>{let b=el('button',x);b.setAttribute('aria-pressed',x===current);b.onclick=()=>fn(x);row.append(b)});panel.append(row)}
function hint(t){panel.append(el('p',t,'hint'))}
function setPreset(i){const old=presets[s.preset];if(!s.title||s.title===old[1])s.title=presets[i][1];if(!s.line||s.line===old[2])s.line=presets[i][2];s.preset=i;}
function go(i){
 if(i>0 && s.mode==='Eget foto' && !s.upload)return;
 s.step=i;s.done=false;sourceShown=false;render()
}
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
 s.upload=canvas.toDataURL('image/jpeg',.92);preview();
}
function photoControls(){
 const f=el('input');f.type='file';f.accept='image/png,image/jpeg,image/webp';
 field('Välj ditt porträtt',f);
 hint('Ta ett foto framifrån, gärna mot en lugn bakgrund. JPG, PNG eller WebP, högst 8 MB. Ditt foto bearbetas på din enhet.');
 const status=el('p',s.uploadName||'Välj ett foto för att fortsätta. Vid omladdning behöver fotot väljas igen.','hint');status.setAttribute('role','status');panel.append(status);
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

function render(){panel.replaceChildren();$('steps').replaceChildren();names.forEach((v,i)=>{if(s.empty&&i===1)return;const b=el('button',v,i===s.step?'current':'');b.setAttribute('aria-current',i===s.step?'step':'false');b.disabled=i>0&&s.mode==='Eget foto'&&!s.upload;b.onclick=()=>go(i);$('steps').append(b)});
 $('stockFormat').setAttribute('aria-pressed',String(!s.empty));
 $('emptyFormat').setAttribute('aria-pressed',String(s.empty));
 $('wrapTab').hidden=s.empty;
 $('back').disabled=s.step===0;$('next').disabled=s.mode==='Eget foto'&&!s.upload;$('next').textContent=s.done?'Skapa en ny design':[s.empty?'Välj presentutförande':'Välj innehåll','Välj presentutförande',s.empty?'Granska min dosa':'Granska min stock','Godkänn demokorrektur'][s.step];
 if(s.done){panel.append(el('h3','Ditt korrektur är klart.'));hint('Visningen är avslutad. Ingen order eller betalning har skickats.');}
 else if(s.step===1){panel.append(el('h3','Vad ska vara i dosan?'));choose(['Nikotinfritt','Med nikotin'],s.type,v=>{if(s.type===v)return;s.type=v;s.flavor=flavors()[0];s.strength=v==='Med nikotin'?'11,2 mg/påse':'';render()});
 select('Smak',flavors(),s.flavor,v=>{s.flavor=v;preview()});if(s.type==='Med nikotin'){select('Styrka',['11,2 mg/påse'],s.strength,v=>s.strength=v);hint('Denna produkt innehåller nikotin som är ett mycket beroendeframkallande ämne. 18 år.')}
 hint('Exempelsortiment för presentationen. Tillgängliga smaker och styrkor för Dosverkstan bekräftas med producenten.');}
 else if(s.step===0){
 if(s.mode==='Mall'&&s.preset===1){let intro=el('div',null,'photoIntro');
 intro.append(el('h3','Vem vill du sätta på locket?'),el('p','Max-dosan är ett illustrerat exempel. Prova själv genom att välja ett foto, skapa ett färgtryck och skriva din egen text.'));
 let btn=el('button','Prova med ditt foto','primary');btn.onclick=()=>{s.mode='Eget foto';view='tin';render();panel.querySelector('input[type=file]').focus()};intro.append(btn);panel.append(intro)}
 choose(['Mall','Eget foto','Beskriv motiv'],s.mode,v=>{photoVersion++;s.mode=v;sourceShown=false;view='tin';render()});
 if(s.mode==='Mall')select('Välj motiv',presets.map(p=>p[1]),presets[s.preset][1],v=>{setPreset(presets.findIndex(p=>p[1]===v));render()});
 if(s.mode==='Eget foto')photoControls();
 if(s.mode==='Beskriv motiv'){edit('Vad vill du avbilda?','brief',180);const feedback=el('p','','hint');feedback.setAttribute('role','status');const suggest=el('button','Prova ett illustrerat förslag','secondary try');suggest.onclick=()=>{const words=s.brief.toLocaleLowerCase('sv');const matches=[/rör|verktyg|jour|vvs/,/porträtt|max|foto|ansikte/,/aik|gnag|solna/,/bajen|hammarby|söder/,/gårdar|djurgård|dif/];let idx=matches.findIndex(re=>re.test(words));if(idx<0){feedback.textContent='Ingen matchning i demokollektionen. Prova exempelvis AIK, Hammarby, Djurgården, porträtt eller rörmokare.';return}setPreset(idx);render()};panel.append(suggest,feedback);hint('Demon väljer ett färdigt illustrationsförslag ur kollektionen. Beskrivningen följer med i ditt korrektur.')}
 edit('Namn på din dosa','title',30);edit('Din hälsning','line',65);
 let pal=el('div',null,'palette');pal.append(el('span','Tryckfärg'));for(const [name,hex] of [['Original',labels[presets[s.preset][0]].ink],...colors]){
 const btn=el('button');btn.style.setProperty('--swatch',hex);btn.title=name;btn.setAttribute('aria-label',name);const val=name==='Original'?'':hex;
 btn.setAttribute('aria-pressed',color===val);btn.onclick=()=>{color=val;render()};pal.append(btn)}panel.append(pal);}
 else if(s.step===2){panel.append(el('h3','Hur ska den ges bort?'));if(!s.empty)select('Antal stockar',Array.from({length:10},(_,i)=>String(i+1)),String(s.qty),v=>{s.qty=Number(v);preview()});
 const standard=s.empty?'Endast dosan':'Standardomslag';
 choose([standard,'Presentkartong'],s.gift?'Presentkartong':standard,v=>{s.gift=v==='Presentkartong';render()});if(s.gift){edit('Hälsning på kortet','card',120);edit('Från (valfritt)','signature',45);hint('Tom avsändare ger ett osignerat kort.')}else if(s.empty)hint('Din personliga dosa levereras tom.');else hint('Stocken får ditt personliga pappersomslag runt skyddsplasten.')}
 else{panel.append(el('h3','Ditt demokorrektur'));let dl=el('dl');const rows=[['Motiv',s.mode==='Eget foto'?'Eget foto · '+s.uploadName:presets[s.preset][1]],['Innehåll',s.empty?'Tom dosa att fylla själv':[s.type,s.flavor,s.strength].filter(Boolean).join(' · ')],['Omfattning',s.empty?'1 dosa':s.qty+' × 10 dosor'],[s.empty?'Lock':'Omslag',[s.title||'Din dosa',s.line].filter(Boolean).join(' · ')],['Förpackning',s.gift?'Presentkartong med kort':s.empty?'Endast dosan':'Stock med personligt omslag']];if(s.gift)rows.push(['Kort',[s.card,s.signature||'Osignerat'].filter(Boolean).join(' · ')]);if(s.mode==='Beskriv motiv')rows.push(['Motivbeskrivning',s.brief||'Ej angiven']);for(const [k,v] of rows)dl.append(el('dt',k),el('dd',v));panel.append(dl);hint('Endast presentation. Korrekturet skickas inte till produktion.')}
 preview()}
$('back').onclick=()=>go(s.empty&&s.step===2?0:Math.max(0,s.step-1));$('next').onclick=()=>{if(s.done){photoOriginal=null;photoVersion++;photoY=.5;photoStyle='Färgtryck';sourceShown=false;Object.assign(s,initial);color='';view='tin';render();return}if(s.step<3)go(s.empty&&s.step===0?2:s.step+1);else{s.done=true;render()}};
$('tinTab').onclick=()=>{view='tin';preview()};
$('wrapTab').onclick=()=>{view='wrap';preview()};
function setFormat(empty){
 if(s.empty===empty)return;
 s.empty=empty;
 if(empty)view='tin';
 go(empty&&s.step===1?2:s.step);
}
$('stockFormat').onclick=()=>setFormat(false);
$('emptyFormat').onclick=()=>setFormat(true);
function useDesign(id){
 const i=presets.findIndex(p=>p[0]===id);
 if(i<0)return;
 photoVersion++;sourceShown=false;setPreset(i);s.title=presets[i][1];s.line=presets[i][2];s.mode='Mall';color='';view='tin';go(0);$('verkstan').scrollIntoView()
}
$('sourceToggle').onclick=()=>{sourceShown=!sourceShown;preview()};
$('useRor').onclick=()=>useDesign('ror');
const captions=['AIK · Svart och guld','Hammarby · Grönt och vitt','Djurgården · Blå ränder'];
presets.slice(2).forEach((p,i)=>{
 const b=el('button',null,'card'),img=el('img');
 img.alt=p[1]+' med illustrerat supporterlock';img.loading='lazy';img.src='assets/'+p[0]+'-tin.webp';
 b.append(img,el('strong',p[1]),el('small',captions[i]));
 b.setAttribute('aria-label','Använd '+p[1]);b.onclick=()=>useDesign(p[0]);$('cards').append(b)
});
let showBox=true;
$('giftView').onclick=()=>{showBox=!showBox;$('giftPhoto').src=showBox?'assets/hero.webp':'assets/stock.webp';$('giftPhoto').alt=showBox?'Öppen presentkartong med illustrerade prillor':'Stock med personligt pappersomslag';$('giftView').textContent=showBox?'Visa standardomslag':'Visa presentkartong'};
render();
