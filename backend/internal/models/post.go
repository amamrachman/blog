// Package models contains post models.
package models

import (
	"encoding/json"
	"time"

	"gorm.io/gorm"
)

type Post struct {
	ID        uint            `json:"id" gorm:"primaryKey"`
	Title     string          `json:"title" gorm:"not null"`
	Content   json.RawMessage `json:"content" gorm:"type:text"`
	Slug      string          `json:"slug" gorm:"uniqueIndex"`
	AuthorID  uint            `json:"author_id"`
	Author    User            `json:"author,omitempty" gorm:"foreignKey:AuthorID"`
	CreatedAt time.Time       `json:"created_at"`
	UpdatedAt time.Time       `json:"updated_at"`
}

func (p *Post) BeforeCreate(tx *gorm.DB) error {
	p.CreatedAt = time.Now()
	p.UpdatedAt = time.Now()
	return nil
}

func (p *Post) BeforeUpdate(tx *gorm.DB) error {
	p.UpdatedAt = time.Now()
	return nil
}
