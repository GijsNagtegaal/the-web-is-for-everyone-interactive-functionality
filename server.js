import express from 'express'
import { Liquid } from 'liquidjs'

const app = express()
const API_BASE = 'https://fdnd-agency.directus.app/items'
const USER_ID = 2 // De ID van de huidige gebruiker

// Config de server
app.use(express.urlencoded({ extended: true }))
app.use(express.static('public'))

// Liquid setup
const engine = new Liquid()
app.engine('liquid', engine.express())
app.set('views', './views')
app.set('view engine', 'liquid')

// Middleware voor paden en user_id in alle templates
app.use((request, response, next) => {
    response.locals.current_path = request.path || '/'
    response.locals.previous_path = request.get('Referrer') || '/'
    response.locals.user_id = USER_ID 
    next()
})

// Lokale quest data die de slugs koppelt aan plant_ids uit de database
const quests_data = {
    'items': [
        { 'id': 1, 'title': 'Opdracht 1', 'name': 'Zoeken', 'slug': 'opdracht-1', 'plant_id': 1, 'zones': [1, 2], 'xp': 25, 'type': 'button', 'description': 'De Teunisbloem opent zijn bloemen pas in de avondschemering.', 'question_title': 'Vorm van de bloem', 'question_text': 'Kijk goed naar de geopende bloem. Welke vorm herken je in de kroonbladeren?', 'options': [{ 'label': 'Hartvormig', 'value': 'hart' }, { 'label': 'Rond', 'value': 'rond' }, { 'label': 'Puntig', 'value': 'punt' }], 'correct_answer': 'hart' },
        { 'id': 2, 'title': 'Opdracht 2', 'name': 'Herkennen', 'slug': 'opdracht-2', 'plant_id': 2, 'zones': [1,2,3,4,5], 'xp': 30, 'type': 'image', 'description': 'De Gele Lis staat graag met zijn voeten in het water.', 'question_title': 'Bladvorm check', 'question_text': 'Welke van deze afbeeldingen toont de echte zwaardvormige bladeren?', 'options': [{ 'image_url': '/assets/images/alium.webp', 'value': 'zwaard' }, { 'image_url': '/assets/images/alium.webp', 'value': 'rond' }], 'correct_answer': 'zwaard' },
        { 'id': 3, 'title': 'Opdracht 3', 'name': 'Ruiken', 'slug': 'opdracht-3', 'plant_id': 3, 'zones': [1, 2, 3,5,6,7,8,9,10], 'xp': 20, 'type': 'button', 'description': 'Lavendel trekt veel bijen en vlinders aan door zijn sterke geur.', 'question_title': 'De geur-ervaring', 'question_text': 'Wrijf zachtjes over de bloem. Waar doet deze geur je aan denken?', 'options': [{ 'label': 'Rotten eieren', 'value': 'rot' }, { 'label': 'Vers gemaaid gras', 'value': 'gras' }], 'correct_answer': 'rot' },
        { 'id': 4, 'title': 'Opdracht 4', 'name': 'Tellen', 'slug': 'opdracht-4', 'plant_id': 4, 'zones': [1,2,3,4,5,6,7,8,9,10], 'xp': 25, 'type': 'button', 'description': 'De Wilde Aardbei heeft kleine witte bloemetjes met een geel hart.', 'question_title': 'Bloemblaadjes', 'question_text': 'Hoeveel witte kroonblaadjes heeft één bloem van de Wilde Aardbei?', 'options': [{ 'label': '5 blaadjes', 'value': '5' }, { 'label': '6 blaadjes', 'value': '6' }], 'correct_answer': '5' },
        { 'id': 5, 'title': 'Opdracht 5', 'name': 'Voelen', 'slug': 'opdracht-5', 'plant_id': 5, 'zones': [1], 'xp': 35, 'type': 'image', 'description': 'De Gewone Vlier heeft takken die van binnen zacht zijn.', 'question_title': 'Takstructuur', 'question_text': 'Welke foto laat de bast van een oudere Vlierstruik zien?', 'options': [{ 'image_url': '/assets/images/alium.webp', 'value': 'kurk' }, { 'image_url': '/assets/images/alium.webp', 'value': 'glad' }], 'correct_answer': 'kurk' },
        { 'id': 6, 'title': 'Opdracht 6', 'name': 'Kijken', 'slug': 'opdracht-6', 'plant_id': 6, 'zones': [1, 3], 'xp': 20, 'type': 'button', 'description': 'De Brandnetel heeft haartjes die kunnen prikken.', 'question_title': 'De stengel', 'question_text': 'Kijk naar de stengel. Welke vorm heeft de doorsnede?', 'options': [{ 'label': 'Rond', 'value': 'rond' }, { 'label': 'Vierkant', 'value': 'vierkant' }], 'correct_answer': 'vierkant' },
        { 'id': 7, 'title': 'Opdracht 7', 'name': 'Smaak', 'slug': 'opdracht-7', 'plant_id': 7, 'zones': [2], 'xp': 40, 'type': 'button', 'description': 'Zuring smaakt heel fris en een beetje zuur.', 'question_title': 'Bladvorm', 'question_text': 'Hoe ziet de onderkant van het blad eruit bij de stengel?', 'options': [{ 'label': 'In een puntje', 'value': 'punt' }, { 'label': 'Met twee oortjes', 'value': 'oren' }], 'correct_answer': 'oren' },
        { 'id': 8, 'title': 'Opdracht 8', 'name': 'Zoeken', 'slug': 'opdracht-8', 'plant_id': 8, 'zones': [1, 2, 3], 'xp': 15, 'type': 'image', 'description': 'Madeliefjes groeien vaak in het kort gemaaide gras.', 'question_title': 'Kleur bekennen', 'question_text': 'Welke kleur hebben de tipjes van de blaadjes vaak?', 'options': [{ 'image_url': '/assets/images/alium.webp', 'value': 'roze' }, { 'image_url': '/assets/images/alium.webp', 'value': 'blauw' }], 'correct_answer': 'roze' },
        { 'id': 9, 'title': 'Opdracht 9', 'name': 'Onderzoek', 'slug': 'opdracht-9', 'plant_id': 9, 'zones': [3], 'xp': 30, 'type': 'button', 'description': 'De Grote Lisdodde wordt ook wel sigarenplant genoemd.', 'question_title': 'De sigaar', 'question_text': 'Hoe voelt de bruine sigaar aan als je er in knijpt?', 'options': [{ 'label': 'Zacht en verend', 'value': 'zacht' }, { 'label': 'Plakkerig', 'value': 'plak' }], 'correct_answer': 'zacht' },
        { 'id': 10, 'title': 'Opdracht 10', 'name': 'Determinatie', 'slug': 'opdracht-10', 'plant_id': 10, 'zones': [1], 'xp': 50, 'type': 'image', 'description': 'De Paardenbloem verandert na de bloei in een pluizenbol.', 'question_title': 'Bladrand', 'question_text': 'Welke van deze bladeren heeft de diep ingesneden tanden?', 'options': [{ 'image_url': '/assets/images/alium.webp', 'value': 'tand' }, { 'image_url': '/assets/images/alium.webp', 'value': 'glad' }, { 'image_url': '/assets/images/alium.webp', 'value': 'lob' }], 'correct_answer': 'tand' }
    ]
}

// Helper om images te fixen (als Directus een object stuurt ipv een ID)
const fixImages = (data) => {
    if (!data) return data
    if (Array.isArray(data)) return data.map(fixImages)
    if (typeof data === 'object') {
        for (const key in data) {
            if (data[key] && typeof data[key] === 'object' && data[key].id && 
                ['in_bloom', 'not_in_bloom', 'image', 'logo'].includes(key)) {
                data[key] = data[key].id
            } else if (typeof data[key] === 'object') {
                fixImages(data[key])
            }
        }
    }
    return data
}

const fetchData = async (endpoint) => {
    const separator = endpoint.includes('?') ? '&' : '?'
    const response = await fetch(`${API_BASE}/${endpoint}${separator}fields=*.*`)
    const json = await response.json()
    return fixImages(json.data)
}

// --- Routes ---

app.get('/welcome', (req, res) => res.render('welcome.liquid'))

app.get('/', async (req, res) => {
    const [zones, plants, news] = await Promise.all([
        fetchData('frankendael_zones'),
        fetchData('frankendael_plants'),
        fetchData('frankendael_news')
    ])

    const plants_with_zones = plants.map(plant => {
        const zoneId = plant.zones?.[0]?.id || plant.zones?.[0]
        const matched_zone = zones.find(zone => zone.id === zoneId)
        return { ...plant, main_zone: matched_zone }
    })

    res.render('index.liquid', { zones, plants: plants_with_zones, news, zone_type: 'home' })
})

app.get('/veldverkenner', async (request, response) => {
    const [allZones, allPlants] = await Promise.all([
        fetchData('frankendael_zones'),
        fetchData('frankendael_plants')
    ])

    const zonesWithQuestsAndPlants = allZones.map(currentZone => {
        const foundQuest = quests_data.items.find(quest => quest.zones.includes(currentZone.id))
        if (foundQuest) {
            foundQuest.plant = allPlants.find(plant => plant.id === foundQuest.plant_id)
        }
        currentZone.quest = foundQuest || null
        return currentZone
    })

    response.render('veldverkenner.liquid', { zones: zonesWithQuestsAndPlants })
})

app.get('/veldverkenner/:zone_slug', async (request, response, next) => {
    const { zone_slug } = request.params
    try {
        const zoneData = await fetchData(`frankendael_zones?filter[slug][_eq]=${zone_slug}`)
        const currentZone = zoneData[0]
        if (!currentZone) return next()

        let plantsInThisZone = []
        if (currentZone.plants?.length > 0) {
            const plantIds = currentZone.plants.map(p => p.id || p)
            plantsInThisZone = await fetchData(`frankendael_plants?filter[id][_in]=${plantIds.join(',')}`)
        }

        const plantsWithQuests = plantsInThisZone.map(currentPlant => {
            currentPlant.quest = quests_data.items.find(quest => quest.plant_id === currentPlant.id)
            return currentPlant
        })

        response.render('zone.liquid', {
            zone: currentZone,
            plants: plantsWithQuests,
            zone_slug,
            zone_type: currentZone.type
        })
    } catch (error) {
        response.status(500).send('Fout bij laden zone')
    }
})

app.get('/veldverkenner/:zone_slug/:item_slug', async (request, response, next) => {
    const { zone_slug, item_slug } = request.params
    try {
        const zoneData = await fetchData(`frankendael_zones?filter[slug][_eq]=${zone_slug}`)
        const currentZone = zoneData[0]
        if (!currentZone) return next()

        const foundQuest = quests_data.items.find(quest => quest.slug === item_slug)
        if (foundQuest) {
            const plantData = await fetchData(`frankendael_plants?filter[id][_eq]=${foundQuest.plant_id}`)
            foundQuest.plant = plantData[0]

            return response.render('opdracht.liquid', {
                quest: foundQuest, 
                zone: currentZone, 
                zone_slug, 
                state: request.query.step || 'intro'
            })
        }

        const plantData = await fetchData(`frankendael_plants?filter[slug][_eq]=${item_slug}`)
        if (plantData[0]) {
            return response.render('plant-detail.liquid', { plant: plantData[0], zone: currentZone, zone_slug })
        }
        next()
    } catch (error) {
        response.status(500).send('Server fout')
    }
})

app.post('/veldverkenner/:zone_slug/:item_slug', async (request, response) => {
    const { plant_id } = request.body
    const { zone_slug } = request.params
    
    try {
        const url = 'https://fdnd-agency.directus.app/items/frankendael_users_plants'

        const postResponse = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                frankendael_users_id: parseInt(USER_ID),
                frankendael_plants_id: parseInt(plant_id)
            })
        })

        if (!postResponse.ok) {
            const errorData = await postResponse.json()
            console.error('Directus Rejected Post:', JSON.stringify(errorData, null, 2))
            throw new Error('Save failed')
        }

        response.redirect(`/veldverkenner/${zone_slug}`)
        
    } catch (error) {
        console.error('Quest save error:', error)
        response.status(500).send('Kon de opdracht niet voltooien.')
    }
})

app.get('/nieuws', async (request, response) => {
    const allNews = await fetchData('frankendael_news')
    response.render('nieuws.liquid', { news: allNews })
})

app.get('/nieuws/:slug', async (request, response) => {
    const { slug } = request.params
    const newsData = await fetchData(`frankendael_news?filter[slug][_eq]=${slug}`)
    response.render('news-detail.liquid', { newsItem: newsData[0] })
})

app.get('/collectie', async (request, response) => {
    try {
        const [allPlants, allZones, userSavedData] = await Promise.all([
            fetchData('frankendael_plants'),
            fetchData('frankendael_zones'),
            fetchData(`frankendael_users_plants?filter[frankendael_users_id][_eq]=${USER_ID}`)
        ])

        const finishedPlantIds = userSavedData.map(item => 
            item.frankendael_plants_id?.id || item.frankendael_plants_id
        )

        const collectedPlants = allPlants
            .filter(plant => finishedPlantIds.includes(plant.id))
            .map(currentPlant => {
                const zoneId = currentPlant.zones?.[0]?.id || currentPlant.zones?.[0]
                currentPlant.main_zone = allZones.find(zone => zone.id === zoneId)
                return currentPlant
            })

        response.render('collectie.liquid', { 
            plants: collectedPlants, 
            zone_type: 'collectie' 
        })
    } catch (error) {
        console.error(error)
        response.status(500).send('Fout bij laden collectie')
    }
})

app.use((request, response) => {
    response.status(404).render('404.liquid')
})

app.set('port', process.env.PORT || 8000)
app.listen(app.get('port'), () => {
    console.log(`Started on http://localhost:${app.get('port')}`)
})