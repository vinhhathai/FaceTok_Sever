"use strict";
//----------------------------------------------------------------

module.exports = {
  "/api/friend/requests": {
    get: {
      tags: ["Friend"],
      summary: "Lấy danh sách lời mời kết bạn",
      description: "Lấy danh sách lời mời kết bạn đã nhận và đã gửi của người dùng đang đăng nhập",
      security: [
        {
          bearerAuth: []
        }
      ],
      responses: {
        200: {
          description: "Lấy danh sách lời mời kết bạn thành công",
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
                      received: {
                        type: "array",
                        description: "Danh sách lời mời kết bạn đã nhận",
                        items: {
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
                                },
                                email: {
                                  type: "string",
                                  description: "Email của người gửi"
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
                            }
                          }
                        }
                      },
                      sent: {
                        type: "array",
                        description: "Danh sách lời mời kết bạn đã gửi",
                        items: {
                          type: "object",
                          properties: {
                            id: {
                              type: "string",
                              description: "ID của lời mời kết bạn"
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
                                },
                                email: {
                                  type: "string",
                                  description: "Email của người nhận"
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
                            }
                          }
                        }
                      },
                      totalReceived: {
                        type: "integer",
                        description: "Tổng số lời mời kết bạn đã nhận",
                        example: 5
                      },
                      totalSent: {
                        type: "integer",
                        description: "Tổng số lời mời kết bạn đã gửi",
                        example: 3
                      }
                    }
                  },
                  message: {
                    type: "string",
                    example: "Lấy danh sách lời mời kết bạn thành công"
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
                    example: "/api/friend/requests"
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
                        example: "GET_FRIEND_REQUESTS_FAILED"
                      },
                      message: {
                        type: "string",
                        example: "Lỗi khi lấy danh sách lời mời kết bạn"
                      }
                    }
                  },
                  path: {
                    type: "string",
                    example: "/api/friend/requests"
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