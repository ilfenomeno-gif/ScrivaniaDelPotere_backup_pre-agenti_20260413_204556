/* ============================================
   LOCALIZATION — Gestione traduzioni dinamiche
   ============================================ */

const Localization = {
    // Dizionario principale: lingua → chiave → testo
    strings: {
        it: {
            // Task work
            'task.revisione_budget': 'Revisione Budget',
            'task.report_trimestrale': 'Report Trimestrale',
            'task.riunione_operativa': 'Riunione Operativa',
            'task.pratica_amministrativa': 'Pratica Amministrativa',
            // Task political
            'task.discorso_pubblico': 'Discorso Pubblico',
            'task.volantinaggio': 'Volantinaggio',
            'task.raccolta_firme': 'Raccolta Firme',
            'task.assemblea_sezione': 'Assemblea di Sezione',
            'task.delegazione_regionale': 'Delegazione a Livello Regionale',
            'task.congresso_partito': 'Congresso del Partito',
            // UI generica
            'ui.confirm': 'Conferma',
            'ui.cancel': 'Annulla',
            'ui.save': 'Salva',
            'ui.close': 'Chiudi',
            // International transfer
            'transfer.title': 'Trasferimento all\'Estero',
            'transfer.cost': 'Costo: €2000 + 2 PA',
            'transfer.warning': 'Perderai tutti i contatti (anche preferiti) e dovrai ricominciare da zero nella nuova nazione.',
            'transfer.destination': 'Nazione destinazione:',
            'transfer.confirm_btn': 'Conferma Trasferimento',
            'transfer.cancel_btn': 'Annulla',
            'transfer.insufficient_funds': 'Fondi o PA insufficienti!',
            'transfer.success': 'Sei arrivato in {nation}. Nuova vita, nuove sfide.',
            // Elections
            'election.system_italy': 'Sistema parlamentare proporzionale con soglia di coalizione',
            'election.system_france': 'Sistema semi-presidenziale con ballottaggio',
            'election.system_germany': 'Sistema cancellierato federale con soglia 5%',
            'election.system_uk': 'Sistema First-Past-The-Post (Westminster)',
            'election.won': 'Hai vinto! Ruolo: {role}.',
            'election.lost': 'Hai perso ({score}% vs {rival}%).',
            // Mentor events
            'mentor.marta_presidio.title': 'Presidio ambientale',
            'mentor.marta_presidio.body': 'Marta ti chiama a un presidio contro la discarica. La piazza aspetta una tua presa di posizione.',
            'mentor.marta_industriale.title': 'Offerta dell\'industriale',
            'mentor.marta_industriale.body': 'Un industriale ti offre €500 per calmare il centro sociale. Marta lo ha scoperto.',
        },
        fr: {
            // Task work
            'task.revisione_budget': 'Révision du Budget',
            'task.report_trimestrale': 'Rapport Trimestriel',
            'task.riunione_operativa': 'Réunion Opérationnelle',
            'task.pratica_amministrativa': 'Rapport Administratif',
            // Task political
            'task.discorso_pubblico': 'Discours Public',
            'task.volantinaggio': 'Distribution de Tracts',
            'task.raccolta_firme': 'Collecte de Signatures',
            'task.assemblea_sezione': 'Réunion de la Cellule',
            'task.delegazione_regionale': 'Manifestation Autorisée',
            'task.congresso_partito': 'Débat Parlementaire',
            // UI generica
            'ui.confirm': 'Confirmer',
            'ui.cancel': 'Annuler',
            'ui.save': 'Sauvegarder',
            'ui.close': 'Fermer',
            // International transfer
            'transfer.title': 'Transfert à l\'Étranger',
            'transfer.cost': 'Coût: €2000 + 2 PA',
            'transfer.warning': 'Vous perdrez tous vos contacts (y compris les favoris) et devrez recommencer à zéro dans la nouvelle nation.',
            'transfer.destination': 'Nation de destination:',
            'transfer.confirm_btn': 'Confirmer le Transfert',
            'transfer.cancel_btn': 'Annuler',
            'transfer.insufficient_funds': 'Fonds ou PA insuffisants!',
            'transfer.success': 'Vous êtes arrivé en {nation}. Nouvelle vie, nouveaux défis.',
            // Elections
            'election.system_italy': 'Système parlementaire proportionnel avec seuil de coalition',
            'election.system_france': 'Système semi-présidentiel avec ballottage',
            'election.system_germany': 'Système chancellerial fédéral avec seuil 5%',
            'election.system_uk': 'Système First-Past-The-Post (Westminster)',
            'election.won': 'Vous avez gagné! Rôle: {role}.',
            'election.lost': 'Vous avez perdu ({score}% vs {rival}%).',
            // Mentor events
            'mentor.marta_presidio.title': 'Manifestation environnementale',
            'mentor.marta_presidio.body': 'Marta vous appelle à une manifestation contre la décharge. La place attend votre prise de position.',
        },
        de: {
            // Task work
            'task.revisione_budget': 'Budgetüberprüfung',
            'task.report_trimestrale': 'Quartalsbericht',
            'task.riunione_operativa': 'Betriebsbesprechung',
            'task.pratica_amministrativa': 'Amtliches Verfahren',
            // Task political
            'task.discorso_pubblico': 'Öffentliche Rede',
            'task.volantinaggio': 'Flyerverteilung',
            'task.raccolta_firme': 'Unterschriftensammlung',
            'task.assemblea_sezione': 'Sitzung des Ortsverbandes',
            'task.delegazione_regionale': 'Bundestag Besuch',
            'task.congresso_partito': 'Wahlkampf Koordination',
            // UI generica
            'ui.confirm': 'Bestätigen',
            'ui.cancel': 'Abbrechen',
            'ui.save': 'Speichern',
            'ui.close': 'Schließen',
            // International transfer
            'transfer.title': 'Auslandsversetzung',
            'transfer.cost': 'Kosten: €2000 + 2 PA',
            'transfer.warning': 'Sie verlieren alle Kontakte (auch Favoriten) und müssen in der neuen Nation von vorne anfangen.',
            'transfer.destination': 'Zielland:',
            'transfer.confirm_btn': 'Versetzung Bestätigen',
            'transfer.cancel_btn': 'Abbrechen',
            'transfer.insufficient_funds': 'Unzureichende Mittel oder PA!',
            'transfer.success': 'Sie sind angekommen in {nation}. Neues Leben, neue Herausforderungen.',
            // Elections
            'election.system_italy': 'Proportionales Parlamentssystem mit Koalitionsschwelle',
            'election.system_france': 'Halbpräsidentielles System mit Stichwahl',
            'election.system_germany': 'Bundeskanzlersystem mit 5%-Hürde',
            'election.system_uk': 'First-Past-The-Post System (Westminster)',
            'election.won': 'Sie haben gewonnen! Rolle: {role}.',
            'election.lost': 'Sie haben verloren ({score}% vs {rival}%).',
            // Mentor events
            'mentor.marta_presidio.title': 'Umweltkundgebung',
            'mentor.marta_presidio.body': 'Marta ruft Sie zu einer Kundgebung gegen die Mülldeponie. Der Platz wartet auf Ihre Position.',
            'mentor.marta_industriale.title': 'Angebot des Industriellen',
            'mentor.marta_industriale.body': 'Ein Industrieller bietet Ihnen 500 € an, um das Sozialzentrum zu beruhigen. Marta hat es erfahren.',
            'mentor.roberto_cena.title': 'Lobby-Dinner',
            'mentor.roberto_cena.body': 'Roberto arrangiert ein Abendessen mit einem Lobbyisten. Mehr Einfluss, aber ein Preis für die Glaubwürdigkeit.',
            'mentor.roberto_variante.title': 'Pakt mit den Gemäßigten',
            'mentor.roberto_variante.body': 'Ein moderates Bündnis bietet institutionelle Rückendeckung. Unterstützen Sie den Deal?',
            'mentor.beppe_live.title': 'Direkter Livestream',
            'mentor.beppe_live.body': 'Beppe drängt auf einen aggressiven Livestream gegen das Establishment.',
            'mentor.beppe_querela.title': 'Verleumdungsklage',
            'mentor.beppe_querela.body': 'Ein Gegner droht mit einer Klage wegen Ihrer Aussagen in den sozialen Medien.',
            'mentor.elena_ottimizzazione.title': 'Optimierungsplan',
            'mentor.elena_ottimizzazione.body': 'Elena schlägt eine datenbasierte Reform vor. Weniger Schlagworte, mehr Zahlen.',
            'mentor.elena_fondi.title': 'Undurchsichtige Finanzierung',
            'mentor.elena_fondi.body': 'Ein technischer Berater bietet eine schnelle Finanzierung über undurchsichtige Kanäle an.',
            'mentor.massimo_retata.title': 'Symbolische Razzia',
            'mentor.massimo_retata.body': 'Massimo fordert ein sichtbares Sicherheitsmanöver im Viertel.',
            'mentor.massimo_giornalista.title': 'Dossier gegen Journalisten',
            'mentor.massimo_giornalista.body': 'Massimo will eine harte Kampagne gegen einen Journalisten starten.',
            'mentor.anziano_dibattito.title': 'Debatte mit Studierenden',
            'mentor.anziano_dibattito.body': 'Eine öffentliche Debatte mit Studierenden fordert Ihre Ideen heraus.',
            'mentor.anziano_correnti.title': 'Wahl der Strömungen',
            'mentor.anziano_correnti.body': 'Drei Strömungen wollen Sie anwerben. Bleiben Sie unabhängig oder suchen Sie Schutz?',
        },
        en: {
            // Task work
            'task.revisione_budget': 'Budget Review',
            'task.report_trimestrale': 'Quarterly Report',
            'task.riunione_operativa': 'Operational Meeting',
            'task.pratica_amministrativa': 'Council Paperwork',
            // Task political
            'task.discorso_pubblico': 'Public Speech',
            'task.volantinaggio': 'Leafleting',
            'task.raccolta_firme': 'Signature Collection',
            'task.assemblea_sezione': 'Constituency Meeting',
            'task.delegazione_regionale': 'PMQs Watching Party',
            'task.congresso_partito': 'Shadow Cabinet Briefing',
            // UI generica
            'ui.confirm': 'Confirm',
            'ui.cancel': 'Cancel',
            'ui.save': 'Save',
            'ui.close': 'Close',
            // International transfer
            'transfer.title': 'International Transfer',
            'transfer.cost': 'Cost: €2000 + 2 AP',
            'transfer.warning': 'You will lose all contacts (including favorites) and must start over from scratch in the new nation.',
            'transfer.destination': 'Destination country:',
            'transfer.confirm_btn': 'Confirm Transfer',
            'transfer.cancel_btn': 'Cancel',
            'transfer.insufficient_funds': 'Insufficient funds or AP!',
            'transfer.success': 'You have arrived in {nation}. New life, new challenges.',
            // Elections
            'election.system_italy': 'Proportional parliamentary system with coalition threshold',
            'election.system_france': 'Semi-presidential system with runoff',
            'election.system_germany': 'Federal chancellery system with 5% threshold',
            'election.system_uk': 'First-Past-The-Post system (Westminster)',
            'election.won': 'You have won! Role: {role}.',
            'election.lost': 'You have lost ({score}% vs {rival}%).',
            // Mentor events
            'mentor.marta_presidio.title': 'Environmental Rally',
            'mentor.marta_presidio.body': 'Marta calls you to a rally against the landfill. The square expects your stance.',
            'mentor.marta_industriale.title': 'Industrialist Offer',
            'mentor.marta_industriale.body': 'An industrialist offers you €500 to calm down the social center. Marta found out.',
            'mentor.roberto_cena.title': 'Lobby Dinner',
            'mentor.roberto_cena.body': 'Roberto arranges a dinner with a lobbyist. More influence, but at a credibility cost.',
            'mentor.roberto_variante.title': 'Moderate Pact',
            'mentor.roberto_variante.body': 'A moderate coalition offers institutional backing. Do you support the deal?',
            'mentor.beppe_live.title': 'Live Stream Push',
            'mentor.beppe_live.body': 'Beppe pushes for an aggressive live stream against the establishment.',
            'mentor.beppe_querela.title': 'Defamation Threat',
            'mentor.beppe_querela.body': 'An opponent threatens legal action over your social media statements.',
            'mentor.elena_ottimizzazione.title': 'Optimization Plan',
            'mentor.elena_ottimizzazione.body': 'Elena proposes a data-driven reform plan. Less slogans, more numbers.',
            'mentor.elena_fondi.title': 'Opaque Funding',
            'mentor.elena_fondi.body': 'A technical advisor offers rapid funding through unclear channels.',
            'mentor.massimo_retata.title': 'Symbolic Raid',
            'mentor.massimo_retata.body': 'Massimo asks for a high-visibility security operation in the district.',
            'mentor.massimo_giornalista.title': 'Journalist Dossier',
            'mentor.massimo_giornalista.body': 'Massimo wants to launch an aggressive campaign against a journalist.',
            'mentor.anziano_dibattito.title': 'Debate with Students',
            'mentor.anziano_dibattito.body': 'A public debate with students challenges your ideas and rhetoric.',
            'mentor.anziano_correnti.title': 'Faction Choice',
            'mentor.anziano_correnti.body': 'Three factions try to recruit you. Stay independent or seek political cover?',
        },
    },

    getCurrentLanguage() {
        const nation = Game.state.nation?.id || 'italy';
        const map = { italy: 'it', france: 'fr', germany: 'de', uk: 'en' };
        return map[nation] || 'it';
    },

    translate(key, variables = {}) {
        const lang = this.getCurrentLanguage();
        const dict = this.strings[lang];
        let text = (dict && dict[key]) || this.strings.it[key] || key;
        
        // Sostituisci variabili nel formato {variabile}
        Object.entries(variables).forEach(([k, v]) => {
            text = text.replace(`{${k}}`, v);
        });
        
        return text;
    },

    // Traduce dinamicamente un elemento DOM o un testo
    localizeElement(element, key, variables = {}) {
        if (element) element.textContent = this.translate(key, variables);
    },

    // Ottiene linguaggio per un'ideologia specifica (fallback)
    getIdeologyInLanguage(ideologyKey) {
        const nationData = Game.state.nation?.data;
        if (nationData && nationData.ideologies && nationData.ideologies[ideologyKey]) {
            return nationData.ideologies[ideologyKey].localName;
        }
        return ideologyKey;
    },
};
