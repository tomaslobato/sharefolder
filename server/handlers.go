package server

import (
	"fmt"
	"log"
	"os"
	"path/filepath"

	"github.com/gofiber/fiber/v2"
)

const ROOT = "/home/tomi/Documents/new/"

type NewFileRequest struct {
	Name   string `json:"name"`
	Parent string `json:"parent"`
	IsDir  bool   `json:"isDir"`
}

type File struct {
	Name  string `json:"name"`
	IsDir bool   `json:"isDir"`
	Id    string `json:"id"`
}

func HandleFrontRoutes(app *fiber.App, routes []string) {
	app.Static("/", "./dist", fiber.Static{
		CacheDuration: 200,
	})

	for _, r := range routes {
		app.Get(r, func(c *fiber.Ctx) error {
			return c.Render("dist/index.html", fiber.Map{})
		})
	}
}

func HandleNewFile(c *fiber.Ctx) error {
	var req NewFileRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	dir := ROOT
	if req.Parent != "" {
		dir = findDirPath(req.Parent)
		if dir == "" {
			msg := fmt.Sprintf("parent dir with id: %s not found", req.Parent)
			return c.Status(400).JSON(fiber.Map{
				"error": msg,
			})
		}
	}

	//create dir
	if req.IsDir {
		newDirPath := filepath.Join(dir, req.Name)
		err := os.Mkdir(newDirPath, os.ModePerm)
		if err != nil {
			msg := fmt.Sprintf("failed to create folder at %s", req.Parent)
			return c.JSON(fiber.Map{
				"error": msg,
			})
		}
		return c.JSON(fiber.Map{
			"message": "directory created successfully",
			"path":    newDirPath,
		})
	}

	//create file
	newFilePath := filepath.Join(dir, req.Name)
	newFile, err := os.Create(newFilePath)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Unable to create file",
		})
	}
	defer newFile.Close()

	return c.JSON(fiber.Map{
		"message": "file created successfully",
		"path":    newFilePath,
	})
}

func HandleGetFiles(c *fiber.Ctx) error {
	files := recursiveSetFiles(ROOT, "")
	return c.JSON(files)
}

func recursiveSetFiles(dir string, childChain string) []File {
	var files []File

	fls, err := os.ReadDir(dir)
	if err != nil {
		log.Fatal(err)
	}

	for _, f := range fls {
		var file File
		file.Name = f.Name()
		file.IsDir = f.IsDir()
		file.Id = filepath.Join(childChain, file.Name)

		if file.IsDir {
			newDir := filepath.Join(dir, file.Name)
			files = append(files, file)
			files = append(files, recursiveSetFiles(newDir, file.Id)...)
		} else {
			files = append(files, file)
		}
	}

	return files
}

func findDirPath(parentId string) string {
	files := recursiveSetFiles(ROOT, "")
	for _, file := range files {
		if file.Id == parentId && file.IsDir {
			return filepath.Join(ROOT, file.Name)
		}
	}

	return ""
}
