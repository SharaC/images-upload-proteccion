var express = require('express');
var router = express.Router();
var fs = require('fs')
var path = require('path')
var util = require('util')
var sizeOf = require('image-size');
const { ESTALE } = require('constants');

var multer = require('multer')({
  dest: 'public/uploads'
})

router.get('/', function(req, res, next) {
  res.render('uploadForm.pug');
});


router.get('/success', function (req, res, next) {
  var {fileName, height, width, orientation} = req.query
  res.render('uploadOK.pug', {fileName: fileName, height: height, width: width, orientation: orientation})
})

router.post('/',  [multer.single('attachment')], function(req, res, next) {
  return storeWithOriginalName(req.file)
  .then(encodeURIComponent)
  .then(encoded => {
    console.log("alto: "+ optimizedImage.height + " ancho: "+ optimizedImage.width + " orientacion: " + optimizedImage.orientation)
    res.redirect(`/upload/success?fileName=${encoded}&height=${optimizedImage.height}&width=${optimizedImage.width}&orientation=${optimizedImage.orientation}`)
  })
  .catch(next)
});

function storeWithOriginalName (file){
  var fullNewPath = path.join(file.destination, file.originalname)
  var rename = util.promisify(fs.rename)
 

  return rename(file.path, fullNewPath)
  .then(()=> {
     
    var dimensions = sizeOf(fullNewPath);
    var image = {
      height: dimensions.height,
      width : dimensions.width
    }
    console.log(image.width, image.height);

      console.log(image)
    
      optimizeImage(image.height, image.width)
    return (file.originalname)

  })

}

var optimizedImage = {
  height: 0,
  width: 0,
  orientation: "vertical"
};

var optimizeImage =  function(height, width){
  
  if (height > width) {
    optimizedImage.orientation = "vertical";
    var ratio = height/width;
    if (height > 1123) {
      optimizedImage.height = 1123;
      optimizedImage.width = Math.round(optimizedImage.height/ratio);
    } else if (width > 796){
      optimizedImage.width = 796;
      optimizedImage.height = Math.round(optimizedImage.width*ratio);
    } else {
      optimizedImage.width = width;
      optimizedImage.height = height;
    }

  } else if (width > height) {
    optimizedImage.orientation = "horizontal";
    var ratio = width/height;
    if (width > 1123) {
      optimizedImage.width = 1123;
      optimizedImage.height = Math.round(optimizedImage.width/ratio);
    } else if (height > 796){
      optimizedImage.height = 796;
      optimizedImage.width = Math.round(optimizedImage.height*ratio);
    } else {
      optimizedImage.width = width;
      optimizedImage.height = height;
    }
  } else {
    optimizedImage.orientation = "vertical";
    ratio = 1;
    if (height > 796) {
      optimizedImage.height = 796;
      optimizedImage.width = 796;
    } else {
      optimizedImage.height = height;
      optimizedImage.width = width;
    }
  }
  return optimizedImage;
}

module.exports = router;
