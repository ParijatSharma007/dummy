const {Router} = require('express')
const FeedBack = require('./feedback')

const router = Router()

router.post('/', async(req, res) => {
    const {name, image, feedback} = req.body
    const userFeedback = new FeedBack({
        name,
        image,
        feedback
        })
    userFeedback
      .save()
      .then(() => {
        return res.status(200).json({
          message: "Feedback Submitted",
          success: true,
          status: 200,
        });
      })
      .catch((err) => {
        return res.status(200).json({
          success: false,
        });
      });
})

router.get('/', async(req, res) => {
    try{
        const feedback = await FeedBack.find()
        return res.status(200).json({
            status : 200,
            success : true,
            feedback
        })
    }catch(err){
        return res.status(500).json({
            success : false,
            message : err.message
        })
    }
})

module.exports = router