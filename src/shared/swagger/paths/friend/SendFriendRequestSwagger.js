"use strict";
//----------------------------------------------------------------

module.exports = {
  "/api/friend/request": {
    post: {
      tags: ["Friend"],
      summary: "Gửi lời mời kết bạn",
      description: "Gửi lời mời kết bạn đến người dùng khác",
      security: [
        {
          bearerAuth: []
        }
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["recipientId"],
              properties: {
                recipientId: {
                  type: "string",
                  description: "ID của người nhận lời mời kết bạn"
                }
              }
            }
          }
        }
      },
      responses: {
        201: {
          description: "Lời mời kết bạn đã được gửi thành công",
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
                      friendRequest: {
                        type: "object",
                        properties: {
                          id: {
                            type: "string",
                            description: "ID của lời mời kết bạn"
                          },
                          sender: {
                            type: "object",
                            properties: {
                              id: {
                                type: "string",
                                description: "ID của người gửi"
                              },
                              fullName: {
                                type: "string",
                                description: "Tên đầy đủ của người gửi"
                              },
                              profilePicture: {
                                type: "string",
                                description: "URL ảnh đại diện của người gửi"
                              }
                            }
                          },
                          recipient: {
                            type: "object",
                            properties: {
                              id: {
                                type: "string",
                                description: "ID của người nhận"
                              },
                              fullName: {
                                type: "string",
                                description: "Tên đầy đủ của người nhận"
                              },
                              profilePicture: {
                                type: "string",
                                description: "URL ảnh đại diện của người nhận"
                              }
                            }
                          },
                          status: {
                            type: "string",
                            description: "Trạng thái của lời mời kết bạn",
                            enum: ["pending", "accepted", "rejected"]
                          },
                          createdAt: {
                            type: "string",
                            format: "date-time",
                            description: "Thời gian tạo lời mời kết bạn"
                          },
                          updatedAt: {
                            type: "string",
                            format: "date-time",
                            description: "Thời gian cập nhật lời mời kết bạn"
                          }
                        }
                      }
                    }
                  },
                  message: {
                    type: "string",
                    example: "Gửi lời mời kết bạn thành công"
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
                        example: "ID người nhận không được để trống"
                      }
                    }
                  },
                  path: {
                    type: "string",
                    example: "/api/friend/request"
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
          description: "Không tìm thấy người dùng",
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
                        example: "USER_NOT_FOUND"
                      },
                      message: {
                        type: "string",
                        example: "Không tìm thấy người dùng để gửi lời mời kết bạn"
                      }
                    }
                  },
                  path: {
                    type: "string",
                    example: "/api/friend/request"
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
        409: {
          description: "Lời mời kết bạn đã tồn tại",
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
                        example: "FRIEND_REQUEST_FAILED"
                      },
                      message: {
                        type: "string",
                        example: "Lời mời kết bạn đã được gửi trước đó"
                      }
                    }
                  },
                  path: {
                    type: "string",
                    example: "/api/friend/request"
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
                        example: "FRIEND_REQUEST_FAILED"
                      },
                      message: {
                        type: "string",
                        example: "Lỗi khi gửi lời mời kết bạn"
                      }
                    }
                  },
                  path: {
                    type: "string",
                    example: "/api/friend/request"
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