/* ============================================
   ARCHITECTURAL CONTRACTS (JSDoc Typedefs)
   Single-source data contracts for nation/city/mentor/events.
   ============================================ */

/**
 * @typedef {Object} MentorEffects
 * @property {number=} coherence
 * @property {number=} money
 * @property {number=} followers
 * @property {number=} carisma
 * @property {number=} muscoli
 * @property {number=} intelligenza
 * @property {number=} reputazione
 * @property {number=} reputazioneNazionale
 * @property {number=} repNazionale
 * @property {number=} stress
 * @property {number=} autenticita
 * @property {number=} networking
 * @property {number=} careerProgress
 * @property {number=} relationAll
 */

/**
 * @typedef {Object} Mentor
 * @property {string} id
 * @property {string} name
 * @property {string} shortName
 * @property {string} icon
 * @property {string} quote
 * @property {string} bonusText
 * @property {MentorEffects} effects
 */

/**
 * @typedef {Object} IdeologyMeta
 * @property {string} localName
 * @property {string} icon
 * @property {string} desc
 */

/**
 * @typedef {Object} Nation
 * @property {string} id
 * @property {string} name
 * @property {('parlamentare_proporzionale'|'semi_presidenziale'|'cancellierato_federale'|'westminster_maggioritario')} politicalSystem
 * @property {number} electionThreshold
 * @property {boolean} coalitionRequired
 * @property {string} headOfState
 * @property {string} headOfGov
 * @property {string} currency
 * @property {number} salaryMultiplier
 * @property {number} rentMultiplier
 * @property {{[key:string]: IdeologyMeta}} ideologies
 * @property {{[ideology:string]: Mentor[]|string[]}} mentors
 * @property {string=} defaultCity
 * @property {string=} startingCity
 */

/**
 * @typedef {Object} City
 * @property {string} id
 * @property {string} name
 * @property {string} region
 * @property {number} lat
 * @property {number} lng
 * @property {string} desc
 * @property {{
 *   reputazione?: number,
 *   networking?: number,
 *   money?: number,
 *   carisma?: number,
 *   intelligenza?: number,
 *   morale?: number,
 *   autenticita?: number,
 *   reputazioneNazionale?: number,
 * }} bonus
 * @property {{stress?: number, concorrenza?: number}} malus
 * @property {number} rentMultiplier
 * @property {number} salaryMultiplier
 * @property {number} startingMoney
 * @property {1|2|3} tier
 * @property {'city'|'municipality'} settlementType
 * @property {'large'|'medium'|'small'} population
 */

/**
 * @typedef {Object} EventChoice
 * @property {string} label
 * @property {MentorEffects} effects
 */

/**
 * @typedef {Object} GameEvent
 * @property {'news'|'urgent'|'phone'} type
 * @property {string} title
 * @property {string} body
 * @property {string=} from
 * @property {string=} urgentType
 * @property {MentorEffects=} effects
 * @property {{accept: EventChoice, refuse: EventChoice}=} choices
 * @property {Function=} condition
 * @property {string=} nation
 * @property {string=} city
 */
