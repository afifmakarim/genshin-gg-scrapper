var express = require("express");
const {
  getTierList,
  getAllCharacter,
  getCharacterByName,
} = require("../controllers/apiControllers");
var router = express.Router();

/* GET users listing. */
router.get("/tier-list", getTierList);
router.get("/characters", getAllCharacter);
router.get("/character/:name", getCharacterByName);

module.exports = router;
