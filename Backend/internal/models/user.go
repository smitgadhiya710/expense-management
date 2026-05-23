package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type User struct {
	ID        primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	UserName  string             `bson:"userName" json:"userName"`
	Password  string             `bson:"password" json:"-"`
	Phone     string             `bson:"phone" json:"phone"`
	Email     string             `bson:"email" json:"email"`
	Role      string             `bson:"role" json:"role"`
	CreatedAt time.Time          `bson:"createdAt" json:"createdAt"`
	UpdatedAt time.Time          `bson:"updatedAt" json:"updatedAt"`
}

type PublicUser struct {
	ID        primitive.ObjectID `json:"id"`
	UserName  string             `json:"userName"`
	Phone     string             `json:"phone"`
	Email     string             `json:"email"`
	Role      string             `json:"role"`
	CreatedAt time.Time          `json:"createdAt"`
	UpdatedAt time.Time          `json:"updatedAt"`
}

func (u User) Public() PublicUser {
	return PublicUser{
		ID:        u.ID,
		UserName:  u.UserName,
		Phone:     u.Phone,
		Email:     u.Email,
		Role:      u.Role,
		CreatedAt: u.CreatedAt,
		UpdatedAt: u.UpdatedAt,
	}
}
