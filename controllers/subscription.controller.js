import { workflowClient } from '../config/upstash.js';
import Subscription from '../models/subscription.model.js';
import { SERVER_URL } from '../config/env.js';

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
        if(req.user.id !== req.params.userId) {
            const error = new Error('You are not the owner of the account');
            error.statusCode = 403;
            throw error;
        }

        const subscriptions = await Subscription.find({ user: req.user._id });

        if (!subscriptions) {
            const error = new Error('No subscriptions found for this user');
            error.statusCode = 404;
            throw error;
        }

        res.status(200).json({
            success: true,
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