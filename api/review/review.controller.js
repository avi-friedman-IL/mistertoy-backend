import { ObjectId } from 'mongodb'
import { logger } from '../../services/logger.service.js'
import { authService } from '../auth/auth.service.js'
import { userService } from '../user/user.service.js'
import { reviewService } from './review.service.js'

export async function getReviews(req, res) {
    try {
        const reviews = await reviewService.query(req.query)
        res.send(reviews)
    } catch (err) {
        logger.error('Failed to get reviews', err)
        res.status(500).send({ err: 'Failed to get reviews' })
    }
}

export async function deleteReview(req, res) {
    var { reviewId } = req.params

    try {
        const remove = await reviewService.remove(reviewId)
        res.send(remove)
    } catch (err) {
        logger.error('Failed to delete review', err)
        res.status(400).send({ err: 'Failed to delete review' })
    }
}

export async function addReview(req, res) {
    const { loggedinUser } = req
    try {
        const review = await reviewService.add(req.body, loggedinUser)
        res.send(review)
    } catch (err) {
        logger.error('Failed to get review', err)
        res.status(500).send({ err: 'Failed to get review' })
    }
}
