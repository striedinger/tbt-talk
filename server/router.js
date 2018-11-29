const Assets = require("models/asset");
const Comments = require("models/comment");

const maxAge = (10 * 60); //Cache duration, in seconds

module.exports = async function (router) {
  router.get("/api/tbt/comments/count/url", async function (req, res) {
    let urls = req.query.urls ? req.query.urls.split(",") : []; //Grab all urls in the query param
    let results = [];
    let promises = [];
    // Send back the headers
    res.setHeader("Cache-Control", `public, max-age=${maxAge}`);
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Access-Control-Allow-Origin", "*");//Change to include only valid domain on production (VERY important)

    let assets = await Assets.find({
      "url": {
        $in: urls
      }
    }); //find all stories in the urls array
    for (asset of assets) {
      promises.push(Comments.find({
        "asset_id": asset.id,
        "status": {
          $ne: "REJECTED"
        }
      }).count());
    }
    Promise.all(promises).then(function (counts) {
      for (let i = 0; i < counts.length; i++) {
        results.push({
          id: assets[i].id,
          url: assets[i].url,
          count: counts[i],
          closed: (assets[i].closedAt == null) ? false : true
        });
      }
      return res.json(results); //send back in json format
    }).catch(function () {
      return res.status(500).send('Failed to resolve all queries');
    });
  });

  router.get("/api/tbt/comments/count/id", async function (req, res) {
    let ids = req.query.ids ? req.query.ids.split(",") : []; //Grab all ids in the query param
    let results = [];
    let promises = [];
    // Send back the headers
    res.setHeader("Cache-Control", `public, max-age=${maxAge}`);
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Access-Control-Allow-Origin", "*");//Change to include only valid domain on production (VERY important)

    for (id of ids) {
      promises.push(Comments.find({ "asset_id": id,
        "status": {
          $ne: "REJECTED"
        }
      }).count());
    }
    Promise.all(promises).then(function (counts) {
      for (let i = 0; i < counts.length; i++) {
        results.push({
          id: ids[i],
          count: counts[i],
        });
      }

      return res.json(results); //send back in json format
    }).catch(function () {
      return res.status(500).send('Failed to resolve all queries');
    });
  });
}