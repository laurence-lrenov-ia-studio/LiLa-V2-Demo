'use strict';
const $ = id => document.getElementById(id);
const spaces = [
  ['Ma journée','calendar','Vos priorités, au même endroit.','Votre agenda et vos priorités seront réunis ici. Aucun agenda n’est encore connecté.'],
  ['Notes','notes','Une idée, un détail, un rappel.','L’espace Notes est prêt à accueillir vos mémos. La version de référence ne dispose pas encore de sauvegarde durable : la création et la dictée seront raccordées dans une prochaine étape.'],
  ['Tâches','checkbox','Garder le fil de vos actions.','Vos tâches et leurs échéances apparaîtront ici après raccordement.'],
  ['Mon Réseau / CRM','users','Vos contacts et vos échanges.','Votre réseau professionnel sera accessible ici. Aucun contact n’est importé à cette étape.'],
  ['Biens & projets','building-estate','Suivre chaque projet immobilier.','Le suivi des biens et projets sera raccordé dans une prochaine étape.'],
  ['Hub Immobilier Li.La','home-search','Votre espace immobilier neutre.','Un espace immobilier Li.La indépendant, à construire. Le Hub Maison d’AVA reste dans son environnement existant.']
];
const tools = [
  ['ChatGPT','sparkles','https://chatgpt.com/'],['Claude','asterisk','https://claude.ai/'],
  ['Gemini','star','https://gemini.google.com/'],['Gamma','presentation','https://gamma.app/'],
  ['Gmail','mail','https://mail.google.com/'],['Agenda','calendar','https://calendar.google.com/']
];
// This standalone demo never creates an authenticated session.
function currentProfile(){ return lilaReadUserProfile(); }
$('greeting').textContent = 'Bonjour, '+currentProfile().firstName+'.';
function openDetail(title, copy){
  $('profile-fields').replaceChildren();
  $('detail-status').textContent = '';
  $('detail-title').textContent = title; $('detail-copy').textContent = copy;
  $('detail').showModal();
}
function renderSearch(){
  const normalize = text => text.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  const query = normalize($('search').value.trim());
  let count = 0;
  document.querySelectorAll('[data-search]').forEach(el => { el.hidden = !normalize(el.dataset.search).includes(query); if(!el.hidden) count++; });
  $('no-results').hidden = count > 0;
}
spaces.forEach(([title,icon,description,copy], index) => {
  const button = document.createElement('button'); button.className = 'space'; button.dataset.search = title+' '+description;
  const colors = [['#FDEEE4','#C75F28'],['#F1ECF5','#7C6491'],['#EBF0E7','#5E7350']][index%3];
  button.style.setProperty('--tint',colors[0]); button.style.setProperty('--ink',colors[1]);
  button.innerHTML = `<span class="icon"><i class="ti ti-${icon}" aria-hidden="true"></i></span><span class="badge">À venir</span><strong>${title}</strong><span class="description">${description}</span>`;
  button.addEventListener('click',()=>openDetail(title,copy)); $('spaces').append(button);
});
tools.forEach(([name,icon,url])=>{
  const link = document.createElement('a'); link.className='tool'; link.href=url; link.target='_blank'; link.rel='noopener noreferrer'; link.dataset.search=name;
  link.innerHTML=`<i class="ti ti-${icon}" aria-hidden="true"></i>${name}`; link.setAttribute('aria-label',name+' — nouvel onglet'); $('tools').append(link);
});
$('today').textContent = new Date().toLocaleDateString('fr-FR',{weekday:'long',day:'numeric',month:'long'});
$('search').addEventListener('input',renderSearch);
$('detail').querySelector('.close').addEventListener('click',()=>$('detail').close());
$('profile-button').addEventListener('click',()=>{
  openDetail('Mon profil','Profil fictif de démonstration, uniquement pour l’affichage. Aucune donnée personnelle chargée.');
  const profile=currentProfile(); const dl=document.createElement('dl');
  Object.entries({firstName:'Prénom',lastName:'Nom',email:'E-mail',phone:'Téléphone',job:'Métier',company:'Entreprise',location:'Localisation',signature:'Signature'}).forEach(([key,label])=>{
    const dt=document.createElement('dt'), dd=document.createElement('dd'); dt.textContent=label; dd.textContent=profile[key]||'Non renseigné'; dl.append(dt,dd);
  });
  $('profile-fields').append(dl);
});
$('weather').addEventListener('click',()=>{
  const message = text => { $('weather').textContent=text; };
  if(!navigator.geolocation){ message('Localisation indisponible'); return; }
  message('Localisation…');
  navigator.geolocation.getCurrentPosition(async position=>{
    try{
      const {latitude,longitude}=position.coords;
      const response=await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m`,{signal:AbortSignal.timeout(10000)});
      if(!response.ok) throw new Error('weather');
      const data=await response.json(); const temperature=data.current?.temperature_2m;
      if(typeof temperature!=='number') throw new Error('weather');
      message('Ma position · '+Math.round(temperature)+' °C');
    }catch{ message('Météo indisponible · réessayer'); }
  },()=>message('Position indisponible · réessayer'),{timeout:6000,maximumAge:600000});
});
