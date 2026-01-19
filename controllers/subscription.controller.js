import { workflowClient } from '../config/upstash.js';
import Subscription from '../models/subscription.model.js';
import { SERVER_URL } from '../config/env.js';
import dayjs from 'dayjs';

export const createSubscription = async (req, res, next) => {
    try {
        const subscription = await Subscription.create({
            ...req.body,
            user: req.user._id
        });

        await workflowClient.trigger({
            url: `${SERVER_URL}/api/v1/workflows/subscription/reminder`,
            body: {
                subscriptionId: subscription._id.toString()
            }
        });

        res.status(201).json({
            success: true,
            data: subscription
        });
    }
    catch(e) {
        next(e);
    }
}

export const getUserSubscriptions = async (req, res, next) => {
    try {
        if(req.user._id.toString() !== req.params.userId) {
            const error = new Error('You are not the owner of the account');
            error.statusCode = 403;
            throw error;
        }

        const subscriptions = await Subscription.find({ user: req.user._id })
            .sort({ renewalDate: 1 }); // Sort by renewal date

        // Don't throw error if empty array - empty is valid
        res.status(200).json({
            success: true,
            count: subscriptions.length,
            data: subscriptions
        });
    } 
    catch(e) {
        next(e);
    }
}

export const getAllSubscriptions = async (req, res, next) => {

    try {
        const subscriptions = await Subscription.find().populate('user', 'name email');
        if (!subscriptions) {
            const error = new Error('No subscriptions found.');
            error.statusCode = 404;
            throw error;
        }

        res.status(200).json({
            success: true,
            data: subscriptions
        })
    }
    catch(e) {
        next(e);
    }
}

export const getUpcomingRenewals = async (req, res, next) => {
    try {
        const daysAhead = parseInt(req.query.days) || 30; // Default 30 days
        const today = dayjs();
        
        const upcomingRenewals = await Subscription.find({
            user: req.user._id, 
            status: 'active',
            renewalDate: {
                $gte: today.toDate(),
                $lte: today.add(daysAhead, 'day').toDate()
            }
        })
        .populate('user', 'name email')
        .sort({ renewalDate: 1 }); // Soonest first

        res.status(200).json({
            success: true,
            count: upcomingRenewals.length,
            data: upcomingRenewals
        });
    }
    catch(e) {
        next(e);
    }
}

export const getSubscriptionById = async (req, res, next) => {
    try {
        const subscription = await Subscription.findById(req.params.id)
            .populate('user', 'name email');

        if (!subscription) {
            const error = new Error('Subscription not found');
            error.statusCode = 404;
            throw error;
        }

        if (subscription.user._id.toString() !== req.user._id.toString()) {
            const error = new Error('Unauthorized to view this subscription');
            error.statusCode = 403;
            throw error;
        }

        res.status(200).json({
            success: true,
            data: subscription
        });
    }
    catch(e) {
        next(e);
    }
}

export const updateSubscription = async (req, res, next) => {
    try {
        const subscription = await Subscription.findById(req.params.id);

        if (!subscription) {
            const error = new Error('Subscription not found');
            error.statusCode = 404;
            throw error;
        }

        if (subscription.user.toString() !== req.user._id.toString()) {
            const error = new Error('Unauthorized to update this subscription');
            error.statusCode = 403;
            throw error;
        }

        delete req.body.user;

        // Update subscription
        const updatedSubscription = await Subscription.findByIdAndUpdate(
            req.params.id,
            req.body,
            { 
                new: true, // Return updated document
                runValidators: true // Run schema validation
            }
        );

        res.status(200).json({
            success: true,
            message: 'Subscription updated successfully',
            data: updatedSubscription
        });
    }
    catch(e) {
        next(e);
    }
}

export const deleteSubscription = async (req, res, next) => {
    try {
        const subscription = await Subscription.findById(req.params.id);

        if (!subscription) {
            const error = new Error('Subscription not found');
            error.statusCode = 404;
            throw error;
        }

        if (subscription.user.toString() !== req.user._id.toString()) {
            const error = new Error('Unauthorized to delete this subscription');
            error.statusCode = 403;
            throw error;
        }

        await Subscription.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: 'Subscription deleted successfully'
        });
    }
    catch(e) {
        next(e);
    }
}

export const cancelSubscription = async (req, res, next) => {
    try {
        const subscription = await Subscription.findById(req.params.id);

        if (!subscription) {
            const error = new Error('Subscription not found');
            error.statusCode = 404;
            throw error;
        }

        if (subscription.user.toString() !== req.user._id.toString()) {
            const error = new Error('Unauthorized to cancel this subscription');
            error.statusCode = 403;
            throw error;
        }

        // Check if already cancelled
        if (subscription.status === 'canceled') {
            const error = new Error('Subscription is already canceled');
            error.statusCode = 400;
            throw error;
        }

        // Update status to cancelled
        subscription.status = 'canceled';
        await subscription.save();

        res.status(200).json({
            success: true,
            message: 'Subscription canceled successfully',
            data: subscription
        });
    }
    catch(e) {
        next(e);
    }
}