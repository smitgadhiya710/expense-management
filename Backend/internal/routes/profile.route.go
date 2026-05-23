package routes

import (
	"expense-management/backend/internal/middleware"

	"github.com/gin-gonic/gin"
)

func registerProfileRoutes(api *gin.RouterGroup, ctx routeContext) {
	profile := api.Group("/profile")
	profile.Use(middleware.Auth(ctx.cfg))

	profile.GET("/me", ctx.authHandler.Me)
}
