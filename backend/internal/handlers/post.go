// Package handlers contains post handlers.
package handlers

import (
	"encoding/json"
	"fmt"
	"strings"
	"time"

	"github.com/amamrachman/blog-platform/internal/config"
	"github.com/amamrachman/blog-platform/internal/models"
	"github.com/amamrachman/blog-platform/internal/utils"
	"github.com/gofiber/fiber/v3"
)

type CreatePostInput struct {
	Title   string `json:"title"`
	Content string `json:"content"`
}

func CreatePost(c fiber.Ctx) error {
	var input CreatePostInput
	if err := c.Bind().Body(&input); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid input"})
	}

	userID := utils.GetUserIDFromContext(c)

	slug := generateSlug(input.Title)

	post := models.Post{
		Title:    input.Title,
		Content:  json.RawMessage(input.Content),
		Slug:     slug,
		AuthorID: userID,
	}

	if err := config.DB.Create(&post).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to create post"})
	}

	config.DB.Preload("Author").First(&post, post.ID)

	return c.Status(201).JSON(post)
}

func GetPosts(c fiber.Ctx) error {
	var posts []models.Post

	page := fiber.Query(c, "page", 1)
	limit := fiber.Query(c, "limit", 10)
	offset := (page - 1) * limit

	config.DB.Preload("Author").
		Order("created_at DESC").
		Limit(limit).
		Offset(offset).
		Find(&posts)

	return c.JSON(posts)
}

func GetPost(c fiber.Ctx) error {
	id := c.Params("id")

	var post models.Post
	if err := config.DB.Preload("Author").First(&post, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Post not found"})
	}

	return c.JSON(post)
}

func GetPostBySlug(c fiber.Ctx) error {
	slug := c.Params("slug")

	var post models.Post
	if err := config.DB.Preload("Author").Where("slug = ?", slug).First(&post).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Post not found"})
	}

	return c.JSON(post)
}

func UpdatePost(c fiber.Ctx) error {
	id := c.Params("id")
	userID := utils.GetUserIDFromContext(c)

	var post models.Post
	if err := config.DB.First(&post, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Post not found"})
	}

	if post.AuthorID != userID {
		return c.Status(403).JSON(fiber.Map{"error": "Unauthorized"})
	}

	var input struct {
		Title   *string          `json:"title"`
		Content *json.RawMessage `json:"content"`
	}

	if err := c.Bind().Body(&input); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid input"})
	}

	updates := make(map[string]any)

	if input.Title != nil && *input.Title != "" {
		updates["title"] = *input.Title
		updates["slug"] = generateSlug(*input.Title)
	}

	if input.Content != nil {
		updates["content"] = *input.Content
	}

	if len(updates) == 0 {
		return c.Status(400).JSON(fiber.Map{"error": "No fields to update"})
	}

	if err := config.DB.Model(&post).Updates(updates).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to update"})
	}

	config.DB.Preload("Author").First(&post, id)

	return c.JSON(post)
}

func DeletePost(c fiber.Ctx) error {
	id := c.Params("id")
	userID := utils.GetUserIDFromContext(c)

	var post models.Post
	if err := config.DB.First(&post, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Post not found"})
	}

	if post.AuthorID != userID {
		return c.Status(403).JSON(fiber.Map{"error": "Unauthorized"})
	}

	config.DB.Delete(&post)

	return c.JSON(fiber.Map{"message": "Post deleted"})
}

func generateSlug(title string) string {
	slug := strings.ToLower(title)
	slug = strings.ReplaceAll(slug, " ", "-")

	return fmt.Sprintf("%s-%d", slug, time.Now().Unix())
}
