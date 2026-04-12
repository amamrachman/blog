// go run cmd/api/main.go
package main

import (
	"log"

	"github.com/amamrachman/blog-platform/internal/config"
	"github.com/amamrachman/blog-platform/internal/handlers"
	"github.com/amamrachman/blog-platform/internal/middleware"
	"github.com/gofiber/fiber/v3"
	"github.com/gofiber/fiber/v3/middleware/cors"
	"github.com/gofiber/fiber/v3/middleware/logger"
)

func main() {

	config.ConnectDB()
	config.Migrate()

	app := fiber.New()

	app.Use(logger.New())
	app.Use(cors.New(cors.Config{
		AllowOrigins: []string{
			"http://localhost:5173",
		},
		AllowHeaders: []string{
			"Origin",
			"Content-Type",
			"Accept",
			"Authorization",
		},
		AllowMethods: []string{
			"GET",
			"POST",
			"PATCH",
			"PUT",
			"DELETE",
			"OPTIONS",
		},
	}))

	api := app.Group("/api")

	api.Get("/health", func(c fiber.Ctx) error {
		return c.JSON(fiber.Map{"status": "ok"})
	})

	api.Post("/register", handlers.Register)
	api.Post("/login", handlers.Login)

	api.Get("/posts", handlers.GetPosts)
	api.Get("/posts/:id", handlers.GetPost)
	api.Get("/posts/slug/:slug", handlers.GetPostBySlug)

	auth := api.Group("", middleware.AuthRequired())
	auth.Get("/me", handlers.Me)
	auth.Post("/posts", handlers.CreatePost)
	auth.Patch("/posts/:id", handlers.UpdatePost)
	auth.Delete("/posts/:id", handlers.DeletePost)

	log.Println("Server starting on :3000")
	log.Fatal(app.Listen(":3000"))
}
