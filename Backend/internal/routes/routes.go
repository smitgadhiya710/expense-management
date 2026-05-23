package routes

import (
	"net/http"

	"expense-management/backend/internal/config"
	"expense-management/backend/internal/handlers"
	"expense-management/backend/internal/middleware"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/mongo"
)

func Register(router *gin.Engine, db *mongo.Database, cfg config.Config) {
	router.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
	})

	api := router.Group("/api/v1")
	authHandler := handlers.NewAuthHandler(db, cfg)

	auth := api.Group("/auth")
	// auth.POST("/register", authHandler.Register)
	auth.POST("/signup", authHandler.Register)
	auth.POST("/login", authHandler.Login)
	auth.GET("/me", middleware.Auth(cfg), authHandler.Me)
}
