'use strict';
// "Mes outils": personal shortcuts to the user's own tools. Plain links, no API and no key.
// Ten fixed slots; the user can rename, relabel, hide or repoint each one.
const defaultTools=()=>[
 {id:'chatgpt',name:'ChatGPT',label:'Compte rendu de visite',url:'https://chatgpt.com/'},
 {id:'claude',name:'Claude',label:'Synthèse vendeur',url:'https://claude.ai/'},
 {id:'gemini',name:'Gemini',label:'',url:'https://gemini.google.com/'},
 {id:'gamma',name:'Gamma',label:'Présentation vendeur',url:'https://gamma.app/'},
 {id:'canva',name:'Canva',label:'Annonce immobilière',url:'https://www.canva.com/'},
 {id:'gmail',name:'Gmail',label:'',url:'https://mail.google.com/'},
 {id:'agenda',name:'Agenda',label:'',url:'https://calendar.google.com/'},
 {id:'drive',name:'Drive',label:'',url:'https://drive.google.com/'},
 {id:'notion',name:'Notion',label:'',url:'https://www.notion.so/'},
 {id:'autre',name:'Autre',label:'',url:'',hidden:true}
];
const safeUrl=url=>/^https:\/\/[^\s"'<>]+$/i.test(url||'');
function userTools(){const saved=state.tools||[];return defaultTools().map(t=>({...t,...(saved.find(s=>s.id===t.id)||{})}));}
function docTool(){const list=userTools().filter(t=>safeUrl(t.url));return list.find(t=>t.id===state.docTool)||list.find(t=>t.id==='gamma')||list[0];}
const toolLogo=t=>`<span class="tool-logo tone-${esc(t.id)}" aria-hidden="true">${esc((t.name||'?').trim().slice(0,1).toUpperCase())}</span>`;
// Opens the chosen external tool in a new tab; the user pastes the copied synthesis there.
function createDocumentLink(){const t=docTool();const list=userTools().filter(t=>safeUrl(t.url));return t?`<span class="create-doc-group"><a class="button create-doc" href="${esc(t.url)}" target="_blank" rel="noopener noreferrer" title="Ouvre l’outil choisi dans un nouvel onglet">${icon('sparkle')}Créer mon document<small>${esc(t.name)}</small></a><select data-doc-tool aria-label="Outil de création du document">${list.map(o=>`<option value="${esc(o.id)}" ${o.id===t.id?'selected':''}>${esc(o.name)}</option>`).join('')}</select></span>`:'';}
function toolsBar(){const list=userTools().filter(t=>!t.hidden&&safeUrl(t.url));return `<div class="tools-inner"><div class="tools-head"><strong>Mes outils</strong><button type="button" class="ghost small icon-only" data-tools-config aria-label="Configurer mes outils">${icon('gear')}</button></div><div class="tools-list">${list.map(t=>`<a class="tool" href="${esc(t.url)}" target="_blank" rel="noopener noreferrer" title="${esc(t.name+(t.label?' · '+t.label:''))}">${toolLogo(t)}<span class="tool-text"><strong>${esc(t.name)}</strong>${t.label?`<small>${esc(t.label)}</small>`:''}</span></a>`).join('')||'<span class="hint">Aucun outil affiché.</span>'}</div></div>`;}
function toolsConfig(){const list=userTools();showModal(`<p class="eyebrow">Mes outils</p><h2 id="detail-title">Configurer mes raccourcis</h2><p class="hint">Liens vers vos outils personnels. Rien n’est connecté : chaque raccourci ouvre simplement l’adresse indiquée.</p><form id="tools-form" class="editor-form">${list.map(t=>`<div class="tool-row" data-tool-id="${esc(t.id)}">${toolLogo(t)}<label class="check"><input type="checkbox" name="visible-${esc(t.id)}" ${t.hidden?'':'checked'}>Afficher</label><label>Nom<input name="name-${esc(t.id)}" value="${esc(t.name)}" maxlength="30" required></label><label>Intitulé<input name="label-${esc(t.id)}" value="${esc(t.label||'')}" maxlength="40"></label><label>Adresse<input name="url-${esc(t.id)}" type="url" value="${esc(t.url||'')}" placeholder="https://…" maxlength="300"></label></div>`).join('')}<label>Outil ouvert par « Créer mon document »<select name="docTool">${list.map(t=>`<option value="${esc(t.id)}" ${t.id===(docTool()?.id)?'selected':''}>${esc(t.name)}</option>`).join('')}</select></label><p id="tools-error" role="alert"></p><div class="actions"><button type="submit" class="primary">Enregistrer</button><button type="button" data-tools-reset>Rétablir les outils par défaut</button><button type="button" data-cancel>Annuler</button></div></form>`);
 $('tools-form').addEventListener('submit',event=>{event.preventDefault();const f=event.target;const next=list.map(t=>({id:t.id,name:f.elements['name-'+t.id].value.trim()||t.name,label:f.elements['label-'+t.id].value.trim(),url:f.elements['url-'+t.id].value.trim(),hidden:!f.elements['visible-'+t.id].checked}));const bad=next.find(t=>t.url&&!safeUrl(t.url));if(bad){$('tools-error').textContent=`L’adresse de ${bad.name} doit commencer par https://.`;return;}state.tools=next;state.docTool=f.elements.docTool.value;save();$('detail').close();render();notify('Mes outils ont été mis à jour.');});}
