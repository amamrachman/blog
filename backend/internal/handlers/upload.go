// Package handlers contains upload handlers.
package handlers

import (
	"fmt"
	"io"
	"log"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/amamrachman/blog-platform/internal/utils"
	"github.com/gofiber/fiber/v3"
)

func UploadImage(c fiber.Ctx) error {
	userID := utils.GetUserIDFromContext(c)

	file, err := c.FormFile("image")
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "No image file provided or failed to parse form"})
	}

	// Validate MIME type
	contentType := file.Header.Get("Content-Type")
	if !strings.HasPrefix(contentType, "image/") ||
		(contentType != "image/png" && contentType != "image/jpeg" && strings.ToLower(contentType) != "image/jpg") {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Only PNG, JPG, JPEG files allowed"})
	}

	// Ensure uploads directory exists
	uploadsDir := "./public/uploads"
	if err := os.MkdirAll(uploadsDir, 0755); err != nil {
		log.Printf("Failed to create uploads directory: %v", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to create upload directory"})
	}

	// Generate unique filename
	ext := filepath.Ext(file.Filename)
	if ext == "" {
		ext = ".jpg"
	}
	timestamp := time.Now().UnixNano()
	filename := fmt.Sprintf("%d_%d%s", userID, timestamp, ext)

	// Save file
	src, err := file.Open()
	if err != nil {
		log.Printf("Failed to open uploaded file: %v", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to process file"})
	}
	defer src.Close()

	dstPath := filepath.Join(uploadsDir, filename)
	dst, err := os.Create(dstPath)
	if err != nil {
		log.Printf("Failed to create destination file: %v", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to save file"})
	}
	defer dst.Close()

	if _, err := io.Copy(dst, src); err != nil {
		log.Printf("Failed to copy file content: %v", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to save file"})
	}

	// Return full URL
	imageURL := fmt.Sprintf("http://localhost:3000/uploads/%s", filename)

	return c.JSON(fiber.Map{"url": imageURL})
}
