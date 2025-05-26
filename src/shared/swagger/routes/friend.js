const GetFriendsListSwagger = require('../paths/friend/GetFriendsListSwagger');
const SendFriendRequestSwagger = require('../paths/friend/SendFriendRequestSwagger');
const GetFriendRequestsSwagger = require('../paths/friend/GetFriendRequestsSwagger');
const GetSentRequestsSwagger = require('../paths/friend/GetSentRequestsSwagger');

module.exports = {
  ...GetFriendsListSwagger,
  ...SendFriendRequestSwagger,
  ...GetFriendRequestsSwagger,
  ...GetSentRequestsSwagger
}; 