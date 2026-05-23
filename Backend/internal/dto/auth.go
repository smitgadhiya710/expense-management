package dto

import "go.mongodb.org/mongo-driver/bson/primitive"

type RegisterRequest struct {
	UserName string `json:"userName" binding:"required,min=3,max=50"`
	Password string `json:"password" binding:"required,min=8,max=72"`
	Phone    string `json:"phone" binding:"required,min=7,max=20"`
	Email    string `json:"email" binding:"required,email,max=254"`
	Role     string `json:"role" binding:"omitempty,oneof=user admin"`
}

type LoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

type AuthResponse struct {
	Token    string             `json:"token"`
	ID       primitive.ObjectID `json:"id"`
	UserName string             `json:"userName"`
	Email    string             `json:"email"`
	Role     string             `json:"role"`
}
