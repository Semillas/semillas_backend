import { Schema, arrayOf, normalize } from 'normalizr'
import { camelizeKeys } from 'humps'

// Extracts the next page URL from Github API response.
const getNextPageUrl = response => {
  const link = response.headers.get('link')
  if (!link) {
    return null
  }

  const nextLink = link.split(',').find(s => s.indexOf('rel="next"') > -1)
  if (!nextLink) {
    return null
  }


  return nextLink.split(';')[0].slice(1, -1)
}

const API_ROOT = '/'

// Fetches an API response and normalizes the result JSON according to schema.
// This makes every API response have the same shape, regardless of how nested it was.
const callApi = (endpoint, schema) => {
  const fullUrl = (endpoint.indexOf(API_ROOT) === -1) ? API_ROOT + endpoint : endpoint
  debugger;

  return fetch(fullUrl)
    .then(response =>
      response.json().then(json => {
        if (!response.ok) {
          return Promise.reject(json)
        }

        const camelizedJson = camelizeKeys(json)
        const nextPageUrl = getNextPageUrl(response)

        return Object.assign({},
          normalize(camelizedJson, schema),
          { nextPageUrl }
        )
      })
    )
}

// We use this Normalizr schemas to transform API responses from a nested form
// to a flat form where repos and users are placed in `entities`, and nested
// JSON objects are replaced with their IDs. This is very convenient for
// consumption by reducers, because we can easily build a normalized tree
// and keep it updated as we fetch more data.

// Read more about Normalizr: https://github.com/paularmstrong/normalizr

const serviceSchema = new Schema('services', {
  idAttribute: service => service.uuid.toLowerCase()
})

// Schemas for Github API responses.
export const Schemas = {
  SERVICE: serviceSchema,
  SERVICE_ARRAY: arrayOf(serviceSchema)
}

// Action key that carries API call info interpreted by this Redux middleware.
export const CALL_API = Symbol('Call Semillas API')

// A Redux middleware that interprets actions with CALL_API info specified.
// Performs the call and promises when such actions are dispatched.
export default store => next => action => {
  debugger;
  const callAPI = action[CALL_API]
  if (typeof callAPI === 'undefined') {
    debugger;
    return next(action)
  }

  let { endpoint } = callAPI
  const { schema, types } = callAPI

  if (typeof endpoint === 'function') {
    endpoint = endpoint(store.getState())
  }

  if (typeof endpoint !== 'string') {
    throw new Error('Specify a string endpoint URL.')
  }
  if (!schema) {
    throw new Error('Specify one of the exported Schemas.')
  }
  if (!Array.isArray(types) || types.length !== 3) {
    throw new Error('Expected an array of three action types.')
  }
  if (!types.every(type => typeof type === 'string')) {
    throw new Error('Expected action types to be strings.')
  }

  const actionWith = data => {
    const finalAction = Object.assign({}, action, data)
    delete finalAction[CALL_API]
    return finalAction
  }

  const [ requestType, successType, failureType ] = types
  next(actionWith({ type: requestType }))

  return callApi(endpoint, schema).then(
    response => next(actionWith({
      response,
      type: successType
    })),
    error => next(actionWith({
      type: failureType,
      error: error.message || 'Something bad happened'
    }))
  )
}