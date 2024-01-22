const PetModel = require('../model/petGallery')
const {Router} = require('express')

const router = Router()

router.post('/add-image', (req, res) => {
    const {image, breed} = req.body
    PetModel.findOneAndUpdate({breed}, {image}).then((doc) => {
        console.log(doc);
        return res.status(200).json({})
    }).catch(() => {
        return res.status(500).json({});
    })
})

router.get("/:id", (req, res) => {
  const { id } = req.params;
  PetModel.findById({_id : id})
    .then((doc) => {
      return res.status(200).json({
        success: true,
        status: 200,
        data: doc,
      });
    })
    .catch((error) => {
      return res.status(404).json({
        success: false,
        status: 500,
        error: error.message,
      });
    });
});

router.get('/', (req, res) => {
    PetModel.find().then((doc) => {
        return res.status(200).json({
            success : true,
            status : 200,
            data : doc
        })
    }).catch((error) => {
        return res.status(500).json({
            success : false,
            status : 500,
            error : error.message
        })
    }) 
})



module.exports = router