import { createRequire } from 'module';
import Subscription from '../models/subscription.model';
import dayjs from 'dayjs';

const REMINDERS = [7, 5, 2, 1];
const require = createRequire(import.meta.url);
const { serve } = require('@upstash/workflows/express');

export const sendReminders = serve(async (context) => {
    const { subscriptionId } = context.requestPayload;
    const subscription =  await fetchSubscription(context, subscriptionId);

    if (!subscription || subscription.status !== 'active') return;

    const renewalDate = dayjs(subscription.renewalDate);
    if (renewalDate.isBefore(dayjs())) {
        console.log(`Renewal date for subscription ${subscription._id} has passed. Stopping workflow.`);
        return;
    }

    for (const daysBefore of REMINDERS) {
        const reminderDate = renewalDate.subtract(daysBefore, 'day');

        if(reminderDate.isAfter(dayjs())) {
            await sleepUntilReminder(context, `Reminder ${daysBefore} days before`, reminderDate);
        }

        await triggerReminder(context, `Reminder ${daysBefore} days before`);
    }
});

const fetchSubscription = async (context, subscriptionId) => {
    return await context.run('get subscription', async () => {
        return Subscription.findById(subscriptionId).populate('user', 'name email');
    })
}

const sleepUntilReminder = async(context, MongoErrorLabel, date) => {
    console.log(`Sleeping until ${label} reminder at ${date.toISOString()}`);
    await context.sleepUntil(label, date.toDate());
}

const triggerReminder = async (context, label) => {
    return await context.run(label, () => {
        console.log(`Triggering ${label} reminder`);
        // Send email, SMS, push notification, etc.
    })
}