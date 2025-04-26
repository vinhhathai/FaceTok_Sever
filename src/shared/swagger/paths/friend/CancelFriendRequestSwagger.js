"use strict";
//----------------------------------------------------------------

module.exports = {
  "/api/friend/cancel/{requestId}": {
    delete: {
      tags: ["Friend"],
      summary: "Hủy lời mời kết bạn đã gửi",
      description: "API này cho phép người dùng đang đăng nhập hủy một lời mời kết bạn mà họ đã gửi",
      security: [
        {
          bearerAuth: []
        }
      ],
      parameters: [
        {
          name: "requestId",
          in: "path",
          required: true,
          description: "ID của lời mời kết bạn cần hủy",
          schema: {
            type: "string"
          }
        }
      ],
      responses: {
        200: {
          description: "Hủy lời mời kết bạn thành công",
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
                        example: "Lời mời kết bạn đã được hủy"
                      }
                    }
                  },
                  message: {
                    type: "string",
                    example: "Hủy lời mời kết bạn thành công"
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
                        example: "ID lời mời kết bạn không hợp lệ"
                      }
                    }
                  },
                  path: {
                    type: "string",
                    example: "/api/friend/cancel/invalidId"
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
                    example: "/api/friend/cancel/requestId"
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
          description: "Không tìm thấy lời mời kết bạn",
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
                        example: "DATA_NOT_FOUND"
                      },
                      message: {
                        type: "string",
                        example: "Không tìm thấy lời mời kết bạn"
                      }
                    }
                  },
                  path: {
                    type: "string",
                    example: "/api/friend/cancel/requestId"
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
                        example: "SEND_FRIEND_REQUEST_FAILED"
                      },
                      message: {
                        type: "string",
                        example: "Lỗi khi hủy lời mời kết bạn"
                      }
                    }
                  },
                  path: {
                    type: "string",
                    example: "/api/friend/cancel/requestId"
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