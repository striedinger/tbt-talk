const Assets = require("models/asset");
const Comments = require("models/comment");
const mongoose = require("../../../services/mongoose");

module.exports = async function(router) {
  router.get("/api/tbt/comments/count", async function (req, res, next) {
    let urls = req.query.urls? req.query.urls.split(",") : [];//Grab all urls in the get param
    let assets  = await Assets.find({"url": {$in: urls}});//find all stories in the urls array
    let results = [];
    for(asset of assets) {
      let count = await Comments.find({"asset_id" : asset.id}).count();//grab comment count for each story in urls array
      results.push({
        id: asset.id,
        url: asset.url,
        comments: count
      });//push results to new array that contains story id, url and comment count
    }
    res.header("Access-Control-Allow-Origin", "*");//Change to include only valid domain on production (VERY important)
    return res.status(200).json(results);//send back in json format
  });
}
