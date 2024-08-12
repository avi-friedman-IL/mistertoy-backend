import { ObjectId } from 'mongodb'

import { dbService } from '../../services/db.service.js'
import { logger } from '../../services/logger.service.js'
import { asyncLocalStorage } from '../../services/als.service.js'

export const reviewService = {
    query,
    remove,
    add,
}

async function query(filterBy = {}) {
    console.log(filterBy)
	const criteria = {}

	if (filterBy.byUserId) {
		criteria.byUserId = ObjectId.createFromHexString(filterBy.byUserId)
	}
	if (filterBy.toyId) {
		criteria.toyId = ObjectId.createFromHexString(filterBy.toyId)
	}

	try {
		const collection = await dbService.getCollection('review')
		var reviews = await collection
			.aggregate([
				{ $match: criteria },
				{
					$lookup: {
						localField: 'byUserId',
						from: 'user',
						foreignField: '_id',
						as: 'byUser',
					},
				},
                {
                    $unwind: '$byUser',
                },
				{
					$lookup: {
						localField: 'toyId',
						from: 'toy',
						foreignField: '_id',
						as: 'toy',
					},
				},
                {
                    $unwind: '$toy',
                },
            ]).toArray()

        reviews = reviews.map(review => {
            delete review.byUser.password
            return review
        })
		return reviews
	} catch (err) {
		logger.error('cannot find reviews', err)
		throw err
	}
}

async function remove(reviewId) {
    try {
        const { loggedinUser } = asyncLocalStorage.getStore()
        const collection = await dbService.getCollection('review')
        const criteria = { _id: reviewId }
        if (!loggedinUser.isAdmin) {
            criteria.byUserId = ObjectId.createFromHexString(loggedinUser._id)
        }
        await collection.deleteOne({ _id: ObjectId.createFromHexString(reviewId) })
    } catch (err) {
        logger.error(`cannot remove review ${reviewId}`, err)
        throw err
    }
}

async function add(review, byUser) {
	console.log('review:', review)
	console.log('byUser:', byUser)
    try {
		const reviewToAdd = {
			byUserId: ObjectId.createFromHexString(byUser._id),
			toyId: ObjectId.createFromHexString(review.toyId),
			txt: review.txt,
		}
		const collection = await dbService.getCollection('review')
		await collection.insertOne(reviewToAdd)
		return reviewToAdd
	} catch (err) {
		logger.error('cannot insert review', err)
		throw err
	}
}

