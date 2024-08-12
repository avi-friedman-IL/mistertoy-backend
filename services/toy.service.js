import fs from 'fs'
import { utilService } from './util.service.js'
import { loggerService } from './logger.service.js'

export const toyService = {
    // query,
    // getById,
    // remove,
    // save,
}

const toys = utilService.readJsonFile('data/toy.json')

function query(filterBy = {}) {
    let filteredToys = toys

    if (filterBy.txt) {
        const regExp = new RegExp(filterBy.txt, 'i')
        filteredToys = filteredToys.filter(toy => regExp.test(toy.name))
    }
    if (filterBy.maxPrice) {
        filteredToys = filteredToys.filter(toy => toy.price <= filterBy.maxPrice)
    }
    if (filterBy.labels?.length) {
        filteredToys = filteredToys.filter(toy => filterBy.labels.every(label => toy.labels.includes(label)))
    }
    if (filterBy.radio === 'inStock') {
        filteredToys = filteredToys.filter(toy => toy.inStock)
    }

    if (filterBy.sortBy) {
        switch (filterBy.sortBy) {
            case 'name':
                filteredToys.sort((a, b) => a.name.localeCompare(b.name))
                break
            case 'price':
                filteredToys.sort((a, b) => a.price - b.price)
                break
            case 'createdAt':
                filteredToys.sort((a, b) => a.createdAt - b.createdAt)
                break
        }
    }

    return Promise.resolve(filteredToys)
}

function getById(toyId) {
    let toy = toys.find(toy => toy._id === toyId)
    toy = _setNextPrevToyId(toy)
    return Promise.resolve(toy)
}

function remove(toyId) {
    const idx = toys.findIndex(toy => toy._id === toyId)
    if (idx === -1) return Promise.reject('No Such Toy')

    toys.splice(idx, 1)
    return _saveToysToFile()
}

function save(toy) {
    if (toy._id) {
        const toyToUpdate = toys.find(currToy => currToy._id === toy._id)
        toyToUpdate.name = toy.name
        toyToUpdate.price = toy.price
        toyToUpdate.labels = toy.labels
        toy = toyToUpdate
    } else {
        toy._id = utilService.makeId()
        toy.createdAt = Date.now()
        toy.inStock = true
        toy.img = '08'

        toys.push(toy)
    }

    return _saveToysToFile().then(() => toy)
}

function _saveToysToFile() {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify(toys, null, 4)
        fs.writeFile('data/toy.json', data, err => {
            if (err) {
                loggerService.error('Cannot write to toys file', err)
                return reject(err)
            }
            resolve()
        })
    })
}

function _setNextPrevToyId(toy) {
    const toyIdx = toys.findIndex(currToy => currToy._id === toy._id)
    const nextToy = toys[toyIdx + 1] ? toys[toyIdx + 1] : toys[0]
    const prevToy = toys[toyIdx - 1] ? toys[toyIdx - 1] : toys[toys.length - 1]
    toy.nextToyId = nextToy._id
    toy.prevToyId = prevToy._id
    return toy
}
