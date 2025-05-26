const UpdateAvatarSwagger = require('./paths/user/UpdateAvatarSwagger');
const UpdateThumbnailSwagger = require('./paths/user/UpdateThumbnailSwagger');
const SearchUserSwagger = require('./paths/user/SearchUserSwagger');

// Friend API documentation
const GetFriendsListSwagger = require('./paths/friend/GetFriendsListSwagger');
const SendFriendRequestSwagger = require('./paths/friend/SendFriendRequestSwagger');
const GetFriendRequestsSwagger = require('./paths/friend/GetFriendRequestsSwagger');
const AcceptFriendRequestSwagger = require('./paths/friend/AcceptFriendRequestSwagger');
const RejectFriendRequestSwagger = require('./paths/friend/RejectFriendRequestSwagger');
const CancelFriendRequestSwagger = require('./paths/friend/CancelFriendRequestSwagger');
const RemoveFriendSwagger = require('./paths/friend/RemoveFriendSwagger');

module.exports = {
    ...UpdateAvatarSwagger,
    ...UpdateThumbnailSwagger,
    ...SearchUserSwagger,
    
    // Friend API routes
    ...GetFriendsListSwagger,
    ...SendFriendRequestSwagger,
    ...GetFriendRequestsSwagger,
    ...AcceptFriendRequestSwagger,
    ...RejectFriendRequestSwagger,
    ...CancelFriendRequestSwagger,
    ...RemoveFriendSwagger
}; 