import { Router } from 'express';
import authorize from '../middleware/auth.middleware.js';
import { createSubscription, getAllSubscriptions, getUpcomingRenewals, getUserSubscriptions } from '../controllers/subscription.controller.js';

const subscriptionRouter = Router();

subscriptionRouter.get('/', authorize, getAllSubscriptions);
subscriptionRouter.get('/:id', authorize, getUserSubscriptions);
subscriptionRouter.post('/', authorize, createSubscription);
subscriptionRouter.get('/user/:id', authorize, getUserSubscriptions);
subscriptionRouter.get('/upcoming-renewals', authorize, getUpcomingRenewals);

subscriptionRouter.put('/:id', (req, res) => {
    res.send({ title: 'UPDATE subscription by id'});
});
subscriptionRouter.delete('/:id', (req, res) => {
    res.send({ title: 'DELETE subscription by id'});
});
subscriptionRouter.put('/:id/cancel', (req, res) => {
    res.send({ title: 'CANCEL subscription'});
});

export default subscriptionRouter;