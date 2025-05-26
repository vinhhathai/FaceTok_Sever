"use strict";
//----------------------------------------------------------------

module.exports = {
  "/api/friend/remove/{friendId}": {
    delete: {
      tags: ["Friend"],
      summary: "Xóa bạn bè",
      description: "API này cho phép người dùng đang đăng nhập xóa một người bạn khỏi danh sách bạn bè",
      security: [
        {
          bearerAuth: []
        }
      ],
      parameters: [
        {
          name: "friendId",
          in: "path",
          required: true,
          description: "ID của người bạn cần xóa",
          schema: {
            type: "string"
          }
        }
      ],
      responses: {
        200: {
          description: "Xóa bạn bè thành công",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: {
                    type: "boolean",
                    example: true
                  },
                  data: {
                    type: "object",
                    properties: {
                      message: {
                        type: "string",
                        example: "Đã xóa khỏi danh sách bạn bè"
                      }
                    }
                  },
                  message: {
                    type: "string",
                    example: "Xóa bạn bè thành công"
                  }
                }
              }
            }
          }
        },
        400: {
          description: "Lỗi xác thực dữ liệu",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: {
                    type: "boolean",
                    example: false
                  },
                  error: {
                    type: "object",
                    properties: {
                      code: {
                        type: "string",
                        example: "VALIDATION_FAILED"
                      },
                      message: {
                        type: "string",
                        example: "ID bạn bè không hợp lệ"
                      }
                    }
                  },
                  path: {
                    type: "string",
                    example: "/api/friend/remove/invalidId"
                  },
                  timestamp: {
                    type: "string",
                    format: "date-time"
                  }
                }
              }
            }
          }
        },
        401: {
          description: "Không có quyền truy cập",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: {
                    type: "boolean",
                    example: false
                  },
                  error: {
                    type: "object",
                    properties: {
                      code: {
                        type: "string",
                        example: "UNAUTHORIZED"
                      },
                      message: {
                        type: "string",
                        example: "Bạn cần đăng nhập để truy cập tài nguyên này"
                      }
                    }
                  },
                  path: {
                    type: "string",
                    example: "/api/friend/remove/friendId"
                  },
                  timestamp: {
                    type: "string",
                    format: "date-time"
                  }
                }
              }
            }
          }
        },
        404: {
          description: "Không tìm thấy bạn bè",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: {
                    type: "boolean",
                    example: false
                  },
                  error: {
                    type: "object",
                    properties: {
                      code: {
                        type: "string",
                        example: "VALIDATION_FAILED"
                      },
                      message: {
                        type: "string",
                        example: "Người dùng này không phải là bạn bè của bạn"
                      }
                    }
                  },
                  path: {
                    type: "string",
                    example: "/api/friend/remove/friendId"
                  },
                  timestamp: {
                    type: "string",
                    format: "date-time"
                  }
                }
              }
            }
          }
        },
        500: {
          description: "Lỗi server",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: {
                    type: "boolean",
                    example: false
                  },
                  error: {
                    type: "object",
                    properties: {
                      code: {
                        type: "string",
                        example: "REMOVE_FRIEND_FAILED"
                      },
                      message: {
                        type: "string",
                        example: "Lỗi khi xóa bạn bè"
                      }
                    }
                  },
                  path: {
                    type: "string",
                    example: "/api/friend/remove/friendId"
                  },
                  timestamp: {
                    type: "string",
                    format: "date-time"
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}; 