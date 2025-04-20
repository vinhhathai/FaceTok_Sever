const UpdateAvatarSwagger = require('./paths/user/UpdateAvatarSwagger');
const UpdateThumbnailSwagger = require('./paths/user/UpdateThumbnailSwagger');
const SearchUserSwagger = require('./paths/user/SearchUserSwagger');

module.exports = {
    ...UpdateAvatarSwagger,
    ...UpdateThumbnailSwagger,
    ...SearchUserSwagger
}; 