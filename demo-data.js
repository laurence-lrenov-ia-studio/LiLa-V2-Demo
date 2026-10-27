'use strict';
// Entirely fictional fixtures. Nothing is read from an account or a service.
const currentAgentId = 'camille';
const demoAgents = [
 {id:'camille',name:'Camille',agency:'Li.La',phone:'05 56 00 10 20',email:'camille@example.com'},
 {id:'emma',name:'Emma Girard',agency:'Girard Immobilier',phone:'05 56 00 21 30',email:'emma.girard@example.com'},
 {id:'nicolas',name:'Nicolas Perrin',agency:'',phone:'05 56 00 32 40',email:'nicolas.perrin@example.com'}
];
const demoProperties = [
 {id:'pessac',agentId:'camille',published:true,title:'Maison Pessac',city:'Pessac',price:465000,type:'Maison',surface:125,rooms:5,bedrooms:4,land:640,status:'Publié',listedOn:'2026-09-18',owner:'Claire Morel',dpe:'C',description:'Maison familiale lumineuse, avec jardin et terrasse. Une pièce de vie ouverte et quatre chambres pour accueillir les nouveaux projets.',features:['Jardin','Terrasse','Garage'],color:'sage',photos:['assets/maison-pessac.webp']},
 {id:'bordeaux',agentId:'camille',published:false,title:'Appartement Bordeaux',city:'Bordeaux',price:289000,type:'Appartement',surface:68,rooms:3,bedrooms:2,land:0,status:'Brouillon',owner:'Thomas Laurent',dpe:'D',description:'Appartement traversant proche des transports. Description en cours de préparation.',features:['Balcon','Ascenseur'],color:'lavender',photos:[]},
 {id:'merignac',agentId:'camille',published:true,title:'Maison Mérignac',city:'Mérignac',price:398000,type:'Maison',surface:105,rooms:4,bedrooms:3,land:420,status:'Sous offre',owner:'Élodie Bernard',dpe:'C',description:'Maison de plain-pied avec jardin, dans un secteur résidentiel calme.',features:['Jardin','Stationnement'],color:'sand',photos:[]},
 {id:'talence',agentId:'camille',published:false,title:'Studio Talence',city:'Talence',price:139000,type:'Appartement',surface:28,rooms:1,bedrooms:0,land:0,status:'À actualiser',owner:'Marc Petit',dpe:'E',description:'Studio proche des universités. Diagnostics et photos à actualiser.',features:['Balcon'],color:'lavender',photos:[]},
 {id:'begles',agentId:'camille',published:false,title:'Maison Bègles',city:'Bègles',price:325000,type:'Maison',surface:90,rooms:4,bedrooms:3,land:210,status:'Vendu',owner:'Sophie Durand',dpe:'D',description:'Dossier clôturé après commercialisation.',features:['Terrasse'],color:'sage',photos:[]},
 {id:'cenon',agentId:'camille',published:false,title:'Appartement Cenon',city:'Cenon',price:245000,type:'Appartement',surface:61,rooms:3,bedrooms:2,land:0,status:'Retiré',owner:'Alexandre Vidal',dpe:'D',description:'Commercialisation interrompue à la demande du propriétaire.',features:['Balcon','Stationnement'],color:'lavender',photos:[]},
 {id:'bordeaux-chartrons',agentId:'emma',published:true,title:'Appartement Bordeaux Chartrons',city:'Bordeaux · Chartrons',price:435000,type:'Appartement',surface:82,rooms:4,bedrooms:2,land:0,status:'Publié',dpe:'C',description:'Appartement en pierre rénové, lumineux, avec séjour traversant et balcon. À proximité des commerces et du tramway.',features:['Balcon','Parquet','Proche tramway'],color:'lavender',photos:['assets/annonce-bordeaux.png']},
 {id:'le-bouscat',agentId:'nicolas',published:true,title:'Maison Le Bouscat',city:'Le Bouscat',price:579000,type:'Maison',surface:132,rooms:5,bedrooms:4,land:310,status:'Publié',dpe:'B',description:'Maison familiale contemporaine avec terrasse et jardin paysagé, dans un environnement résidentiel.',features:['Jardin','Terrasse','Stationnement'],color:'sage',photos:['assets/annonce-le-bouscat.png']}
];
const demoVisitors = [
 {id:'lea',property:'pessac',name:'Léa Martin',status:'Contre-visite',date:'24 octobre · 14 h',budget:480000,note:'Le jardin et la pièce de vie plaisent. Souhaite revenir avec son conjoint.',action:'Proposer une contre-visite le 29 octobre',offer:null},
 {id:'hugo',property:'pessac',name:'Hugo Perrin',status:'Refus',date:'23 octobre · 11 h',budget:470000,note:'Le trajet quotidien est trop long. Préfère Bordeaux centre.',action:'Rechercher un bien plus proche du centre',offer:null},
 {id:'ines',property:'pessac',name:'Inès Robert',status:'Intéressé',date:'25 octobre · 10 h',budget:475000,note:'Financement validé. Attend les diagnostics.',action:'Préparer le dossier des diagnostics',offer:null},
 {id:'paul',property:'pessac',name:'Paul Garnier',status:'À recontacter',date:'22 octobre · 16 h',budget:460000,note:'Réfléchit à la distribution des chambres. Aucun retour depuis la visite.',action:'Faire le point sur ses critères',offer:null},
 {id:'sarah',property:'pessac',name:'Sarah Dubois',status:'Offre',date:'26 octobre · 15 h',budget:465000,note:'Offre reçue, à présenter à la propriétaire.',action:'Présenter l’offre à Claire Morel',offer:450000},
 {id:'alice',property:'merignac',name:'Alice Roux',status:'Offre',date:'25 octobre · 17 h',budget:400000,note:'Offre en cours d’examen par la propriétaire.',action:'Préparer le point avec la propriétaire',offer:390000}
];

// Explicit client-facing summaries. Agent comments, contact records and tasks are never reused here.
const demoSellerSummaries = {
 lea:'Contre-visite demandée.',
 hugo:'Localisation jugée trop éloignée.',
 ines:'Intéressé, attend les diagnostics.',
 paul:'Intéressé, souhaite réfléchir.',
 sarah:'Une offre est en cours d’examen.'
};
const demoBuyerSearch = {type:'Maison',areas:'Bordeaux / Bruges / Le Bouscat',budget:450000,bedrooms:3,garden:true};
const demoBuyerMatches = [
 {property:'bordeaux-chartrons',status:'À découvrir',seenOn:null},
 {property:'pessac',status:'Favori',seenOn:'2026-10-25'},
 {property:'merignac',status:'Visite programmée',seenOn:null}
];

const demoContacts = [
 ...demoProperties.filter(p=>p.agentId===currentAgentId).map((p,i)=>({id:'owner-'+p.id,name:p.owner,company:['Morel Conseil','Atelier Laurent','Bernard & Associés','Petit Conseil','Durand Services','Vidal Conseil'][i],job:['Consultante','Architecte','Comptable','Enseignant','Commerçante','Consultant'][i],city:p.city,category:'Client',typology:'Propriétaire',properties:[p.id]})),
 ...demoVisitors.map((v,i)=>({id:v.id,name:v.name,company:['Studio Martin','Perrin Conseil','Robert Santé','Garnier Énergie','Dubois Conseil','Roux Design'][i],job:['Designer','Ingénieur','Médecin','Technicien','Consultante','Architecte'][i],city:['Pessac','Bordeaux','Mérignac','Talence','Bordeaux','Mérignac'][i],category:'Prospect',typology:'Acquéreur',properties:[v.property]})),
 ...[
 ['notaire','Julie Lacroix','Étude Lacroix','Notaire','Bordeaux','Notaire'],
 ['courtier','Antoine Vidal','Vidal Financement','Courtier','Pessac','Courtier'],
 ['diagnostic','Nadia Simon','Habitat Diagnostic','Diagnostiqueuse','Mérignac','Diagnostiqueur'],
 ['artisan','Lucas Bonnet','Bonnet Rénovation','Artisan','Talence','Artisan'],
 ['collegue','Emma Girard','Girard Immobilier','Agent immobilier','Bordeaux','Collègue'],
 ['apporteur','Louis Faure','Faure Conseil','Conseiller','Bègles','Apporteur'],
 ['partenaire','Chloé André','André Habitat','Décoratrice','Pessac','Partenaire'],
 ['autre','Marie Lambert','Lambert Services','Assistante','Bordeaux','Autre']
 ].map(([id,name,company,job,city,category])=>({id,name,company,job,city,category,typology:'Professionnel',properties:[],...(id==='collegue'?{email:'emma.girard@example.com',phone:'05 56 00 21 30'}:{})}))
];
