package middleware

import (
	"strings"

	"github.com/amamrachman/blog-platform/internal/utils"
	"github.com/gofiber/fiber/v3"
)

func AuthRequired() fiber.Handler {
	return func(c fiber.Ctx) error {
		authHeader := c.Get("Authorization")
		if authHeader == "" {
			return c.Status(401).JSON(fiber.Map{
				"error": "Authorization header required",
			})
		}

		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			return c.Status(401).JSON(fiber.Map{
				"error": "Invalid authorization format",
			})
		}

		claims, err := utils.ParseToken(parts[1])
		if err != nil {
			return c.Status(401).JSON(fiber.Map{
				"error": "Invalid or expired token",
			})
		}

		c.Locals("userID", claims.UserID)
		c.Locals("email", claims.Email)

		return c.Next()
	}
}
