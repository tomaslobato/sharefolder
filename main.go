package main

import (
	"log"
	"os"
	"sharefolder/server"

	"github.com/gofiber/fiber/v2"
)

const folder = "/home/tomi/Documents/new"

type File struct {
	Name  string `json:"name"`
	IsDir bool   `json:"isDir"`
	In    []File `json:"in"`
}

func main() {
	app := fiber.New()

	server.HandleFrontRoutes(app, []string{"/"})

	app.Get("/getfiles", func(c *fiber.Ctx) error {
		files := recursiveReadDir(folder, &[]File{})
		return c.JSON(files)
	})

	app.Listen(":3000")
}

func recursiveReadDir(dir string, files *[]File) []File {
	fls, err := os.ReadDir(dir)
	if err != nil {
		log.Fatal(err)
	}

	for _, f := range fls {
		var file File
		file.Name = f.Name()
		file.IsDir = f.IsDir()
		if file.IsDir {
			newDir := dir + "/" + file.Name
			file.In = recursiveReadDir(newDir, &[]File{})

		}

		*files = append(*files, file)
	}

	return *files
}
