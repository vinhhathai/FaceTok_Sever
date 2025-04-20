const ThumbUser = require('./user/ThumbUserSwagger');
const UpdateAvatarSwagger = require('./user/UpdateAvatarSwagger');
const UpdateThumbnailSwagger = require('./user/UpdateThumbnailSwagger');
const UpdateFullnameSwagger = require('./user/UpdateFullnameSwagger');
const UpdateProfileSwagger = require('./user/UpdateProfileSwagger');

module.exports = {
  [UpdateAvatarSwagger.path]: UpdateAvatarSwagger,
  [UpdateThumbnailSwagger.path]: UpdateThumbnailSwagger,
  [UpdateFullnameSwagger.path]: UpdateFullnameSwagger,
  [UpdateProfileSwagger.path]: UpdateProfileSwagger,
}; 