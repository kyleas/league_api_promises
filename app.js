// Axios for promise based HTTP requests
const axios = require('axios')
// Express server
const express = require('express')

const app = express()

const API_KEY = 'YOUR_API_KEY_HERE'
const API_URL = 'https://la1.api.riotgames.com/lol'

// Receives a summoner name in the query parameters
app.get('/', (req, res) => {
  // If there is no 
  if (!req.query.summoner_name) {
    res.sendStatus(400)
  }
  const summoner_name = req.query.summoner_name
  // Fetch the summoner from the API
  let a = fetchSummoner(summoner_name)
    // then fetch the matches in which the player has used a F2P champion
    .then(fetchF2PChampionMatches)
    // then send the results back to the client
    .then(result => res.json(result) )
    // Naive error handling
    .catch(error => res.json(error.toString()) )
})

app.listen(3000, () => console.log('App listening on port 3000!'))

// Utility function to resolve an API call URI
function resolveUrl(url, params = '') {
  params = (params === '')? params:'&'+params
  return `${API_URL}/${url}?api_key=${API_KEY}${params}`
}

// Fetch the matches in which the player has used a F2P champion
function fetchF2PChampionMatches (summoner) {
  // Fetch both the summoners' matches and the F2P champions
  return Promise.all([
      fetchSummonerMatches(summoner),
      fetchFreeToPlayChampions()
    ]).then(results => { // then filter the matches to find the ones that have a F2P champion
        const matches = results[0]
        const f2p_champions = results[1]

        // Get a champion ID array
        const champion_ids = f2p_champions.map(champion => champion.id)
        // Filter the matches using the champion ID array and return the array
        return matches.filter(match => champion_ids.includes(match.champion))
      })
      // Naive error handling
      .catch(error => error)
}


// Fetch the summoner data from the API based on the summoner_name
function fetchSummoner(summoner_name) {
  return axios.get(resolveUrl(`summoner/v3/summoners/by-name/${summoner_name}`))
    // Resolves to the summoner object
    .then(result => result.data)
    // Naive error handling
    .catch(error => {throw error})
}

// Fetch the summoners' match data from the API given a summoner object
function fetchSummonerMatches(summoner) {
  return axios.get(resolveUrl(`match/v3/matchlists/by-account/${summoner.accountId}`))
    // Resolves to the summoners' match array
    .then(result => result.data.matches)
    // Naive error handling
    .catch(error => {throw error})
}

// Fetch the free to play champions data from the API
function fetchFreeToPlayChampions() {
  return axios.get(resolveUrl('platform/v3/champions', 'freeToPlay=true'))
    // Resolves to the free to play champions array
    .then(result => result.data.champions)
    // Naive error handling
    .catch(error => {throw error})
}