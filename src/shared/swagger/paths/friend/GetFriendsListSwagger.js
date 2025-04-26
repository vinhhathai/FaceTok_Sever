module.exports = {
  '/friend/list': {
    get: {
      tags: ['Friend'],
      summary: 'Lấy danh sách bạn bè của người dùng đang đăng nhập',
      description: 'API này dùng để lấy danh sách bạn bè của người dùng đang đăng nhập với phân trang',
      security: [
        {
          BearerAuth: []
        }
      ],
      parameters: [
        {
          name: 'page',
          in: 'query',
          description: 'Số trang (bắt đầu từ 1)',
          required: false,
          schema: {
            type: 'integer',
            default: 1,
            minimum: 1
          }
        },
        {
          name: 'limit',
          in: 'query',
          description: 'Số lượng bạn bè trên mỗi trang',
          required: false,
          schema: {
            type: 'integer',
            default: 20,
            minimum: 1,
            maximum: 50
          }
        }
      ],
      responses: {
        '200': {
          description: 'Lấy danh sách bạn bè thành công',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: {
                    type: 'boolean',
                    example: true
                  },
                  message: {
                    type: 'string',
                    example: 'Lấy danh sách bạn bè thành công'
                  },
                  data: {
                    type: 'object',
                    properties: {
                      friends: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            id: {
                              type: 'string',
                              example: '6577cc8b1ccffc88a9d1aab8'
                            },
                            fullName: {
                              type: 'string',
                              example: 'Nguyễn Văn A'
                            },
                            profilePicture: {
                              type: 'string',
                              example: 'https://example.com/profile.jpg'
                            },
                            email: {
                              type: 'string',
                              example: 'example@gmail.com'
                            },
                            bio: {
                              type: 'string',
                              example: 'This is my bio'
                            }
                          }
                        }
                      },
                      pagination: {
                        type: 'object',
                        properties: {
                          currentPage: {
                            type: 'integer',
                            example: 1
                          },
                          totalPages: {
                            type: 'integer',
                            example: 5
                          },
                          totalResults: {
                            type: 'integer',
                            example: 100
                          },
                          resultsPerPage: {
                            type: 'integer',
                            example: 20
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        '400': {
          description: 'Lỗi validation',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: {
                    type: 'boolean',
                    example: false
                  },
                  error: {
                    type: 'object',
                    properties: {
                      code: {
                        type: 'string',
                        example: 'VALIDATION_FAILED'
                      },
                      message: {
                        type: 'string',
                        example: 'Tham số không hợp lệ'
                      }
                    }
                  },
                  path: {
                    type: 'string',
                    example: '/friend/list'
                  },
                  timestamp: {
                    type: 'string',
                    example: '2023-12-11T15:24:33.458Z'
                  }
                }
              }
            }
          }
        },
        '401': {
          description: 'Không có quyền truy cập',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: {
                    type: 'boolean',
                    example: false
                  },
                  error: {
                    type: 'object',
                    properties: {
                      code: {
                        type: 'string',
                        example: 'UNAUTHORIZED'
                      },
                      message: {
                        type: 'string',
                        example: 'Không có quyền truy cập'
                      }
                    }
                  }
                }
              }
            }
          }
        },
        '500': {
          description: 'Lỗi server',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: {
                    type: 'boolean',
                    example: false
                  },
                  error: {
                    type: 'object',
                    properties: {
                      code: {
                        type: 'string',
                        example: 'GET_FRIENDS_LIST_FAILED'
                      },
                      message: {
                        type: 'string',
                        example: 'Lỗi khi lấy danh sách bạn bè'
                      }
                    }
                  },
                  path: {
                    type: 'string',
                    example: '/friend/list'
                  },
                  timestamp: {
                    type: 'string',
                    example: '2023-12-11T15:24:33.458Z'
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