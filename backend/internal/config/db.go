// Package config contains database configuration and migration logic.
package config

import (
	"log"

	"github.com/amamrachman/blog-platform/internal/models"
	"github.com/glebarez/sqlite"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var DB *gorm.DB

func ConnectDB() {
	var err error

	DB, err = gorm.Open(sqlite.Open("blog.db"), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	})

	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	log.Println("Database connected")
}

func Migrate() {
	DB.AutoMigrate(&models.User{}, &models.Post{})
	log.Println("Database migrated")
}
