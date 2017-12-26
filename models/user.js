var mongoose = require('mongoose');
var assert = require('assert');
mongoose.connect('mongodb://localhost:27017/chatbot',{
    useMongoClient:true
});

var Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

const userSchema = new Schema({
    UserName: {
        type: String,
        required: true
    },
    SessionId:{
        type: String,
        required: true
    },
    Q: {
        type: String,
        required: true
    },
    text: {
        type:String,
        default:null
    },
    A: {
        type: String,
        required: true
    },
    back: {
        type:Boolean,
        default: false
    },
    prevtext: {
        type: String,
        default: null
    },
    prevA: {
        type:String,
        default: null
    },
    time: {
        type: Date,
        default: Date.now
    }
});

var users = mongoose.model('user',userSchema);
module.exports=users;