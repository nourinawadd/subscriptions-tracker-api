import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Subscription name is required'],
        trim: true,
        minLength: 2,
        maxLength: 100
    },
    price: {
        type: Number,
        required: [true, 'Subscription price is required'],
        min: [0, 'Price must be greater than 0'],
        max: [1000, 'Price must be less than 1000'],
    },
    currency: {
        type: String,
        enum: ['USD', 'EGP', 'KWD', 'EUR', 'GBP'],
        default: 'EGP'
    },

    frequency: {
        type: String,
        enum: ['daily', 'weekly', 'monthly', 'yearly'],
        required: true
    },

    category: {
        type: String,
        enum: ['entertainment', 'education', 'productivity', 'health', 'other'],
        required: true
    },

    paymentMethod: {
        type: String,
        required: true,
        trim: true
    },

    status: {
        type: String,
        enum: ['active', 'paused', 'canceled', 'expired'],
        default: 'active'
    },

    startDate: {
        type: Date,
        required: true,
        validate: {
            validator: function(value) {
                return value <= new Date();
            },
            message: 'Start date cannot be in the future'
        },
    },

    renewalDate: {
        type: Date,
        required: false,
        validate: {
            validator: function(value) {
                if (!value) return true;
                return value > this.startDate;
            },
            message: 'Renewal date must be after start date'
        }
    },


    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    }
}, { timestamps: true });

// Auto-calculate renewalDate if missing
subscriptionSchema.pre('save', function() {
    if(!this.renewalDate) {
        const renewalPeriods = {
            daily: 1,
            weekly: 7,
            monthly: 30,
            yearly: 365
        };

        this.renewalDate = new Date(this.startDate);
        this.renewalDate.setDate(this.renewalDate.getDate() + renewalPeriods[this.frequency]);
    }
    
    // Auto-update status if renewalDate has passed
    if(this.renewalDate <= new Date()) {
        this.status = 'expired';
    }
});

const Subscription = mongoose.model('Subscription', subscriptionSchema);
export default Subscription;