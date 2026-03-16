import express from 'express'
import { Liquid } from 'liquidjs'

const app = express()
const API_BASE = 'https://fdnd-agency.directus.app/items'
const USER_ID = 2

app.use(express.urlencoded({ extended: true }))
app.use(express.static('public'))

const engine = new Liquid()
app.engine('liquid', engine.express())
app.set('views', './views')
app.set('view engine', 'liquid')

app.use((request, response, next) => {
    response.locals.current_path = request.path || '/'
    response.locals.previous_path = request.get('Referrer') || '/'
    response.locals.user_id = USER_ID 
    next()
})

const quests_data = {
    'items': [
        { 'id': 1, 'title': 'Opdracht 1', 'name': 'Zoeken', 'slug': 'opdracht-1', 'plant_id': 1, 'zones': [1, 2] },
        { 'id': 2, 'title': 'Opdracht 2', 'name': 'Herkennen', 'slug': 'opdracht-2', 'plant_id': 2, 'zones': [1,2,3,4,5] },
        { 'id': 3, 'title': 'Opdracht 3', 'name': 'Ruiken', 'slug': 'opdracht-3', 'plant_id': 3, 'zones': [1, 2, 3,5,6,7,8,9,10] },
        { 'id': 4, 'title': 'Opdracht 4', 'name': 'Tellen', 'slug': 'opdracht-4', 'plant_id': 4, 'zones': [1,2,3,4,5,6,7,8,9,10] },
        { 'id': 5, 'title': 'Opdracht 5', 'name': 'Voelen', 'slug': 'opdracht-5', 'plant_id': 5, 'zones': [1] },
        { 'id': 6, 'title': 'Opdracht 6', 'name': 'Kijken', 'slug': 'opdracht-6', 'plant_id': 6, 'zones': [1, 3] },
        { 'id': 7, 'title': 'Opdracht 7', 'name': 'Smaak', 'slug': 'opdracht-7', 'plant_id': 7, 'zones': [2] },
        { 'id': 8, 'title': 'Opdracht 8', 'name': 'Zoeken', 'slug': 'opdracht-8', 'plant_id': 8, 'zones': [1, 2, 3] },
        { 'id': 9, 'title': 'Opdracht 9', 'name': 'Onderzoek', 'slug': 'opdracht-9', 'plant_id': 9, 'zones': [3] },
        { 'id': 10, 'title': 'Opdracht 10', 'name': 'Determinatie', 'slug': 'opdracht-10', 'plant_id': 10, 'zones': [1] }
    ]
}

const fetchData = async (endpoint) => {
    const separator = endpoint.includes('?') ? '&' : '?'
    const response = await fetch(`${API_BASE}/${endpoint}${separator}fields=*.*`)
    const json = await response.json()
    return json.data
}

// --- GEDEELDE LOGICA VOOR COLLECTIE ---
// Deze functie zorgt ervoor dat we overal dezelfde 'verdiende' planten ophalen
const getCollectedPlants = async () => {
    const [allPlants, allZones, userSavedData] = await Promise.all([
        fetchData('frankendael_plants'),
        fetchData('frankendael_zones'),
        fetchData(`frankendael_users_plants?filter[frankendael_users_id][_eq]=${USER_ID}`)
    ])

    const finishedPlantIds = userSavedData.map(item => 
        item.frankendael_plants_id?.id || item.frankendael_plants_id
    )

    return allPlants
        .filter(plant => finishedPlantIds.includes(plant.id))
        .map(plant => {
            const zoneId = plant.zones?.[0]?.id || plant.zones?.[0]
            return { ...plant, main_zone: allZones.find(z => z.id === zoneId) }
        })
}

// All routes

// Welcome page
app.get('/welcome', (req, res) => res.render('welcome.liquid'))

// Homepage
app.get('/', async (req, res) => {
    const news = await fetchData('frankendael_news')
    const zones = await fetchData('frankendael_zones')
    const collectedPlants = await getCollectedPlants()

    res.render('index.liquid', { 
        zones, 
        plants: collectedPlants, 
        news, 
        zone_type: 'home' 
    })
})

// Collection pagina 
app.get('/collectie', async (req, res) => {
    const collectedPlants = await getCollectedPlants()
    res.render('collectie.liquid', { 
        plants: collectedPlants, 
        zone_type: 'collectie' 
    })
})

// Veldverkenner (map)
app.get('/veldverkenner', async (request, response) => {
    const [allZones, allPlants] = await Promise.all([
        fetchData('frankendael_zones'),
        fetchData('frankendael_plants')
    ])

    const zonesWithQuests = allZones.map(currentZone => {
        const foundQuest = quests_data.items.find(quest => quest.zones.includes(currentZone.id))
        if (foundQuest) {
            foundQuest.plant = allPlants.find(plant => plant.id === foundQuest.plant_id)
        }
        currentZone.quest = foundQuest || null
        return currentZone
    })

    response.render('veldverkenner.liquid', { zones: zonesWithQuests })
})

// Zone detail
app.get('/veldverkenner/:zone_slug', async (request, response, next) => {
    const { zone_slug } = request.params
    const zoneData = await fetchData(`frankendael_zones?filter[slug][_eq]=${zone_slug}`)
    const currentZone = zoneData[0]
    if (!currentZone) return next()

    let plantsInThisZone = []
    if (currentZone.plants?.length > 0) {
        const plantIds = currentZone.plants.map(p => p.id || p)
        plantsInThisZone = await fetchData(`frankendael_plants?filter[id][_in]=${plantIds.join(',')}`)
    }

    const plantsWithQuests = plantsInThisZone.map(plant => {
        plant.quest = quests_data.items.find(q => q.plant_id === plant.id)
        return plant
    })

    response.render('zone.liquid', { zone: currentZone, plants: plantsWithQuests, zone_slug })
})

// Quest / Plant detail
app.get('/veldverkenner/:zone_slug/:item_slug', async (request, response, next) => {
    const { zone_slug, item_slug } = request.params
    const zoneData = await fetchData(`frankendael_zones?filter[slug][_eq]=${zone_slug}`)
    const currentZone = zoneData[0]
    if (!currentZone) return next()

    const foundQuest = quests_data.items.find(q => q.slug === item_slug)
    if (foundQuest) {
        const plantData = await fetchData(`frankendael_plants?filter[id][_eq]=${foundQuest.plant_id}`)
        foundQuest.plant = plantData[0]
        return response.render('opdracht.liquid', {
            quest: foundQuest, zone: currentZone, zone_slug, state: request.query.step || 'intro'
        })
    }

    const plantData = await fetchData(`frankendael_plants?filter[slug][_eq]=${item_slug}`)
    if (plantData[0]) {
        return response.render('plant-detail.liquid', { plant: plantData[0], zone: currentZone, zone_slug })
    }
    next()
})

// Quest complete (POST to Directus)
app.post('/veldverkenner/:zone_slug/:item_slug', async (request, response) => {
    const { plant_id } = request.body
    const { zone_slug } = request.params
    
    try {
        await fetch('https://fdnd-agency.directus.app/items/frankendael_users_plants', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                frankendael_users_id: parseInt(USER_ID),
                frankendael_plants_id: parseInt(plant_id)
            })
        })
        response.redirect(`/veldverkenner/${zone_slug}`)
    } catch (error) {
        response.status(500).send('Fout bij opslaan.')
    }
})

// news page
app.get('/nieuws', async (request, response) => {
    const allNews = await fetchData('frankendael_news')
    response.render('nieuws.liquid', { news: allNews })
})

// news article
app.get('/nieuws/:slug', async (request, response) => {
    const newsData = await fetchData(`frankendael_news?filter[slug][_eq]=${request.params.slug}`)
    response.render('news-detail.liquid', { newsItem: newsData[0] })
})

// 404 checker
app.use((request, response) => {
    response.status(404).render('404.liquid')
})

app.set('port', process.env.PORT || 8000)
app.listen(app.get('port'), () => console.log(`http://localhost:${app.get('port')}`))