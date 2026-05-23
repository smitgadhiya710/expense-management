package routes

import (
	"net/http"

	"expense-management/backend/internal/config"
	"expense-management/backend/internal/handlers"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/mongo"
)

type routeContext struct {
	db          *mongo.Database
	cfg         config.Config
	authHandler *handlers.AuthHandler
	userHandler *handlers.UserHandler
}

func Register(router *gin.Engine, db *mongo.Database, cfg config.Config) {
	ctx := routeContext{
		db:          db,
		cfg:         cfg,
		authHandler: handlers.NewAuthHandler(db, cfg),
		userHandler: handlers.NewUserHandler(db),
	}

	registerHealthRoutes(router)

	api := router.Group("/api/v1")
	registerAuthRoutes(api, ctx)
	registerUserRoutes(api, ctx)
	registerProfileRoutes(api, ctx)
}

func registerHealthRoutes(router *gin.Engine) {
	router.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
	})
}
