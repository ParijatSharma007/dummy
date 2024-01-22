const Clinic = require("../model/clinic");
const { Router } = require("express");

const router = Router();

router.get("/", async (req, res) => {
  try {
    const clinics = await Clinic.find();
    return res.status(200).json({
      success: true,
      data: clinics,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

router.get("/", async (req, res, next) => {
  const { longitude, latitude } = req.body;
  console.log(req.body);
  try {
    const clinic = await Clinic.aggregate([
      {
        $geoNear: {
          near: {
            type: "Point",
            coordinates: [parseFloat(longitude), parseFloat(latitude)],
          },
          key: "location",
          // maxDistance : parseFloat(range.max)*1609,
          // minDistance : parseFloat(range.min)*1609,
          distanceField: "dist.calculated",
          speherical: true,
        },
      },
    ]);

    // const clinic = await Clinic.find().then((doc) => {
    //     return res.status(200).json({doc})
    // })

    res.status(200).send({
      success: true,
      data: clinic,
    });
  } catch (error) {
    res.status(400).send({
      success: false,
      message: error.message,
    });
  }
});

router.get('/:id', (req, res) => {
  const {id} = req.params
  Clinic.findById(id).then((doc) => {
    return res.status(200).json({
      success : true,
      status : 200,
      data : doc
    })
  }).catch((error) => {
    return res.status(404).json({
      success : false,
      status : 404,
      message : error.message
    })
  })
})

router.post("/add-location", async (req, res, next) => {
  const { location } = req.body;
  try {
    const clinic = new Clinic({
      location: {
        type: location.type,
        coordinates: location.coordinates,
      },
    });

    clinic.save().then(() => {
      res.status(200).json({
        success: true,
      });
    });
  } catch (err) {
    return res.status(500).json({
      error: err.message,
    });
  }
});

router.put("/add-image/:id", async (req, res) => {
  const { id } = req.params;
  const { image } = req.body;

  Clinic.findByIdAndUpdate(id, { image })
    .then((doc) => {
      return res.status(200).json({
        success: true,
      });
    })
    .catch((err) => {
      return res.status(500).json({
        success: false,
      });
    });
});

module.exports = router;
