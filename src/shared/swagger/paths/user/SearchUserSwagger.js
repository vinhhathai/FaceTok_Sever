"use strict";
//----------------------------------------------------------------

module.exports = {
    "/user/search": {
        post: {
            tags: ["User"],
            summary: "Tìm kiếm người dùng",
            description: "Tìm kiếm người dùng theo từ khóa (tên, email)",
            security: [
                {
                    BearerAuth: []
                }
            ],
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: {
                            type: "object",
                            required: ["query"],
                            properties: {
                                query: {
                                    type: "string",
                                    description: "Từ khóa tìm kiếm",
                                    example: "John"
                                },
                                page: {
                                    type: "integer",
                                    description: "Số trang (bắt đầu từ 1)",
                                    default: 1,
                                    example: 1
                                },
                                limit: {
                                    type: "integer",
                                    description: "Số lượng kết quả trên mỗi trang",
                                    default: 20,
                                    example: 20
                                }
                            }
                        }
                    }
                }
            },
            responses: {
                "200": {
                    description: "Tìm kiếm người dùng thành công",
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
                                            users: {
                                                type: "array",
                                                items: {
                                                    type: "object",
                                                    properties: {
                                                        id: {
                                                            type: "string",
                                                            example: "60d0fe4f5311236168a109ca"
                                                        },
                                                        fullName: {
                                                            type: "string",
                                                            example: "John Doe"
                                                        },
                                                        profilePicture: {
                                                            type: "string",
                                                            example: "https://example.com/avatar.jpg"
                                                        },
                                                        thumbnailPicture: {
                                                            type: "string",
                                                            example: "https://example.com/thumbnail.jpg"
                                                        },
                                                        bio: {
                                                            type: "string",
                                                            example: "I am a software developer"
                                                        }
                                                    }
                                                }
                                            },
                                            pagination: {
                                                type: "object",
                                                properties: {
                                                    currentPage: {
                                                        type: "integer",
                                                        example: 1
                                                    },
                                                    totalPages: {
                                                        type: "integer",
                                                        example: 5
                                                    },
                                                    totalResults: {
                                                        type: "integer",
                                                        example: 100
                                                    },
                                                    resultsPerPage: {
                                                        type: "integer",
                                                        example: 20
                                                    }
                                                }
                                            }
                                        }
                                    },
                                    message: {
                                        type: "string",
                                        example: "Tìm kiếm người dùng thành công"
                                    }
                                }
                            }
                        }
                    }
                },
                "400": {
                    description: "Lỗi validation",
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
                                                example: "VAL_VALIDATION_FAILED"
                                            },
                                            message: {
                                                type: "string",
                                                example: "Từ khóa tìm kiếm không được để trống"
                                            }
                                        }
                                    },
                                    path: {
                                        type: "string",
                                        example: "/user/search"
                                    },
                                    timestamp: {
                                        type: "string",
                                        example: "2023-08-20T10:30:40.123Z"
                                    }
                                }
                            }
                        }
                    }
                },
                "401": {
                    description: "Không xác thực",
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
                                                example: "AUTH_UNAUTHORIZED"
                                            },
                                            message: {
                                                type: "string",
                                                example: "Bạn cần đăng nhập để truy cập tài nguyên này"
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                "500": {
                    description: "Lỗi máy chủ",
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
                                                example: "USER_SEARCH_USERS_FAILED"
                                            },
                                            message: {
                                                type: "string",
                                                example: "Lỗi khi tìm kiếm người dùng"
                                            },
                                            detail: {
                                                type: "string",
                                                example: "Internal server error"
                                            }
                                        }
                                    },
                                    path: {
                                        type: "string",
                                        example: "/user/search"
                                    },
                                    timestamp: {
                                        type: "string",
                                        example: "2023-08-20T10:30:40.123Z"
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