package routes

import "github.com/gin-gonic/gin"

func registerAuthRoutes(api *gin.RouterGroup, ctx routeContext) {
	auth := api.Group("/auth")
	auth.POST("/register", ctx.authHandler.Register)
	auth.POST("/signup", ctx.authHandler.Register)
	auth.POST("/login", ctx.authHandler.Login)
}
