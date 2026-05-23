package handlers

import (
	"context"
	"errors"
	"net/http"
	"strings"
	"time"

	"expense-management/backend/internal/database"
	"expense-management/backend/internal/dto"
	"expense-management/backend/internal/models"
	"expense-management/backend/internal/utils"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type UserHandler struct {
	users *mongo.Collection
}

func NewUserHandler(db *mongo.Database) *UserHandler {
	return &UserHandler{
		users: db.Collection(database.UsersCollection),
	}
}

func (h *UserHandler) GetAll(c *gin.Context) {
	ctx, cancel := context.WithTimeout(c.Request.Context(), 10*time.Second)
	defer cancel()

	cursor, err := h.users.Find(ctx, bson.M{}, options.Find().SetSort(bson.D{{Key: "createdAt", Value: -1}}))
	if err != nil {
		utils.Error(c, http.StatusInternalServerError, "failed to fetch users")
		return
	}
	defer cursor.Close(ctx)

	users := make([]models.PublicUser, 0)
	for cursor.Next(ctx) {
		var user models.User
		if err := cursor.Decode(&user); err != nil {
			utils.Error(c, http.StatusInternalServerError, "failed to decode user")
			return
		}
		users = append(users, user.Public())
	}

	if err := cursor.Err(); err != nil {
		utils.Error(c, http.StatusInternalServerError, "failed to read users")
		return
	}

	utils.Success(c, http.StatusOK, gin.H{"users": users})
}

func (h *UserHandler) GetByID(c *gin.Context) {
	userID, ok := parseUserID(c)
	if !ok {
		return
	}

	ctx, cancel := context.WithTimeout(c.Request.Context(), 5*time.Second)
	defer cancel()

	var user models.User
	err := h.users.FindOne(ctx, bson.M{"_id": userID}).Decode(&user)
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

func (h *UserHandler) Update(c *gin.Context) {
	userID, ok := parseUserID(c)
	if !ok {
		return
	}

	var req dto.UpdateUserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.Error(c, http.StatusBadRequest, "invalid request body")
		return
	}

	update := bson.M{}
	if strings.TrimSpace(req.UserName) != "" {
		update["userName"] = strings.TrimSpace(req.UserName)
	}
	if strings.TrimSpace(req.Phone) != "" {
		update["phone"] = strings.TrimSpace(req.Phone)
	}
	if strings.TrimSpace(req.Email) != "" {
		update["email"] = strings.ToLower(strings.TrimSpace(req.Email))
	}
	if strings.TrimSpace(req.Role) != "" {
		update["role"] = strings.ToLower(strings.TrimSpace(req.Role))
	}

	if len(update) == 0 {
		utils.Error(c, http.StatusBadRequest, "no valid fields to update")
		return
	}
	update["updatedAt"] = time.Now().UTC()

	ctx, cancel := context.WithTimeout(c.Request.Context(), 5*time.Second)
	defer cancel()

	opts := options.FindOneAndUpdate().SetReturnDocument(options.After)
	var user models.User
	err := h.users.FindOneAndUpdate(ctx, bson.M{"_id": userID}, bson.M{"$set": update}, opts).Decode(&user)
	if errors.Is(err, mongo.ErrNoDocuments) {
		utils.Error(c, http.StatusNotFound, "user not found")
		return
	}
	if mongo.IsDuplicateKeyError(err) {
		utils.Error(c, http.StatusConflict, "user with email, phone, or userName already exists")
		return
	}
	if err != nil {
		utils.Error(c, http.StatusInternalServerError, "failed to update user")
		return
	}

	utils.Success(c, http.StatusOK, gin.H{"user": user.Public()})
}

func (h *UserHandler) Delete(c *gin.Context) {
	userID, ok := parseUserID(c)
	if !ok {
		return
	}

	ctx, cancel := context.WithTimeout(c.Request.Context(), 5*time.Second)
	defer cancel()

	result, err := h.users.DeleteOne(ctx, bson.M{"_id": userID})
	if err != nil {
		utils.Error(c, http.StatusInternalServerError, "failed to delete user")
		return
	}
	if result.DeletedCount == 0 {
		utils.Error(c, http.StatusNotFound, "user not found")
		return
	}

	c.Status(http.StatusNoContent)
}

func parseUserID(c *gin.Context) (primitive.ObjectID, bool) {
	id := strings.TrimSpace(c.Param("id"))
	userID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		utils.Error(c, http.StatusBadRequest, "invalid user id")
		return primitive.NilObjectID, false
	}

	return userID, true
}
