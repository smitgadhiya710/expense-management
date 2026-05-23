package handlers

import (
	"context"
	"errors"
	"net/http"
	"strings"
	"time"

	"expense-management/backend/internal/config"
	"expense-management/backend/internal/database"
	"expense-management/backend/internal/dto"
	"expense-management/backend/internal/models"
	"expense-management/backend/internal/utils"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

type AuthHandler struct {
	users *mongo.Collection
	cfg   config.Config
}

func NewAuthHandler(db *mongo.Database, cfg config.Config) *AuthHandler {
	return &AuthHandler{
		users: db.Collection(database.UsersCollection),
		cfg:   cfg,
	}
}

func (h *AuthHandler) Register(c *gin.Context) {
	var req dto.RegisterRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Error(c, http.StatusBadRequest, "invalid request body")
		return
	}

	req.Email = strings.ToLower(strings.TrimSpace(req.Email))
	req.UserName = strings.TrimSpace(req.UserName)
	req.Phone = strings.TrimSpace(req.Phone)
	req.Role = strings.ToLower(strings.TrimSpace(req.Role))
	if req.Role == "" {
		req.Role = "user"
	}

	ctx, cancel := context.WithTimeout(c.Request.Context(), 5*time.Second)
	defer cancel()

	existingCount, err := h.users.CountDocuments(ctx, bson.M{
		"$or": []bson.M{
			{"email": req.Email},
			{"phone": req.Phone},
			{"userName": req.UserName},
		},
	})
	if err != nil {
		utils.Error(c, http.StatusInternalServerError, "failed to check user")
		return
	}
	if existingCount > 0 {
		utils.Error(c, http.StatusConflict, "user with email, phone, or userName already exists")
		return
	}

	hash, err := utils.HashPassword(req.Password)
	if err != nil {
		utils.Error(c, http.StatusInternalServerError, "failed to secure password")
		return
	}

	now := time.Now().UTC()
	user := models.User{
		ID:        primitive.NewObjectID(),
		UserName:  req.UserName,
		Password:  hash,
		Phone:     req.Phone,
		Email:     req.Email,
		Role:      req.Role,
		CreatedAt: now,
		UpdatedAt: now,
	}

	if _, err := h.users.InsertOne(ctx, user); err != nil {
		if mongo.IsDuplicateKeyError(err) {
			utils.Error(c, http.StatusConflict, "user with email, phone, or userName already exists")
			return
		}
		utils.Error(c, http.StatusInternalServerError, "failed to create user")
		return
	}

	token, err := utils.GenerateToken(user.ID, user.Email, h.cfg.JWTSecret, h.cfg.JWTExpiresIn)
	if err != nil {
		utils.Error(c, http.StatusInternalServerError, "failed to generate token")
		return
	}

	utils.Success(c, http.StatusCreated, dto.AuthResponse{
		Token:    token,
		ID:       user.ID,
		UserName: user.UserName,
		Email:    user.Email,
		Role:     user.Role,
	})
}

func (h *AuthHandler) Login(c *gin.Context) {
	var req dto.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Error(c, http.StatusBadRequest, "invalid request body")
		return
	}

	email := strings.ToLower(strings.TrimSpace(req.Email))

	ctx, cancel := context.WithTimeout(c.Request.Context(), 5*time.Second)
	defer cancel()

	var user models.User
	err := h.users.FindOne(ctx, bson.M{"email": email}).Decode(&user)
	if errors.Is(err, mongo.ErrNoDocuments) || !utils.CheckPassword(req.Password, user.Password) {
		utils.Error(c, http.StatusUnauthorized, "invalid email or password")
		return
	}
	if err != nil {
		utils.Error(c, http.StatusInternalServerError, "failed to login")
		return
	}

	token, err := utils.GenerateToken(user.ID, user.Email, h.cfg.JWTSecret, h.cfg.JWTExpiresIn)
	if err != nil {
		utils.Error(c, http.StatusInternalServerError, "failed to generate token")
		return
	}

	utils.Success(c, http.StatusOK, dto.AuthResponse{
		Token:    token,
		ID:       user.ID,
		UserName: user.UserName,
		Email:    user.Email,
		Role:     user.Role,
	})
}

func (h *AuthHandler) Me(c *gin.Context) {
	userIDValue, exists := c.Get("userID")
	if !exists {
		utils.Error(c, http.StatusUnauthorized, "unauthorized")
		return
	}

	userID, err := primitive.ObjectIDFromHex(userIDValue.(string))
	if err != nil {
		utils.Error(c, http.StatusUnauthorized, "invalid token subject")
		return
	}

	ctx, cancel := context.WithTimeout(c.Request.Context(), 5*time.Second)
	defer cancel()

	var user models.User
	err = h.users.FindOne(ctx, bson.M{"_id": userID}).Decode(&user)
	if errors.Is(err, mongo.ErrNoDocuments) {
		utils.Error(c, http.StatusNotFound, "user not found")
		return
	}
	if err != nil {
		utils.Error(c, http.StatusInternalServerError, "failed to fetch user")
		return
	}

	utils.Success(c, http.StatusOK, gin.H{"user": user.Public()})
}
