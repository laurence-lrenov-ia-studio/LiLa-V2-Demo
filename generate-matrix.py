"""Read-only extraction of the two source workbooks into the implementation audit."""
from pathlib import Path
from openpyxl import load_workbook

root = Path(__file__).parent
sources = [
    Path(r'C:\Users\lreno\Downloads\Collecte_Hub_immobilier_completee.xlsx'),
    Path(r'C:\Users\lreno\Downloads\Depot_recherche_immobiliere_Maison_d_AVA.xlsx'),
]
property_mapping = [
    'PRÉREMPLI — profil fictif : prénom', 'PRÉREMPLI — profil fictif : nom',
    'PRÉREMPLI — profil fictif : téléphone', 'PRÉREMPLI — profil fictif : e-mail',
    'PRÉREMPLI — profil fictif : agence', 'PRÉREMPLI — profil fictif : secteur',
    'PRÉREMPLI — profil fictif : ville', 'AUTO — référence interne BIEN',
    'SAISIE — numéro de mandat, interne', 'SAISIE — certification obligatoire du mandat valide plus de 30 jours',
    'SAISIE — type de bien', 'SAISIE — commune', 'SAISIE — code postal à cinq chiffres',
    'SAISIE — quartier / secteur', 'SAISIE — surface annoncée',
    'CONDITIONNEL — surface Carrez si appartement en copropriété',
    'SAISIE — nombre de pièces', 'SAISIE — nombre de chambres',
    'CONDITIONNEL — étage si appartement', 'SAISIE — état du bien',
    'SAISIE — description courte', 'SAISIE — prix FAI en euros',
    'SAISIE — charge des honoraires', 'SAISIE — honoraires TTC en euros',
    'CONDITIONNEL — classe DPE si DPE disponible', 'CONDITIONNEL — classe GES si DPE disponible',
    'CONDITIONNEL — dépenses minimum si DPE disponible', 'CONDITIONNEL — dépenses maximum si DPE disponible',
    'CONDITIONNEL — années de référence si DPE disponible', 'AUTO — mention si classe F ou G',
    'CONDITIONNEL — motif si exemption DPE', 'AUTO — mention Géorisques dans aperçu et fiche publique',
    'SAISIE — choix copropriété Oui / Non', 'CONDITIONNEL — nombre de lots si copropriété',
    'CONDITIONNEL — quote-part annuelle si copropriété', 'CONDITIONNEL — procédures si copropriété',
    'CONDITIONNEL — précision obligatoire si procédure Oui', 'INTERNE — numéros des lots, saisis sans diffusion',
    'SAISIE — menu des six régimes', 'CONDITIONNEL — précision si régime particulier',
    'CONDITIONNEL — conditions acquéreur si BRS', 'CONDITIONNEL — OFS si BRS',
    'CONDITIONNEL — redevance si BRS', 'CONDITIONNEL — prix autorisé si BRS',
    'FONCTION EXISTANTE — remplacé par la galerie photos Li.La',
    'SAISIE — accord de diffusion des photos avant validation avec photos',
    'FONCTION EXISTANTE — première photo de la galerie, réorganisable et obligatoire',
    'SAISIE — disponibilité du bien',
    'SAISIE — contrôle obligatoire ; AUTO — date de dernière actualisation et échéance à 30 jours en stockage local',
]
search_mapping = [
    'PRÉREMPLI — profil fictif : nom', 'PRÉREMPLI — profil fictif : prénom',
    'PRÉREMPLI — profil fictif : agence', 'PRÉREMPLI — profil fictif : téléphone',
    'PRÉREMPLI — profil fictif : e-mail', 'PRÉREMPLI — profil fictif : secteur',
    'PRÉREMPLI — profil fictif : ville', 'AUTO — référence interne RECH',
    'SAISIE — date du mandat', 'SAISIE — types séparés par virgules',
    'SAISIE — recherche active et diffusion autorisée', 'SAISIE — fin de validité, contrôlée si renseignée',
    'SAISIE — plusieurs départements', 'SAISIE — plusieurs communes',
    'SAISIE — plusieurs secteurs / quartiers', 'SAISIE — secteurs exclus',
    'SAISIE — budget maximal FAI', 'SAISIE — budget hors frais si différent',
    'SAISIE — mode de financement', 'SAISIE — financement étudié / validé',
    'SAISIE — accord / attestation disponible', 'SAISIE — surface minimale',
    'SAISIE — pièces minimum', 'SAISIE — chambres minimum',
    'CONDITIONNEL — terrain si maison', 'CONDITIONNEL — étage souhaité et maximal si appartement',
    'CONDITIONNEL — ascenseur si appartement', 'SAISIE — extérieur exigé',
    'SAISIE — stationnement requis', 'SAISIE — cuisine équipée exigée',
    'SAISIE — travaux acceptés', 'SAISIE — DPE minimum souhaité',
    'SAISIE — autres critères impératifs', 'SAISIE — critères appréciés facultatifs',
    'SAISIE — usage du projet', 'SAISIE — date souhaitée',
    'SAISIE — délai / visites', 'SAISIE — bien à vendre avant achat',
    'SAISIE — particularités acceptées', 'SAISIE — commentaires non sensibles',
    'SAISIE — accord pour critères anonymisés', 'SAISIE — diffusion interprofessionnelle',
    'SAISIE — confirmation obligatoire de non-publication des coordonnées client',
    'PRÉREMPLI — professionnel fictif affiché comme contact',
    'SAISIE — mode de contact souhaité', 'SAISIE — lien de présentation facultatif',
    'INTERNE — date dernière vérification à effectuer',
    'INTERNE — statut initial À valider', 'INTERNE — validation Maison d’AVA à effectuer',
    'INTERNE — informations manquantes / observations conservées dans le modèle',
]

assert len(property_mapping) == 49
assert len(search_mapping) == 50
lines = [
    '# Matrice exhaustive Excel → Li.La V2 DEMO', '',
    'Les lignes ci-dessous correspondent aux lignes métier des onglets FORMULAIRE PUBLICATION HUB IMMO et DEPOT DE RECHERCHE. Les onglets UTILISATION et MODE EMPLOI sont des consignes, pas des champs supplémentaires.', '',
    '| Fichier | Famille | Information Excel | Traitement Li.La |',
    '|---|---|---|---|',
]
for source, sheet_name, mapping, short in [
    (sources[0], 'FORMULAIRE PUBLICATION HUB IMMO', property_mapping, 'Bien'),
    (sources[1], 'DEPOT DE RECHERCHE', search_mapping, 'Recherche'),
]:
    sheet = load_workbook(source, read_only=True, data_only=True)[sheet_name]
    rows = list(sheet.iter_rows(min_row=2, values_only=True))
    assert len(rows) == len(mapping)
    for row, treatment in zip(rows, mapping):
        family, label = str(row[0]), str(row[1]).strip()
        safe = lambda value: value.replace('|', '\\|').replace('\n', ' ')
        lines.append(f'| {short} | {safe(family)} | {safe(label)} | {safe(treatment)} |')

lines += ['', '## Ambiguïtés à arbitrer', '',
          '- Le tableau bien ne donne pas de date précise d’expiration du mandat de vente. La certification de validité à plus de 30 jours est demandée, mais la date n’est pas contrôlable sans champ ou source supplémentaire.',
          '- Le tableau recherche demande une date de fin de validité mais n’indique pas si son absence doit bloquer. La DEMO la contrôle lorsqu’elle est renseignée.',
          '- Les modalités exactes de validation Maison d’AVA et du retrait automatique après 30 jours restent à définir pour la production. La DEMO conserve les états nécessaires sans automatisme serveur.',
          '- Les champs « selon projet » sont visibles dans leurs sections et certains dépendent du type de bien ; leur caractère obligatoire nécessite un arbitrage métier.', '']
(root / 'FORMULAIRES-MATRICE.md').write_text('\n'.join(lines), encoding='utf-8')
