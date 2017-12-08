var mongoose = require('mongoose');
var Schema = mongoose.Schema;
module.exports = {
    user: {
        logo: { type: String },
        name: { type: String, required: true },
        password: { type: String, required: true },
        sex: { type: String, default: "boy" },
        status: { type: String, default: "down" },
        socket: String,
        account: { type: String, required: true },
        group: [
            {
                type: Schema.Types.ObjectId,
                ref: 'group'        // ref->m   populate.path->字段名
            }
        ],
        // 群组管理
        chatgroup: [
            {
                type: Schema.Types.ObjectId,
                ref: 'chatgroup'        // ref->m   populate.path->字段名
            }
        ],
        friends: [{
            user: {
                type: Schema.Types.ObjectId,
                ref: 'user'
            },
            remark: String,
            groupId: Schema.Types.ObjectId,
            news: {
                type: Schema.Types.ObjectId,
                ref: 'news'
            }
        }],
        framef: [
            {
                type: Schema.Types.ObjectId,
                ref: 'user'
            }
        ]
    },
    group: {
        gname: { type: String, require: true },
        ismain: {type: Boolean , default: false}
    },
    news: {
        time: String,
        msg: String
    },
    chatgroup: {
        gnumber: String,
        cgname: { type: String, require: true },
        member: [
            {
                type: Schema.Types.ObjectId,
                ref: 'user'
            }
        ]
    },
    content: {
        name: { type: String, require: true },
        data: { type: String, require: true },
        time: { type: String, required: true }
    },
    momentmax: {
        account: { type: Number, required: true }
    }
};
