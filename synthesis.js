'use strict';
// Deterministic dossier export. The seller branch is an allowlist, never a redaction of agent text.
const synthesisScopes=[
 ['all','Tout le dossier'],['visits','Toutes les visites'],['visitor','Un visiteur précis'],
 ['period','Une période'],['interested','Intéressés uniquement'],['counter','Contre-visites'],
 ['refused','Refus'],['notes','Notes'],['tasks','Tâches / prochaines actions']
];
const synthesisFormats=[['complete','Synthèse complète'],['visitor','Synthèse d’un visiteur'],['seller','Version vendeur'],['structured','Données structurées']];
function synthesisPanel(p){
 const contacts=[...new Set(visits(p.id).map(v=>v.contact))].filter(id=>person(id));
 return `<section class="panel below synthesis-panel" id="synthesis-panel"><div class="row"><div><h2>Synthèse du dossier</h2><p class="hint">Générée depuis les données de ce dossier, sans IA. Copiez-la puis ouvrez votre outil de rédaction pour produire le livrable.</p></div></div><div class="synthesis-controls"><label>Périmètre<select id="synthesis-scope">${synthesisScopes.map(([id,label])=>`<option value="${id}">${label}</option>`).join('')}</select></label><label id="synthesis-visitor-wrap" hidden>Visiteur<select id="synthesis-visitor">${contacts.map(id=>`<option value="${esc(id)}">${esc(person(id).name)}</option>`).join('')}</select></label><label id="synthesis-from-wrap" hidden>Du<input id="synthesis-from" type="date"></label><label id="synthesis-to-wrap" hidden>Au<input id="synthesis-to" type="date"></label><label>Sortie<select id="synthesis-format">${synthesisFormats.map(([id,label])=>`<option value="${id}">${label}</option>`).join('')}</select></label></div><div class="synthesis-checks"><label class="check"><input id="synthesis-visits" type="checkbox" checked>Visites et retours</label><label class="check"><input id="synthesis-notes" type="checkbox" checked>Notes associées</label><label class="check"><input id="synthesis-tasks" type="checkbox" checked>Tâches / prochaines actions</label></div><p id="synthesis-privacy" class="hint" hidden>La version vendeur exclut les identités des visiteurs, leurs coordonnées, les commentaires et notes internes ainsi que les tâches de l’agent.</p><pre id="synthesis-output" class="synthesis-output" tabindex="0"></pre><div class="actions"><button id="synthesis-copy" type="button" class="primary">${icon('doc')}Copier la synthèse</button>${createDocumentLink()}<span id="synthesis-copy-status" class="hint" role="status" aria-live="polite"></span></div></section>`;
}
function synthesisSelection(p){
 const scope=$('synthesis-scope').value,visitor=$('synthesis-visitor').value,from=scope==='period'?$('synthesis-from').value:'',to=scope==='period'?$('synthesis-to').value:'';
 const include={visits:$('synthesis-visits').checked,notes:$('synthesis-notes').checked,tasks:$('synthesis-tasks').checked};
 let selected=visits(p.id);
 if(scope==='visitor')selected=selected.filter(v=>v.contact===visitor);
 if(scope==='period')selected=selected.filter(v=>(!from||v.date>=from)&&(!to||v.date<=to));
 if(scope==='interested')selected=selected.filter(v=>v.status==='Intéressé');
 if(scope==='counter')selected=selected.filter(v=>v.status==='Contre-visite');
 if(scope==='refused')selected=selected.filter(v=>v.status==='Refus');
 if(scope==='notes'||scope==='tasks')selected=[];
 const contacts=new Set(selected.map(v=>v.contact));
 const relatedRecord=item=>{
  if(scope==='all'||scope==='notes'||scope==='tasks')return true;
  if(scope==='period')return (!from||((item.due||item.created||'').slice(0,10)>=from))&&(!to||((item.due||item.created||'').slice(0,10)<=to));
  return scope==='visitor'?item.contact===visitor:contacts.has(item.contact);
 };
 const notes=state.notes.filter(n=>n.property===p.id&&relatedRecord(n));
 const tasks=state.tasks.filter(t=>t.property===p.id&&relatedRecord(t));
 return {scope,visitor,from,to,visits:include.visits?selected:[],notes:include.notes?notes:[],tasks:include.tasks?tasks:[],include};
}
function synthesisCounts(list){const statuses={};for(const v of list)statuses[v.status]=(statuses[v.status]||0)+1;return {visits:list.length,statuses,counterVisits:list.filter(v=>v.status==='Contre-visite').length,offers:list.filter(v=>v.offer!=null||v.status==='Offre').length};}
function synthesisTitle(p,format){return `${synthesisFormats.find(([id])=>id===format)[1]} — ${p.title}`;}
function synthesisText(p,selection,format){
 const {scope,visitor,from,to,visits:list,notes,tasks,include}=selection;
 const counts=synthesisCounts(list);
 const scopeLabel=synthesisScopes.find(([id])=>id===scope)[1];
 if(format==='seller'){
  const lines=[synthesisTitle(p,format),`${p.city} · ${money(p.price)} · ${p.status}`,`Périmètre : ${scope==='visitor'?'Une visite sélectionnée':scopeLabel}${scope==='period'?` (${from||'début'} au ${to||'fin'})`:''}`,`Visites : ${counts.visits} · Contre-visites : ${counts.counterVisits} · Offres : ${counts.offers}`];
  if(include.visits){lines.push('Visites et retours anonymisés :');lines.push(...(list.length?list.map(v=>`- ${visitDate(v)} · ${v.status}${v.offer!=null?` · Offre de ${money(v.offer)}`:''} · ${demoSellerSummaries[v.id]||'Retour non communiqué.'}${v.sellerResponse?` · Votre réponse : ${v.sellerResponse}`:''}`):['- Aucune visite pour cette sélection.']));}
  lines.push('Notes et tâches internes exclues.');return lines.join('\n');
 }
 const nameOf=v=>person(v.contact)?.name||v.name||'Visiteur non renseigné';
 if(format==='structured'){
  return JSON.stringify({type:'synthese_dossier',source:'Li.La DEMO — données fictives',bien:{id:p.id,titre:p.title,ville:p.city,prix_eur:p.price,statut:p.status},selection:{perimetre:scope,visiteur:scope==='visitor'?person(visitor)?.name||null:null,du:from||null,au:to||null},totaux:counts,visites:list.map(v=>({date:v.date,heure:v.time||null,visiteur:nameOf(v),statut:v.status,retour:v.comment||null,offre_eur:v.offer??null,reponse_vendeur:v.sellerResponse||null})),notes:notes.map(n=>({titre:n.title,texte:n.body,visiteur:n.contact?person(n.contact)?.name||null:null,date:n.created||null})),taches:tasks.map(t=>({intitule:t.title,statut:t.status,priorite:t.priority,echeance:t.due||null,visiteur:t.contact?person(t.contact)?.name||null:null}))},null,2);
 }
 const lines=[synthesisTitle(p,format),`${p.city} · ${money(p.price)} · ${p.status}`,`Périmètre : ${scope==='visitor'?`Visiteur ${person(visitor)?.name||'non renseigné'}`:scopeLabel}${scope==='period'?` (${from||'début'} au ${to||'fin'})`:''}`,`Visites : ${counts.visits} · Contre-visites : ${counts.counterVisits} · Offres : ${counts.offers}`];
 if(include.visits){lines.push('Statuts : '+(Object.entries(counts.statuses).map(([status,count])=>`${status} ${count}`).join(' · ')||'aucun'));lines.push('Visites et retours :');lines.push(...(list.length?list.map(v=>`- ${nameOf(v)} · ${visitDate(v)} · ${v.status}${v.offer!=null?` · Offre ${money(v.offer)}`:''}${v.sellerResponse?` · Réponse vendeur : ${v.sellerResponse}`:''}\n  Retour : ${v.comment||'Aucun retour saisi.'}`):['- Aucune visite pour cette sélection.']));}
 if(include.notes){lines.push('Notes associées :');lines.push(...(notes.length?notes.map(n=>`- ${n.title}${n.contact?` (${person(n.contact)?.name||'contact'})`:''}${n.created?` · ${dateLabel(n.created.slice(0,10))}`:''} : ${n.body}`):['- Aucune note pour cette sélection.']));}
 if(include.tasks){lines.push('Tâches et prochaines actions :');lines.push(...(tasks.length?tasks.map(t=>`- ${t.title} · ${t.status} · échéance ${dateLabel(t.due)}${t.contact?` · ${person(t.contact)?.name||'contact'}`:''}`):['- Aucune tâche pour cette sélection.']));}
 return lines.join('\n');
}
function updateSynthesis(p,changed){
 const scope=$('synthesis-scope'),format=$('synthesis-format');
 if(changed==='format'&&format.value==='visitor')scope.value='visitor';
 if(changed==='scope'&&scope.value!=='visitor'&&format.value==='visitor')format.value='complete';
 if(changed==='scope'){
  const presets={visits:[true,false,false],notes:[false,true,false],tasks:[false,false,true]};
  const values=presets[scope.value]||[true,true,true];['visits','notes','tasks'].forEach((key,i)=>$('synthesis-'+key).checked=values[i]);
 }
 $('synthesis-visitor-wrap').hidden=scope.value!=='visitor';
 $('synthesis-from-wrap').hidden=scope.value!=='period';$('synthesis-to-wrap').hidden=scope.value!=='period';
 $('synthesis-privacy').hidden=format.value!=='seller';
 const invalid=scope.value==='period'&&$('synthesis-from').value&&$('synthesis-to').value&&$('synthesis-from').value>$('synthesis-to').value;
 $('synthesis-output').textContent=invalid?'La date de début doit précéder la date de fin.':synthesisText(p,synthesisSelection(p),format.value);
 $('synthesis-copy').disabled=Boolean(invalid);$('synthesis-copy-status').textContent='';
}
function bindSynthesis(p){
 const panel=$('synthesis-panel');panel.addEventListener('change',event=>{if(event.target.id?.startsWith('synthesis-'))updateSynthesis(p,event.target.id==='synthesis-scope'?'scope':event.target.id==='synthesis-format'?'format':'other');});
 panel.addEventListener('input',event=>{if(event.target.type==='date')updateSynthesis(p,'other');});
 $('synthesis-copy').addEventListener('click',async()=>{$('synthesis-copy-status').textContent=await copyText($('synthesis-output').textContent)?'Synthèse copiée.':'Copie impossible sur ce navigateur. Sélectionnez le texte ci-dessus.';});
 updateSynthesis(p,'initial');
}

async function copyText(value){try{await navigator.clipboard.writeText(value);return true;}catch{const field=document.createElement('textarea');field.value=value;field.style.cssText='position:fixed;left:-9999px;top:0';document.body.append(field);field.select();let copied=false;try{copied=document.execCommand('copy');}catch{}field.remove();return copied;}}
