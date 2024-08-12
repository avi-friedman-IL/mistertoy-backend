import { ObjectId } from 'mongodb'

import { dbService } from '../../services/db.service.js'
import { logger } from '../../services/logger.service.js'
import { utilService } from '../../services/util.service.js'
import { text } from 'express'

export const toyService = {
    remove,
    query,
    getById,
    add,
    update,
    addReview,
    removeReview,
}

async function query(filterBy = {}) {
    try {
        const criteria = {
            name: { $regex: filterBy.txt, $options: 'i' },
            price: { $lte: filterBy.maxPrice || Infinity },
        }
        if (filterBy.radio === 'inStock') criteria.inStock = true
        filterBy.labels?.length && (criteria.labels = { $in: filterBy.labels })

        const collection = await dbService.getCollection('toy')
        var toys = await collection.find(criteria).toArray()
        return toys
    } catch (err) {
        logger.error('cannot find toys', err)
        throw err
    }
}

async function getById(toyId) {
    try {
        const collection = await dbService.getCollection('toy')
        var toy = await collection.findOne({ _id: ObjectId.createFromHexString(toyId) })
        toy = await _setNextPrevToyId(toy)
        toy.createdAt = toy._id.getTimestamp()
        await collection.updateOne({ _id: ObjectId.createFromHexString(toyId) }, { $set: toy })
        return toy
    } catch (err) {
        logger.error(`while finding toy ${toyId}`, err)
        throw err
    }
}

async function remove(toyId) {
    try {
        const collection = await dbService.getCollection('toy')
        const { deletedCount } = await collection.deleteOne({ _id: ObjectId.createFromHexString(toyId) })
        return deletedCount
    } catch (err) {
        logger.error(`cannot remove toy ${toyId}`, err)
        throw err
    }
}

async function add(toy) {
    toy.img = '05'
    try {
        const collection = await dbService.getCollection('toy')
        await collection.insertOne(toy)
        return toy
    } catch (err) {
        logger.error('cannot insert toy', err)
        throw err
    }
}

async function update(toy) {
    try {
        const toyToSave = {
            name: toy.name,
            price: toy.price,
            labels: toy.labels,
        }
        const collection = await dbService.getCollection('toy')
        await collection.updateOne({ _id: ObjectId.createFromHexString(toy._id) }, { $set: toyToSave })
        return toy
    } catch (err) {
        logger.error(`cannot update toy ${toy._id}`, err)
        throw err
    }
}

async function _setNextPrevToyId(toy) {
    const filterBy = {
        txt: '',
        maxPrice: '',
        labels: [],
        radio: '',
    }
    var toys = await query(filterBy)
    const toyIdx = toys.findIndex(currToy => currToy._id.toString() === toy._id.toString())
    const nextToy = toys[toyIdx + 1] ? toys[toyIdx + 1] : toys[0]
    const prevToy = toys[toyIdx - 1] ? toys[toyIdx - 1] : toys[toys.length - 1]
    toy.nextToyId = nextToy._id
    toy.prevToyId = prevToy._id
    return toy
}

async function addReview(toyId, msg) {
    try {
        msg.id = utilService.makeId()

        const collection = await dbService.getCollection('toy')
        await collection.updateOne({ _id: ObjectId.createFromHexString(toyId) }, { $push: { msgs: msg } })
        return msg
    } catch (err) {
        logger.error(`cannot add toy msg ${toyId}`, err)
        throw err
    }
}

async function removeReview(toyId, msgId) {
    try {
        const collection = await dbService.getCollection('toy')
        await collection.updateOne({ _id: ObjectId.createFromHexString(toyId) }, { $pull: { msgs: { id: msgId } } })
        return msgId
    } catch (err) {
        logger.error(`cannot add toy msg ${toyId}`, err)
        throw err
    }
}

