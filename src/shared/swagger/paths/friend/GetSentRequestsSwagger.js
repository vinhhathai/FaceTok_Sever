"use strict";
//----------------------------------------------------------------

module.exports = {
  "/api/friend/sent": {
    get: {
      tags: ["Friend"],
      summary: "Lấy danh sách lời mời kết bạn đã gửi",
      description: "Lấy danh sách lời mời kết bạn đã gửi",
      security: [
        {
          bearerAuth: []
        }
      ],
      responses: {
        200: {
          description: "Lấy danh sách lời mời kết bạn đã gửi thành công",
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
                      },
                      sent: {
                        type: "array",
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
                        example: "User ID không được để trống"
                      }
                    }
                  },
                  path: {
                    type: "string",
                    example: "/api/friend/sent"
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
                    example: "/api/friend/sent"
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