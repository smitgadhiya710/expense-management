package routes

import (
	"expense-management/backend/internal/middleware"

	"github.com/gin-gonic/gin"
)

func registerUserRoutes(api *gin.RouterGroup, ctx routeContext) {
	user := api.Group("/user")
	user.Use(middleware.Auth(ctx.cfg))

	user.GET("/me", ctx.authHandler.Me)
	user.GET("", ctx.userHandler.GetAll)
	user.GET("/:id", ctx.userHandler.GetByID)
	user.PUT("/:id", ctx.userHandler.Update)
	user.DELETE("/:id", ctx.userHandler.Delete)
}
