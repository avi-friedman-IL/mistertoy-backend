import express from 'express'

import { requireAuth, requireAdmin } from '../../middlewares/requireAuth.middleware.js'
import { log } from '../../middlewares/logger.middleware.js'

import { getReviews, addReview, deleteReview } from './review.controller.js'

export const reviewRoutes = express.Router()

reviewRoutes.get('/', log, requireAuth, getReviews)
reviewRoutes.post('/', log, requireAuth, addReview)
reviewRoutes.delete('/:reviewId', requireAdmin, deleteReview)
