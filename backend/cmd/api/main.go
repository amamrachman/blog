package main

import (
	"log"

	"github.com/amamrachman/blog-platform/internal/config"
	"github.com/gofiber/fiber/v3"
)

func main() {

	config.ConnectDB()
	config.Migrate()

	app := fiber.New()

	app.Get("/health", func(c fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"status": "ok",
			"db":     "sqlite connected",
		})
	})

	log.Println("Server starting on :3000")
	log.Fatal(app.Listen(":3000"))
}
