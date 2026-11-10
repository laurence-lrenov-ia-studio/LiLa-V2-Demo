'use strict';
// Proof of concept: isolated from Li.La V2's core, no Supabase, no backend, no token persistence.
// The existing Li.La localStorage is READ ONLY. This file writes only through explicit
// user actions to Google Calendar's events.insert endpoint.
(() => {
  const $ = id => document.getElementById(id);
  const SCOPES = {
    read: 'https://www.googleapis.com/auth/calendar.calendarlist.readonly https://www.googleapis.com/auth/calendar.events.readonly',
    write: 'https://www.googleapis.com/auth/calendar.events'
  };
  let readToken = null;
  let writeToken = null;
  let clientId = null;
  let calendars = [];
  let readClient = null;
  let writeClient = null;
  let chosenCalendars = new Set();
  let visits = [];
  const uploaded = new Set();

  function status(message, tone='') {
    $('status').textContent = message;
    $('status').className = 'status' + (tone ? ' ' + tone : '');
  }
  function setButtons() {
    $('authorize-write').disabled = !readToken;
    $('disconnect').disabled = !readToken && !writeToken;
    $('load-events').disabled = !readToken;
    $('create').disabled = !writeToken || !$('target').value;
  }
  function empty(parent, message) {
    parent.replaceChildren();
    const p = document.createElement('p'); p.className='muted'; p.textContent=message; parent.append(p);
  }
  function localDayOffset(offset=0) {
    const d = new Date(); d.setDate(d.getDate()+offset);
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  }
  async function googleFetch(path, token, options={}) {
    if (!token) throw new Error('Connexion Google nécessaire.');
    const response = await fetch('https://www.googleapis.com/calendar/v3' + path, {
      ...options,
      headers: {...options.headers, Authorization:'Bearer '+token}
    });
    const body = await response.json().catch(()=>({}));
    if (!response.ok) {
      if (response.status === 401) throw new Error('Autorisation expirée : reconnectez Google.');
      const reason = body?.error?.message || response.statusText;
      throw new Error(`Google Agenda (${response.status}) : ${reason}`);
    }
    return body;
  }
  function getClients() {
    const id = $('client-id').value.trim();
    if (!/^[\w-]+\.apps\.googleusercontent\.com$/.test(id)) {
      throw new Error('Renseignez un identifiant client OAuth de type …apps.googleusercontent.com (pas de secret).');
    }
    if (!window.google?.accounts?.oauth2) {
      throw new Error('Bibliothèque Google indisponible : contrôlez la connexion Internet ou le blocage des scripts.');
    }
    if (id === clientId && readClient && writeClient) return;
    clientId = id;
    readToken = null; writeToken = null; calendars = []; chosenCalendars.clear();
    readClient = google.accounts.oauth2.initTokenClient({
      client_id: id,
      scope: SCOPES.read,
      callback: async result => {
        if (result.error || !result.access_token) {status('Accès Google refusé ou interrompu : '+(result.error||'inconnu'),'error');return;}
        readToken=result.access_token;
        setButtons();
        try {await loadCalendars(); status('Google connecté en lecture seule. Choisissez les agendas à afficher.','ok');}
        catch (e) {status(e.message,'error');}
      }
    });
    writeClient = google.accounts.oauth2.initTokenClient({
      client_id: id,
      scope: SCOPES.write,
      callback: result => {
        if(result.error || !result.access_token){status('Autorisation d’écriture refusée ou interrompue.','error');return;}
        writeToken=result.access_token;
        setButtons();
        status('Ajout d’événements autorisé pour cette session. Aucun événement n’a été créé.','ok');
      }
    });
  }
  function connect() {
    try {getClients();readClient.requestAccessToken();status('Ouverture de la fenêtre Google…');}
    catch(e){status(e.message,'error');}
  }
  function authorizeWrite() {
    try {getClients();writeClient.requestAccessToken();status('Demande d’autorisation pour créer une visite…');}
    catch(e){status(e.message,'error');}
  }
  function disconnect() {
    // Forget tokens only; never store them in localStorage/sessionStorage/cookies.
    const tokens = [...new Set([readToken, writeToken].filter(Boolean))];
    readToken=null;writeToken=null;calendars=[];chosenCalendars.clear();
    if(google?.accounts?.oauth2?.revoke) {
      for(const token of tokens) google.accounts.oauth2.revoke(token,()=>{});
    }
    empty($('calendars'),'Calendriers déconnectés.');
    empty($('events'),'Aucun événement chargé.');
    $('target').replaceChildren(new Option('Connectez Google',''));
    $('target').disabled=true;
    setButtons();status('Session Google déconnectée. Les visites Li.La n’ont pas été modifiées.');
  }
  async function loadCalendars() {
    const body=await googleFetch('/users/me/calendarList?maxResults=250',readToken);
    calendars=body.items||[];
    chosenCalendars=new Set(calendars.filter(c=>c.primary || c.selected).map(c=>c.id));
    if(!chosenCalendars.size && calendars.length)chosenCalendars.add(calendars[0].id);
    const host=$('calendars');host.replaceChildren();
    for(const cal of calendars) {
      const row=document.createElement('div');row.className='cal-item';
      const label=document.createElement('label');
      const input=document.createElement('input');input.type='checkbox';input.checked=chosenCalendars.has(cal.id);
      input.addEventListener('change',()=>{if(input.checked)chosenCalendars.add(cal.id);else chosenCalendars.delete(cal.id);});
      const name=document.createElement('span');name.textContent=cal.summaryOverride||cal.summary||'Sans titre';
      label.append(input,name);
      const access=document.createElement('small');access.textContent=cal.accessRole||'';
      row.append(label,access);host.append(row);
    }
    if (!calendars.length)empty(host,'Aucun agenda disponible.');
    const dest=$('target');dest.replaceChildren();
    const writable=calendars.filter(c=>['writer','owner'].includes(c.accessRole));
    for(const cal of writable)dest.add(new Option(cal.summaryOverride||cal.summary||cal.id,cal.id));
    if(!writable.length)dest.add(new Option('Aucun agenda modifiable',''));
    dest.disabled=!writable.length;
    const primary=writable.find(c=>c.primary);if(primary)dest.value=primary.id;
    setButtons();await loadEvents();
  }
  async function loadEvents() {
    if(!readToken){status('Connectez Google pour lire les rendez-vous.','error');return;}
    const selected=calendars.filter(c=>chosenCalendars.has(c.id));
    if(selected.length>20){status('Sélectionnez au maximum 20 agendas pour cet essai.','error');return;}
    const day=$('day').value||localDayOffset();
    const start=new Date(day+'T00:00:00');const end=new Date(start);end.setDate(end.getDate()+1);
    const items=[];
    try {
      await Promise.all(selected.map(async cal=>{
        const qs=new URLSearchParams({timeMin:start.toISOString(),timeMax:end.toISOString(),singleEvents:'true',orderBy:'startTime',maxResults:'250'});
        const data=await googleFetch(`/calendars/${encodeURIComponent(cal.id)}/events?${qs}`,readToken);
        for(const e of data.items||[])items.push({...e,calendarName:cal.summaryOverride||cal.summary||cal.id});
      }));
      items.sort((a,b)=>(a.start?.dateTime||a.start?.date||'').localeCompare(b.start?.dateTime||b.start?.date||''));
      const host=$('events');host.replaceChildren();
      for(const e of items) {
        const row=document.createElement('div');row.className='event';
        const title=document.createElement('strong');title.textContent=e.summary||'(sans titre)';
        const meta=document.createElement('small');
        const when=e.start?.dateTime?new Date(e.start.dateTime).toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'}):'Toute la journée';
        meta.textContent=`${when} · ${e.calendarName}`;
        row.append(title,meta);host.append(row);
      }
      if(!items.length)empty(host,'Aucun rendez-vous sur les agendas sélectionnés pour ce jour.');
      status(`${items.length} rendez-vous lus dans Google Agenda, sans modification.`, 'ok');
    } catch(e){status(e.message,'error');}
  }
  function loadLilaVisits() {
    let data=null;
    try {data=JSON.parse(localStorage.getItem('lila-v2-demo-workspace-v1'));}catch{}
    visits=Array.isArray(data?.visits)?data.visits.filter(v=>v&&/^\d{4}-\d{2}-\d{2}$/.test(v.date||'')&&/^\d{2}:\d{2}$/.test(v.time||'')):[];
    const select=$('lila-visit');
    for (const [index,v] of visits.entries()) {
      const label=`${v.date} ${v.time} · ${v.name||'Visite'} · ${v.property||'Bien'}`;
      select.add(new Option(label,String(index)));
    }
    if(!visits.length)select.disabled=true;
    select.addEventListener('change',()=>{
      if(select.value==='')return;
      const v=visits[Number(select.value)];if(!v)return;
      $('title').value='TEST Li.La – Visite '+(v.property||'immobilière');
      $('visit-date').value=v.date;
      $('visit-time').value=v.time;
      $('location').value=v.property||'';
    });
  }
  async function createVisit() {
    if(!writeToken){status('Autorisez d’abord l’ajout de visites.','error');return;}
    const calendarId=$('target').value;
    const title=$('title').value.trim();
    const date=$('visit-date').value;const time=$('visit-time').value;
    const duration=Number($('duration').value);
    if(!calendarId || !title || !date || !time || !Number.isFinite(duration) || duration<15 || duration>480){status('Complétez le titre, la date, l’heure, l’agenda et une durée entre 15 et 480 minutes.','error');return;}
    const from=new Date(`${date}T${time}:00`);
    if(Number.isNaN(from.getTime())){status('Date ou heure invalide.','error');return;}
    const to=new Date(from.getTime()+duration*60000);
    const origin=$('lila-visit').value;
    const visitKey=origin===''?null:visits[Number(origin)]?.id;
    if(visitKey && uploaded.has(visitKey)) {
      status('Cette visite a déjà été créée durant cette session. Aucun doublon envoyé.','error');return;
    }
    const calendarName=calendars.find(c=>c.id===calendarId)?.summary||calendarId;
    if(!window.confirm(`Créer réellement dans Google Agenda « ${calendarName} » :\n\n${title}\n${date} à ${time} (${duration} min) ?\n\nCette action écrit un événement dans Google.`))return;
    $('create').disabled=true;
    try {
      const event=await googleFetch(`/calendars/${encodeURIComponent(calendarId)}/events`,writeToken,{
        method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({summary:title,description:'Essai de connexion Li.La V2 DEMO. Créé volontairement depuis la page de test.',location:$('location').value.trim(),start:{dateTime:from.toISOString()},end:{dateTime:to.toISOString()},extendedProperties:{private:{lilaTest:'true',...(visitKey?{demoVisitId:visitKey}:{})}}})
      });
      if(visitKey)uploaded.add(visitKey);
      const result=$('creation-result');result.replaceChildren();
      const p=document.createElement('p');p.textContent='Événement créé dans Google Agenda. ID : '+(event.id||'inconnu');result.append(p);
      if(event.htmlLink){const a=document.createElement('a');a.href=event.htmlLink;a.target='_blank';a.rel='noopener noreferrer';a.textContent='Voir la visite dans Google Agenda';result.append(a);}
      status('Visite test créée réellement dans Google Agenda. Aucune donnée Li.La n’a été modifiée.','ok');
      await loadEvents();
    } catch(e){status('Création non confirmée : '+e.message,'error');}
    finally {setButtons();}
  }
  $('day').value=localDayOffset();
  $('visit-date').value=localDayOffset(1);
  $('connect').addEventListener('click',connect);
  $('authorize-write').addEventListener('click',authorizeWrite);
  $('disconnect').addEventListener('click',disconnect);
  $('load-events').addEventListener('click',loadEvents);
  $('create').addEventListener('click',createVisit);
  $('target').addEventListener('change',setButtons);
  loadLilaVisits();setButtons();
})();
