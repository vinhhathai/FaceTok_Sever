"use strict";
//----------------------------------------------------------------

module.exports = {
  "/api/friend/accept/{requestId}": {
    put: {
      tags: ["Friend"],
      summary: "Chấp nhận lời mời kết bạn",
      description: "API này cho phép người dùng đang đăng nhập chấp nhận một lời mời kết bạn",
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
          description: "ID của lời mời kết bạn cần chấp nhận",
          schema: {
            type: "string"
          }
        }
      ],
      responses: {
        200: {
          description: "Chấp nhận lời mời kết bạn thành công",
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
                            enum: ["pending", "accepted", "rejected"],
                            example: "accepted"
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
                      },
                      friend: {
                        type: "object",
                        properties: {
                          id: {
                            type: "string",
                            description: "ID của bạn bè mới"
                          },
                          fullName: {
                            type: "string",
                            description: "Tên đầy đủ của bạn bè mới"
                          },
                          profilePicture: {
                            type: "string",
                            description: "URL ảnh đại diện của bạn bè mới"
                          }
                        }
                      }
                    }
                  },
                  message: {
                    type: "string",
                    example: "Chấp nhận lời mời kết bạn thành công"
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
                    example: "/api/friend/accept/invalidId"
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
                    example: "/api/friend/accept/requestId"
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
                    example: "/api/friend/accept/requestId"
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
                        example: "ACCEPT_FRIEND_REQUEST_FAILED"
                      },
                      message: {
                        type: "string",
                        example: "Lỗi khi chấp nhận lời mời kết bạn"
                      }
                    }
                  },
                  path: {
                    type: "string",
                    example: "/api/friend/accept/requestId"
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