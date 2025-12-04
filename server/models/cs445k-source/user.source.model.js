// models/cs445k-source/user.source.model.js
import mongoose from 'mongoose';
import connectCS445KDB from '../../config/connectCS445KDB.js';

const conn = await connectCS445KDB();

// Use the same schema as CS445K
const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    mobile: String,
    status: String,
    role: String,
    rewardsPoint: Number,
}, {
    timestamps: true,
    collection: 'users',  // CS445K collection name
});

export default conn.models.CS445KUser || conn.model('CS445KUser', userSchema);
