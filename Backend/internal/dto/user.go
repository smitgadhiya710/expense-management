package dto

type UpdateUserRequest struct {
	UserName string `json:"userName" binding:"omitempty,min=3,max=50"`
	Phone    string `json:"phone" binding:"omitempty,min=7,max=20"`
	Email    string `json:"email" binding:"omitempty,email,max=254"`
	Role     string `json:"role" binding:"omitempty,oneof=user admin"`
}
