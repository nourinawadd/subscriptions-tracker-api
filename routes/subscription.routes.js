import { Router } from 'express';
import authorize from '../middleware/auth.middleware.js';
import { 
    createSubscription, 
    getAllSubscriptions, 
    getSubscriptionById,
    getUserSubscriptions,
    getUpcomingRenewals,
    updateSubscription,
    deleteSubscription,
    cancelSubscription
} from '../controllers/subscription.controller.js';

const subscriptionRouter = Router();

subscriptionRouter.get('/upcoming-renewals', authorize, getUpcomingRenewals);
subscriptionRouter.get('/', authorize, getAllSubscriptions);
subscriptionRouter.post('/', authorize, createSubscription);
subscriptionRouter.get('/user/:userId', authorize, getUserSubscriptions);
subscriptionRouter.get('/:id', authorize, getSubscriptionById);
subscriptionRouter.put('/:id', authorize, updateSubscription);
subscriptionRouter.delete('/:id', authorize, deleteSubscription);
subscriptionRouter.put('/:id/cancel', authorize, cancelSubscription);

export default subscriptionRouter;