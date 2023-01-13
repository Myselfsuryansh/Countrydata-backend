const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require("mongoose")
const app = express();
app.use(cors())
app.listen(3000, (req, res) => {
    console.log('Express API is running at port 3000');
})
mongoose.set('strictQuery', true)
mongoose.set('strictQuery', false)
mongoose.connect('mongodb://localhost:27017/data', {
    useNewUrlParser: true,
    useUnifiedTopology: true,


}, (err) => {
    if (!err) {
        console.log("connected to database")
    } else {
        console.log("error")
    }
});
app.use(bodyParser.urlencoded({ extended: false }))

app.use(bodyParser.json());
// const Schema = {
//     // ID:Number,
//     COUNTRY:{type:String},
//     STATE:{type:String}
// }
// const model = mongoose.model("COUNTRY", Schema);
const reqString = {
    type: String,
    required: true,
}

const districtschema = mongoose.Schema(
    {
        DISTRICTNAME: reqString,
    }
)
const stateschema = mongoose.Schema(
    {
        STATENAME: reqString,
        DISTRICT: [districtschema],
    }
)
const oneSchema = mongoose.Schema(
    {
        COUNTRY: reqString,
        STATE: [stateschema],
    }
)
// const model = mongoose.model("COUNTRY", oneSchema);
// const model = mongoose.model("COUNTRY", oneSchema);
const model = mongoose.model("Data", oneSchema);

app.get('/fetch', (req, res, next) => {

    model.find()

        .exec()

        .then(docs => {

            res.status(200).json(docs)

        }).catch(err => {

            console.log(err);

            res.status(500).json({

                error: err

            })

        })

})
app.post("/postData", (req, res) => {
    console.log("inside post function");

    const data = new model({

        COUNTRY: req.body.COUNTRY

    })
    data.save().then((result) => {

        console.log({ result });

        res.status(201).json({

            message: "data add",

            result

        })

    })

        .catch(err => {

            console.log(err);

            res.status(500).json({

                error: err

            })

        })
})

app.post('/COUNTRY/:COUNTRY', (req, res) => {
    let PUTCOUNTRY = req.params.COUNTRY
    let PUTSTATE = req.body.STATENAME
    model.findOneAndUpdate({ COUNTRY: PUTCOUNTRY }, { $push: { "STATE": { STATENAME: PUTSTATE } } }, { new: true }, (err, data) => {
        if (err) {
            res.send(err)
        } else {
            if (data == null) {
                res.send({
                    status: false,
                    message: "Nothing found"
                })
            } else {
                res.send({
                    status: true,
                    message: "Data Updated successfully"
                })
            }
        }
    })
})

app.get('/fetch/:STATE', function (req, res) {
    fetchSTATE = req.params.STATE;
    model.find(({}), function (err, val) {
        res.send(val)

    })
})
//   app.post('/COUNTRY/:STATENAME', (req,res)=>{
//     let PUTSTATE = req.params.STATENAME
//     let PUTDISTRICT = req.params.DISTRICTNAME
//     model.findOneAndUpdate({STATENAME:PUTSTATE},{$push:{"STATE":{"DISTRICT":{DISTRICTNAME: PUTDISTRICT}}}},{new:true},(err,data)=>{
//         if(err){
//             res.send(err)

//         }else{
//             if(data==null){
//                 res.send({
//                     status:false,
//                     message:"Nothing found"

//                 })

//             }else{
//                 res.send({
//                     status:true,
//                     message: "Data updated successfully"
//                 })
//             }
//         }data.save();
//     })
//   })


//   app.post('/COUNTRY/:STATENAME',(req,res) => {
//     let PUTCOUNTRY = req.params.COUNTRY
//     let PUTSTATE = req.body.STATENAME
//     let PUTDISTRICT = req.body.DISTRICTNAME
//     model.findOneAndUpdate({COUNTRY:PUTCOUNTRY,STATENAME:PUTSTATE},{$push:{"DISTRICT":{ DISTRICTNAME: PUTDISTRICT } }},{new: true},(err,data) => {
//         if(err){
//           res.send(err)
//         }else{
//           if(data==null){
//             res.send({
//                 status: false,
//                 message: "Nothing found"
//               })
//         }else{
//             res.send({
//                 status: true,
//                 message: "Data Updated successfully"
//             })
//         }
//         }
//     })
//   })
app.get("/COUNTRY/:COUNTRY", (req, res, next) => {
    const id = req.params.COUNTRY;
    model.find({ COUNTRY: id })
        .populate("COUNTRY")
        .exec()
        .then((docs) => {
            res.status(200).json(docs);
        })
        .catch((err) => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
});
app.post("/COUNTRY/:COUNTRY/:STATENAME", (req, res) => {
    let PUTCOUNTRY = req.params.COUNTRY;
    let PUTSTATE = req.params.STATENAME;
    console.log(PUTCOUNTRY);
    console.log(PUTSTATE);
    
    let PUTDISTRICT = req.body.DISTRICTNAME;
    model.findOneAndUpdate(
        { $and: [{ 'COUNTRY': PUTCOUNTRY }, { 'STATENAME': { '$elemMatch': { 'STATENAME': PUTSTATE } } }] },
        { $push: { "STATE.$[outer].DISTRICTNAME": { DISTRICTNAME: PUTDISTRICT } } },

        { "arrayFilters": [{ "outer.STATENAME": PUTSTATE }] })
        .then((result) => {

            console.log({ result });

            res.status(201).json({

                message: "District successfully Added",

                result,

            });

        })

        // .catch((err) => {

        //     console.log(err);

        //     res.status(500).json({

        //         error: err,

        //     });

        // });

}
)



